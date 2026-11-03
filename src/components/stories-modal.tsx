import { useEffect, useState, useRef, useCallback } from "react";
import { X, ShoppingBag, MessageCircle, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { WATCHES, money, KIND_LABEL, type Watch } from "@/data/watches";

export type StoryCategory = "all" | "luxury" | "smart" | "gifts" | "bestsellers";

export const STORY_CHANNELS: { id: StoryCategory; title: string; avatar: string; subtitle: string }[] = [
  { id: "all", title: "كافة الساعات", avatar: "/watches/classic.jpg", subtitle: "التشكيلة الكاملة" },
  { id: "luxury", title: "ميكانيكي فاخر", avatar: "/watches/nocturne.jpg", subtitle: "حركات أوتوماتيك" },
  { id: "smart", title: "ساعات سمارت", avatar: "/watches/pulse.jpg", subtitle: "تقنية وأناقة" },
  { id: "gifts", title: "مختارات الهدايا", avatar: "/watches/leila.jpg", subtitle: "تغليف مجاني" },
  { id: "bestsellers", title: "الأكثر طلباً", avatar: "/watches/marine.jpg", subtitle: "الأعلى رواجاً" },
];

export function StoriesModal({
  isOpen,
  category,
  onClose,
  onOpenWatch,
  onAddToCart,
}: {
  isOpen: boolean;
  category: StoryCategory;
  onClose: () => void;
  onOpenWatch: (id: string) => void;
  onAddToCart: (id: string) => void;
}) {
  const slides = getSlidesForCategory(category);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = slides[index] || slides[0];

  const goNext = useCallback(() => {
    if (index < slides.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [index, slides.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  }, [index]);

  useEffect(() => {
    setIndex(0);
  }, [category, isOpen]);

  // Auto-advance timer (5.5 seconds per slide)
  useEffect(() => {
    if (!isOpen || isPaused) return;
    timerRef.current = window.setTimeout(() => {
      goNext();
    }, 5500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, index, isPaused, goNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goNext();
      else if (e.key === "ArrowRight") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen || !current) return null;

  function handleAdd() {
    onAddToCart(current.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const whatsappInquiry = `https://api.whatsapp.com/send?phone=970598471925&text=${encodeURIComponent(
    `مرحباً دار فلك، شاهدت ساعة «${current.name}» في ستوري المتجر وأود الاستفسار عنها.`,
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="قصص دار فلك"
    >
      {/* Story Container (Phone Aspect Ratio) */}
      <div
        className="relative flex h-full w-full max-w-md flex-col justify-between overflow-hidden bg-night text-white shadow-2xl md:h-[90vh] md:max-h-[820px] md:rounded-2xl md:border md:border-white/10"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Watch Image */}
        <div className="absolute inset-0">
          <img
            key={current.id}
            src={current.image}
            alt={current.name}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70" />
        </div>

        {/* Top Header & Progress Segments */}
        <div className="safe-top relative z-20 px-4 pt-3">
          {/* Progress Bars */}
          <div className="flex gap-1.5" dir="ltr">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    i < index
                      ? "w-full"
                      : i === index
                      ? isPaused
                        ? "w-1/2 opacity-75"
                        : "w-full animate-[progress_5.5s_linear]"
                      : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Profile Bar */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-brass/30 border border-white/20 text-brass text-xs font-semibold">
                فلك
              </span>
              <div>
                <p className="text-xs font-semibold leading-tight text-white flex items-center gap-1">
                  دار فلك · نابلس
                  <Sparkles className="size-3 text-brass" />
                </p>
                <p className="text-[11px] text-white/70">
                  {KIND_LABEL[current.kind]} · {index + 1} من {slides.length}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md hover:bg-black/70 active:scale-90"
              aria-label="إغلاق الستوري"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Left & Right Touch Tap Navigation Zones */}
        <div className="absolute inset-x-0 top-16 bottom-32 z-10 grid grid-cols-2">
          {/* Right side is previous in RTL, left side is next */}
          <div
            className="cursor-pointer"
            onClick={goNext}
            aria-label="الشريحة التالية"
          />
          <div
            className="cursor-pointer"
            onClick={goPrev}
            aria-label="الشريحة السابقة"
          />
        </div>

        {/* Bottom Watch Information & Actions */}
        <div className="safe-bottom relative z-20 px-4 pb-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 backdrop-blur-md border border-white/10 text-xs">
              <span className="text-brass font-medium">{KIND_LABEL[current.kind]}</span>
              {current.flag ? <span className="text-white/80">· {current.flag}</span> : null}
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {current.name}
              </h3>
              <span className="text-xl font-bold text-brass" dir="ltr">
                {money(current.price)}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-white/90 line-clamp-2">
              {current.story}
            </p>

            {/* Quick Specs Pill Row */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-white/80">
              {current.specs.slice(0, 3).map((spec) => (
                <span
                  key={spec.label}
                  className="rounded bg-white/10 px-2 py-0.5 backdrop-blur-sm"
                >
                  {spec.label}: {spec.value}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-3 grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-brass px-3 text-xs font-semibold text-black transition-transform active:scale-95 shadow-lg"
              >
                <ShoppingBag className="size-4" />
                <span>{added ? "أُضيفت للحقيبة ✓" : "أضف للحقيبة"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWatch(current.id);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white backdrop-blur-md transition-transform hover:bg-white/25 active:scale-95 border border-white/15"
              >
                <span>المواصفات الكاملة</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={whatsappInquiry}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <MessageCircle className="size-3.5" />
                <span>استفسار واتساب مباشر</span>
              </a>
              <span className="text-[11px] text-white/50">
                انقر على جانبي الشاشة للتنقل
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSlidesForCategory(cat: StoryCategory): Watch[] {
  switch (cat) {
    case "luxury":
      return WATCHES.filter((w) => w.kind === "luxury");
    case "smart":
      return WATCHES.filter((w) => w.kind === "smart");
    case "gifts":
      return [
        WATCHES.find((w) => w.id === "classic")!,
        WATCHES.find((w) => w.id === "leila")!,
        WATCHES.find((w) => w.id === "pulse")!,
      ].filter(Boolean);
    case "bestsellers":
      return [
        WATCHES.find((w) => w.id === "classic")!,
        WATCHES.find((w) => w.id === "pulse")!,
        WATCHES.find((w) => w.id === "marine")!,
        WATCHES.find((w) => w.id === "ridge")!,
      ].filter(Boolean);
    case "all":
    default:
      return WATCHES;
  }
}

