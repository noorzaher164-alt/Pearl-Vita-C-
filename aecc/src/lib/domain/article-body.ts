import type { ArticleBlock } from './types';

/**
 * Converts the lightweight editor syntax into structured article blocks.
 *
 * The magazine renderer takes blocks rather than raw HTML so authors cannot inject
 * markup and every element is styled by the AECC editorial system.
 *
 *   ## text     → heading
 *   > text      → pull quote  (`> text — attribution` sets the attribution)
 *   ! Title: text → scientific callout box
 *   - item      → list item
 *   blank line  → new paragraph
 */
export function parseArticleBody(bodyEn: string, bodyAr: string): ArticleBlock[] {
  const en = splitLines(bodyEn);
  const ar = splitLines(bodyAr);
  const blocks: ArticleBlock[] = [];

  let index = 0;
  while (index < en.length) {
    const lineEn = en[index];
    const lineAr = ar[index] ?? '';

    if (lineEn.startsWith('## ')) {
      blocks.push({
        type: 'heading',
        text_en: lineEn.slice(3).trim(),
        text_ar: lineAr.startsWith('## ') ? lineAr.slice(3).trim() : lineAr.trim(),
      });
      index += 1;
      continue;
    }

    if (lineEn.startsWith('> ')) {
      const [textEn, attributionEn] = splitAttribution(lineEn.slice(2));
      const [textAr, attributionAr] = splitAttribution(
        lineAr.startsWith('> ') ? lineAr.slice(2) : lineAr,
      );
      blocks.push({
        type: 'quote',
        text_en: textEn,
        text_ar: textAr,
        attribution_en: attributionEn,
        attribution_ar: attributionAr,
      });
      index += 1;
      continue;
    }

    if (lineEn.startsWith('! ')) {
      const [titleEn, textEn] = splitCallout(lineEn.slice(2));
      const [titleAr, textAr] = splitCallout(lineAr.startsWith('! ') ? lineAr.slice(2) : lineAr);
      blocks.push({
        type: 'callout',
        title_en: titleEn,
        title_ar: titleAr || titleEn,
        text_en: textEn,
        text_ar: textAr || textEn,
      });
      index += 1;
      continue;
    }

    if (lineEn.startsWith('- ')) {
      const itemsEn: string[] = [];
      const itemsAr: string[] = [];
      while (index < en.length && en[index].startsWith('- ')) {
        itemsEn.push(en[index].slice(2).trim());
        const candidate = ar[index] ?? '';
        itemsAr.push(candidate.startsWith('- ') ? candidate.slice(2).trim() : candidate.trim());
        index += 1;
      }
      blocks.push({ type: 'list', items_en: itemsEn, items_ar: itemsAr });
      continue;
    }

    blocks.push({ type: 'paragraph', text_en: lineEn.trim(), text_ar: lineAr.trim() });
    index += 1;
  }

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', text_en: '', text_ar: '' }];
}

function splitLines(value: string): string[] {
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function splitAttribution(value: string): [string, string | undefined] {
  const marker = value.lastIndexOf('—');
  if (marker > 0) return [value.slice(0, marker).trim(), value.slice(marker + 1).trim()];
  return [value.trim(), undefined];
}

function splitCallout(value: string): [string, string] {
  const marker = value.indexOf(':');
  if (marker > 0) return [value.slice(0, marker).trim(), value.slice(marker + 1).trim()];
  return ['', value.trim()];
}

/** Serialises blocks back into the editor syntax, for the edit screen. */
export function serialiseArticleBody(blocks: ArticleBlock[], locale: 'en' | 'ar'): string {
  const lines: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        lines.push(`## ${locale === 'en' ? block.text_en : block.text_ar}`);
        break;
      case 'quote': {
        const text = locale === 'en' ? block.text_en : block.text_ar;
        const attribution = locale === 'en' ? block.attribution_en : block.attribution_ar;
        lines.push(`> ${text}${attribution ? ` — ${attribution}` : ''}`);
        break;
      }
      case 'callout':
        lines.push(
          `! ${locale === 'en' ? block.title_en : block.title_ar}: ${locale === 'en' ? block.text_en : block.text_ar}`,
        );
        break;
      case 'list':
        for (const item of locale === 'en' ? block.items_en : block.items_ar) lines.push(`- ${item}`);
        break;
      case 'image':
        lines.push(`![](${block.url})`);
        break;
      default:
        lines.push(locale === 'en' ? block.text_en : block.text_ar);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}
