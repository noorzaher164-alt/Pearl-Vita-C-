const pptxgen = require("pptxgenjs");

const PLUM = "48132F";
const ROSE = "9F656B";
const ROSE_GOLD = "CB8C78";
const IVORY = "FBEAE6";
const WHITE = "FFFFFF";
const INK = "2D1A24";
const INK_MUTED = "6B4F5E";
const CARD_BG = "FDF5F2";
const FIELD_BG = "F7ECEB";
const SLIDE_H = 5.625;

function buildDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "AECC Platform";
  pres.subject = "دليل المعلمة الشامل";
  pres.title = "دليل استخدام منصة نادي الإيمان للكيمياء — المعلمة";

  const rtl = { rtlMode: true, lang: "ar-SA" };
  const font = "Arial";

  // helper: step label (small text top-right of content slides)
  function addStepLabel(slide, text) {
    slide.addText(text, {
      x: 0.6, y: 0.30, w: 8.8, h: 0.32,
      fontSize: 13, fontFace: font, color: ROSE,
      align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
  }

  // helper: slide title
  function addTitle(slide, text) {
    slide.addText(text, {
      x: 0.6, y: 0.60, w: 8.8, h: 0.65,
      fontSize: 28, fontFace: font, color: PLUM,
      align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
  }

  // helper: section divider slide
  function addSectionSlide(sectionNum, title, subtitle) {
    const s = pres.addSlide();
    s.background = { color: PLUM };
    // decorative circle
    s.addShape(pres.shapes.OVAL, {
      x: 7.8, y: -1.0, w: 3.2, h: 3.2,
      fill: { color: ROSE, transparency: 82 },
    });
    s.addShape(pres.shapes.OVAL, {
      x: -0.6, y: 3.8, w: 2.5, h: 2.5,
      fill: { color: ROSE_GOLD, transparency: 85 },
    });
    // section number
    s.addText(sectionNum, {
      x: 0.5, y: 1.2, w: 9.0, h: 0.7,
      fontSize: 18, fontFace: font, color: ROSE_GOLD,
      align: "center", isTextBox: true, margin: 0, ...rtl,
    });
    s.addText(title, {
      x: 0.5, y: 1.9, w: 9.0, h: 0.9,
      fontSize: 36, fontFace: font, color: WHITE,
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
    s.addText(subtitle, {
      x: 1.0, y: 2.9, w: 8.0, h: 0.6,
      fontSize: 14, fontFace: font, color: ROSE_GOLD,
      align: "center", isTextBox: true, margin: 0, ...rtl,
    });
    return s;
  }

  // helper: info card (rounded rect with title + body)
  function addInfoCard(slide, x, y, w, h, title, body, opts = {}) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h,
      fill: { color: opts.bg || CARD_BG }, rectRadius: 0.12,
      shadow: { type: "outer", blur: 8, offset: 2, angle: 270, color: "000000", opacity: 0.06 },
    });
    slide.addText(title, {
      x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.32,
      fontSize: 13, fontFace: font, color: opts.titleColor || PLUM,
      align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
    if (body) {
      slide.addText(body, {
        x: x + 0.15, y: y + 0.38, w: w - 0.3, h: h - 0.50,
        fontSize: 11, fontFace: font, color: INK_MUTED,
        align: "right", isTextBox: true, margin: 0, valign: "top", ...rtl,
      });
    }
  }

  // helper: bullet list as array of text objects
  function bulletList(items) {
    return items.map((t, i) => ({
      text: t,
      options: {
        bullet: true, breakLine: i < items.length - 1,
        fontSize: 12, fontFace: font, color: INK,
        paraSpaceAfter: 4, ...rtl,
      },
    }));
  }

  // ======================================================================
  // SLIDE 1: Title
  // ======================================================================
  const s1 = pres.addSlide();
  s1.background = { color: PLUM };

  s1.addShape(pres.shapes.OVAL, {
    x: 7.5, y: -1.2, w: 3.5, h: 3.5,
    fill: { color: ROSE, transparency: 80 },
  });
  s1.addShape(pres.shapes.OVAL, {
    x: -0.8, y: 3.5, w: 2.8, h: 2.8,
    fill: { color: ROSE_GOLD, transparency: 85 },
  });

  s1.addText("نادي الإيمان للكيمياء", {
    x: 0.5, y: 1.4, w: 9.0, h: 0.55,
    fontSize: 18, fontFace: font, color: ROSE_GOLD,
    align: "center", isTextBox: true, margin: 0, ...rtl,
  });
  s1.addText("دليل المعلمة الشامل", {
    x: 0.5, y: 1.95, w: 9.0, h: 1.0,
    fontSize: 38, fontFace: font, color: WHITE,
    align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s1.addText("كل ما تحتاجينه لإدارة المنصة — من التسجيل إلى التقارير", {
    x: 0.5, y: 3.05, w: 9.0, h: 0.5,
    fontSize: 14, fontFace: font, color: ROSE_GOLD,
    align: "center", isTextBox: true, margin: 0, ...rtl,
  });
  s1.addText("مدرسة الإيمان الثانوية · 2026 – 2027", {
    x: 0.5, y: 4.85, w: 9.0, h: 0.4,
    fontSize: 11, fontFace: font, color: ROSE,
    align: "center", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 2: Table of Contents
  // ======================================================================
  const s2 = pres.addSlide();
  s2.background = { color: WHITE };
  addTitle(s2, "محتويات الدليل");

  const tocItems = [
    ["١", "فتح الموقع والصفحات العامة"],
    ["٢", "إنشاء حساب وتسجيل الدخول"],
    ["٣", "لوحة التحكم والتنقل"],
    ["٤", "إدارة العضوات"],
    ["٥", "اللجان والفعاليات"],
    ["٦", "الحضور والنقاط"],
    ["٧", "المهام والمشاريع"],
    ["٨", "المسابقات وصندوق الأفكار"],
    ["٩", "الإعلانات"],
    ["١٠", "المجلة الإلكترونية"],
    ["١١", "الشهادات والإنجازات"],
    ["١٢", "المعرض والمصادر"],
    ["١٣", "التقارير والإحصائيات"],
    ["١٤", "إدارة الحسابات والإعدادات"],
  ];

  // Two columns for TOC
  const col1 = tocItems.slice(0, 7);
  const col2 = tocItems.slice(7);

  col1.forEach((item, i) => {
    const yy = 1.42 + i * 0.52;
    s2.addShape(pres.shapes.OVAL, {
      x: 7.8, y: yy + 0.04, w: 0.30, h: 0.30,
      fill: { color: PLUM },
    });
    s2.addText(item[0], {
      x: 7.78, y: yy + 0.02, w: 0.34, h: 0.34,
      fontSize: 11, fontFace: font, color: WHITE,
      align: "center", bold: true, isTextBox: true, margin: 0,
    });
    s2.addText(item[1], {
      x: 5.2, y: yy, w: 2.50, h: 0.38,
      fontSize: 13, fontFace: font, color: INK,
      align: "right", isTextBox: true, margin: 0, ...rtl,
    });
  });

  col2.forEach((item, i) => {
    const yy = 1.42 + i * 0.52;
    s2.addShape(pres.shapes.OVAL, {
      x: 3.6, y: yy + 0.04, w: 0.30, h: 0.30,
      fill: { color: ROSE },
    });
    s2.addText(item[0], {
      x: 3.58, y: yy + 0.02, w: 0.34, h: 0.34,
      fontSize: 11, fontFace: font, color: WHITE,
      align: "center", bold: true, isTextBox: true, margin: 0,
    });
    s2.addText(item[1], {
      x: 0.6, y: yy, w: 2.90, h: 0.38,
      fontSize: 13, fontFace: font, color: INK,
      align: "right", isTextBox: true, margin: 0, ...rtl,
    });
  });

  // ======================================================================
  // SLIDE 3: Open the site — public pages
  // ======================================================================
  const s3 = pres.addSlide();
  s3.background = { color: WHITE };
  addStepLabel(s3, "الخطوة الأولى");
  addTitle(s3, "افتحي الموقع — الصفحات العامة");

  s3.addText("الموقع العام مفتوح لأي زائر ويحتوي على:", {
    x: 0.6, y: 1.40, w: 8.8, h: 0.35,
    fontSize: 13, fontFace: font, color: INK, align: "right",
    isTextBox: true, margin: 0, ...rtl,
  });

  const publicPages = [
    ["الصفحة الرئيسية", "تعريف بالنادي وأبرز الأنشطة والإحصائيات"],
    ["عن النادي", "الرسالة والرؤية والقيم والهيكل التنظيمي"],
    ["حياة النادي", "معرض الأنشطة والإنجازات والفعاليات"],
    ["المجلة الإلكترونية", "المقالات المنشورة للقراءة العامة"],
    ["معرض الصور", "ألبومات الفعاليات والأنشطة العامة"],
  ];

  publicPages.forEach((p, i) => {
    const yy = 1.90 + i * 0.66;
    addInfoCard(s3, 0.6, yy, 8.8, 0.58, p[0], p[1]);
  });

  s3.addText("اضغطي على «تسجيل الدخول» في الشريط العلوي للانتقال إلى صفحة الدخول", {
    x: 0.6, y: 5.10, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: font, color: ROSE,
    align: "right", italic: true, isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 4: Create account
  // ======================================================================
  const s4 = pres.addSlide();
  s4.background = { color: WHITE };
  addStepLabel(s4, "الخطوة الثانية");
  addTitle(s4, "إنشاء حساب جديد");

  const fields = [
    ["اسم المستخدم", "مثال: sara.almutairi"],
    ["الاسم الكامل", "بالعربي والإنجليزي"],
    ["الصف الدراسي", "10 أو 11 أو 12"],
    ["البريد الإلكتروني", "البريد الرسمي للمدرسة"],
    ["كلمة المرور", "اختاري كلمة مرور قوية"],
    ["تأكيد كلمة المرور", "أعيدي كتابتها للتأكيد"],
  ];

  // 2-column grid of fields
  fields.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xx = col === 0 ? 5.15 : 0.6;
    const yy = 1.45 + row * 0.95;

    s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: yy, w: 4.25, h: 0.82,
      fill: { color: CARD_BG }, rectRadius: 0.10,
    });
    s4.addText(f[0], {
      x: xx + 0.15, y: yy + 0.08, w: 3.95, h: 0.30,
      fontSize: 13, fontFace: font, color: PLUM,
      align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
    s4.addText(f[1], {
      x: xx + 0.15, y: yy + 0.40, w: 3.95, h: 0.30,
      fontSize: 11, fontFace: font, color: INK_MUTED,
      align: "right", isTextBox: true, margin: 0, ...rtl,
    });
  });

  s4.addText("بعد التعبئة، اضغطي «إنشاء حساب» ← يمكنك تسجيل الدخول فوراً", {
    x: 0.6, y: 4.45, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: font, color: ROSE,
    align: "right", italic: true, isTextBox: true, margin: 0, ...rtl,
  });

  // note about admin creating accounts
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 4.90, w: 8.8, h: 0.55,
    fill: { color: PLUM }, rectRadius: 0.10,
  });
  s4.addText("ملاحظة: بصفتك مشرفة النظام، يمكنك إنشاء حسابات المعلمات والطالبات من «إدارة الحسابات» مباشرة", {
    x: 0.75, y: 4.95, w: 8.5, h: 0.45,
    fontSize: 11, fontFace: font, color: WHITE,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 5: Login
  // ======================================================================
  const s5 = pres.addSlide();
  s5.background = { color: WHITE };
  addStepLabel(s5, "الخطوة الثالثة");
  addTitle(s5, "تسجيل الدخول");

  // Login form mockup
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 2.8, y: 1.50, w: 4.4, h: 3.0,
    fill: { color: CARD_BG }, rectRadius: 0.15,
    shadow: { type: "outer", blur: 12, offset: 3, angle: 270, color: "000000", opacity: 0.08 },
  });
  s5.addText("مرحباً بعودتك", {
    x: 3.1, y: 1.65, w: 3.8, h: 0.40,
    fontSize: 18, fontFace: font, color: PLUM,
    align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  // username field
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.3, y: 2.20, w: 3.4, h: 0.45,
    fill: { color: WHITE }, rectRadius: 0.06,
    line: { color: "D0B5B0", width: 1 },
  });
  s5.addText("اسم المستخدم", {
    x: 3.4, y: 2.22, w: 3.2, h: 0.40,
    fontSize: 11, fontFace: font, color: INK_MUTED,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });
  // password field
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.3, y: 2.80, w: 3.4, h: 0.45,
    fill: { color: WHITE }, rectRadius: 0.06,
    line: { color: "D0B5B0", width: 1 },
  });
  s5.addText("كلمة المرور", {
    x: 3.4, y: 2.82, w: 3.2, h: 0.40,
    fontSize: 11, fontFace: font, color: INK_MUTED,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });
  // login button
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.3, y: 3.45, w: 3.4, h: 0.45,
    fill: { color: PLUM }, rectRadius: 0.06,
  });
  s5.addText("تسجيل الدخول", {
    x: 3.3, y: 3.45, w: 3.4, h: 0.45,
    fontSize: 13, fontFace: font, color: WHITE,
    align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  s5.addText("نسيتِ كلمة المرور؟ تواصلي مع مسؤولة النظام لإعادة التعيين", {
    x: 0.6, y: 4.70, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: font, color: ROSE,
    align: "right", italic: true, isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 6: Navigation overview
  // ======================================================================
  const s6 = pres.addSlide();
  s6.background = { color: WHITE };
  addStepLabel(s6, "الخطوة الرابعة");
  addTitle(s6, "التنقل في المنصة");

  // Sidebar mockup
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.0, y: 1.40, w: 2.6, h: 3.80,
    fill: { color: PLUM }, rectRadius: 0.12,
  });

  const sidebarItems = [
    ["النادي", ROSE_GOLD, true],
    ["لوحة التحكم", WHITE, false],
    ["العضوات", WHITE, false],
    ["اللجان", WHITE, false],
    ["الفعاليات", WHITE, false],
    ["الحضور", WHITE, false],
    ["الأنشطة", ROSE_GOLD, true],
    ["المهام", WHITE, false],
    ["الإنجازات", WHITE, false],
    ["الإعلانات", WHITE, false],
    ["النشر", ROSE_GOLD, true],
    ["المجلة", WHITE, false],
    ["الشهادات", WHITE, false],
    ["الإدارة", ROSE_GOLD, true],
    ["إدارة الحسابات", WHITE, false],
  ];

  sidebarItems.forEach((item, i) => {
    const yy = 1.50 + i * 0.24;
    s6.addText(item[0], {
      x: 7.15, y: yy, w: 2.30, h: 0.22,
      fontSize: item[2] ? 9 : 10, fontFace: font, color: item[1],
      align: "right", bold: item[2], isTextBox: true, margin: 0, ...rtl,
    });
  });

  // Text explanation
  s6.addText([
    { text: "الشريط الجانبي (على الحاسوب):", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, ...rtl } },
    { text: "يحتوي على جميع أقسام المنصة مقسمة إلى ٤ مجموعات:", options: { fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 6, ...rtl } },
    { text: "النادي: لوحة التحكم، العضوات، اللجان، الفعاليات، الحضور", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الأنشطة: المهام، الإنجازات، الإعلانات", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "النشر: المجلة الإلكترونية، الشهادات", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الإدارة: إدارة الحسابات (للمشرفة فقط)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 8, ...rtl } },
    { text: "الشريط العلوي:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, ...rtl } },
    { text: "الدور الوظيفي · أيقونة المهام · جرس الإشعارات", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تبديل الوضع (فاتح/داكن) · تبديل اللغة (عربي/إنجليزي)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 6.0, h: 3.80,
    valign: "top", isTextBox: true, margin: 0,
  });

  // ======================================================================
  // SLIDE 7: Dashboard — metrics
  // ======================================================================
  const s7 = pres.addSlide();
  s7.background = { color: WHITE };
  addStepLabel(s7, "الخطوة الخامسة");
  addTitle(s7, "لوحة التحكم — الإحصائيات");

  const metrics = [
    ["إجمالي العضوات", "عدد جميع عضوات النادي"],
    ["الفعاليات القادمة", "الفعاليات المجدولة"],
    ["المشاريع الجارية", "المشاريع النشطة حالياً"],
    ["نسبة الحضور", "نسبة الحضور الإجمالية"],
    ["نقاط النادي", "مجموع النقاط الممنوحة"],
    ["المقالات المنشورة", "في المجلة الإلكترونية"],
  ];

  metrics.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xx = 0.6 + col * 3.15;
    const yy = 1.45 + row * 1.25;
    addInfoCard(s7, xx, yy, 2.95, 1.05, m[0], m[1]);
  });

  s7.addText("لوحة التحكم تعرض لك نظرة شاملة على كل شيء في النادي من مكان واحد", {
    x: 0.6, y: 4.05, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: font, color: INK_MUTED,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // Quick actions
  s7.addText("الإجراءات السريعة:", {
    x: 0.6, y: 4.45, w: 8.8, h: 0.30,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s7.addText("إضافة عضوة · إنشاء فعالية · رصد الحضور · منح نقاط · نشر إعلان · إضافة مقال", {
    x: 0.6, y: 4.75, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: font, color: INK,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 8: Dashboard — widgets
  // ======================================================================
  const s8 = pres.addSlide();
  s8.background = { color: WHITE };
  addTitle(s8, "لوحة التحكم — الأقسام التفصيلية");

  const widgets = [
    ["صلاحيات المشرفة", "٩ اختصارات سريعة لأهم المهام الإشرافية"],
    ["آخر الإعلانات", "أحدث إعلان منشور في النادي"],
    ["الفعاليات القادمة", "أقرب ٣ فعاليات مجدولة مع التواريخ"],
    ["تقدم المشاريع", "نسبة إنجاز المشاريع النشطة"],
    ["لوحة المتصدرين", "ترتيب الأعضاء حسب النقاط"],
    ["النشاط الأخير", "آخر الأحداث في النادي"],
    ["أدوار النادي", "شرح كل دور وصلاحياته"],
    ["نسبة الحضور", "رسم بياني لمعدل الحضور"],
  ];

  widgets.forEach((w, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xx = col === 0 ? 5.10 : 0.6;
    const yy = 1.15 + row * 1.05;
    addInfoCard(s8, xx, yy, 4.30, 0.90, w[0], w[1]);
  });

  s8.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.0, w: 8.8, h: 0.45,
    fill: { color: IVORY }, rectRadius: 0.08,
  });
  s8.addText("المعلمة ترى لوحة تحكم مختلفة عن الطالبة — تعرض الإحصائيات الإشرافية بدلاً من الملف الشخصي", {
    x: 0.75, y: 5.03, w: 8.5, h: 0.38,
    fontSize: 11, fontFace: font, color: PLUM,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SECTION: Members
  // ======================================================================
  addSectionSlide("القسم الأول", "إدارة العضوات", "عرض الملفات · تعديل البيانات · ملاحظات المشرفة");

  // SLIDE 10: Members list
  const s10 = pres.addSlide();
  s10.background = { color: WHITE };
  addTitle(s10, "قائمة العضوات");

  s10.addText([
    { text: "صفحة العضوات تعرض جميع عضوات النادي مع أدوات البحث والتصفية:", options: { fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 6, ...rtl } },
    { text: "البحث بالاسم أو اسم المستخدم", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "التصفية حسب: الصف الدراسي، اللجنة، الدور، الحالة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تصدير القائمة كملف CSV", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الضغط على اسم العضوة لفتح ملفها الكامل", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 8.8, h: 2.5,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Member profile details
  s10.addText("الملف الشخصي للعضوة يحتوي على:", {
    x: 0.6, y: 3.30, w: 8.8, h: 0.32,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const profileTabs = [
    ["البيانات الشخصية", "الاسم، الصف، البريد، الهاتف، ولي الأمر"],
    ["النقاط والإنجازات", "سجل النقاط والشارات الممنوحة"],
    ["الحضور والمهام", "سجل الحضور والمهام المسندة"],
    ["ملاحظات المشرفة", "ملاحظات خاصة لا تظهر للطالبة أبداً"],
  ];

  profileTabs.forEach((t, i) => {
    const xx = i < 2 ? 5.10 : 0.6;
    const yy = i % 2 === 0 ? 3.75 : 4.55;
    const row = i < 2 ? 3.75 : 4.55;
    const realY = Math.floor(i / 2) === 0 ? 3.75 : 4.55;
    const realX = i % 2 === 0 ? 5.10 : 0.6;
    addInfoCard(s10, realX, realY, 4.30, 0.68, t[0], t[1],
      t[0] === "ملاحظات المشرفة" ? { bg: IVORY, titleColor: ROSE } : {});
  });

  // ======================================================================
  // SLIDE 11: Edit member & assign role
  // ======================================================================
  const s11 = pres.addSlide();
  s11.background = { color: WHITE };
  addTitle(s11, "تعديل بيانات العضوة");

  s11.addText([
    { text: "من ملف العضوة، اضغطي «تعديل» لتغيير:", options: { fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 6, ...rtl } },
    { text: "الاسم الكامل (بالعربي والإنجليزي)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الصف الدراسي والبريد الإلكتروني", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الهاتف ورقم ولي الأمر", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "النبذة الشخصية", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "اللجنة التابعة لها", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الدور الوظيفي (عضوة، قائدة لجنة، نائبة، رئيسة)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "ملاحظات المشرفة الخاصة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 8.8, h: 3.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Roles table
  s11.addText("الأدوار المتاحة:", {
    x: 0.6, y: 4.15, w: 8.8, h: 0.30,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const roles = [
    ["مشرفة النادي", "كل الصلاحيات"],
    ["رئيسة النادي", "إدارة + مراجعة"],
    ["نائبة الرئيسة", "إدارة محدودة"],
    ["قائدة لجنة", "إدارة لجنتها"],
    ["عضوة", "مشاركة فقط"],
  ];

  roles.forEach((r, i) => {
    const xx = 0.6 + i * 1.88;
    s11.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: 4.50, w: 1.72, h: 0.85,
      fill: { color: i === 0 ? PLUM : CARD_BG }, rectRadius: 0.08,
    });
    s11.addText(r[0], {
      x: xx + 0.08, y: 4.53, w: 1.56, h: 0.35,
      fontSize: 11, fontFace: font, color: i === 0 ? WHITE : PLUM,
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
    s11.addText(r[1], {
      x: xx + 0.08, y: 4.88, w: 1.56, h: 0.35,
      fontSize: 9, fontFace: font, color: i === 0 ? ROSE_GOLD : INK_MUTED,
      align: "center", isTextBox: true, margin: 0, ...rtl,
    });
  });

  // ======================================================================
  // SLIDE 12: Committees & Events
  // ======================================================================
  addSectionSlide("القسم الثاني", "اللجان والفعاليات", "عرض اللجان · إنشاء الفعاليات · إدارة التسجيل");

  const s12 = pres.addSlide();
  s12.background = { color: WHITE };
  addTitle(s12, "اللجان والفعاليات");

  // Left side: committees
  s12.addText("اللجان", {
    x: 5.30, y: 1.40, w: 4.10, h: 0.32,
    fontSize: 16, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s12.addText([
    { text: "عرض جميع اللجان مع القائدات وعدد الأعضاء", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "المشاريع النشطة لكل لجنة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "المهام الحالية والأنشطة القادمة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "إعلانات كل لجنة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 5.30, y: 1.78, w: 4.10, h: 1.60,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Right side: events
  s12.addText("الفعاليات", {
    x: 0.60, y: 1.40, w: 4.30, h: 0.32,
    fontSize: 16, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s12.addText([
    { text: "عرض الفعاليات في شكل قائمة أو تقويم", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "إنشاء فعالية جديدة مع كل التفاصيل", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الموافقة على طلبات التسجيل أو رفضها", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تسجيل الحضور للمشاركات", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.60, y: 1.78, w: 4.30, h: 1.60,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Event creation fields
  s12.addText("إنشاء فعالية — الحقول:", {
    x: 0.6, y: 3.55, w: 8.8, h: 0.32,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const eventFields = [
    "العنوان (عربي/إنجليزي)",
    "الوصف والتفاصيل",
    "التاريخ والوقت",
    "المكان",
    "السعة القصوى",
    "آخر موعد للتسجيل",
    "اللجنة المنظمة",
    "النقاط المكتسبة",
  ];

  eventFields.forEach((f, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const xx = 0.6 + col * 2.32;
    const yy = 4.0 + row * 0.65;
    s12.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: yy, w: 2.12, h: 0.50,
      fill: { color: CARD_BG }, rectRadius: 0.08,
    });
    s12.addText(f, {
      x: xx + 0.1, y: yy + 0.05, w: 1.92, h: 0.40,
      fontSize: 10, fontFace: font, color: INK,
      align: "center", isTextBox: true, margin: 0, ...rtl,
    });
  });

  // ======================================================================
  // SLIDE 14: Attendance
  // ======================================================================
  const s14 = pres.addSlide();
  s14.background = { color: WHITE };
  addTitle(s14, "تسجيل الحضور");

  s14.addText([
    { text: "إنشاء جلسة حضور جديدة:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "اختاري نوع الجلسة: اجتماع، ورشة عمل، فعالية، مسابقة، اجتماع لجنة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "حددي العنوان (عربي/إنجليزي) والتاريخ واللجنة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 8, ...rtl } },
    { text: "تسجيل الحضور:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "حددي حالة كل عضوة:", options: { fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 8.8, h: 2.0,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Attendance status cards
  const statuses = [
    ["حاضرة", "22C55E"],
    ["غائبة", "EF4444"],
    ["متأخرة", "F59E0B"],
    ["بعذر", "3B82F6"],
  ];
  statuses.forEach((st, i) => {
    const xx = 0.6 + (3 - i) * 2.32;
    s14.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: 3.20, w: 2.12, h: 0.55,
      fill: { color: st[1], transparency: 85 }, rectRadius: 0.08,
      line: { color: st[1], width: 2 },
    });
    s14.addText(st[0], {
      x: xx, y: 3.20, w: 2.12, h: 0.55,
      fontSize: 14, fontFace: font, color: st[1],
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
  });

  s14.addText([
    { text: "زر «تحضير الكل» لتسجيل جميع العضوات حاضرات مرة واحدة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "يمكن تعديل الحضور لاحقاً (مع تسجيل في سجل المراجعة)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "صفحة الحضور تعرض: نسبة الحضور الإجمالية، الحضور حسب اللجنة، كل الجلسات السابقة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.6, y: 3.95, w: 8.8, h: 1.5,
    valign: "top", isTextBox: true, margin: 0,
  });

  // ======================================================================
  // SLIDE 15: Points & Leaderboard
  // ======================================================================
  const s15 = pres.addSlide();
  s15.background = { color: WHITE };
  addTitle(s15, "النقاط ولوحة المتصدرين");

  // Points section
  s15.addText("منح النقاط:", {
    x: 5.10, y: 1.40, w: 4.30, h: 0.32,
    fontSize: 15, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s15.addText([
    { text: "اختاري العضوة المراد منحها نقاطاً", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "حددي عدد النقاط (أو اختاري سبباً جاهزاً)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "اكتبي السبب (مثال: مشاركة متميزة)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "لا يمكن منح نقاط لنفسك", options: { bullet: true, fontSize: 11, fontFace: font, color: ROSE, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "يمكن عكس/تصحيح نقاط سابقة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 5.10, y: 1.78, w: 4.30, h: 2.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Leaderboard section
  s15.addText("لوحة المتصدرين:", {
    x: 0.60, y: 1.40, w: 4.10, h: 0.32,
    fontSize: 15, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s15.addText([
    { text: "ترتيب العضوات حسب النقاط المكتسبة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "فترات العرض: شهري، فصلي، الكل", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "متاحة لجميع العضوات للاطلاع", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.60, y: 1.78, w: 4.10, h: 1.5,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Points note
  s15.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 4.10, w: 8.8, h: 0.55,
    fill: { color: IVORY }, rectRadius: 0.08,
  });
  s15.addText("سجل النقاط تراكمي — لا يمكن حذف سجل، فقط عكسه بإدخال تعويضي مع ذكر السبب", {
    x: 0.75, y: 4.15, w: 8.5, h: 0.45,
    fontSize: 11, fontFace: font, color: PLUM,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 16: Tasks
  // ======================================================================
  addSectionSlide("القسم الثالث", "المهام والمشاريع", "توزيع المهام · متابعة التقدم · إدارة المشاريع");

  const s16 = pres.addSlide();
  s16.background = { color: WHITE };
  addTitle(s16, "إدارة المهام");

  s16.addText([
    { text: "إنشاء مهمة جديدة:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "العنوان والوصف (عربي/إنجليزي)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الأولوية: منخفضة، متوسطة، عالية، عاجلة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تاريخ التسليم", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "اللجنة والمشروع (اختياري)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تعيين المهمة لعضوات محددات (حصري للمشرفة)", options: { bullet: true, fontSize: 12, fontFace: font, color: ROSE, breakLine: true, paraSpaceAfter: 8, ...rtl } },
  ], {
    x: 5.10, y: 1.40, w: 4.30, h: 3.0,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Kanban board mockup
  s16.addText("لوحة المهام (Kanban):", {
    x: 0.60, y: 1.40, w: 4.10, h: 0.32,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const kanbanCols = [
    ["للتنفيذ", "EF4444"],
    ["قيد العمل", "F59E0B"],
    ["للمراجعة", "3B82F6"],
    ["منجزة", "22C55E"],
  ];
  kanbanCols.forEach((k, i) => {
    const xx = 0.60 + (3 - i) * 1.10;
    s16.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: 1.85, w: 0.95, h: 2.2,
      fill: { color: k[1], transparency: 90 }, rectRadius: 0.08,
      line: { color: k[1], width: 1 },
    });
    s16.addText(k[0], {
      x: xx, y: 1.88, w: 0.95, h: 0.28,
      fontSize: 9, fontFace: font, color: k[1],
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
  });

  s16.addText("يمكنك سحب المهام بين الأعمدة أو تغيير حالتها من صفحة المهمة", {
    x: 0.60, y: 4.20, w: 4.10, h: 0.35,
    fontSize: 10, fontFace: font, color: INK_MUTED,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 17: Projects
  // ======================================================================
  const s17 = pres.addSlide();
  s17.background = { color: WHITE };
  addTitle(s17, "المشاريع");

  s17.addText([
    { text: "إنشاء مشروع:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "العنوان والوصف", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الفريق المشارك", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الجدول الزمني (تاريخ البداية والنهاية)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "المراحل والإنجازات المرحلية", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 8, ...rtl } },
    { text: "متابعة المشروع:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "نسبة الإنجاز لكل مشروع", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "حالة كل مرحلة (مخطط، قيد التنفيذ، مكتمل)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الملفات والصور المرفقة والنتائج", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 8.8, h: 4.0,
    valign: "top", isTextBox: true, margin: 0,
  });

  // ======================================================================
  // SLIDE 18: Challenges & Ideas
  // ======================================================================
  const s18 = pres.addSlide();
  s18.background = { color: WHITE };
  addTitle(s18, "المسابقات الكيميائية وصندوق الأفكار");

  // Challenges
  s18.addText("المسابقات:", {
    x: 5.10, y: 1.40, w: 4.30, h: 0.32,
    fontSize: 15, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s18.addText([
    { text: "إنشاء مسابقة مع سؤال وخيارات والإجابة الصحيحة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "أنواع: اختيار من متعدد، إجابة قصيرة، صورة، لغز كيميائي", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تحديد فترة المسابقة (تاريخ الفتح والإغلاق)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "نقاط المكافأة للإجابات الصحيحة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "عرض إحصائيات المشاركة (عدد المشاركات، نسبة الصحة)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 5.10, y: 1.78, w: 4.30, h: 2.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Ideas
  s18.addText("صندوق الأفكار:", {
    x: 0.60, y: 1.40, w: 4.10, h: 0.32,
    fontSize: 15, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s18.addText([
    { text: "العضوات يقدمن أفكاراً واقتراحات", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "المشرفة تراجع وتغير الحالة:", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 2, ...rtl } },
    { text: "جديدة ← قيد المراجعة ← مقبولة ← مختارة ← مخطط لها ← منفذة", options: { fontSize: 10, fontFace: font, color: INK_MUTED, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "إضافة ملاحظات المشرفة على كل فكرة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تفعيل/إيقاف التصويت على الأفكار من إعدادات النادي", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.60, y: 1.78, w: 4.10, h: 2.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Note
  s18.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 4.25, w: 8.8, h: 0.50,
    fill: { color: IVORY }, rectRadius: 0.08,
  });
  s18.addText("المشرفة يمكنها أيضاً تقديم أفكارها الخاصة والمشاركة في المسابقات", {
    x: 0.75, y: 4.30, w: 8.5, h: 0.40,
    fontSize: 11, fontFace: font, color: PLUM,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 19: Announcements
  // ======================================================================
  const s19 = pres.addSlide();
  s19.background = { color: WHITE };
  addTitle(s19, "الإعلانات");

  s19.addText([
    { text: "نشر إعلان جديد:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "العنوان والمحتوى (عربي/إنجليزي)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "مستوى الإعلان:", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 2, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 8.8, h: 1.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Level cards
  const levels = [
    ["عادي", "3B82F6"],
    ["مهم", "F59E0B"],
    ["عاجل", "EF4444"],
  ];
  levels.forEach((l, i) => {
    const xx = 0.6 + (2 - i) * 3.13;
    s19.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: 2.65, w: 2.93, h: 0.50,
      fill: { color: l[1], transparency: 85 }, rectRadius: 0.08,
      line: { color: l[1], width: 2 },
    });
    s19.addText(l[0], {
      x: xx, y: 2.65, w: 2.93, h: 0.50,
      fontSize: 14, fontFace: font, color: l[1],
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
  });

  s19.addText([
    { text: "الجمهور المستهدف:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
  ], {
    x: 0.6, y: 3.35, w: 8.8, h: 0.35,
    valign: "top", isTextBox: true, margin: 0,
  });

  const audiences = [
    ["الجميع", "كل العضوات"],
    ["لجنة محددة", "عضوات لجنة واحدة"],
    ["القائدات فقط", "القائدات والنائبات"],
    ["عضوات محددات", "اختيار يدوي"],
  ];
  audiences.forEach((a, i) => {
    const xx = 0.6 + (3 - i) * 2.32;
    addInfoCard(s19, xx, 3.75, 2.12, 0.70, a[0], a[1]);
  });

  s19.addText("يمكن تثبيت الإعلان على لوحة التحكم · يمكن حذف الإعلان بعد النشر", {
    x: 0.6, y: 4.70, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: font, color: INK_MUTED,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 20: Magazine — editorial
  // ======================================================================
  addSectionSlide("القسم الرابع", "المجلة الإلكترونية", "لوحة التحرير · مراجعة المقالات · النشر والإصدارات");

  const s20 = pres.addSlide();
  s20.background = { color: WHITE };
  addTitle(s20, "المجلة — لوحة التحرير");

  s20.addText("المشرفة ترى لوحة التحرير الكاملة (وليس فقط «مقالاتي»):", {
    x: 0.6, y: 1.40, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: font, color: INK, align: "right",
    isTextBox: true, margin: 0, ...rtl,
  });

  const editorialCards = [
    ["إحصائيات المقالات", "عدد المقالات في كل حالة (مسودة، مقدمة، قيد المراجعة، منشورة)"],
    ["جميع المقالات المقدمة", "عرض كل ما قدمته العضوات للمراجعة"],
    ["الأكثر قراءة", "ترتيب المقالات حسب عدد القراءات"],
    ["عدد الكاتبات", "إحصائية بعدد العضوات المساهمات"],
  ];

  editorialCards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xx = col === 0 ? 5.10 : 0.6;
    const yy = 1.90 + row * 1.0;
    addInfoCard(s20, xx, yy, 4.30, 0.85, c[0], c[1]);
  });

  // Workflow
  s20.addText("سير عمل المقال:", {
    x: 0.6, y: 4.05, w: 8.8, h: 0.32,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const wfSteps = ["مسودة", "مقدمة", "قيد المراجعة", "مقبولة", "مجدولة", "منشورة"];
  wfSteps.forEach((st, i) => {
    const xx = 0.6 + (5 - i) * 1.55;
    s20.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: 4.45, w: 1.35, h: 0.45,
      fill: { color: i === 5 ? PLUM : CARD_BG }, rectRadius: 0.06,
    });
    s20.addText(st, {
      x: xx, y: 4.45, w: 1.35, h: 0.45,
      fontSize: 10, fontFace: font, color: i === 5 ? WHITE : INK,
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
    if (i < 5) {
      s20.addText("←", {
        x: xx - 0.22, y: 4.45, w: 0.22, h: 0.45,
        fontSize: 12, fontFace: font, color: INK_MUTED,
        align: "center", isTextBox: true, margin: 0,
      });
    }
  });

  s20.addText("المشرفة فقط تستطيع: النشر، إلغاء النشر، الجدولة، وضع المقال على الغلاف", {
    x: 0.6, y: 5.05, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: font, color: ROSE,
    align: "right", italic: true, isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 22: Magazine — issues & review
  // ======================================================================
  const s22 = pres.addSlide();
  s22.background = { color: WHITE };
  addTitle(s22, "المجلة — المراجعة والإصدارات");

  s22.addText([
    { text: "مراجعة المقالات:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "بدء المراجعة — نقل المقال إلى «قيد المراجعة»", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الموافقة — قبول المقال للنشر", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "طلب تعديل — إعادة المقال للكاتبة مع ملاحظات", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 8, ...rtl } },
    { text: "إصدارات المجلة:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "إنشاء عدد جديد بعنوان وكلمة المحررة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "ربط المقالات المعتمدة بالعدد", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "نشر العدد ليظهر في الموقع العام", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 8.8, h: 4.0,
    valign: "top", isTextBox: true, margin: 0,
  });

  // ======================================================================
  // SLIDE 23: Certificates & Achievements
  // ======================================================================
  const s23 = pres.addSlide();
  s23.background = { color: WHITE };
  addTitle(s23, "الشهادات والإنجازات");

  // Certificates
  s23.addText("إصدار شهادة (حصري للمشرفة):", {
    x: 5.10, y: 1.40, w: 4.30, h: 0.32,
    fontSize: 14, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const certTypes = [
    "شهادة مشاركة",
    "عضوة متميزة",
    "سفيرة الكيمياء",
    "جائزة مسابقة",
    "مشاركة بحثية",
  ];
  s23.addText(certTypes.map((c, i) => ({
    text: c,
    options: {
      bullet: true, breakLine: i < certTypes.length - 1,
      fontSize: 11, fontFace: font, color: INK,
      paraSpaceAfter: 3, ...rtl,
    },
  })), {
    x: 5.10, y: 1.80, w: 4.30, h: 1.8,
    valign: "top", isTextBox: true, margin: 0,
  });

  s23.addText("قوالب: كلاسيك، حديث، أنيق · رقم تسلسلي تلقائي", {
    x: 5.10, y: 3.45, w: 4.30, h: 0.30,
    fontSize: 10, fontFace: font, color: INK_MUTED,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // Achievements
  s23.addText("الإنجازات والأوسمة:", {
    x: 0.60, y: 1.40, w: 4.10, h: 0.32,
    fontSize: 14, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const badgeTiers = [
    ["أساسي", ROSE_GOLD],
    ["تميز", ROSE],
    ["شرف", PLUM],
  ];
  badgeTiers.forEach((b, i) => {
    const xx = 0.60 + (2 - i) * 1.45;
    s23.addShape(pres.shapes.OVAL, {
      x: xx + 0.25, y: 1.90, w: 0.80, h: 0.80,
      fill: { color: b[1], transparency: 20 },
    });
    s23.addText(b[0], {
      x: xx, y: 2.75, w: 1.30, h: 0.30,
      fontSize: 11, fontFace: font, color: b[1],
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
  });

  s23.addText([
    { text: "منح شارة لعضوة مع ملاحظة (اختيارية)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "عرض سجل جميع الشارات الممنوحة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.60, y: 3.15, w: 4.10, h: 0.8,
    valign: "top", isTextBox: true, margin: 0,
  });

  // ======================================================================
  // SLIDE 24: Gallery & Resources
  // ======================================================================
  const s24 = pres.addSlide();
  s24.background = { color: WHITE };
  addTitle(s24, "معرض الصور والمصادر التعليمية");

  // Gallery
  s24.addText("معرض الصور:", {
    x: 5.10, y: 1.40, w: 4.30, h: 0.32,
    fontSize: 15, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s24.addText([
    { text: "إنشاء ألبوم جديد (عام أو للأعضاء فقط)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "رفع صور الفعاليات والأنشطة", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "الألبومات العامة تظهر في الموقع العام", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 5.10, y: 1.78, w: 4.30, h: 1.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Resources
  s24.addText("المصادر التعليمية:", {
    x: 0.60, y: 1.40, w: 4.10, h: 0.32,
    fontSize: 15, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s24.addText([
    { text: "رفع مصادر: PDF، DOC، عروض، جداول", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تصنيف: السلامة، أوراق التجارب، قوالب البحث، إرشادات المسابقات، سياسات النادي، عروض تقديمية", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
  ], {
    x: 0.60, y: 1.78, w: 4.10, h: 1.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Visibility levels
  s24.addText("مستويات الرؤية للمصادر:", {
    x: 0.6, y: 3.30, w: 8.8, h: 0.32,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });

  const visLevels = [
    ["كل العضوات", "جميع عضوات النادي يرونها", "22C55E"],
    ["القائدات والمشرفات", "القائدات والمشرفات فقط", "F59E0B"],
    ["المشرفات فقط", "المعلمة المشرفة حصرياً", "EF4444"],
  ];
  visLevels.forEach((v, i) => {
    const xx = 0.6 + (2 - i) * 3.13;
    s24.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: xx, y: 3.72, w: 2.93, h: 0.85,
      fill: { color: v[2], transparency: 90 }, rectRadius: 0.08,
      line: { color: v[2], width: 1 },
    });
    s24.addText(v[0], {
      x: xx + 0.1, y: 3.77, w: 2.73, h: 0.30,
      fontSize: 12, fontFace: font, color: v[2],
      align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
    });
    s24.addText(v[1], {
      x: xx + 0.1, y: 4.10, w: 2.73, h: 0.35,
      fontSize: 10, fontFace: font, color: INK_MUTED,
      align: "center", isTextBox: true, margin: 0, ...rtl,
    });
  });

  // ======================================================================
  // SLIDE 25: Reports
  // ======================================================================
  const s25 = pres.addSlide();
  s25.background = { color: WHITE };
  addTitle(s25, "التقارير والإحصائيات");

  s25.addText("صفحة التقارير تعرض لك رؤية شاملة عن أداء النادي:", {
    x: 0.6, y: 1.40, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: font, color: INK, align: "right",
    isTextBox: true, margin: 0, ...rtl,
  });

  const reportCards = [
    ["الأعضاء النشطات", "عدد العضوات الفعّالات"],
    ["إحصائيات الحضور", "رسم بياني لمعدل الحضور"],
    ["توزيع النقاط", "بحسب اللجان (رسم أعمدة)"],
    ["أنشط اللجان", "ترتيب اللجان حسب النشاط"],
    ["المشاركة في الفعاليات", "نسبة الحضور للفعاليات"],
    ["تقدم المشاريع", "حالة كل مشروع نشط"],
    ["المسابقات", "عدد المشاركات والنتائج"],
    ["المجلة", "مقالات مقدمة ومنشورة"],
  ];

  reportCards.forEach((r, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const xx = 0.6 + (3 - col) * 2.32;
    const yy = 1.90 + row * 1.10;
    addInfoCard(s25, xx, yy, 2.12, 0.95, r[0], r[1]);
  });

  s25.addText("يمكن تصدير التقارير · البيانات محدثة لحظياً", {
    x: 0.6, y: 4.25, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: font, color: INK_MUTED,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SECTION: Administration
  // ======================================================================
  addSectionSlide("القسم الخامس", "الإدارة", "إدارة الحسابات · سجل المراجعة · إعدادات النادي");

  // SLIDE 27: User Management
  const s27 = pres.addSlide();
  s27.background = { color: WHITE };
  addTitle(s27, "إدارة الحسابات (حصري للمشرفة)");

  s27.addText([
    { text: "إنشاء حساب جديد:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "اسم المستخدم، البريد، كلمة المرور", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تحديد الدور (عضوة، قائدة، نائبة، رئيسة، مشرفة)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تحديد الصف واللجنة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 8, ...rtl } },
    { text: "إدارة الحسابات الحالية:", options: { bold: true, fontSize: 13, fontFace: font, color: PLUM, breakLine: true, paraSpaceAfter: 4, ...rtl } },
    { text: "تفعيل / تعطيل الحساب", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تعيين كخريجة", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "إعادة تعيين كلمة المرور (كلمة مرور مؤقتة تُغيَّر عند أول دخول)", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "عرض تاريخ آخر تسجيل دخول", options: { bullet: true, fontSize: 12, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.6, y: 1.40, w: 8.8, h: 4.0,
    valign: "top", isTextBox: true, margin: 0,
  });

  // ======================================================================
  // SLIDE 28: Audit, Settings, Roles
  // ======================================================================
  const s28 = pres.addSlide();
  s28.background = { color: WHITE };
  addTitle(s28, "سجل المراجعة وإعدادات النادي");

  // Audit
  s28.addText("سجل المراجعة (Audit Log):", {
    x: 5.10, y: 1.40, w: 4.30, h: 0.32,
    fontSize: 14, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s28.addText([
    { text: "يسجل كل عملية حساسة تلقائياً:", options: { fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "إنشاء الحسابات وتعديل الأدوار", options: { bullet: true, fontSize: 10, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 2, ...rtl } },
    { text: "تسجيل الحضور ومنح النقاط", options: { bullet: true, fontSize: 10, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 2, ...rtl } },
    { text: "نشر المقالات وإصدار الشهادات", options: { bullet: true, fontSize: 10, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 2, ...rtl } },
    { text: "تعديل الإعدادات وإعادة تعيين كلمات المرور", options: { bullet: true, fontSize: 10, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 2, ...rtl } },
    { text: "كل سجل يتضمن: من، ماذا، متى", options: { fontSize: 11, fontFace: font, color: INK_MUTED, ...rtl } },
  ], {
    x: 5.10, y: 1.78, w: 4.30, h: 2.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Settings
  s28.addText("إعدادات النادي:", {
    x: 0.60, y: 1.40, w: 4.10, h: 0.32,
    fontSize: 14, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s28.addText([
    { text: "تفعيل/إيقاف التصويت على الأفكار", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تفعيل/إيقاف الموافقة على تسجيل الفعاليات", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, breakLine: true, paraSpaceAfter: 3, ...rtl } },
    { text: "تعديل إعدادات النادي (الأسماء، التواريخ)", options: { bullet: true, fontSize: 11, fontFace: font, color: INK, ...rtl } },
  ], {
    x: 0.60, y: 1.78, w: 4.10, h: 1.2,
    valign: "top", isTextBox: true, margin: 0,
  });

  // Roles matrix
  s28.addText("مصفوفة الصلاحيات:", {
    x: 0.60, y: 3.15, w: 4.10, h: 0.32,
    fontSize: 14, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s28.addText("من «الأدوار والصلاحيات» يمكنك رؤية جدول كامل بكل صلاحية ومن يملكها — ٣٧ صلاحية موزعة على ٥ أدوار", {
    x: 0.60, y: 3.50, w: 4.10, h: 0.60,
    fontSize: 11, fontFace: font, color: INK,
    align: "right", isTextBox: true, margin: 0, valign: "top", ...rtl,
  });

  // Profile & Settings
  s28.addText("الملف الشخصي والإعدادات:", {
    x: 0.6, y: 4.25, w: 8.8, h: 0.30,
    fontSize: 13, fontFace: font, color: PLUM,
    align: "right", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s28.addText("تغيير اللغة (عربي/إنجليزي) · تغيير كلمة المرور · تعديل الصورة الشخصية · إعدادات الإشعارات · تبديل الوضع الفاتح/الداكن", {
    x: 0.6, y: 4.58, w: 8.8, h: 0.50,
    fontSize: 11, fontFace: font, color: INK,
    align: "right", isTextBox: true, margin: 0, ...rtl,
  });

  // ======================================================================
  // SLIDE 29: Exclusive permissions summary
  // ======================================================================
  const s29 = pres.addSlide();
  s29.background = { color: WHITE };
  addTitle(s29, "صلاحيات حصرية للمشرفة");

  s29.addText("هذه المهام لا يستطيع أحد غير المشرفة تنفيذها:", {
    x: 0.6, y: 1.40, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: font, color: INK, align: "right",
    isTextBox: true, margin: 0, ...rtl,
  });

  const exclusives = [
    ["إنشاء وإدارة الحسابات", "إنشاء حسابات جديدة، تفعيل/تعطيل، إعادة تعيين كلمة المرور"],
    ["تغيير أدوار العضوات", "ترقية أو تغيير دور أي عضوة"],
    ["ملاحظات المشرفة", "كتابة ملاحظات خاصة على ملفات العضوات لا تظهر لهن"],
    ["نشر المقالات", "نشر، إلغاء نشر، جدولة المقالات، وضعها على الغلاف"],
    ["إصدار الشهادات", "إصدار شهادات رسمية بأنواعها المختلفة"],
    ["تعيين المهام", "إسناد مهام لعضوات بعينهن"],
    ["سجل المراجعة", "الاطلاع على سجل كل العمليات الحساسة"],
    ["إعدادات النادي", "تغيير إعدادات المنصة والتبديلات"],
  ];

  exclusives.forEach((e, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xx = col === 0 ? 5.10 : 0.6;
    const yy = 1.90 + row * 0.82;
    addInfoCard(s29, xx, yy, 4.30, 0.72, e[0], e[1], { bg: IVORY, titleColor: ROSE });
  });

  // ======================================================================
  // SLIDE 30: Closing
  // ======================================================================
  const s30 = pres.addSlide();
  s30.background = { color: PLUM };

  s30.addShape(pres.shapes.OVAL, {
    x: -1.0, y: -1.5, w: 4.0, h: 4.0,
    fill: { color: ROSE, transparency: 82 },
  });
  s30.addShape(pres.shapes.OVAL, {
    x: 8.0, y: 3.0, w: 3.0, h: 3.0,
    fill: { color: ROSE_GOLD, transparency: 85 },
  });

  s30.addText("أنتِ جاهزة!", {
    x: 0.5, y: 1.8, w: 9.0, h: 0.9,
    fontSize: 40, fontFace: font, color: WHITE,
    align: "center", bold: true, isTextBox: true, margin: 0, ...rtl,
  });
  s30.addText("المنصة بين يديك — سجلي دخولك واستكشفي جميع الأدوات", {
    x: 0.5, y: 2.8, w: 9.0, h: 0.5,
    fontSize: 15, fontFace: font, color: ROSE_GOLD,
    align: "center", isTextBox: true, margin: 0, ...rtl,
  });
  s30.addText("٣٧ صلاحية · ١٤ قسم · منصة واحدة شاملة", {
    x: 0.5, y: 3.6, w: 9.0, h: 0.4,
    fontSize: 13, fontFace: font, color: ROSE,
    align: "center", isTextBox: true, margin: 0, ...rtl,
  });
  s30.addText("نادي الإيمان للكيمياء · مدرسة الإيمان الثانوية · 2026–2027", {
    x: 0.5, y: 4.85, w: 9.0, h: 0.4,
    fontSize: 11, fontFace: font, color: ROSE,
    align: "center", isTextBox: true, margin: 0, ...rtl,
  });

  return pres.writeFile({ fileName: "/home/user/Pearl-Vita-C-/aecc-guide-teacher.pptx" })
    .then(() => console.log("Created: /home/user/Pearl-Vita-C-/aecc-guide-teacher.pptx"));
}

buildDeck().catch(e => { console.error(e); process.exit(1); });
