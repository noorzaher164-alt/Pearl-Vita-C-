const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// --- React Icons rendering ---
let renderIcon;
try {
  const React = require("react");
  const ReactDOMServer = require("react-dom/server");
  const sharp = require("sharp");
  renderIcon = async (IconComponent, color, size = 256) => {
    const svg = ReactDOMServer.renderToStaticMarkup(
      React.createElement(IconComponent, { size, color, strokeWidth: 1.75 })
    );
    const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    return "image/png;base64," + buf.toString("base64");
  };
} catch {
  renderIcon = null;
}

// AECC Brand Palette
const PLUM = "48132F";
const PLUM_DARK = "3C0824";
const ROSE = "9F656B";
const ROSE_GOLD = "CB8C78";
const IVORY = "FBEAE6";
const BLUSH = "FDF5EF";
const WHITE = "FFFFFF";
const INK = "2D1A1E";
const INK_MUTED = "5E4650";

// RTL text helper
const rtl = (text, opts = {}) => ({
  text,
  options: { rtlMode: true, lang: "ar-QA", ...opts },
});

async function buildDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "AECC Platform";
  pres.subject = "دليل استخدام المنصة";
  pres.title = "دليل استخدام منصة نادي الإيمان للكيمياء";

  // Load flask icon for branding
  let flaskIcon = null;
  if (renderIcon) {
    try {
      const { LuFlaskConical } = require("react-icons/lu");
      flaskIcon = await renderIcon(LuFlaskConical, "#FFFFFF", 128);
    } catch {}
  }

  // =====================================================
  // SLIDE 1: Title
  // =====================================================
  const s1 = pres.addSlide();
  s1.background = { color: PLUM };

  // Decorative circle top-right
  s1.addShape(pres.shapes.OVAL, {
    x: 7.5, y: -1.2, w: 3.5, h: 3.5,
    fill: { color: ROSE, transparency: 80 },
    line: { color: ROSE, width: 1, transparency: 60 },
  });
  // Decorative circle bottom-left
  s1.addShape(pres.shapes.OVAL, {
    x: -0.8, y: 3.5, w: 2.8, h: 2.8,
    fill: { color: ROSE_GOLD, transparency: 85 },
    line: { color: ROSE_GOLD, width: 1, transparency: 70 },
  });

  if (flaskIcon) {
    s1.addImage({ data: flaskIcon, x: 4.4, y: 0.6, w: 1.2, h: 1.2 });
  }

  s1.addText("نادي الإيمان للكيمياء", {
    x: 0.5, y: 1.9, w: 9, h: 0.6,
    fontSize: 18, fontFace: "Arial",
    color: ROSE_GOLD, align: "center",
    rtlMode: true, lang: "ar-QA",
    letterSpacing: 3, bold: true, isTextBox: true,
  });

  s1.addText("دليل استخدام المنصة", {
    x: 0.5, y: 2.5, w: 9, h: 1.2,
    fontSize: 40, fontFace: "Arial",
    color: WHITE, align: "center",
    rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true,
  });

  s1.addText("خطوة بخطوة — من التسجيل إلى لوحة التحكم", {
    x: 0.5, y: 3.7, w: 9, h: 0.5,
    fontSize: 16, fontFace: "Arial",
    color: ROSE_GOLD, align: "center",
    rtlMode: true, lang: "ar-QA",
    isTextBox: true,
  });

  s1.addText("مدرسة الإيمان الثانوية · 2026 – 2027", {
    x: 0.5, y: 4.8, w: 9, h: 0.4,
    fontSize: 12, fontFace: "Arial",
    color: ROSE, align: "center",
    rtlMode: true, lang: "ar-QA",
    isTextBox: true,
  });

  // =====================================================
  // SLIDE 2: Open the site
  // =====================================================
  const s2 = pres.addSlide();
  s2.background = { color: WHITE };

  // Top accent bar
  s2.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: PLUM },
  });

  s2.addText("الخطوة الأولى", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: "Arial", color: ROSE_GOLD,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  s2.addText("افتحي الموقع", {
    x: 0.6, y: 0.7, w: 8.8, h: 0.7,
    fontSize: 36, fontFace: "Arial", color: PLUM,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  // Content area with description
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.7, w: 8.8, h: 3.3,
    fill: { color: IVORY }, rectRadius: 0.15,
    line: { color: "E8D0CB", width: 1 },
  });

  s2.addText([
    rtl("الموقع العام مفتوح للجميع ويعرض:", { fontSize: 17, bold: true, color: PLUM, breakLine: true }),
    rtl("", { fontSize: 8, breakLine: true }),
    rtl("الصفحة الرئيسية — تعريف بالنادي وأهم الأنشطة", { fontSize: 15, color: INK, bullet: true, breakLine: true }),
    rtl("عن النادي — الرسالة والرؤية والقيم", { fontSize: 15, color: INK, bullet: true, breakLine: true }),
    rtl("حياة النادي — الأنشطة والإنجازات", { fontSize: 15, color: INK, bullet: true, breakLine: true }),
    rtl("المجلة الإلكترونية — المقالات المنشورة", { fontSize: 15, color: INK, bullet: true, breakLine: true }),
    rtl("معرض الصور — ألبومات الفعاليات", { fontSize: 15, color: INK, bullet: true, breakLine: true }),
    rtl("", { fontSize: 8, breakLine: true }),
    rtl('اضغطي على "تسجيل الدخول" للانتقال إلى صفحة الدخول.', { fontSize: 15, bold: true, color: ROSE }),
  ], {
    x: 1.1, y: 1.9, w: 7.8, h: 2.9,
    valign: "top", rtlMode: true, lang: "ar-QA",
    paraSpaceAfter: 4, isTextBox: true, margin: 0,
  });

  // =====================================================
  // SLIDE 3: Create Account
  // =====================================================
  const s3 = pres.addSlide();
  s3.background = { color: WHITE };

  s3.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: PLUM },
  });

  s3.addText("الخطوة الثانية", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: "Arial", color: ROSE_GOLD,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  s3.addText("إنشاء حساب جديد", {
    x: 0.6, y: 0.7, w: 8.8, h: 0.7,
    fontSize: 36, fontFace: "Arial", color: PLUM,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  // Form fields as cards
  const fields = [
    { label: "الاسم الكامل", desc: "بالعربي والإنجليزي", icon: "👤" },
    { label: "اسم المستخدم", desc: "مثال: sara.almutairi", icon: "🔑" },
    { label: "البريد الإلكتروني", desc: "البريد الرسمي", icon: "✉️" },
    { label: "الصف الدراسي", desc: "10 أو 11 أو 12", icon: "🎓" },
    { label: "كلمة المرور", desc: "اختاري كلمة مرور قوية", icon: "🔒" },
    { label: "تأكيد كلمة المرور", desc: "أعيدي كتابتها", icon: "✅" },
  ];

  // 2 columns x 3 rows
  fields.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 5.15 : 0.6; // RTL: right first
    const y = 1.7 + row * 1.05;

    s3.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.25, h: 0.9,
      fill: { color: IVORY }, rectRadius: 0.1,
      line: { color: "E8D0CB", width: 1 },
    });

    s3.addText(f.label, {
      x: x + 0.2, y: y + 0.1, w: 3.5, h: 0.35,
      fontSize: 14, fontFace: "Arial", color: PLUM,
      align: "right", rtlMode: true, lang: "ar-QA",
      bold: true, isTextBox: true, margin: 0,
    });

    s3.addText(f.desc, {
      x: x + 0.2, y: y + 0.45, w: 3.5, h: 0.3,
      fontSize: 11, fontFace: "Arial", color: INK_MUTED,
      align: "right", rtlMode: true, lang: "ar-QA",
      isTextBox: true, margin: 0,
    });
  });

  s3.addText('بعد تعبئة البيانات، اضغطي "إنشاء حساب" ← يمكنك تسجيل الدخول فوراً', {
    x: 0.6, y: 4.95, w: 8.8, h: 0.4,
    fontSize: 13, fontFace: "Arial", color: ROSE,
    align: "center", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true,
  });

  // =====================================================
  // SLIDE 4: Login
  // =====================================================
  const s4 = pres.addSlide();
  s4.background = { color: WHITE };

  s4.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: PLUM },
  });

  s4.addText("الخطوة الثالثة", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: "Arial", color: ROSE_GOLD,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  s4.addText("تسجيل الدخول", {
    x: 0.6, y: 0.7, w: 8.8, h: 0.7,
    fontSize: 36, fontFace: "Arial", color: PLUM,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  // Login form mockup - centered card
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 2.5, y: 1.6, w: 5, h: 3.2,
    fill: { color: IVORY }, rectRadius: 0.18,
    line: { color: "E8D0CB", width: 1 },
    shadow: { type: "outer", blur: 12, offset: 4, angle: 270, color: "000000", opacity: 0.08 },
  });

  s4.addText("مرحباً بعودتك", {
    x: 2.8, y: 1.8, w: 4.4, h: 0.45,
    fontSize: 20, fontFace: "Arial", color: PLUM,
    align: "center", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true,
  });

  // Username field mock
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3, y: 2.4, w: 4, h: 0.5,
    fill: { color: WHITE }, rectRadius: 0.08,
    line: { color: "D0B5B0", width: 1 },
  });
  s4.addText("اسم المستخدم", {
    x: 3.15, y: 2.45, w: 3.7, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: INK_MUTED,
    align: "right", rtlMode: true, lang: "ar-QA",
    isTextBox: true, margin: 0,
  });

  // Password field mock
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3, y: 3.05, w: 4, h: 0.5,
    fill: { color: WHITE }, rectRadius: 0.08,
    line: { color: "D0B5B0", width: 1 },
  });
  s4.addText("كلمة المرور", {
    x: 3.15, y: 3.1, w: 3.7, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: INK_MUTED,
    align: "right", rtlMode: true, lang: "ar-QA",
    isTextBox: true, margin: 0,
  });

  // Sign in button mock
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3, y: 3.75, w: 4, h: 0.5,
    fill: { color: PLUM }, rectRadius: 0.08,
  });
  s4.addText("تسجيل الدخول", {
    x: 3, y: 3.75, w: 4, h: 0.5,
    fontSize: 14, fontFace: "Arial", color: WHITE,
    align: "center", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true,
  });

  s4.addText("نسيتِ كلمة المرور؟ اضغطي على الرابط وسيتواصل معك المشرف", {
    x: 0.6, y: 4.95, w: 8.8, h: 0.4,
    fontSize: 13, fontFace: "Arial", color: INK_MUTED,
    align: "center", rtlMode: true, lang: "ar-QA",
    isTextBox: true,
  });

  // =====================================================
  // SLIDE 5: Navigation
  // =====================================================
  const s5 = pres.addSlide();
  s5.background = { color: WHITE };

  s5.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: PLUM },
  });

  s5.addText("الخطوة الرابعة", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: "Arial", color: ROSE_GOLD,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  s5.addText("التنقل في المنصة", {
    x: 0.6, y: 0.7, w: 8.8, h: 0.7,
    fontSize: 36, fontFace: "Arial", color: PLUM,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  // Sidebar mock
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7, y: 1.6, w: 2.4, h: 3.5,
    fill: { color: PLUM }, rectRadius: 0.12,
  });

  const sidebarItems = [
    { label: "لوحة التحكم", active: true },
    { label: "الأعضاء", active: false },
    { label: "اللجان", active: false },
    { label: "الفعاليات", active: false },
    { label: "الحضور", active: false },
    { label: "المهام", active: false },
    { label: "الإنجازات", active: false },
    { label: "الإعلانات", active: false },
    { label: "المجلة", active: false },
  ];

  sidebarItems.forEach((item, i) => {
    if (item.active) {
      s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 7.15, y: 1.75 + i * 0.35, w: 2.1, h: 0.3,
        fill: { color: ROSE, transparency: 70 }, rectRadius: 0.06,
      });
    }
    s5.addText(item.label, {
      x: 7.15, y: 1.75 + i * 0.35, w: 2.1, h: 0.3,
      fontSize: 10, fontFace: "Arial",
      color: item.active ? WHITE : "D7A7A5",
      align: "right", rtlMode: true, lang: "ar-QA",
      bold: item.active, isTextBox: true,
    });
  });

  // Description on the left
  s5.addText([
    rtl("الشريط الجانبي (على الحاسوب):", { fontSize: 15, bold: true, color: PLUM, breakLine: true }),
    rtl("يحتوي على جميع أقسام المنصة مقسمة إلى مجموعات", { fontSize: 13, color: INK_MUTED, breakLine: true }),
    rtl("", { fontSize: 8, breakLine: true }),
    rtl("النادي: لوحة التحكم، الأعضاء، اللجان، الفعاليات، الحضور", { fontSize: 13, color: INK, bullet: true, breakLine: true }),
    rtl("النشاط: المهام، الإنجازات، الإعلانات", { fontSize: 13, color: INK, bullet: true, breakLine: true }),
    rtl("النشر: المجلة، الشهادات", { fontSize: 13, color: INK, bullet: true, breakLine: true }),
    rtl("الإدارة: إدارة المستخدمين", { fontSize: 13, color: INK, bullet: true, breakLine: true }),
    rtl("", { fontSize: 10, breakLine: true }),
    rtl("الشريط العلوي:", { fontSize: 15, bold: true, color: PLUM, breakLine: true }),
    rtl("يحتوي على:", { fontSize: 13, color: INK_MUTED, breakLine: true }),
    rtl("الدور الوظيفي · أيقونة المهام · جرس الإشعارات", { fontSize: 13, color: INK, bullet: true, breakLine: true }),
    rtl("تبديل الوضع (فاتح/داكن) · تبديل اللغة (عربي/إنجليزي)", { fontSize: 13, color: INK, bullet: true }),
  ], {
    x: 0.6, y: 1.6, w: 6, h: 3.5,
    valign: "top", rtlMode: true, lang: "ar-QA",
    paraSpaceAfter: 3, isTextBox: true, margin: 0,
  });

  // =====================================================
  // SLIDE 6: Dashboard
  // =====================================================
  const s6 = pres.addSlide();
  s6.background = { color: WHITE };

  s6.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: PLUM },
  });

  s6.addText("الخطوة الخامسة", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: "Arial", color: ROSE_GOLD,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  s6.addText("لوحة التحكم — ما ستراه المعلمة", {
    x: 0.6, y: 0.7, w: 8.8, h: 0.7,
    fontSize: 34, fontFace: "Arial", color: PLUM,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  // Metric cards mockup
  const metrics = [
    { label: "إجمالي الأعضاء", value: "—", color: PLUM },
    { label: "الفعاليات القادمة", value: "—", color: ROSE },
    { label: "المشاريع الجارية", value: "—", color: "764E61" },
    { label: "نسبة الحضور", value: "—%", color: ROSE_GOLD },
  ];

  metrics.forEach((m, i) => {
    const x = 7.15 - i * 2.2;
    s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 2, h: 1.1,
      fill: { color: IVORY }, rectRadius: 0.1,
      line: { color: "E8D0CB", width: 1 },
    });
    s6.addText(m.label, {
      x: x + 0.15, y: 1.7, w: 1.7, h: 0.35,
      fontSize: 11, fontFace: "Arial", color: INK_MUTED,
      align: "right", rtlMode: true, lang: "ar-QA",
      isTextBox: true, margin: 0,
    });
    s6.addText(m.value, {
      x: x + 0.15, y: 2.1, w: 1.7, h: 0.45,
      fontSize: 24, fontFace: "Arial", color: m.color,
      align: "right", rtlMode: true, lang: "ar-QA",
      bold: true, isTextBox: true, margin: 0,
    });
  });

  // Dashboard features
  s6.addText([
    rtl("لوحة التحكم تعرض لك:", { fontSize: 16, bold: true, color: PLUM, breakLine: true }),
    rtl("", { fontSize: 6, breakLine: true }),
    rtl("إحصائيات النادي — عدد الأعضاء، الفعاليات، المشاريع، الحضور، النقاط", { fontSize: 14, color: INK, bullet: true, breakLine: true }),
    rtl("آخر الإعلانات — أحدث إعلان منشور في النادي", { fontSize: 14, color: INK, bullet: true, breakLine: true }),
    rtl("الفعاليات القادمة — أقرب ٣ فعاليات مجدولة", { fontSize: 14, color: INK, bullet: true, breakLine: true }),
    rtl("تقدم المشاريع — نسبة إنجاز المشاريع النشطة", { fontSize: 14, color: INK, bullet: true, breakLine: true }),
    rtl("النشاط الأخير — آخر الأنشطة في النادي", { fontSize: 14, color: INK, bullet: true, breakLine: true }),
    rtl("إجراءات سريعة — اختصارات لأهم العمليات", { fontSize: 14, color: INK, bullet: true, breakLine: true }),
    rtl("لوحة المتصدرين — ترتيب الأعضاء حسب النقاط", { fontSize: 14, color: INK, bullet: true }),
  ], {
    x: 0.6, y: 2.9, w: 8.8, h: 2.5,
    valign: "top", rtlMode: true, lang: "ar-QA",
    paraSpaceAfter: 3, isTextBox: true, margin: 0,
  });

  // =====================================================
  // SLIDE 7: Key Features
  // =====================================================
  const s7 = pres.addSlide();
  s7.background = { color: WHITE };

  s7.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: PLUM },
  });

  s7.addText("أهم أدوات المنصة", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.7,
    fontSize: 34, fontFace: "Arial", color: PLUM,
    align: "right", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true, margin: 0,
  });

  const tools = [
    { title: "إدارة الفعاليات", desc: "إنشاء فعاليات وتحديد التاريخ والمكان والسعة" },
    { title: "تسجيل الحضور", desc: "تسجيل حضور كل عضوة في كل فعالية" },
    { title: "منح النقاط", desc: "مكافأة الأعضاء بالنقاط مع ذكر السبب" },
    { title: "إدارة المهام", desc: "توزيع المهام على الأعضاء مع مواعيد التسليم" },
    { title: "المجلة الإلكترونية", desc: "مراجعة ونشر مقالات الأعضاء" },
    { title: "الشهادات", desc: "إصدار شهادات مشاركة وتميز للأعضاء" },
    { title: "الإنجازات والأوسمة", desc: "منح شارات تقدير للأعضاء المتميزات" },
    { title: "إدارة المستخدمين", desc: "إنشاء حسابات وتحديد الأدوار والصلاحيات" },
  ];

  tools.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 5.1 : 0.6;
    const y = 1.2 + row * 1.05;

    s7.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.3, h: 0.9,
      fill: { color: IVORY }, rectRadius: 0.1,
      line: { color: "E8D0CB", width: 1 },
    });

    s7.addText(t.title, {
      x: x + 0.2, y: y + 0.1, w: 3.9, h: 0.35,
      fontSize: 14, fontFace: "Arial", color: PLUM,
      align: "right", rtlMode: true, lang: "ar-QA",
      bold: true, isTextBox: true, margin: 0,
    });

    s7.addText(t.desc, {
      x: x + 0.2, y: y + 0.45, w: 3.9, h: 0.3,
      fontSize: 11, fontFace: "Arial", color: INK_MUTED,
      align: "right", rtlMode: true, lang: "ar-QA",
      isTextBox: true, margin: 0,
    });
  });

  // =====================================================
  // SLIDE 8: Closing
  // =====================================================
  const s8 = pres.addSlide();
  s8.background = { color: PLUM };

  // Decorative circles
  s8.addShape(pres.shapes.OVAL, {
    x: -1, y: -1.5, w: 4, h: 4,
    fill: { color: ROSE, transparency: 85 },
    line: { color: ROSE, width: 1, transparency: 70 },
  });
  s8.addShape(pres.shapes.OVAL, {
    x: 8, y: 3, w: 3, h: 3,
    fill: { color: ROSE_GOLD, transparency: 85 },
    line: { color: ROSE_GOLD, width: 1, transparency: 70 },
  });

  if (flaskIcon) {
    s8.addImage({ data: flaskIcon, x: 4.4, y: 0.8, w: 1.2, h: 1.2 });
  }

  s8.addText("!ابدأي الآن", {
    x: 0.5, y: 2.2, w: 9, h: 1,
    fontSize: 44, fontFace: "Arial", color: WHITE,
    align: "center", rtlMode: true, lang: "ar-QA",
    bold: true, isTextBox: true,
  });

  s8.addText("المنصة جاهزة — سجلي دخولك واستكشفي جميع الأدوات", {
    x: 0.5, y: 3.2, w: 9, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: ROSE_GOLD,
    align: "center", rtlMode: true, lang: "ar-QA",
    isTextBox: true,
  });

  s8.addText("استكشفي · تفاعلي · اكتشفي", {
    x: 0.5, y: 4.1, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: ROSE,
    align: "center", rtlMode: true, lang: "ar-QA",
    isTextBox: true,
  });

  s8.addText("نادي الإيمان للكيمياء · مدرسة الإيمان الثانوية · 2026–2027", {
    x: 0.5, y: 4.8, w: 9, h: 0.4,
    fontSize: 11, fontFace: "Arial", color: "9F656B",
    align: "center", rtlMode: true, lang: "ar-QA",
    isTextBox: true,
  });

  // Write
  const outPath = path.join(process.cwd(), "aecc-guide-ar.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log("Created:", outPath);
}

buildDeck().catch(console.error);
