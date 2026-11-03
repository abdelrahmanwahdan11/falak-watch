import { useState } from "react";
import { X, ArrowLeftRight, Check, ShoppingBag, Sparkles } from "lucide-react";
import { WATCHES, money, KIND_LABEL, type Watch } from "@/data/watches";

const btnInk =
  "inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-4 text-xs font-semibold text-bg transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50";
const btnLine =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-surface px-4 text-xs font-semibold text-ink transition-[background-color,transform] duration-150 ease-out active:scale-95";

export function ComparisonModal({
  isOpen,
  initialWatchA,
  initialWatchB,
  onClose,
  onOpenWatch,
  onAddToCart,
}: {
  isOpen: boolean;
  initialWatchA?: string;
  initialWatchB?: string;
  onClose: () => void;
  onOpenWatch: (id: string) => void;
  onAddToCart: (id: string) => void;
}) {
  const [idA, setIdA] = useState<string>(initialWatchA || "classic");
  const [idB, setIdB] = useState<string>(initialWatchB || "pulse");
  const [addedId, setAddedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const watchA = WATCHES.find((w) => w.id === idA) || WATCHES[0];
  const watchB = WATCHES.find((w) => w.id === idB) || WATCHES[1];

  function handleAdd(id: string) {
    onAddToCart(id);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1500);
  }

  // AI Comparison Verdict synthesis
  let verdict = "";
  if (watchA.kind === "luxury" && watchB.kind === "smart") {
    verdict = `المقارنة هنا بين الأصالة الميكانيكية والتقنية الذكية؛ ساعة «${watchA.name}» تمنحك هيبة كلاسيكية راقية لا تحتاج إلى شحن ومصنوعة للمناسبات والمكتب، بينما «${watchB.name}» تقدم لك شاشة أموليد متطورة لمتابعة صحتك وإشعاراتك اليومية.`;
  } else if (watchA.kind === "luxury" && watchB.kind === "luxury") {
    verdict = `كلا الخيارين من الخط الميكانيكي الفاخر بضمان 24 شهراً؛ تميل «${watchA.name}» إلى ${watchA.summary}، في حين تتميز «${watchB.name}» بـ ${watchB.summary}.`;
  } else if (watchA.kind === "smart" && watchB.kind === "smart") {
    verdict = `كلاهما من فئة الساعات الذكية المتطورة؛ «${watchA.name}» تركز على ${watchA.summary}، بينما تتفوق «${watchB.name}» في ${watchB.summary}.`;
  } else {
    verdict = `ساعة «${watchA.name}» تمثل خط ${KIND_LABEL[watchA.kind]} بسعر ${money(watchA.price)}، بينما تقدم «${watchB.name}» تجربة ${KIND_LABEL[watchB.kind]} بسعر ${money(watchB.price)}.`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      {/* Top Header */}
      <div className="safe-top flex h-14 shrink-0 items-center justify-between border-b border-line bg-bg px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brass/10 text-brass">
            <ArrowLeftRight className="size-4" />
          </span>
          <div>
            <h2 id="comparison-title" className="text-sm font-semibold tracking-wide">
              مقارنة الساعات الذكية
            </h2>
            <p className="text-[11px] text-muted">مقارنة المواصفات والملاءمة جنباً إلى جنب</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className={btnLine}>
          <X className="size-4" strokeWidth={1.75} />
          <span>إغلاق</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Watch Selectors Row */}
          <div className="grid grid-cols-2 gap-3 border border-line bg-surface p-3">
            <div>
              <label className="text-[11px] font-semibold text-brass block mb-1">الساعة الأولى</label>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className="h-10 w-full border border-line bg-bg px-2 text-xs font-medium text-ink outline-none"
              >
                {WATCHES.map((w) => (
                  <option key={w.id} value={w.id} disabled={w.id === idB}>
                    {w.name} ({KIND_LABEL[w.kind]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-brass block mb-1">الساعة الثانية</label>
              <select
                value={idB}
                onChange={(e) => setIdB(e.target.value)}
                className="h-10 w-full border border-line bg-bg px-2 text-xs font-medium text-ink outline-none"
              >
                {WATCHES.map((w) => (
                  <option key={w.id} value={w.id} disabled={w.id === idA}>
                    {w.name} ({KIND_LABEL[w.kind]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards & Spec Matrix */}
          <div className="border border-line bg-bg">
            {/* Watch Header Cards */}
            <div className="grid grid-cols-2 divide-x divide-x-reverse divide-line border-b border-line text-center">
              {/* Watch A */}
              <div className="p-4 space-y-2">
                <img
                  src={watchA.image}
                  alt={watchA.name}
                  className="mx-auto size-28 bg-line object-cover rounded cursor-pointer"
                  onClick={() => {
                    onClose();
                    onOpenWatch(watchA.id);
                  }}
                />
                <span className="text-[10px] font-semibold text-brass uppercase block">
                  {KIND_LABEL[watchA.kind]}
                </span>
                <h4 className="text-base font-semibold text-ink">{watchA.name}</h4>
                <p className="text-sm font-bold text-brass" dir="ltr">
                  {money(watchA.price)}
                </p>
                <button
                  type="button"
                  onClick={() => handleAdd(watchA.id)}
                  className={`${btnInk} w-full mt-2`}
                >
                  <ShoppingBag className="size-3.5" />
                  <span>{addedId === watchA.id ? "أُضيفت ✓" : "أضف للحقيبة"}</span>
                </button>
              </div>

              {/* Watch B */}
              <div className="p-4 space-y-2">
                <img
                  src={watchB.image}
                  alt={watchB.name}
                  className="mx-auto size-28 bg-line object-cover rounded cursor-pointer"
                  onClick={() => {
                    onClose();
                    onOpenWatch(watchB.id);
                  }}
                />
                <span className="text-[10px] font-semibold text-brass uppercase block">
                  {KIND_LABEL[watchB.kind]}
                </span>
                <h4 className="text-base font-semibold text-ink">{watchB.name}</h4>
                <p className="text-sm font-bold text-brass" dir="ltr">
                  {money(watchB.price)}
                </p>
                <button
                  type="button"
                  onClick={() => handleAdd(watchB.id)}
                  className={`${btnInk} w-full mt-2`}
                >
                  <ShoppingBag className="size-3.5" />
                  <span>{addedId === watchB.id ? "أُضيفت ✓" : "أضف للحقيبة"}</span>
                </button>
              </div>
            </div>

            {/* AI Verdict Banner */}
            <div className="border-b border-line bg-surface p-4">
              <p className="text-xs font-semibold text-brass mb-1 flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                رأي مستشار فلك الذكي (AI Verdict):
              </p>
              <p className="text-xs leading-relaxed text-muted">{verdict}</p>
            </div>

            {/* Specifications Comparison Table */}
            <div className="divide-y divide-line text-xs">
              <div className="grid grid-cols-2 p-3 text-center bg-surface font-semibold text-ink">
                <span>{watchA.name}</span>
                <span>{watchB.name}</span>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 p-3 text-center gap-2">
                <span className="text-muted leading-relaxed">{watchA.summary}</span>
                <span className="text-muted leading-relaxed">{watchB.summary}</span>
              </div>

              {/* Specs items */}
              {Array.from(new Set([...watchA.specs.map((s) => s.label), ...watchB.specs.map((s) => s.label)])).map(
                (label) => {
                  const valA = watchA.specs.find((s) => s.label === label)?.value || "—";
                  const valB = watchB.specs.find((s) => s.label === label)?.value || "—";
                  return (
                    <div key={label} className="grid grid-cols-2 p-2.5 text-center hover:bg-surface/50">
                      <div>
                        <span className="block text-[10px] text-muted">{label}</span>
                        <span className="font-medium text-ink">{valA}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted">{label}</span>
                        <span className="font-medium text-ink">{valB}</span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

