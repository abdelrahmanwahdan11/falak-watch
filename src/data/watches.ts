export type WatchKind = "luxury" | "smart";

export type Watch = {
  id: string;
  name: string;
  kind: WatchKind;
  price: number;
  flag?: string;
  summary: string;
  story: string;
  specs: { label: string; value: string }[];
  image: string;
};

export const KIND_LABEL: Record<WatchKind, string> = {
  luxury: "فاخرة",
  smart: "سمارت",
};

export const WATCHES: Watch[] = [
  {
    id: "classic",
    name: "كلاسيك 36",
    kind: "luxury",
    price: 4280,
    flag: "الأكثر هدوءاً",
    summary: "علبة ذهبية رفيعة ومينا شمبانيا.",
    story:
      "ساعة تصلح للمكتب والسهرة. الحركة الأوتوماتيكية تُملأ من المعصم، والثواني الصغيرة عند السادسة تُبقي الوجه خالياً من الزحمة.",
    specs: [
      { label: "القطر", value: "36 مم" },
      { label: "الحركة", value: "أوتوماتيك، 21 جوهرة" },
      { label: "العلبة", value: "فولاذ بطلاء ذهب" },
      { label: "المقاومة", value: "5 ATM" },
      { label: "السوار", value: "جلد عجل" },
    ],
    image: "/watches/classic.jpg",
  },
  {
    id: "marine",
    name: "مارين 42",
    kind: "luxury",
    price: 3650,
    summary: "كرونوغراف فولاذ بمينا كحلي.",
    story:
      "إطار هادئ بلا أرقام صارخة، وثلاثة عدّادات للكرونوغراف. تتحمل الماء حتى الغوص الخفيف، وتبقى مقروءة تحت الشمس.",
    specs: [
      { label: "القطر", value: "42 مم" },
      { label: "الحركة", value: "كرونوغراف كوارتز" },
      { label: "العلبة", value: "فولاذ مصقول وممشط" },
      { label: "المقاومة", value: "20 ATM" },
      { label: "السوار", value: "فولاذ" },
    ],
    image: "/watches/marine.jpg",
  },
  {
    id: "leila",
    name: "ليليا 28",
    kind: "luxury",
    price: 3120,
    summary: "ذهب وردي ومينا صدف رقيق.",
    story:
      "صُممت لتختفي تحت الكم ثم تظهر حين ترفع اليد. المينا صدف، والنقاط صغيرة، والسوار الشبكي لا يقرص المعصم.",
    specs: [
      { label: "القطر", value: "28 مم" },
      { label: "الحركة", value: "كوارتز" },
      { label: "العلبة", value: "ذهب وردي" },
      { label: "المقاومة", value: "3 ATM" },
      { label: "السوار", value: "شبك ميلانيز" },
    ],
    image: "/watches/leila.jpg",
  },
  {
    id: "nocturne",
    name: "نوكتورن 40",
    kind: "luxury",
    price: 6900,
    flag: "إصدار محدود",
    summary: "هيكل مكشوف على علبة سوداء مطفية.",
    story:
      "التروس ظاهرة من الأمام. لا شعار، لا أرقام، فقط الحركة. الكمية محدودة لأن التجميع يدوي وبطيء.",
    specs: [
      { label: "القطر", value: "40 مم" },
      { label: "الحركة", value: "أوتوماتيك مكشوف" },
      { label: "العلبة", value: "فولاذ أسود مطفي" },
      { label: "المقاومة", value: "5 ATM" },
      { label: "السوار", value: "جلد" },
    ],
    image: "/watches/nocturne.jpg",
  },
  {
    id: "pulse",
    name: "بَلس",
    kind: "smart",
    price: 890,
    flag: "جديد",
    summary: "شاشة دائرية، نبض ونوم ورسائل.",
    story:
      "وجه هادئ بعقربين، وخلفه نبض القلب والنوم والإشعارات. البطارية تكفي أربعة أيام، والشحن مغناطيسي بلا غطاء.",
    specs: [
      { label: "الشاشة", value: "أموليد 1.43 إنش" },
      { label: "العلبة", value: "تيتانيوم" },
      { label: "البطارية", value: "حتى 4 أيام" },
      { label: "المقاومة", value: "5 ATM" },
      { label: "الشحن", value: "مغناطيسي" },
    ],
    image: "/watches/pulse.jpg",
  },
  {
    id: "orbit",
    name: "أوربت",
    kind: "smart",
    price: 740,
    summary: "مربع ناعم الحواف وإشعارات خفيفة.",
    story:
      "للمعصم الذي يريد الرسائل دون شاشة هاتف كاملة. وضع التركيز يسكت كل شيء إلا المكالمات التي تحددها.",
    specs: [
      { label: "الشاشة", value: "أموليد 1.7 إنش" },
      { label: "العلبة", value: "ألمنيوم" },
      { label: "البطارية", value: "حتى 3 أيام" },
      { label: "المقاومة", value: "IP68" },
      { label: "السوار", value: "سيليكون" },
    ],
    image: "/watches/orbit.jpg",
  },
  {
    id: "aire",
    name: "آير",
    kind: "smart",
    price: 1190,
    summary: "أنحف ساعة سمارت في الدار.",
    story:
      "سماكة 6.8 مم وسوار شبك، فتمر تحت الكم الضيق. الشاشة تبقى مضاءة بسطوع منخفض ولا تضيء الغرفة ليلاً.",
    specs: [
      { label: "السماكة", value: "6.8 مم" },
      { label: "الشاشة", value: "أموليد 1.2 إنش" },
      { label: "البطارية", value: "حتى 3 أيام" },
      { label: "المقاومة", value: "3 ATM" },
      { label: "السوار", value: "شبك فولاذ" },
    ],
    image: "/watches/aire.jpg",
  },
  {
    id: "ridge",
    name: "ريدج",
    kind: "smart",
    price: 980,
    summary: "هيكل متين وتحديد موقع للمسارات.",
    story:
      "علبة زيتونية تتحمل الصدمات والغبار. في وضع التتبع تدوم البطارية قرابة أسبوع، والموقع يعمل بلا شبكة.",
    specs: [
      { label: "الشاشة", value: "أموليد 1.4 إنش" },
      { label: "الموقع", value: "GPS مزدوج" },
      { label: "البطارية", value: "حتى 7 أيام تتبّع" },
      { label: "المقاومة", value: "10 ATM" },
      { label: "السوار", value: "مطاط" },
    ],
    image: "/watches/ridge.jpg",
  },
];

export function money(value: number) {
  return `${value.toLocaleString("en-US")} ₪`;
}

export function findWatch(id: string) {
  return WATCHES.find((watch) => watch.id === id);
}
