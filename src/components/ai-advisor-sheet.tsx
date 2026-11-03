import { useState, useTransition, type FormEvent } from "react";
import { Sparkles, X, ArrowLeft, CheckCircle2, MessageCircle, ShoppingBag, Lightbulb, Compass, Share2 } from "lucide-react";
import { consultAIAdvisor, QUICK_PROMPTS, type AIAdviceResult } from "@/lib/ai-advisor";
import { money, KIND_LABEL, type Watch } from "@/data/watches";

const btnInk =
  "inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-bg transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50";
const btnLine =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-surface px-5 text-sm font-medium text-ink transition-[background-color,transform] duration-150 ease-out active:scale-95";

export function AiAdvisorSheet({
  isOpen,
  onClose,
  onOpenWatch,
  onAddToCart,
  initialQuery = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenWatch: (id: string) => void;
  onAddToCart: (id: string) => void;
  initialQuery?: string;
}) {
  const [input, setInput] = useState(initialQuery);
  const [result, setResult] = useState<AIAdviceResult | null>(() => {
    return initialQuery ? consultAIAdvisor(initialQuery) : null;
  });
  const [isPending, startTransition] = useTransition();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen) return null;

  function handleSearch(queryText: string) {
    const text = queryText.trim();
    if (!text) return;
    setInput(text);
    startTransition(() => {
      const res = consultAIAdvisor(text);
      setResult(res);
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    handleSearch(input);
  }

  function handleAdd(watch: Watch) {
    onAddToCart(watch.id);
    setAddedId(watch.id);
    setTimeout(() => {
      setAddedId((curr) => (curr === watch.id ? null : curr));
    }, 1500);
  }

  function handleShareAdvice() {
    if (!result) return;
    const shareText = `مستشار دار فلك رشح لي ساعة «${result.primaryWatch.name}» (${money(result.primaryWatch.price)}):\n${result.executiveSummary}\nhttps://falak.watch#${result.primaryWatch.id}`;
    if (navigator.share) {
      navigator.share({
        title: `ترشيح دار فلك: ${result.primaryWatch.name}`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      });
    }
  }

  const whatsappMessage = result
    ? `مرحباً دار فلك، استخدمت مستشاركم الذكي واقترح لي ساعة «${result.primaryWatch.name}» (${result.userIntent.title}). أود التأكد من توفرها وتأكيد طلبي.`
    : "";
  const whatsappUrl = `https://api.whatsapp.com/send?phone=970598471925&text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-advisor-title"
    >
      {/* Top Bar optimized for Instagram safe area */}
      <div className="safe-top flex h-14 shrink-0 items-center justify-between border-b border-line bg-bg px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brass/10 text-brass">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h2 id="ai-advisor-title" className="text-sm font-semibold tracking-wide">
              مستشار فلك الذكي (AI)
            </h2>
            <p className="text-[11px] text-muted">تحليل فوري ومطابقة مخصصة للمستعرض</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={btnLine}
          aria-label="إغلاق المستشار الذكي"
        >
          <X className="size-4" strokeWidth={1.75} />
          <span>إغلاق</span>
        </button>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:py-6">
        <div className="mx-auto max-w-2xl">
          {/* Query Input Box */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="صف ما تبحث عنه: هدية، سهرة، دوام يومي، رياضة ومسارات..."
                className="h-12 w-full rounded-none border border-line bg-surface pe-12 ps-4 text-sm text-ink outline-none transition-colors focus:border-brass placeholder:text-muted/70"
                autoFocus
              />
              <button
                type="submit"
                className="absolute end-1.5 inline-flex size-9 items-center justify-center bg-ink text-bg transition-transform active:scale-90"
                aria-label="تحليل الطلب"
              >
                <Sparkles className="size-4 text-brass" />
              </button>
            </div>
          </form>

          {/* Quick Prompts Carousel for Instagram Users */}
          <div className="mt-3">
            <p className="text-xs font-medium text-brass mb-2 flex items-center gap-1.5">
              <Compass className="size-3.5" />
              نماذج مقترحة بلمسة واحدة:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => handleSearch(prompt.query)}
                  className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink transition-colors hover:border-brass hover:bg-bg active:scale-95"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Skeleton / Loading State */}
          {isPending ? (
            <div className="mt-8 flex flex-col items-center justify-center py-12 text-center animate-pulse">
              <div className="size-12 rounded-full bg-brass/10 flex items-center justify-center text-brass mb-4">
                <Sparkles className="size-6 animate-spin" />
              </div>
              <p className="text-base font-medium">جاري فحص طلبك ومطابقة التشكيلة...</p>
              <p className="mt-1 text-xs text-muted">نحلل نوع الحركة، أبعاد العلبة، والمناسبة الأنسب لمعصمك.</p>
            </div>
          ) : result ? (
            /* Analysis & Recommendation Section */
            <div className="mt-6 space-y-6">
              {/* Intent Analysis Breakdown Banner */}
              <div className="border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[11px] font-medium tracking-wide uppercase text-brass">
                      تحليل الطلب المفهوم
                    </span>
                    <h3 className="text-base font-semibold text-ink mt-0.5">
                      {result.userIntent.title}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded bg-brass/10 px-2 py-1 text-xs font-semibold text-brass">
                    ملائمة {result.primaryMatchScore}%
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {result.userIntent.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.userIntent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-medium text-ink border border-line"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Recommended Watch Card */}
              <div className="border-2 border-brass/60 bg-bg p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brass">
                    <Sparkles className="size-3.5" />
                    الترشيح الأول من دار فلك
                  </span>
                  <span className="text-xs text-muted">
                    {KIND_LABEL[result.primaryWatch.kind]} · {result.primaryWatch.flag || "إصدار رسمي"}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-center">
                  <div
                    className="cursor-pointer overflow-hidden bg-line aspect-square"
                    onClick={() => onOpenWatch(result.primaryWatch.id)}
                  >
                    <img
                      src={result.primaryWatch.image}
                      alt={result.primaryWatch.name}
                      width={500}
                      height={500}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-2xl font-semibold text-ink">
                        {result.primaryWatch.name}
                      </h4>
                      <p className="mt-1 text-lg font-medium text-brass" dir="ltr">
                        {money(result.primaryWatch.price)}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted">
                        {result.primaryWatch.summary}
                      </p>

                      {/* Why chosen */}
                      <div className="mt-4 rounded bg-surface p-3 text-xs border border-line">
                        <p className="font-semibold text-ink mb-1 flex items-center gap-1">
                          <Lightbulb className="size-3.5 text-brass" />
                          لماذا تناسب طلبك تحديداً؟
                        </p>
                        <p className="text-muted leading-relaxed">
                          {result.whyChosen}
                        </p>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleAdd(result.primaryWatch)}
                        className={`${btnInk} w-full text-xs font-semibold`}
                      >
                        <ShoppingBag className="size-4" />
                        {addedId === result.primaryWatch.id ? "أُضيفت إلى الحقيبة" : "أضف للحقيبة الآن"}
                      </button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenWatch(result.primaryWatch.id)}
                          className={`${btnLine} text-xs`}
                        >
                          المواصفات الكاملة
                        </button>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`${btnLine} text-xs text-emerald-800 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50`}
                        >
                          <MessageCircle className="size-3.5 text-emerald-600" />
                          استفسار واتساب
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights and Styling Advice */}
                <div className="mt-5 border-t border-line pt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded bg-surface p-3 border border-line">
                    <p className="text-xs font-semibold text-ink mb-2">
                      أبرز الخصائص المطابقة لطلبك:
                    </p>
                    <ul className="space-y-1.5 text-xs text-muted">
                      {result.keyHighlights.map((hl, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="size-3.5 text-brass shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded bg-surface p-3 border border-line">
                    <p className="text-xs font-semibold text-ink mb-2">
                      نصيحة المعصم والتنسيق:
                    </p>
                    <p className="text-xs leading-relaxed text-muted">
                      {result.stylingAdvice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Choice if exists */}
              {result.alternativeWatch ? (
                <div className="border border-line bg-surface p-4">
                  <span className="text-xs font-semibold text-muted block mb-1">
                    خيار بديل للمقارنة:
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={result.alternativeWatch.image}
                        alt={result.alternativeWatch.name}
                        className="size-14 bg-line object-cover shrink-0"
                      />
                      <div>
                        <h5 className="text-sm font-semibold text-ink">
                          {result.alternativeWatch.name}
                        </h5>
                        <p className="text-xs text-brass" dir="ltr">
                          {money(result.alternativeWatch.price)}
                        </p>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">
                          {result.alternativeReason}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenWatch(result.alternativeWatch!.id)}
                      className="shrink-0 text-xs font-medium text-brass hover:underline flex items-center gap-1"
                    >
                      معاينة
                      <ArrowLeft className="size-3" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Share and Bottom Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleShareAdvice}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
                >
                  <Share2 className="size-3.5" />
                  <span>{copiedShare ? "تم نسخ الرابط والترشيح!" : "مشاركة هذه النتيجة في إنستغرام"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("");
                    setResult(null);
                  }}
                  className="text-xs text-brass hover:underline"
                >
                  سؤال أو طلب جديد ↺
                </button>
              </div>
            </div>
          ) : (
            /* Intro State when no search conducted yet */
            <div className="mt-8 text-center py-8">
              <div className="mx-auto size-16 rounded-full bg-surface border border-line flex items-center justify-center text-brass mb-4">
                <Sparkles className="size-8" />
              </div>
              <h3 className="text-lg font-medium text-ink">مستشارك الذكي لاختيار الساعة المثالية</h3>
              <p className="mt-2 max-w-md mx-auto text-xs leading-relaxed text-muted">
                لا نكتفي بإظهار قائمة بالساعات، بل يقرأ نظامنا الذكي طبيعة استخدامك (مناسبة خاصة، عمل، رياضة، هدية، ميزانية) ويشرح لك بدقة لماذا تناسبك هذه الساعة وكيف تنسقها مع مظهرك.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {QUICK_PROMPTS.slice(0, 4).map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSearch(item.query)}
                    className={`${btnLine} text-xs py-2 h-auto`}
                  >
                    ✨ {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

