import { WATCHES, money, type Watch } from "@/data/watches";

export type AIAdviceResult = {
  query: string;
  userIntent: {
    title: string;
    description: string;
    tags: string[];
    occasion?: string;
    budgetContext?: string;
  };
  primaryWatch: Watch;
  primaryMatchScore: number;
  whyChosen: string;
  keyHighlights: string[];
  stylingAdvice: string;
  alternativeWatch?: Watch;
  alternativeReason?: string;
  executiveSummary: string;
};

export const QUICK_PROMPTS = [
  { label: "هدية تخرج أو مناسبة خاصة", query: "أبحث عن ساعة فاخرة تكون هدية راقية ومميزة بمناسبة تخرج" },
  { label: "رياضة وهايكنج وبطارية طويلة", query: "أريد ساعة رياضية قوية تتحمل المسارات والماء وبطاريتها تدوم لأيام" },
  { label: "رسمية وكلاسيكية للدوام والمكتب", query: "ساعة كلاسيكية هادئة للمكتب والعمل اليومي وتختفي تحت كم القميص" },
  { label: "أنحف ساعة ذكية وأنيقة", query: "بدي ساعة سمارت تكون أنحف ما يمكن وسوار شبك وما تكون ضخمة" },
  { label: "ساعة نسائية ناعمة بذهب وردي", query: "ساعة نسائية راقية وناعمة للمعصم الصغير مع لمسة ذهب وردي" },
  { label: "تحفة ميكانيكية ملفتة ومكشوفة", query: "أريد ساعة ميكانيكية أوتوماتيك بتصميم مميز وهيكل مكشوف يظهر التروس" },
  { label: "ساعة ذكية بشاشة دائرية فخمة", query: "ساعة ذكية بشاشة دائرية أموليد وأسلوب يشبه الساعات التقليدية الفاخرة" },
  { label: "خيار اقتصادي تحت 1,000 ₪", query: "أريد ساعة ممتازة وعملية بميزانية اقتصادية أقل من 1000 شيكل" },
];

/**
 * Intelligent client-side AI analysis engine for Dar Falak.
 * Deconstructs natural language inputs in Arabic, extracts nuance/context,
 * scores the collection, and synthesizes tailored, human-feeling advice.
 */
export function consultAIAdvisor(userQuery: string): AIAdviceResult {
  const q = (userQuery || "").toLowerCase().trim();

  // Keyword flags & intent indicators
  const isGift = /هدية|اهداء|تخرج|عيد|زوجي|زوجتي|صديق|هديه/.test(q);
  const isWoman = /نسائية|نسائي|بنات|بنت|صبايا|أنثوية|معصم صغير|وردية|صدف/.test(q);
  const isSport = /رياضة|رياضي|جري|ركض|نادي|جم|هايك|مسار|جبل|مغامرة|صدمات|تخييم|غبار|موقع|gps/.test(q);
  const isWater = /ماء|سباحة|غوص|بحر|مقاوم|مطر|ضد الماء/.test(q);
  const isBattery = /بطارية|شحن|طويلة|تدوم|تطول|أيام|اسبوع/.test(q);
  const isThin = /نحيف|نحيفة|خفيف|خفيفة|سماكة|رقيق|رقيقة|قميص|كم/.test(q);
  const isFormal = /رسمي|مناسبة|سهرة|عرس|مكتب|دوام|عمل|بدلة|كلاسيك|هادئ|فخمة|أنيق|فاخر/.test(q);
  const isSkeleton = /مكشوف|تروس|ميكانيك|ميكانيكية|سكليتون|شفاف|يدوي|اسود|أسود/.test(q);
  const isSmart = /سمارت|ذكية|ذكي|شاشة|اشعارات|إشعارات|رسائل|واتساب|نبض|نوم|أموليد/.test(q);
  const isLuxury = /فاخر|فاخرة|ميكانيكي|ذهب|أوتوماتيك|جلد|سويسري|قيمة/.test(q);
  const isBudgetLow = /رخيص|اقتصادي|أقل من|تحت|١٠٠٠|1000|سعر مناسب|وفر|توفير/.test(q);
  const isSquare = /مربع|مستطيل|أوربت|شاشة كبيرة/.test(q);

  // Scoring matrix for each watch in catalog
  const scores: Record<string, number> = {
    classic: 20,
    marine: 15,
    leila: 15,
    nocturne: 15,
    pulse: 20,
    orbit: 15,
    aire: 15,
    ridge: 15,
  };

  // Specific watch direct mentions
  if (/كلاسيك|classic/.test(q)) scores.classic += 50;
  if (/مارين|marine|غواص|كحلي/.test(q)) scores.marine += 50;
  if (/ليليا|leila|صدف/.test(q)) scores.leila += 50;
  if (/نوكتورن|nocturne|مكشوف|تروس/.test(q)) scores.nocturne += 50;
  if (/بلس|pulse|نبض/.test(q)) scores.pulse += 50;
  if (/أوربت|اوربت|orbit|مربع/.test(q)) scores.orbit += 50;
  if (/آير|اير|aire|أنحف|شبك/.test(q)) scores.aire += 50;
  if (/ريدج|ridge|زيتوني|gps/.test(q)) scores.ridge += 50;

  // Contextual boosts
  if (isWoman) {
    scores.leila += 45;
    scores.aire += 25;
    scores.classic += 10;
  }

  if (isSport) {
    scores.ridge += 45;
    scores.pulse += 25;
    scores.orbit += 15;
    scores.marine += 20; // Dive/marine sport
  }

  if (isWater) {
    scores.marine += 40; // 20 ATM
    scores.ridge += 35; // 10 ATM
    scores.pulse += 15;
  }

  if (isBattery) {
    scores.ridge += 40; // 7 days GPS
    scores.pulse += 30; // 4 days
    scores.orbit += 15;
    // Luxury automatic watches don't need batteries at all!
    if (isLuxury || isFormal) scores.classic += 25;
  }

  if (isThin) {
    scores.aire += 45; // 6.8mm thin
    scores.leila += 35; // 28mm small profile
    scores.classic += 25; // 36mm slim
  }

  if (isFormal) {
    scores.classic += 35;
    scores.leila += 25;
    scores.nocturne += 30;
    scores.marine += 20;
    scores.aire += 15; // Slim dress smart
  }

  if (isSkeleton) {
    scores.nocturne += 55;
    scores.classic += 10;
  }

  if (isBudgetLow) {
    scores.orbit += 45; // 740 NIS
    scores.pulse += 35; // 890 NIS
    scores.ridge += 25; // 980 NIS
    scores.aire += 15;
  }

  if (isSmart && !isLuxury) {
    scores.pulse += 25;
    scores.orbit += 25;
    scores.aire += 25;
    scores.ridge += 25;
    scores.classic -= 20;
    scores.marine -= 20;
    scores.nocturne -= 20;
    scores.leila -= 20;
  }

  if (isLuxury && !isSmart) {
    scores.classic += 30;
    scores.marine += 30;
    scores.nocturne += 30;
    scores.leila += 30;
    scores.pulse -= 20;
    scores.orbit -= 20;
    scores.aire -= 20;
    scores.ridge -= 20;
  }

  if (isGift) {
    scores.classic += 25;
    scores.nocturne += 20;
    scores.leila += 20;
    scores.pulse += 20;
  }

  // Sort candidates
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryId = sorted[0][0];
  const alternativeId = sorted[1] && sorted[1][0] !== primaryId ? sorted[1][0] : sorted[2]?.[0];

  const primaryWatch = WATCHES.find((w) => w.id === primaryId) || WATCHES[0];
  const alternativeWatch = WATCHES.find((w) => w.id === alternativeId);

  // Intent profiling
  const tags: string[] = [];
  if (isFormal) tags.push("إطلالة رسمية ومناسبات");
  if (isSport) tags.push("أنشطة وحركة ورياضة");
  if (isGift) tags.push("هدية خاصة");
  if (isWoman) tags.push("معصم ناعم / نسائي");
  if (isThin) tags.push("تصميم رقيق ونحيف");
  if (isBattery) tags.push("عمر بطارية ممتد");
  if (isWater) tags.push("مقاومة ماء فائقة");
  if (isBudgetLow) tags.push("قيمة اقتصادية ممتازة");
  if (isSmart) tags.push("مزايا تقنية ذكية");
  if (isLuxury) tags.push("فخامة ميكانيكية");
  if (tags.length === 0) tags.push("استخدام يومي راقٍ", "متعددة المناسبات");

  // Build persona analysis and reasoning
  let intentTitle = "ساعة متوازنة تلبي متطلباتك اليومية";
  let intentDesc = `فحصنا طلبك بعناية لمطابقة نوع الحركة، حجم العلبة، وخامة السوار الأنسب لمعصمك وأسلوبك اليومي.`;
  let whyChosen = "";
  let stylingAdvice = "";
  const keyHighlights: string[] = [];

  switch (primaryWatch.id) {
    case "classic":
      intentTitle = isGift ? "هدية فاخرة خالدة تدوم لسنوات" : "أناقة كلاسيكية رفيعة للمكتب والمناسبات";
      intentDesc = `حللنا رغبتك في ساعة أنيقة تفرض حضورها بهدوء تام دون صخب، مع حركة ميكانيكية أصيلة لا تحتاج إلى بطارية.`;
      whyChosen = `اخترنا لك «كلاسيك 36» لأن قطرها (36 مم) هو المقاس الذهبي الكلاسيكي الذي يختفي بسلاسة تحت أكمام القمصان ثم يظهر بلمعان شمبانيا راقٍ. حركتها الأوتوماتيكية المكونة من 21 جوهرة تُشحن ذاتياً من نبض معصمك، مع ثوانٍ صغيرة عند السادسة تمنح المينا اتزاناً مريحاً للعين.`;
      keyHighlights.push("حركة ميكانيكية أوتوماتيك 21 جوهرة تُعبأ من حركة اليد", "علبة فولاذ مطلية ذهب مع مينا شمبانيا كلاسيكي", "سوار جلد عجل طبيعي ناعم ومريح لساعات العمل الطويلة");
      stylingAdvice = "تتناغم بامتياز مع الملابس الرسمية، البدلات، والأقمشة الكتانية البيضاء أو البنية. ننصح بارتدائها بإحكام خفيف على عظمة المعصم.";
      break;

    case "marine":
      intentTitle = isWater ? "أداء مائي احترافي بهيكل صلب" : "كرونوغراف رياضي فاخر بحضور قوي";
      intentDesc = `فهمنا أنك تبحث عن ساعة تتحمل وتعيش معك في كل الظروف دون التنازل عن فخامة المظهر وقوة الهيبة.`;
      whyChosen = `«مارين 42» تجمع بين متانة الفولاذ المصقول والممشط مع مينا كحلي عميق يقاوم الانعكاسات. تمتاز بمقاومة ماء استثنائية تصل إلى 20 ATM تجعلها جاهزة للسباحة والغوص الخفيف، مع ثلاثة عدادات كرونوغراف تمنح المعصم ثقلاً رياضياً وجاذبية لا تخطئها العين.`;
      keyHighlights.push("مقاومة ماء احترافية حتى 20 ATM (200 متر)", "كرونوغراف كوارتز دقيق بثلاثة عدادات", "سوار وهيكل فولاذي متكامل مصقول بمهارة عالية");
      stylingAdvice = "مثالية للإطلالات اليومية والرياضية الفاخرة (Smart Casual)، وتبرز بشكل رائع مع الألوان الكحلية، الرمادية، والبيضاء.";
      break;

    case "leila":
      intentTitle = isGift ? "هدية أنثوية رقيقة بمشاعر دافئة" : "نعومة استثنائية ولمسة ذهب وردي";
      intentDesc = `رصدنا تفضيلك لساعة خفيفة وناعمة جداً تزيّن المعصم الصغير كرائعة مجوهرات راقية.`;
      whyChosen = `ساعة «ليليا 28» صُممت لتكون قطعة فنية رقيقة بقطر 28 مم فقط. يمنحها مينا الصدف الطبيعي لمعاناً متغيراً مع زوايا الضوء، بينما يوفر السوار الشبكي الميلانيز الذهبي الوردي راحة فائقة تمنع أي قرص أو إجهاد للبشرة حتى مع الارتداء طوال اليوم.`;
      keyHighlights.push("قطر مدمج وأنيق (28 مم) يناسب المعاصم الدقيقة تماماً", "مينا من الصدف الطبيعي مع لمسات ذهب وردي ناعمة", "سوار شبك ميلانيز مريح وقابل للتعديل الفوري");
      stylingAdvice = "قطعة أساسية للسهرات والإطلالات الناعمة، ويمكن تنسيقها بسهولة إلى جانب أساور ذهبية أو فضية رفيعة.";
      break;

    case "nocturne":
      intentTitle = "تحفة ميكانيكية استثنائية لأصحاب الذوق الجريء";
      intentDesc = `حللنا طلبك كشخص يبحث عن التميز الحقيقي وعالم الساعات الميكانيكية المكشوفة التي تثير الإعجاب فور رؤيتها.`;
      whyChosen = `«نوكتورن 40» هي درّة إصدارات دار فلك المحدودة؛ حيث يأتي الهيكل مكشوفاً بالكامل (Skeleton) لترى نبض التروس والحركة اليدوية الأوتوماتيكية أمام عينيك. العلبة السوداء المطفية بلا أي شعار تجاري صارخ تجعل التركيز كله منصباً على براعة الصنعة الميكانيكية.`;
      keyHighlights.push("إصدار محدود بتجميع يدوي دقيق وحركة ميكانيكية مكشوفة", "علبة فولاذ أسود مطفي فاخر غير لامع", "سوار جلد فاخر مخصص يمنحها هيبة خاصة");
      stylingAdvice = "ساعة تُرتدى لتلفت الأنظار وتكون محور الحديث. تليق بالملابس الداكنة، السترات الجلدية، والبدلات العصرية المودرن.";
      break;

    case "pulse":
      intentTitle = "التوازن الذكي الكامل بين الفخامة والتقنية";
      intentDesc = `فهمنا أنك تريد جميع المزايا الذكية لمتابعة صحتك ورسائلك، ولكن بوجه دائري فاخر يشبه الساعات السويسرية.`;
      whyChosen = `«بَلس» هي الساعة الذكية التي لا تشبه البلاستيك أو الأجهزة المستهلكة؛ علبتها مصنوعة من التيتانيوم المتين وشاشتها أموليد دائرية فائقة الوضوح. تقدم تتبعاً دقيقاً لنبض القلب، النوم، والإشعارات مع بطارية مريحة تدوم حتى 4 أيام وشحن مغناطيسي سريع.`;
      keyHighlights.push("علبة مصنوعة من معدن التيتانيوم الخفيف والصلب", "شاشة أموليد دائرية بمقاس 1.43 إنش ووضوح ممتاز تحت الشمس", "بطارية تدوم حتى 4 أيام متواصلة مع مقاومة 5 ATM");
      stylingAdvice = "رفيق مثالي من الصباح في العمل وحتى النادي الرياضي. وجه الساعة الدائري الهادئ يجعلها ملائمة حتى مع القمصان الرسمية.";
      break;

    case "orbit":
      intentTitle = "عملية واقتصادية بأفضل شاشة ومتابعة للإشعارات";
      intentDesc = `استنتجنا رغبتك في ساعة ذكية خفيفة بشاشة واضحة لقراءة الرسائل والتحكم اليومي بسعر في متناول اليد.`;
      whyChosen = `«أوربت» تقدم أعلى قيمة مقابل السعر في تشكيلة الساعات الذكية (740 ₪ فقط). شاشتها المربعة الكبيرة (1.7 إنش أموليد) مع وضع التركيز الذكي تضمن لك قراءة الرسائل وتحديد المكالمات الهامة بلمسة واحدة، مع هيكل ألمنيوم خفيف الوزن وسوار سيليكون مريح.`;
      keyHighlights.push("شاشة أموليد مربعة واسعة (1.7 إنش) لقراءة سهلة ومريحة", "وضع التركيز لتصفية المكالمات والإشعارات الهامة فقط", "أفضل خيار اقتصادي مع ضمان كامل لمدة 24 شهراً");
      stylingAdvice = "ممتازة لطلاب الجامعات، رواد الأعمال، وأصحاب العمل المكتبي الذين يرغبون في متابعة التنبيهات دون لمس الهاتف.";
      break;

    case "aire":
      intentTitle = "أنحف وأخف ساعة ذكية للملابس الرسمية";
      intentDesc = `التقطنا انزعاجك من سماكة وثقل الساعات الذكية المعتادة، وبحثك عن ساعة سمارت فائقة النحافة.`;
      whyChosen = `بسماكة مذهلة تبلغ 6.8 مم فقط، «آير» هي أنحف ساعة ذكية في الدار. وسوار الشبك الفولاذي وشاشتها ذات السطوع الذكي المنخفض تجعلها تنزلق تحت أضيق الأكمام دون أي انتفاخ، لتوفر لك التنبيهات الضرورية بهدوء بالغ دون أن تضيء الغرفة في الظلام.`;
      keyHighlights.push("سماكة قياسية فائقة الرقة (6.8 مم فقط)", "سوار شبك فولاذي فاخر يمنحها مظهر الساعات الكلاسيكية", "شاشة Always-on مع إدارة ذكية للسطوع الليلي");
      stylingAdvice = "أفضل ساعة ذكية يمكن ارتداؤها مع بدلة رسمية أو ثوب أنيق؛ حيث تمنحك مزايا التكنولوجيا دون التضحية بأناقة المعصم.";
      break;

    case "ridge":
      intentTitle = "متانة قصوى للمغامرات والرياضات المفتوحة";
      intentDesc = `حللنا حاجتك لساعة صلبة تتحمل الصدمات والظروف القاسية مع بطارية يعتمد عليها في المسارات الطويلة.`;
      whyChosen = `«ريدج» صُممت لرواد الطبيعة والرياضيين؛ علبتها الزيتونية المدعمة بنظام GPS مزدوج تعمل دون الحاجة لشبكة خلوية، وبطاريتها الجبارة تصمد حتى 7 أيام كاملة من التتبع المتواصل. تتحمل ضغط الماء حتى 10 ATM وتتصدى للصدمات والغبار بكل ثقة.`;
      keyHighlights.push("نظام تحديد مواقع GPS مزدوج يعمل بلا تغطية خلوية", "بطارية عملاقة تدوم حتى 7 أيام في وضع التتبع الميداني", "مقاومة ماء 10 ATM وهيكل ممتص للصدمات والغبار");
      stylingAdvice = "الساعة المثالية لأيام الجمعة، المسارات الجبلية، ركوب الدراجات، والأنشطة الخارجية. سوارها المطاطي المقاوم للعرق يمنحك ثباتاً تاماً.";
      break;
  }

  // Alternative synthesis
  let alternativeReason = "";
  if (alternativeWatch) {
    if (alternativeWatch.kind !== primaryWatch.kind) {
      alternativeReason = `إذا كنت ترغب بالاطلاع على خيار من خط ${alternativeWatch.kind === "smart" ? "الساعات الذكية" : "الساعات الميكانيكية الفاخرة"}، فإن «${alternativeWatch.name}» بسعر ${money(alternativeWatch.price)} تشكل البديل الأمثل لمقارنته.`;
    } else {
      alternativeReason = `كبديل ذي طابع مختلف، يمكنك إلقاء نظرة على «${alternativeWatch.name}» (${money(alternativeWatch.price)}) التي تقدم ${alternativeWatch.summary}.`;
    }
  }

  const executiveSummary = `بناءً على طلبك، نوصي بساعة «${primaryWatch.name}» (${money(primaryWatch.price)}) كأفضل اختيار يجمع بين متطلباتك الدقيقة والضمان المعتمد من دار فلك لمدة عامين مع الدفع عند الاستلام.`;

  return {
    query: userQuery,
    userIntent: {
      title: intentTitle,
      description: intentDesc,
      tags,
      occasion: isFormal ? "رسمي" : isSport ? "رياضي وميداني" : "يومي متعدد",
      budgetContext: isBudgetLow ? "اقتصادي مريح" : isLuxury ? "فاخر" : "متوسط",
    },
    primaryWatch,
    primaryMatchScore: Math.min(99, Math.max(88, 75 + sorted[0][1] / 2)),
    whyChosen,
    keyHighlights,
    stylingAdvice,
    alternativeWatch,
    alternativeReason,
    executiveSummary,
  };
}

