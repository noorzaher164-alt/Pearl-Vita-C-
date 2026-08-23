import type { ArticleBlock, ArticleStatus } from '@/lib/domain/types';

export interface SeedArticle {
  id: string;
  slug: string;
  category: string;
  authorId: string;
  status: ArticleStatus;
  featured: boolean;
  published?: string;
  submitted?: string;
  scheduled?: string;
  reviewNotes?: string;
  views: number;
  readingMinutes: number;
  cover: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  references: string[];
  blocks: ArticleBlock[];
}

export const SEED_ARTICLES: SeedArticle[] = [
  {
    id: 'ma-001',
    slug: 'the-chemistry-of-a-cup-of-tea',
    category: 'chemistry-around-us',
    authorId: 'u-020',
    status: 'published',
    featured: true,
    published: '2026-04-18',
    views: 1284,
    readingMinutes: 7,
    cover: '/media/covers/cover-tea.svg',
    title_en: 'The Chemistry of a Cup of Tea',
    title_ar: 'كيمياء فنجان الشاي',
    subtitle_en:
      'Why tea turns pale when you add lemon, and what that colour change tells us about acids, bases and the molecules that carry them.',
    subtitle_ar:
      'لماذا يفتح لون الشاي عند إضافة الليمون، وماذا يخبرنا هذا التغيّر عن الأحماض والقواعد والجزيئات التي تحملها.',
    references: [
      'Harold McGee, On Food and Cooking: The Science and Lore of the Kitchen (2004).',
      'Royal Society of Chemistry, “The chemistry of tea”, Education in Chemistry.',
      'N. Kumar et al., “Theaflavins and thearubigins in black tea”, Food Chemistry (2019).',
    ],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'Almost every household in the country begins its day with the same experiment, performed without a single piece of laboratory glassware. Hot water meets dried leaves, a colour develops, and within two minutes an entirely different liquid is sitting in the cup. What happens in those two minutes is, in the strictest sense, chemistry.',
        text_ar:
          'يبدأ كل بيت تقريبًا يومه بالتجربة نفسها، دون أي أداة من أدوات المختبر. يلتقي الماء الساخن بأوراق مجفّفة، فيتكوّن اللون، وخلال دقيقتين يصبح في الفنجان سائل مختلف تمامًا. وما يحدث في هاتين الدقيقتين هو كيمياء بالمعنى الدقيق للكلمة.',
      },
      {
        type: 'heading',
        text_en: 'Extraction is a competition between solvents',
        text_ar: 'الاستخلاص منافسة بين المذيبات',
      },
      {
        type: 'paragraph',
        text_en:
          'A dried tea leaf holds hundreds of compounds, but only some of them are willing to leave the leaf and enter the water. Whether a compound dissolves depends on how well its structure matches the solvent around it. Water is strongly polar, so it readily pulls out polar molecules — caffeine, amino acids and the family of polyphenols that give tea its astringency — while leaving most of the waxy, non-polar material behind in the leaf.',
        text_ar:
          'تحتوي ورقة الشاي المجفّفة على مئات المركبات، لكن بعضها فقط يغادر الورقة إلى الماء. ويعتمد ذوبان أي مركب على مدى تطابق بنيته مع المذيب المحيط به. والماء مذيب قطبي قوي، لذا يسحب بسهولة الجزيئات القطبية — الكافيين والأحماض الأمينية وعائلة البوليفينولات التي تمنح الشاي قبضه — بينما تبقى المواد الشمعية غير القطبية في الورقة.',
      },
      {
        type: 'callout',
        title_en: 'Why hotter water extracts faster',
        title_ar: 'لماذا يستخلص الماء الأسخن أسرع',
        text_en:
          'Raising the temperature increases the average kinetic energy of the water molecules. They collide with the leaf surface more often and with more energy, so compounds are dislodged and carried into solution more quickly. This is the same reason a reaction rate generally rises with temperature.',
        text_ar:
          'رفع درجة الحرارة يزيد متوسط الطاقة الحركية لجزيئات الماء، فتصطدم بسطح الورقة أكثر وبطاقة أعلى، وبذلك تُنتزع المركبات وتنتقل إلى المحلول أسرع. وهذا هو السبب نفسه في ازدياد سرعة التفاعلات عمومًا مع ارتفاع الحرارة.',
      },
      {
        type: 'heading',
        text_en: 'The lemon test',
        text_ar: 'اختبار الليمون',
      },
      {
        type: 'paragraph',
        text_en:
          'Add a slice of lemon and the tea lightens almost immediately. The compounds responsible for the deep colour of black tea — theaflavins and thearubigins — behave as natural pH indicators. In the mildly acidic conditions created by citric acid, their conjugated structures shift, absorbing light at a shorter wavelength, and the eye reads that as a paler, more orange liquid.',
        text_ar:
          'أضيفي شريحة ليمون فيفتح لون الشاي فورًا تقريبًا. فالمركبات المسؤولة عن اللون الداكن في الشاي الأسود — الثيافلافينات والثياروبيجينات — تتصرّف كأدلة طبيعية على الأس الهيدروجيني. وفي الوسط الحمضي الخفيف الذي يصنعه حمض الستريك تتغيّر بُناها المترافقة فتمتص الضوء عند طول موجي أقصر، فتراه العين سائلًا أفتح يميل إلى البرتقالي.',
      },
      {
        type: 'quote',
        text_en:
          'A good indicator does not change the reaction. It simply makes the reaction visible.',
        text_ar: 'الدليل الجيد لا يغيّر التفاعل، بل يجعله مرئيًا فحسب.',
        attribution_en: 'From the club’s laboratory notebook',
        attribution_ar: 'من دفتر مختبر النادي',
      },
      {
        type: 'paragraph',
        text_en:
          'You can run the reverse experiment at home: a small pinch of sodium bicarbonate darkens the same cup dramatically. It is a reminder that colour, in chemistry, is rarely decoration. It is data.',
        text_ar:
          'ويمكنك إجراء التجربة العكسية في المنزل: رشّة صغيرة من بيكربونات الصوديوم تُعتم الفنجان نفسه بوضوح. وهذا تذكير بأن اللون في الكيمياء نادرًا ما يكون زينة، بل هو بيانات.',
      },
    ],
  },

  {
    id: 'ma-002',
    slug: 'green-chemistry-twelve-principles',
    category: 'green-chemistry',
    authorId: 'u-009',
    status: 'published',
    featured: false,
    published: '2026-04-10',
    views: 862,
    readingMinutes: 8,
    cover: '/media/covers/cover-green.svg',
    title_en: 'Twelve Principles, One Laboratory',
    title_ar: 'اثنا عشر مبدأ ومختبر واحد',
    subtitle_en:
      'How our Sustainability Team rewrote three standard school experiments using the principles of green chemistry — and what we measured afterwards.',
    subtitle_ar:
      'كيف أعاد فريق الاستدامة صياغة ثلاث تجارب مدرسية معتادة وفق مبادئ الكيمياء الخضراء، وماذا قِسنا بعد ذلك.',
    references: [
      'P. Anastas & J. Warner, Green Chemistry: Theory and Practice (1998).',
      'ACS Green Chemistry Institute, “12 Principles of Green Chemistry”.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'Green chemistry is often introduced as a list to memorise. We wanted to treat it as a design brief instead: given a standard experiment, how much waste can be removed before the learning is lost?',
        text_ar:
          'كثيرًا ما تُقدَّم الكيمياء الخضراء بوصفها قائمة للحفظ. أردنا أن نتعامل معها بوصفها موجزًا تصميميًا: إذا أخذنا تجربة معتادة، فكم يمكن التخلص من نفاياتها قبل أن يضيع الهدف التعليمي؟',
      },
      {
        type: 'heading',
        text_en: 'Choosing the three experiments',
        text_ar: 'اختيار التجارب الثلاث',
      },
      {
        type: 'list',
        items_en: [
          'Acid–base titration, normally run at 25 mL scale with a burette.',
          'Copper displacement, normally producing copper sulfate waste.',
          'Ester synthesis, normally requiring concentrated sulfuric acid.',
        ],
        items_ar: [
          'معايرة حمض–قاعدة، تُجرى عادة بحجم ٢٥ مل باستخدام السحّاحة.',
          'إحلال النحاس، ويُنتج عادة نفايات من كبريتات النحاس.',
          'تحضير إستر، ويتطلب عادة حمض كبريتيك مركّزًا.',
        ],
      },
      {
        type: 'paragraph',
        text_en:
          'For the titration we moved to a microscale method using a graduated dropper and a 2 mL sample. The arithmetic is identical, the endpoint is just as sharp, and reagent consumption fell by roughly ninety per cent. For the displacement reaction we recovered and reused the copper rather than discarding it, which turned a disposal problem into a second lesson on filtration and drying.',
        text_ar:
          'في المعايرة انتقلنا إلى طريقة مصغّرة باستخدام قطارة مدرّجة وعيّنة بحجم ٢ مل. الحسابات نفسها، ونقطة النهاية واضحة كما هي، وانخفض استهلاك الكواشف نحو تسعين بالمئة. أما تفاعل الإحلال فقد استرجعنا النحاس وأعدنا استخدامه بدل التخلص منه، فتحوّلت مشكلة التخلص إلى درس ثانٍ في الترشيح والتجفيف.',
      },
      {
        type: 'callout',
        title_en: 'Atom economy in one line',
        title_ar: 'الاقتصاد الذري في سطر',
        text_en:
          'Atom economy = (mass of atoms in the desired product ÷ mass of atoms in all reactants) × 100. A reaction can give a high yield and still have poor atom economy if most of the starting mass ends up in by-products.',
        text_ar:
          'الاقتصاد الذري = (كتلة الذرات في الناتج المطلوب ÷ كتلة الذرات في جميع المتفاعلات) × ١٠٠. وقد يعطي التفاعل مردودًا عاليًا واقتصادًا ذريًا ضعيفًا إذا انتهت معظم الكتلة الابتدائية في نواتج جانبية.',
      },
      {
        type: 'paragraph',
        text_en:
          'Across one term the three redesigned experiments reduced our measured chemical waste by 2.4 kg and cut reagent spending by just under a third. More importantly, every student in the session could explain why the change had been made — which was the point.',
        text_ar:
          'وخلال فصل دراسي واحد خفّضت التجارب الثلاث المعاد تصميمها نفاياتنا الكيميائية المقاسة بمقدار ٢٫٤ كجم، وقلّلت الإنفاق على الكواشف بما يقارب الثلث. والأهم أن كل طالبة في الجلسة استطاعت تفسير سبب التغيير، وهذا هو المقصود.',
      },
    ],
  },

  {
    id: 'ma-003',
    slug: 'marie-curie-and-the-discipline-of-measurement',
    category: 'scientists-discoveries',
    authorId: 'u-016',
    status: 'published',
    featured: false,
    published: '2026-04-02',
    views: 1043,
    readingMinutes: 6,
    cover: '/media/covers/cover-curie.svg',
    title_en: 'Marie Curie and the Discipline of Measurement',
    title_ar: 'ماري كوري وانضباط القياس',
    subtitle_en:
      'The discovery of radium is remembered as a flash of genius. The notebooks tell a slower, more instructive story.',
    subtitle_ar:
      'يُذكر اكتشاف الراديوم بوصفه ومضة عبقرية، لكن الدفاتر تحكي قصة أبطأ وأكثر فائدة.',
    references: [
      'Susan Quinn, Marie Curie: A Life (1995).',
      'Nobel Foundation, Nobel Prize in Chemistry 1911 — presentation speech.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'To isolate one tenth of a gram of radium chloride, Marie Curie processed several tonnes of pitchblende residue. The work was not conceptually complicated. It was repetitive, physically exhausting, and required a level of measurement discipline that most laboratories of the period did not have.',
        text_ar:
          'لعزل عُشر غرام من كلوريد الراديوم عالجت ماري كوري عدة أطنان من مخلفات خام البتشبلند. لم يكن العمل معقّدًا من حيث الفكرة، لكنه كان متكررًا ومرهقًا جسديًا، ويتطلب انضباطًا في القياس لم يكن متوافرًا في أغلب مختبرات ذلك العصر.',
      },
      {
        type: 'heading',
        text_en: 'The instrument came first',
        text_ar: 'الأداة أولًا',
      },
      {
        type: 'paragraph',
        text_en:
          'Before any separation began, Curie used an electrometer — refined with her husband Pierre — to measure the ionising effect of a sample on air. That gave her a quantitative signal to follow. Each time she divided a batch, she could ask a precise question: which fraction carries the activity? Without that measurement, the separation would have been guesswork.',
        text_ar:
          'قبل أي فصل، استخدمت كوري مقياس الكهربية — الذي طوّرته مع زوجها بيير — لقياس أثر العيّنة المؤيّن في الهواء، فحصلت على إشارة كمية تتبعها. وفي كل مرة تقسم فيها دفعة كان بإمكانها طرح سؤال دقيق: أي جزء يحمل النشاط؟ ولولا ذلك القياس لكان الفصل تخمينًا.',
      },
      {
        type: 'quote',
        text_en: 'Nothing in life is to be feared, it is only to be understood.',
        text_ar: 'لا شيء في الحياة يستحق الخوف، إنما يستحق أن يُفهم.',
        attribution_en: 'Marie Skłodowska-Curie',
        attribution_ar: 'ماري سكوودوفسكا كوري',
      },
      {
        type: 'paragraph',
        text_en:
          'Her notebooks remain radioactive and are stored in lead-lined boxes at the Bibliothèque nationale de France. They are also, page after page, an argument that careful record-keeping is not administrative work. It is the experiment.',
        text_ar:
          'ولا تزال دفاترها مشعّة وتُحفظ في صناديق مبطّنة بالرصاص في المكتبة الوطنية الفرنسية. وهي أيضًا، صفحةً بعد صفحة، حجّة على أن التوثيق الدقيق ليس عملًا إداريًا، بل هو التجربة نفسها.',
      },
    ],
  },

  {
    id: 'ma-004',
    slug: 'why-soap-works',
    category: 'chemistry-in-beauty',
    authorId: 'u-013',
    status: 'published',
    featured: false,
    published: '2026-03-24',
    views: 1590,
    readingMinutes: 5,
    cover: '/media/covers/cover-soap.svg',
    title_en: 'Why Soap Works',
    title_ar: 'لماذا ينظّف الصابون',
    subtitle_en:
      'One molecule with two personalities — and the reason twenty seconds of washing is not an arbitrary number.',
    subtitle_ar: 'جزيء واحد بشخصيتين، والسبب في أن عشرين ثانية من الغسل ليست رقمًا اعتباطيًا.',
    references: [
      'Palenik et al., “The molecular basis of soap action”, Journal of Chemical Education (2020).',
    ],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'A soap molecule is a compromise. One end is an ionic head that is entirely comfortable in water; the other is a long hydrocarbon tail that is not. Neither end gets what it wants, and that tension is exactly what makes cleaning possible.',
        text_ar:
          'جزيء الصابون تسوية. أحد طرفيه رأس أيوني مرتاح تمامًا في الماء، والطرف الآخر ذيل هيدروكربوني طويل ليس كذلك. ولا يحصل أي من الطرفين على ما يريد، وهذا التوتر بالذات هو ما يجعل التنظيف ممكنًا.',
      },
      {
        type: 'heading',
        text_en: 'Micelles: an organised retreat',
        text_ar: 'المذيلات: انسحاب منظّم',
      },
      {
        type: 'paragraph',
        text_en:
          'Above a certain concentration the tails solve their problem collectively. They cluster inward, away from the water, forming a sphere with the ionic heads facing outward. Oil and grease dissolve into that hydrophobic interior, and the whole assembly — now water-friendly on the outside — rinses away.',
        text_ar:
          'فوق تركيز معيّن تحلّ الذيول مشكلتها جماعيًا: تتجمّع إلى الداخل بعيدًا عن الماء مكوّنة كرة تتجه فيها الرؤوس الأيونية إلى الخارج. فيذوب الزيت والدهن في ذلك الداخل الكاره للماء، وتنجرف المنظومة كاملة مع الشطف لأن سطحها الخارجي محبّ للماء.',
      },
      {
        type: 'callout',
        title_en: 'The twenty-second rule',
        title_ar: 'قاعدة العشرين ثانية',
        text_en:
          'Soap disrupts the lipid envelope of many viruses, but the tails need time to insert themselves and pull that envelope apart. Twenty seconds is a practical estimate of how long the mechanical and chemical action together need to work.',
        text_ar:
          'يفكّك الصابون الغلاف الدهني لكثير من الفيروسات، لكن الذيول تحتاج وقتًا لتندسّ فيه وتمزّقه. وعشرون ثانية تقدير عملي للمدة التي يحتاجها الفعل الميكانيكي والكيميائي معًا.',
      },
      {
        type: 'paragraph',
        text_en:
          'It is a satisfying piece of chemistry precisely because it is so ordinary: a structure–function relationship you can demonstrate with a bowl of water, a drop of oil and a little washing-up liquid.',
        text_ar:
          'إنها قطعة كيمياء مُرضية لأنها اعتيادية تمامًا: علاقة بين البنية والوظيفة يمكن إثباتها بوعاء ماء وقطرة زيت وقليل من سائل الجلي.',
      },
    ],
  },

  {
    id: 'ma-005',
    slug: 'inside-the-water-treatment-study',
    category: 'scientific-research',
    authorId: 'u-003',
    status: 'published',
    featured: false,
    published: '2026-03-12',
    views: 734,
    readingMinutes: 9,
    cover: '/media/covers/cover-water.svg',
    title_en: 'Inside the Water Treatment Study',
    title_ar: 'داخل دراسة معالجة المياه',
    subtitle_en:
      'Six months, four filter media and one stubborn variable: a first-hand account of the club’s longest-running research project.',
    subtitle_ar:
      'ستة أشهر وأربع أوساط ترشيح ومتغيّر عنيد واحد: رواية مباشرة عن أطول مشاريع النادي البحثية.',
    references: [
      'WHO, Guidelines for Drinking-water Quality, 4th edition (2017).',
      'Ali & Gupta, “Low-cost adsorbents for water treatment”, Environmental Chemistry Letters (2018).',
    ],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'The question sounded simple when we wrote it on the whiteboard in October: which locally available material removes turbidity from greywater most effectively per unit cost? Six months later we have an answer, three rejected hypotheses and a much better understanding of why research takes as long as it does.',
        text_ar:
          'بدا السؤال بسيطًا حين كتبناه على السبورة في أكتوبر: أي المواد المتوفرة محليًا أكثر فاعلية في إزالة العكارة من المياه الرمادية مقابل التكلفة؟ وبعد ستة أشهر لدينا إجابة، وثلاث فرضيات مرفوضة، وفهم أعمق بكثير لسبب طول زمن البحث.',
      },
      {
        type: 'heading',
        text_en: 'Controlling what we could',
        text_ar: 'ضبط ما نستطيع ضبطه',
      },
      {
        type: 'paragraph',
        text_en:
          'Our first three runs were unusable. Turbidity readings drifted between replicates by more than the difference we were trying to measure. The cause turned out to be sample handling: we were not allowing settled solids to redisperse consistently before drawing a sample. Fixing that single procedural detail cut our variance by more than half.',
        text_ar:
          'كانت جولاتنا الثلاث الأولى غير صالحة، إذ تباعدت قراءات العكارة بين المكررات بأكثر من الفارق الذي نحاول قياسه. وتبيّن أن السبب في مناولة العيّنة: لم نكن نعيد تشتيت الرواسب بانتظام قبل السحب. وتصحيح هذه التفصيلة الإجرائية وحدها خفّض التباين إلى أقل من النصف.',
      },
      {
        type: 'callout',
        title_en: 'What a control actually protects',
        title_ar: 'ما الذي تحميه الضابطة فعلًا',
        text_en:
          'A control does not prove your result is right. It protects you from believing a result that came from somewhere else — the container, the timing, the temperature, or the way the sample was drawn.',
        text_ar:
          'الضابطة لا تثبت صحة نتيجتك، بل تحميك من تصديق نتيجة جاءت من مصدر آخر: الوعاء أو التوقيت أو الحرارة أو طريقة سحب العيّنة.',
      },
      {
        type: 'list',
        items_en: [
          'Coarse sand: reliable, cheap, moderate turbidity removal.',
          'Activated charcoal: best odour and colour removal, highest cost per litre.',
          'Crushed date-palm fibre: surprisingly effective, highly variable between batches.',
          'Ceramic fragment bed: slowest flow rate, best clarity at low volumes.',
        ],
        items_ar: [
          'الرمل الخشن: موثوق ورخيص، وإزالة متوسطة للعكارة.',
          'الفحم المنشّط: الأفضل في إزالة الرائحة واللون، والأعلى تكلفة لكل لتر.',
          'ليف النخيل المطحون: فعّال بصورة مفاجئة، لكن تباينه بين الدفعات كبير.',
          'طبقة شظايا السيراميك: الأبطأ تدفقًا، والأفضل صفاءً عند الأحجام الصغيرة.',
        ],
      },
      {
        type: 'paragraph',
        text_en:
          'The date-palm fibre result is the one we are following up next year. Its variability is a problem, but a locally sourced agricultural by-product that performs anywhere near activated charcoal is worth understanding properly.',
        text_ar:
          'ونتيجة ليف النخيل هي التي سنتابعها العام القادم. تباينها مشكلة، لكن منتجًا زراعيًا ثانويًا محلي المصدر يقترب أداؤه من الفحم المنشّط يستحق فهمًا دقيقًا.',
      },
    ],
  },

  {
    id: 'ma-006',
    slug: 'the-periodic-table-is-a-map',
    category: 'student-articles',
    authorId: 'u-028',
    status: 'published',
    featured: false,
    published: '2026-02-28',
    views: 918,
    readingMinutes: 6,
    cover: '/media/covers/cover-table.svg',
    title_en: 'The Periodic Table Is a Map, Not a List',
    title_ar: 'الجدول الدوري خريطة لا قائمة',
    subtitle_en:
      'If you are memorising the table row by row, you are reading it the hard way. Here is how to read it as a set of directions.',
    subtitle_ar:
      'إن كنتِ تحفظين الجدول صفًا بعد صف فأنتِ تقرئينه بالطريقة الأصعب. إليك كيف تقرئينه بوصفه مجموعة اتجاهات.',
    references: ['Eric Scerri, The Periodic Table: Its Story and Its Significance (2019).'],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'When I joined the Education Team I was asked to help Grade 10 students revise the periodic table. Almost all of them were trying to memorise it as a sequence. Almost none of them could predict anything from it. That gap is the whole point of the table.',
        text_ar:
          'حين انضممت إلى الفريق التعليمي طُلب مني مساعدة طالبات الصف العاشر في مراجعة الجدول الدوري. كانت غالبيتهن يحاولن حفظه بوصفه تسلسلًا، ولم تكن أي منهن تقريبًا قادرة على التنبؤ بشيء منه. وهذه الفجوة هي جوهر الجدول.',
      },
      {
        type: 'heading',
        text_en: 'Two directions carry almost everything',
        text_ar: 'اتجاهان يحملان كل شيء تقريبًا',
      },
      {
        type: 'paragraph',
        text_en:
          'Move left to right across a period and the nuclear charge rises while electrons enter the same shell. The pull on those electrons increases, so atomic radius shrinks and ionisation energy climbs. Move down a group and each element adds a shell: the outer electrons sit further from the nucleus and are shielded by the ones beneath them, so they are easier to remove.',
        text_ar:
          'انتقلي من اليسار إلى اليمين عبر دورة، فترتفع الشحنة النووية بينما تدخل الإلكترونات المستوى نفسه. فيزداد الجذب عليها، ويصغر نصف القطر الذري، وترتفع طاقة التأيّن. وانتقلي إلى أسفل مجموعة، فيضيف كل عنصر مستوى جديدًا: تبتعد الإلكترونات الخارجية عن النواة وتحجبها الإلكترونات التي تحتها، فيسهل نزعها.',
      },
      {
        type: 'callout',
        title_en: 'A test you can run in your head',
        title_ar: 'اختبار يمكنك إجراؤه ذهنيًا',
        text_en:
          'Which has the larger atomic radius, sodium or magnesium? Same period, magnesium further right, therefore stronger nuclear pull, therefore smaller. You did not need to remember either value.',
        text_ar:
          'أيهما أكبر نصف قطر: الصوديوم أم المغنيسيوم؟ الدورة نفسها، والمغنيسيوم إلى اليمين أكثر، فالجذب النووي أقوى، فالحجم أصغر. ولم تحتاجي إلى حفظ أي قيمة.',
      },
      {
        type: 'paragraph',
        text_en:
          'Once the trends are secure, the exceptions become interesting rather than frightening. Half-filled and fully-filled subshells are unusually stable, which is why a handful of ionisation energies dip where you would expect them to rise. Those dips are evidence, not noise.',
        text_ar:
          'وحين ترسخ الاتجاهات تصبح الاستثناءات مثيرة للاهتمام لا مخيفة. فالمستويات الفرعية نصف الممتلئة والممتلئة تمامًا مستقرة على نحو غير معتاد، ولذلك تنخفض بعض طاقات التأيّن حيث تتوقعين ارتفاعها. وهذه الانخفاضات دليل لا ضوضاء.',
      },
    ],
  },

  {
    id: 'ma-007',
    slug: 'chemistry-week-2026-in-review',
    category: 'club-news',
    authorId: 'u-018',
    status: 'published',
    featured: false,
    published: '2026-02-14',
    views: 655,
    readingMinutes: 4,
    cover: '/media/covers/cover-week.svg',
    title_en: 'Chemistry Week 2026, in Review',
    title_ar: 'أسبوع الكيمياء ٢٠٢٦ في مراجعة',
    subtitle_en:
      'Five days, eleven demonstrations, and more than four hundred visitors from across the school.',
    subtitle_ar: 'خمسة أيام وإحدى عشرة تجربة توضيحية وأكثر من أربعمئة زائرة من مختلف صفوف المدرسة.',
    references: [],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'Chemistry Week closed on Thursday with the largest attendance the club has recorded. The Events Team ran the schedule, the Experiments Team ran the bench, and the Media Team documented all of it.',
        text_ar:
          'اختُتم أسبوع الكيمياء يوم الخميس بأكبر حضور يسجّله النادي. أدار فريق الفعاليات الجدول، وأدار فريق التجارب المنصة، ووثّق الفريق الإعلامي كل ذلك.',
      },
      {
        type: 'list',
        items_en: [
          'Monday — Indicators from the kitchen: red cabbage, turmeric and tea.',
          'Tuesday — Electrochemistry bench: building a working lemon cell.',
          'Wednesday — Polymer session: cross-linking and slime, done properly.',
          'Thursday — Analytical day: flame tests and paper chromatography.',
          'Thursday evening — Awards and the Issue 02 magazine launch.',
        ],
        items_ar: [
          'الاثنين — أدلة من المطبخ: الملفوف الأحمر والكركم والشاي.',
          'الثلاثاء — منصة الكهروكيمياء: بناء خلية ليمون عاملة.',
          'الأربعاء — جلسة البوليمرات: التشابك المتقاطع والسلايم بطريقة صحيحة.',
          'الخميس — يوم التحليل: اختبارات اللهب واستشراب الورق.',
          'مساء الخميس — الجوائز وإطلاق العدد الثاني من المجلة.',
        ],
      },
      {
        type: 'paragraph',
        text_en:
          'Our thanks to the chemistry department for the additional laboratory hours, and to every member who arrived early to set up and stayed late to clean down. The bench was left in better condition than we found it, every day.',
        text_ar:
          'شكرنا لقسم الكيمياء على الساعات المختبرية الإضافية، ولكل عضوة حضرت مبكرًا للتجهيز وبقيت متأخرة للتنظيف. فقد تُركت المنصة كل يوم في حالة أفضل مما وجدناها عليه.',
      },
    ],
  },

  {
    id: 'ma-008',
    slug: 'what-preservatives-actually-do',
    category: 'chemistry-in-food',
    authorId: 'u-024',
    status: 'published',
    featured: false,
    published: '2026-01-30',
    views: 1122,
    readingMinutes: 6,
    cover: '/media/covers/cover-food.svg',
    title_en: 'What Preservatives Actually Do',
    title_ar: 'ماذا تفعل المواد الحافظة فعلًا',
    subtitle_en:
      'The E-number on the label is not a warning. It is a reference to a mechanism — and the mechanism is usually water, acid or oxygen.',
    subtitle_ar:
      'رقم «E» على الملصق ليس تحذيرًا، بل إشارة إلى آلية، وهذه الآلية غالبًا ماء أو حمض أو أكسجين.',
    references: [
      'EFSA, Re-evaluation of food additives — scientific opinions.',
      'Belitz, Grosch & Schieberle, Food Chemistry, 4th edition (2009).',
    ],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'Food does not spoil for one reason. It spoils because microorganisms grow, because fats oxidise, or because enzymes keep working after harvest. Each of those is a different chemical problem, and each has a different class of solution.',
        text_ar:
          'لا يفسد الطعام لسبب واحد، بل يفسد لأن الأحياء الدقيقة تنمو، أو لأن الدهون تتأكسد، أو لأن الإنزيمات تواصل عملها بعد الحصاد. وكل من هذه مشكلة كيميائية مختلفة ولها صنف مختلف من الحلول.',
      },
      {
        type: 'heading',
        text_en: 'Denying water',
        text_ar: 'حرمان الماء',
      },
      {
        type: 'paragraph',
        text_en:
          'Salt and sugar preserve by lowering water activity. There is still water present, but so much of it is bound to solute that microbial cells cannot draw it in — osmosis works against them. This is why dates, jam and salted fish keep without refrigeration.',
        text_ar:
          'يحفظ الملح والسكر بخفض نشاط الماء. فالماء موجود، لكن كثيرًا منه مرتبط بالمذاب حتى تعجز خلايا الأحياء الدقيقة عن سحبه، إذ يعمل التناضح ضدها. ولهذا يُحفظ التمر والمربى والسمك المملح دون تبريد.',
      },
      {
        type: 'callout',
        title_en: 'Antioxidant, not antimicrobial',
        title_ar: 'مضاد أكسدة لا مضاد ميكروبات',
        text_en:
          'Ascorbic acid (vitamin C, E300) in a packet of crisps is not there to kill bacteria. It is sacrificially oxidised so the fats are not, delaying the rancid flavour that oxidation produces.',
        text_ar:
          'حمض الأسكوربيك (فيتامين ج، E300) في كيس الرقائق ليس لقتل البكتيريا، بل يتأكسد فداءً عن الدهون فيؤخّر الطعم الزنخ الناتج عن الأكسدة.',
      },
      {
        type: 'paragraph',
        text_en:
          'Reading a label with the mechanism in mind changes the experience entirely. Sodium benzoate (E211) only works in acidic foods, because it must be protonated to cross the microbial cell membrane. That is why you find it in soft drinks and pickles and almost never in bread.',
        text_ar:
          'وقراءة الملصق مع استحضار الآلية تغيّر التجربة كليًا. فبنزوات الصوديوم (E211) لا تعمل إلا في الأطعمة الحمضية لأنها تحتاج إلى البروتنة كي تعبر غشاء الخلية الميكروبية. ولهذا نجدها في المشروبات الغازية والمخللات ولا نكاد نجدها في الخبز.',
      },
    ],
  },

  {
    id: 'ma-009',
    slug: 'how-a-painkiller-finds-its-target',
    category: 'chemistry-in-medicine',
    authorId: 'u-015',
    status: 'under_review',
    featured: false,
    submitted: '2026-05-02',
    views: 0,
    readingMinutes: 7,
    cover: '/media/covers/cover-medicine.svg',
    title_en: 'How a Painkiller Finds Its Target',
    title_ar: 'كيف يجد المسكّن هدفه',
    subtitle_en:
      'Aspirin does not search for pain. It bonds to one enzyme, permanently, and the rest follows from that single reaction.',
    subtitle_ar:
      'لا يبحث الأسبرين عن الألم، بل يرتبط بإنزيم واحد ارتباطًا دائمًا، ويتبع ذلك كل ما بعده.',
    references: [
      'J. R. Vane, “Inhibition of prostaglandin synthesis”, Nature New Biology (1971).',
      'Rang & Dale, Pharmacology, 9th edition.',
    ],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'The mechanism of aspirin was not understood for seventy years after it went on sale. When John Vane finally described it in 1971, the answer was a single covalent modification: acetylation of a serine residue in the active site of cyclooxygenase.',
        text_ar:
          'لم تُفهم آلية عمل الأسبرين إلا بعد سبعين عامًا من طرحه في الأسواق. وحين وصفها جون فين أخيرًا عام ١٩٧١ كانت الإجابة تعديلًا تساهميًا واحدًا: أستلة بقية سيرين في الموقع النشط لإنزيم سيكلوأكسيجيناز.',
      },
      {
        type: 'paragraph',
        text_en:
          'That enzyme converts arachidonic acid into prostaglandins, the signalling molecules responsible for inflammation, fever and part of the pain response. Block the enzyme and the signal is not produced. Because the modification is covalent, the inhibition lasts until the cell makes new enzyme.',
        text_ar:
          'يحوّل هذا الإنزيم حمض الأراكيدونيك إلى بروستاجلاندينات، وهي جزيئات إشارية مسؤولة عن الالتهاب والحمى وجزء من استجابة الألم. وبتثبيط الإنزيم لا تُنتج الإشارة. ولأن التعديل تساهمي يستمر التثبيط حتى تصنع الخلية إنزيمًا جديدًا.',
      },
      {
        type: 'callout',
        title_en: 'Selectivity is a matter of shape',
        title_ar: 'الانتقائية مسألة شكل',
        text_en:
          'COX-1 and COX-2 differ by a single amino acid in the binding channel. That one difference is what modern selective anti-inflammatory drugs are designed around.',
        text_ar:
          'يختلف COX-1 عن COX-2 بحمض أميني واحد في قناة الارتباط، وهذا الاختلاف الوحيد هو ما تُصمَّم حوله مضادات الالتهاب الانتقائية الحديثة.',
      },
    ],
  },

  {
    id: 'ma-010',
    slug: 'an-interview-with-our-founding-supervisor',
    category: 'interviews',
    authorId: 'u-020',
    status: 'approved',
    featured: false,
    submitted: '2026-05-06',
    scheduled: '2026-06-01',
    views: 0,
    readingMinutes: 5,
    cover: '/media/covers/cover-interview.svg',
    title_en: 'An Interview with Our Founding Supervisor',
    title_ar: 'حوار مع المشرفة المؤسِّسة',
    subtitle_en:
      'Ms Amal Al-Harbi on starting a chemistry club with one cupboard of equipment and eleven students.',
    subtitle_ar: 'الأستاذة أمل الحربي عن بدء نادٍ للكيمياء بخزانة أدوات واحدة وإحدى عشرة طالبة.',
    references: [],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'We sat down with Ms Amal Al-Harbi at the end of the spring term to talk about how the club began, what she would do differently, and what she expects from the members who will run it after this year’s Grade 12 cohort leaves.',
        text_ar:
          'جلسنا مع الأستاذة أمل الحربي في نهاية الفصل الربيعي للحديث عن بداية النادي، وما الذي كانت ستفعله بطريقة مختلفة، وما تتوقعه من العضوات اللواتي سيقُدنه بعد تخرّج دفعة الصف الثاني عشر.',
      },
      {
        type: 'quote',
        text_en:
          'I did not want a club that performs chemistry. I wanted a club that practises it — including the parts that are slow and unglamorous.',
        text_ar:
          'لم أُرد ناديًا يستعرض الكيمياء، بل ناديًا يمارسها، بما في ذلك أجزاؤها البطيئة غير اللامعة.',
        attribution_en: 'Ms Amal Al-Harbi',
        attribution_ar: 'الأستاذة أمل الحربي',
      },
      {
        type: 'paragraph',
        text_en:
          'The full interview appears in Issue 03, scheduled for the start of the next academic year.',
        text_ar: 'يُنشر الحوار كاملًا في العدد الثالث المقرر مع بداية العام الدراسي القادم.',
      },
    ],
  },

  {
    id: 'ma-011',
    slug: 'the-quiet-power-of-buffer-solutions',
    category: 'experiments',
    authorId: 'u-011',
    status: 'submitted',
    featured: false,
    submitted: '2026-05-11',
    views: 0,
    readingMinutes: 5,
    cover: '/media/covers/cover-buffer.svg',
    title_en: 'The Quiet Power of Buffer Solutions',
    title_ar: 'القوة الهادئة للمحاليل المنظِّمة',
    subtitle_en: 'A first-year member’s account of the experiment that made equilibrium click.',
    subtitle_ar: 'رواية عضوة في سنتها الأولى عن التجربة التي جعلت الاتزان مفهومًا.',
    references: [],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'We added acid to pure water and the pH collapsed. We added the same acid, drop for drop, to a buffer solution and almost nothing happened. That contrast is the clearest demonstration of Le Chatelier’s principle I have seen.',
        text_ar:
          'أضفنا الحمض إلى ماء نقي فانهار الأس الهيدروجيني. ثم أضفنا الحمض نفسه، قطرةً بقطرة، إلى محلول منظِّم فلم يحدث شيء تقريبًا. وهذا التباين أوضح برهان رأيته على مبدأ لوشاتلييه.',
      },
    ],
  },

  {
    id: 'ma-012',
    slug: 'notes-on-flame-tests',
    category: 'experiments',
    authorId: 'u-012',
    status: 'draft',
    featured: false,
    views: 0,
    readingMinutes: 4,
    cover: '/media/covers/cover-flame.svg',
    title_en: 'Notes on Flame Tests',
    title_ar: 'ملاحظات على اختبارات اللهب',
    subtitle_en: 'Why the colours appear, and why sodium ruins everything.',
    subtitle_ar: 'لماذا تظهر الألوان، ولماذا يفسد الصوديوم كل شيء.',
    references: [],
    blocks: [
      {
        type: 'paragraph',
        text_en:
          'Draft in progress — covering electron excitation, emission wavelengths, and practical technique for cleaning the wire loop between samples.',
        text_ar:
          'مسودة قيد الكتابة — تتناول إثارة الإلكترونات، وأطوال موجات الانبعاث، والأسلوب العملي لتنظيف السلك بين العيّنات.',
      },
    ],
  },
];

export interface SeedCategory {
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  accent: 'plum' | 'rose' | 'gold' | 'mauve' | 'berry' | 'soft';
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: 'chemistry-around-us',
    name_en: 'Chemistry Around Us',
    name_ar: 'الكيمياء من حولنا',
    description_en: 'The reactions hiding in ordinary days.',
    description_ar: 'التفاعلات المختبئة في تفاصيل اليوم العادي.',
    accent: 'plum',
  },
  {
    slug: 'experiments',
    name_en: 'Experiments',
    name_ar: 'تجارب',
    description_en: 'Method, observation and result from the club bench.',
    description_ar: 'الطريقة والملاحظة والنتيجة من منصة النادي.',
    accent: 'rose',
  },
  {
    slug: 'scientific-research',
    name_en: 'Scientific Research',
    name_ar: 'البحث العلمي',
    description_en: 'Longer investigations run by our research teams.',
    description_ar: 'دراسات أطول تنفّذها فرقنا البحثية.',
    accent: 'berry',
  },
  {
    slug: 'green-chemistry',
    name_en: 'Green Chemistry',
    name_ar: 'الكيمياء الخضراء',
    description_en: 'Doing the same chemistry with less waste.',
    description_ar: 'الكيمياء نفسها بنفايات أقل.',
    accent: 'soft',
  },
  {
    slug: 'scientists-discoveries',
    name_en: 'Scientists & Discoveries',
    name_ar: 'علماء واكتشافات',
    description_en: 'The people behind the equations.',
    description_ar: 'الأشخاص خلف المعادلات.',
    accent: 'gold',
  },
  {
    slug: 'chemistry-in-medicine',
    name_en: 'Chemistry in Medicine',
    name_ar: 'الكيمياء في الطب',
    description_en: 'How molecules become treatments.',
    description_ar: 'كيف تصبح الجزيئات علاجًا.',
    accent: 'mauve',
  },
  {
    slug: 'chemistry-in-food',
    name_en: 'Chemistry in Food',
    name_ar: 'الكيمياء في الغذاء',
    description_en: 'Flavour, preservation and nutrition, explained.',
    description_ar: 'النكهة والحفظ والتغذية بتفسير علمي.',
    accent: 'rose',
  },
  {
    slug: 'chemistry-in-beauty',
    name_en: 'Chemistry in Beauty',
    name_ar: 'الكيمياء في التجميل',
    description_en: 'Formulation science in everyday products.',
    description_ar: 'علم التركيب في المنتجات اليومية.',
    accent: 'soft',
  },
  {
    slug: 'sustainability',
    name_en: 'Sustainability',
    name_ar: 'الاستدامة',
    description_en: 'Chemistry in service of the environment.',
    description_ar: 'الكيمياء في خدمة البيئة.',
    accent: 'plum',
  },
  {
    slug: 'student-articles',
    name_en: 'Student Articles',
    name_ar: 'مقالات الطالبات',
    description_en: 'Written by members, for members.',
    description_ar: 'بأقلام العضوات وللعضوات.',
    accent: 'mauve',
  },
  {
    slug: 'club-news',
    name_en: 'Club News',
    name_ar: 'أخبار النادي',
    description_en: 'What the club has been doing.',
    description_ar: 'ما الذي يفعله النادي.',
    accent: 'berry',
  },
  {
    slug: 'interviews',
    name_en: 'Interviews',
    name_ar: 'مقابلات',
    description_en: 'Conversations with scientists, teachers and members.',
    description_ar: 'حوارات مع علماء ومعلمات وعضوات.',
    accent: 'gold',
  },
  {
    slug: 'competitions-achievements',
    name_en: 'Competitions & Achievements',
    name_ar: 'مسابقات وإنجازات',
    description_en: 'Where AECC has competed and what we brought home.',
    description_ar: 'أين شارك النادي وماذا حقّق.',
    accent: 'gold',
  },
];

export interface SeedIssue {
  number: number;
  title_en: string;
  title_ar: string;
  cover: string;
  published: string | null;
  status: 'draft' | 'published';
  note_en: string;
  note_ar: string;
  articles: string[];
}

export const SEED_ISSUES: SeedIssue[] = [
  {
    number: 1,
    title_en: 'Beginnings',
    title_ar: 'بدايات',
    cover: '/media/covers/issue-01.svg',
    published: '2026-02-14',
    status: 'published',
    note_en:
      'This first issue was assembled by eleven members over a single term. It is not a perfect magazine, and we are glad of that — it is an honest record of a club learning to write about its own science. Read it as a beginning.',
    note_ar:
      'أُعدّ هذا العدد الأول بجهد إحدى عشرة عضوة خلال فصل دراسي واحد. وهو ليس مجلة كاملة، ونحن سعيدات بذلك، لأنه سجل صادق لنادٍ يتعلم الكتابة عن علمه. اقرئيه بوصفه بداية.',
    articles: ['ma-006', 'ma-007', 'ma-008'],
  },
  {
    number: 2,
    title_en: 'Water, Waste and Everyday Reactions',
    title_ar: 'الماء والنفايات وتفاعلات كل يوم',
    cover: '/media/covers/issue-02.svg',
    published: '2026-04-18',
    status: 'published',
    note_en:
      'The theme of this issue chose itself. Three of our teams spent the term working on questions about water, waste and the chemistry we walk past without noticing. What follows is what they found — including the parts that did not work.',
    note_ar:
      'اختار هذا العدد موضوعه بنفسه. فقد أمضت ثلاثة من فرقنا الفصل في أسئلة عن الماء والنفايات والكيمياء التي نمرّ بها دون أن ننتبه. وفي ما يلي ما توصّلن إليه، بما في ذلك ما لم ينجح منه.',
    articles: ['ma-001', 'ma-002', 'ma-005', 'ma-004', 'ma-003'],
  },
];
