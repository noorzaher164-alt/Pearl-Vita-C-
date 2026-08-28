#!/usr/bin/env python3
"""
Combined: fix dates + replace headers/footers + remove old body-embedded headers.
"""

import os, sys, zipfile, re, zlib, copy
from lxml import etree
from docx import Document
from docx.shared import Twips
from docx.oxml.ns import qn
from docx.opc.part import Part
from docx.opc.packuri import PackURI

BASE = sys.argv[1]
TEMPLATE = "/root/.claude/uploads/48da3efd-90ee-561b-8982-758f35ddfa34/6094eb5f-________________________.docx"

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

# Load template
_tmpl_doc = Document(TEMPLATE)
_tmpl_section = _tmpl_doc.sections[0]
_tmpl_hdr_element = _tmpl_section.header._element
_tmpl_ftr_element = _tmpl_section.footer._element
_tmpl_hdr_part = _tmpl_section.header.part

_tmpl_image_rels = {}
for rId, rel in _tmpl_hdr_part.rels.items():
    if 'image' in rel.reltype:
        _tmpl_image_rels[rId] = rel.target_ref.split('/')[-1]

with zipfile.ZipFile(TEMPLATE) as tz:
    _img_data = {
        'image1.png': tz.read('word/media/image1.png'),
        'image2.png': tz.read('word/media/image2.png'),
    }


def fix_text(text):
    if not text:
        return text, False
    orig = text
    text = re.sub(
        r'20[12]\d(\s*[-‐-―−/]\s*)20[12]\d',
        lambda m: '2026' + m.group(1) + '2027', text)
    text = re.sub(
        r'20[12]\d(\s+(?:الى|إلى)\s+)20[12]\d',
        lambda m: '2026' + m.group(1) + '2027', text)
    for y in range(2010, 2026):
        text = text.replace(str(y), '2026')
    for y in [2028, 2029]:
        text = text.replace(str(y), '2027')
    return text, text != orig


def fix_xml_dates_raw(xml_bytes):
    try:
        root = etree.fromstring(xml_bytes)
    except Exception:
        return None, False
    changed = False
    for p in root.iter(f'{{{W}}}p'):
        t_elems = list(p.iter(f'{{{W}}}t'))
        if not t_elems:
            continue
        texts = [(e, e.text or '') for e in t_elems]
        full = ''.join(t for _, t in texts)
        if not re.search(r'20[12]\d', full):
            continue
        new_full, c = fix_text(full)
        if not c:
            continue
        if len(new_full) != len(full):
            if t_elems:
                t_elems[0].text = new_full
                for e in t_elems[1:]:
                    e.text = ''
        else:
            pos = 0
            for elem, orig_text in texts:
                n = len(orig_text)
                elem.text = new_full[pos:pos + n]
                pos += n
        changed = True
    if not changed:
        return None, False
    return etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True), True


def _has_drawings(element):
    """Check if an element contains drawing objects."""
    return (len(list(element.iter(qn('wp:inline')))) +
            len(list(element.iter(qn('wp:anchor'))))) > 0


def _has_text(element):
    """Check if a paragraph has meaningful text content."""
    for t in element.iter(f'{{{W}}}t'):
        if t.text and t.text.strip():
            return True
    return False


def remove_old_body_header(doc):
    """Remove old header content embedded in the document body.

    Scans from the beginning of the body and removes leading paragraphs
    that are either empty or contain only drawings (no text), up to the
    first paragraph/table with actual text content.
    """
    body = doc.element.body
    removed = 0

    # Get all direct children of body (paragraphs and tables)
    children = list(body)

    for child in children:
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag

        if tag == 'p':
            has_text = _has_text(child)
            has_draw = _has_drawings(child)

            if has_text:
                # Hit actual content - stop removing
                break
            elif has_draw:
                # Drawing-only paragraph (old header image) - remove it
                body.remove(child)
                removed += 1
            else:
                # Empty paragraph (spacer) - remove it
                body.remove(child)
                removed += 1
        elif tag == 'tbl':
            # Hit a table - stop removing (table is actual content)
            break
        elif tag == 'sectPr':
            # Section properties - don't touch, stop
            break
        else:
            # Unknown element - stop to be safe
            break

    return removed


def remove_old_body_footer(doc):
    body = doc.element.body
    removed = 0

    children = list(body)
    to_remove = []

    for child in reversed(children):
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag

        if tag == 'sectPr':
            continue
        elif tag == 'p':
            has_text = _has_text(child)
            has_draw = _has_drawings(child)

            if has_text:
                break
            elif has_draw:
                to_remove.append(child)
            else:
                to_remove.append(child)
        elif tag == 'tbl':
            break
        else:
            break

    for child in to_remove:
        body.remove(child)
        removed += 1

    return removed


def apply_header_footer(doc):
    """Apply template header/footer to all sections."""
    for section in doc.sections:
        # HEADER
        header = section.header
        header.is_linked_to_previous = False
        for el in list(header._element):
            header._element.remove(el)

        hdr_copy = copy.deepcopy(_tmpl_hdr_element)
        rId_map = {}
        for old_rId, img_name in _tmpl_image_rels.items():
            if old_rId in rId_map:
                continue
            img_data = _img_data.get(img_name)
            if not img_data:
                continue
            partname = PackURI(f'/word/media/hdr_{img_name}')
            image_part = Part(partname, 'image/png', img_data, header.part.package)
            new_rId = header.part.relate_to(image_part,
                'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image')
            rId_map[old_rId] = new_rId

        for blip in hdr_copy.iter(qn('a:blip')):
            old_embed = blip.get(qn('r:embed'))
            if old_embed in rId_map:
                blip.set(qn('r:embed'), rId_map[old_embed])

        for child in list(hdr_copy):
            header._element.append(child)

        # FOOTER
        footer = section.footer
        footer.is_linked_to_previous = False
        for el in list(footer._element):
            footer._element.remove(el)

        ftr_copy = copy.deepcopy(_tmpl_ftr_element)
        # Remove page number content from footer
        for p in list(ftr_copy.iter(f'{{{W}}}p')):
            for run in list(p.iter(f'{{{W}}}r')):
                p.remove(run)
        for child in list(ftr_copy):
            footer._element.append(child)

        # MARGINS
        section.header_distance = Twips(500)
        section.footer_distance = Twips(200)
        if section.top_margin is not None and section.top_margin < Twips(1750):
            section.top_margin = Twips(1750)
        if section.bottom_margin is not None and section.bottom_margin < Twips(1440):
            section.bottom_margin = Twips(1440)


def do_docx(path):
    tmp = path + ".tmp"
    try:
        # Step 1: Fix dates via raw ZIP/XML
        with zipfile.ZipFile(path, 'r') as zin:
            entries = {}
            for item in zin.infolist():
                entries[item.filename] = zin.read(item.filename)

        date_changed = False
        for name in list(entries.keys()):
            if name.endswith(('.xml', '.rels', '.vml')):
                new_data, c = fix_xml_dates_raw(entries[name])
                if c and new_data:
                    entries[name] = new_data
                    date_changed = True
                else:
                    try:
                        txt = entries[name].decode('utf-8')
                        new_txt, c2 = fix_text(txt)
                        if c2:
                            entries[name] = new_txt.encode('utf-8')
                            date_changed = True
                    except UnicodeDecodeError:
                        pass

        if date_changed:
            with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
                for name, data in entries.items():
                    zout.writestr(name, data)
            os.replace(tmp, path)

        # Step 2: Apply header/footer + remove old body header/footer via python-docx
        doc = Document(path)
        removed_hdr = remove_old_body_header(doc)
        removed_ftr = remove_old_body_footer(doc)
        apply_header_footer(doc)
        doc.save(tmp)
        os.replace(tmp, path)

        return True, removed_hdr, removed_ftr
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback; traceback.print_exc()
        if os.path.exists(tmp):
            os.remove(tmp)
        return False, 0, 0


def do_doc(path):
    with open(path, 'rb') as f:
        data = f.read()
    orig = data
    for enc in ['utf-16-le', 'utf-8']:
        for first in range(2020, 2030):
            for second in range(2020, 2030):
                if first == 2026 and second == 2027:
                    continue
                for sep in ['-', '–', '/']:
                    old = f"{first}{sep}{second}".encode(enc)
                    new = f"2026{sep}2027".encode(enc)
                    data = data.replace(old, new)
        for y in range(2020, 2026):
            data = data.replace(str(y).encode(enc), "2026".encode(enc))
        for y in [2028, 2029]:
            data = data.replace(str(y).encode(enc), "2027".encode(enc))
    if data != orig:
        with open(path, 'wb') as f:
            f.write(data)
        return True
    return False


def do_pdf(path):
    with open(path, 'rb') as f:
        data = f.read()
    orig = data
    changed = False
    parts = []
    pos = 0
    while True:
        idx = data.find(b'stream\n', pos)
        if idx == -1:
            idx = data.find(b'stream\r\n', pos)
        if idx == -1:
            parts.append(data[pos:])
            break
        sstart = idx + 7
        if data[idx+6:idx+8] == b'\r\n':
            sstart = idx + 8
        endidx = data.find(b'\nendstream', sstart)
        if endidx == -1:
            endidx = data.find(b'\r\nendstream', sstart)
        if endidx == -1:
            parts.append(data[pos:])
            break
        parts.append(data[pos:sstart])
        stream_data = data[sstart:endidx]
        try:
            decompressed = zlib.decompress(stream_data)
            new_dec = decompressed
            for y in range(2020, 2026):
                new_dec = new_dec.replace(str(y).encode(), b'2026')
            for y in [2028, 2029]:
                new_dec = new_dec.replace(str(y).encode(), b'2027')
            if new_dec != decompressed:
                recompressed = zlib.compress(new_dec)
                parts.append(recompressed)
                changed = True
            else:
                parts.append(stream_data)
        except Exception:
            parts.append(stream_data)
        pos = endidx
    if changed:
        new_data = b''.join(parts)
        with open(path, 'wb') as f:
            f.write(new_data)
        return True
    for y in range(2020, 2026):
        data = data.replace(str(y).encode(), b'2026')
    for y in [2028, 2029]:
        data = data.replace(str(y).encode(), b'2027')
    if data != orig:
        with open(path, 'wb') as f:
            f.write(data)
        return True
    return False


def fix_name(text):
    if not text:
        return text, False
    orig = text
    text = re.sub(
        r'20[12]\d(\s*[-‐-―−/]\s*)20[12]\d',
        lambda m: '2026' + m.group(1) + '2027', text)
    text = re.sub(
        r'20[12]\d(\s+(?:الى|إلى)\s+)20[12]\d',
        lambda m: '2026' + m.group(1) + '2027', text)
    for y in range(2010, 2026):
        text = text.replace(str(y), '2026')
    for y in [2028, 2029]:
        text = text.replace(str(y), '2027')
    return text, text != orig


def rename_all(base):
    top = set(os.path.join(base, x) for x in os.listdir(base))
    paths = []
    for root, dirs, files in os.walk(base):
        for f in files:
            paths.append(os.path.join(root, f))
        for d in dirs:
            paths.append(os.path.join(root, d))
    paths.sort(key=lambda p: p.count(os.sep), reverse=True)
    count = 0
    for p in paths:
        if not os.path.exists(p) or p in top:
            continue
        d = os.path.dirname(p)
        name = os.path.basename(p)
        new_name, ch = fix_name(name)
        if ch:
            os.rename(p, os.path.join(d, new_name))
            count += 1
    return count


# ============ RUN ============

print("=== PASS 1: DOCX (dates + header/footer + remove old body header/footer) ===\n")
docx_ok = 0
docx_total = 0
total_hdr_removed = 0
total_ftr_removed = 0
for root, dirs, files in os.walk(BASE):
    for f in files:
        if not f.lower().endswith('.docx'):
            continue
        fp = os.path.join(root, f)
        docx_total += 1
        ok, removed_hdr, removed_ftr = do_docx(fp)
        if ok:
            docx_ok += 1
            tags = []
            if removed_hdr > 0:
                tags.append(f"hdr:{removed_hdr}")
            if removed_ftr > 0:
                tags.append(f"ftr:{removed_ftr}")
            tag = f" (removed {', '.join(tags)})" if tags else ""
            print(f"  OK: {f}{tag}")
            total_hdr_removed += removed_hdr
            total_ftr_removed += removed_ftr
        else:
            print(f"  FAIL: {f}")
print(f"\nDOCX: {docx_ok}/{docx_total} | Old body: {total_hdr_removed} header + {total_ftr_removed} footer elements removed")

print("\n=== PASS 2: DOC (dates) ===\n")
doc_ok = 0
doc_total = 0
for root, dirs, files in os.walk(BASE):
    for f in files:
        if f.lower().endswith('.doc') and not f.lower().endswith('.docx'):
            fp = os.path.join(root, f)
            doc_total += 1
            if do_doc(fp):
                doc_ok += 1
                print(f"  OK: {f}")
            else:
                print(f"  --: {f}")
print(f"\nDOC: {doc_ok}/{doc_total}")

print("\n=== PASS 3: PDF (dates) ===\n")
pdf_ok = 0
pdf_total = 0
for root, dirs, files in os.walk(BASE):
    for f in files:
        if not f.lower().endswith('.pdf'):
            continue
        fp = os.path.join(root, f)
        pdf_total += 1
        try:
            if do_pdf(fp):
                pdf_ok += 1
                print(f"  OK: {f}")
            else:
                print(f"  --: {f}")
        except Exception as e:
            print(f"  ERR: {f}: {e}")
print(f"\nPDF: {pdf_ok}/{pdf_total}")

print("\n=== PASS 4: Rename ===\n")
n = rename_all(BASE)
print(f"Renamed: {n} items")
print("\nDone!")
