import { useState } from "react";
import { X, Check, ArrowLeft, Ruler, Sparkles } from "lucide-react";
import { WATCHES, money, KIND_LABEL, type Watch } from "@/data/watches";

const btnInk =
  "inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-bg transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50";
const btnLine =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-surface px-5 text-sm font-medium text-ink transition-[background-color,transform] duration-150 ease-out active:scale-95";

export function WristGuideModal({
  isOpen,
  onClose,
  onOpenWatch,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenWatch: (id: string) => void;
}) {
  const [wristSize, setWristSize] = useState<number>(16.5);

  if (!isOpen) return null;

  // Categorization
  let categoryLabel = "معصم متوسط / قياسي";
  let recommendedDiameters = "36 مم إلى 40 مم";
  let advice = "معصمك يحظى بأكبر تنوع في التشكيلة، ويتناسب بامتياز مع الساعات الكلاسيكية والذكية المتوازنة.";
  let recommendedWatches: Watch[] = [];

  if (wristSize < 16.0) {
    categoryLabel = "معصم نحيف / دقيق";
    recommendedDiameters = "28 مم إلى 36 مم (أو سمارت نحيفة)";
    advice = "ننصح بالساعات ذات القطر المدمج والسماكة المنخفضة لتبقى مريحة ولا تتجاوز حواف المعصم.";
    recommendedWatches = [
      WATCHES.find((w) => w.id === "leila")!,
      WATCHES.find((w) => w.id === "classic")!,
      WATCHES.find((w) => w.id === "aire")!,
    ].filter(Boolean);
  } else if (wristSize <= 18.0) {
    categoryLabel = "معصم متوسط / قياسي";
    recommendedDiameters = "36 مم إلى 40 مم";
    advice = "المقاس الأكثر توازناً؛ تستقر علبة 36-40 مم بثبات فائق دون ثقل زائد مع مظهر متناسق للغاية.";
    recommendedWatches = [
      WATCHES.find((w) => w.id === "classic")!,
      WATCHES.find((w) => w.id === "pulse")!,
      WATCHES.find((w) => w.id === "nocturne")!,
      WATCHES.find((w) => w.id === "orbit")!,
    ].filter(Boolean);
  } else {
    categoryLabel = "معصم عريض / قوي";
    recommendedDiameters = "40 مم إلى 42 مم فما فوق";
    advice = "معصمك يتحمل الساعات ذات الحضور البارز والكرونوغراف والهياكل المتينة دون أن تبدو ضخمة.";
    recommendedWatches = [
      WATCHES.find((w) => w.id === "marine")!,
      WATCHES.find((w) => w.id === "ridge")!,
      WATCHES.find((w) => w.id === "nocturne")!,
    ].filter(Boolean);
  }

  // Visual proportional calculation
  // Base wrist width ~ 60px to 100px proportionally
  const visualWristWidth = 70 + (wristSize - 14) * 5;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wrist-guide-title"
    >
      {/* Top Header */}
      <div className="safe-top flex h-14 shrink-0 items-center justify-between border-b border-line bg-bg px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brass/10 text-brass">
            <Ruler className="size-4" />
          </span>
          <div>
            <h2 id="wrist-guide-title" className="text-sm font-semibold tracking-wide">
              دليل قياس المعصم التفاعلي
            </h2>
            <p className="text-[11px] text-muted">اختر مقاس معصمك لمعرفة الساعة الأنسب</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className={btnLine}>
          <X className="size-4" strokeWidth={1.75} />
          <span>إغلاق</span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-xl space-y-6">
          {/* Interactive Slider Box */}
          <div className="border border-line bg-surface p-5 text-center">
            <p className="text-xs font-semibold text-brass mb-1">محيط المعصم التقريبي</p>
            <div className="flex items-baseline justify-center gap-1.5" dir="ltr">
              <span className="text-4xl font-bold text-ink tabular-nums">{wristSize.toFixed(1)}</span>
              <span className="text-sm text-muted">سم</span>
            </div>

            {/* Slider */}
            <div className="mt-4 px-2">
              <input
                type="range"
                min={14}
                max={21}
                step={0.5}
                value={wristSize}
                onChange={(e) => setWristSize(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-line accent-brass"
              />
              <div className="mt-2 flex justify-between text-[11px] text-muted" dir="ltr">
                <span>14.0 سم (دقيق)</span>
                <span>17.5 سم (متوسط)</span>
                <span>21.0 سم (عريض)</span>
              </div>
            </div>

            {/* Presets */}
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setWristSize(15)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  wristSize < 16 ? "bg-ink text-bg font-semibold" : "border border-line bg-bg text-muted"
                }`}
              >
                معصم دقيق
              </button>
              <button
                type="button"
                onClick={() => setWristSize(17)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  wristSize >= 16 && wristSize <= 18
                    ? "bg-ink text-bg font-semibold"
                    : "border border-line bg-bg text-muted"
                }`}
              >
                معصم متوسط
              </button>
              <button
                type="button"
                onClick={() => setWristSize(19.5)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  wristSize > 18 ? "bg-ink text-bg font-semibold" : "border border-line bg-bg text-muted"
                }`}
              >
                معصم عريض
              </button>
            </div>
          </div>

          {/* Wrist Diagram Illustration (CSS/SVG) */}
          <div className="border border-line bg-bg p-5 text-center">
            <p className="text-xs text-muted mb-3">محاكاة استقرار الساعة على المعصم:</p>
            <div className="relative mx-auto flex h-32 items-center justify-center">
              {/* Wrist Cross Section */}
              <div
                className="h-24 rounded-2xl bg-amber-100/50 border border-amber-200 transition-all duration-300 flex items-center justify-center relative shadow-inner"
                style={{ width: `${visualWristWidth}%` }}
              >
                {/* Watch Strap simulation */}
                <div className="absolute inset-y-0 w-8 bg-zinc-800/80 rounded" />
                {/* Watch Case simulation */}
                <div className="relative z-10 size-14 rounded-full bg-brass/20 border-2 border-brass flex items-center justify-center text-[10px] font-bold text-brass shadow-md">
                  {wristSize < 16 ? "28-36 مم" : wristSize <= 18 ? "36-40 مم" : "40-42 مم"}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Card */}
          <div className="border-2 border-brass/50 bg-surface p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-medium text-brass uppercase tracking-wide">النتيجة والتشخيص</span>
                <h3 className="text-lg font-semibold text-ink mt-0.5">{categoryLabel}</h3>
              </div>
              <span className="rounded bg-brass/10 px-2.5 py-1 text-xs font-semibold text-brass">
                القطر الأنسب: {recommendedDiameters}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">{advice}</p>

            <div className="mt-4 border-t border-line pt-3">
              <p className="text-xs font-semibold text-ink mb-2.5 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-brass" />
                ساعات دار فلك المصممة لهذا القياس:
              </p>
              <div className="space-y-2">
                {recommendedWatches.map((watch) => (
                  <div
                    key={watch.id}
                    className="flex items-center justify-between gap-3 rounded border border-line bg-bg p-2.5 transition-colors hover:border-brass/70 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onOpenWatch(watch.id);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={watch.image} alt={watch.name} className="size-12 bg-line object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-ink truncate">{watch.name}</span>
                          <span className="text-[10px] text-brass shrink-0">{KIND_LABEL[watch.kind]}</span>
                        </div>
                        <p className="text-[11px] text-muted truncate">{watch.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-ink" dir="ltr">
                        {money(watch.price)}
                      </span>
                      <ArrowLeft className="size-3.5 text-brass" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simple How to measure tip */}
          <div className="rounded border border-line bg-surface p-4 text-xs text-muted leading-relaxed">
            <p className="font-semibold text-ink mb-1">💡 كيف تقيس معصمك في دقيقة؟</p>
            <p>
              لف شريط قياس مرن (أو خيط أو شريط ورق) حول معصمك تحت العظمة مباشرة حيث تضع ساعتك عادة، ثم قس الطول بالمسطرة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

