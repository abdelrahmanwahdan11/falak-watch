import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Banknote,
  Copy,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
  Sparkles,
  MessageCircle,
  Share2,
  Search,
  Heart,
  Ruler,
  ArrowLeftRight,
  Gift,
} from "lucide-react";
import { KIND_LABEL, WATCHES, findWatch, money, type Watch, type WatchKind } from "@/data/watches";
import { saveOrder, useCart, type SavedOrder } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { AiAdvisorSheet } from "@/components/ai-advisor-sheet";
import { QUICK_PROMPTS } from "@/lib/ai-advisor";
import { StoriesModal, STORY_CHANNELS, type StoryCategory } from "@/components/stories-modal";
import { WristGuideModal } from "@/components/wrist-guide-modal";
import { ComparisonModal } from "@/components/comparison-modal";

type Filter = "all" | WatchKind | "wishlist";

const CITIES = [
  "نابلس",
  "رام الله",
  "الخليل",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "سلفيت",
  "طوباس",
  "أريحا",
  "بيت لحم",
  "القدس",
  "الداخل",
  "أخرى",
];

const btnInk =
  "inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-bg transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50";
const btnLine =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-surface px-5 text-sm font-medium text-ink transition-[background-color,transform] duration-150 ease-out active:scale-95";
const btnIcon =
  "inline-flex size-11 items-center justify-center border border-line bg-surface text-ink transition-[background-color,transform] duration-150 ease-out active:scale-95";

function countOf(lines: { qty: number }[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

function orderText(order: SavedOrder) {
  const items = order.lines
    .map((line) => `• ${line.name} × ${line.qty} — ${money(line.price * line.qty)}`)
    .join("\n");
  return [
    `طلب دار فلك`,
    `الرقم: ${order.id}`,
    items,
    `المجموع: ${money(order.total)}`,
    `الاسم: ${order.name}`,
    `المدينة: ${order.city}`,
    `الهاتف: ${order.phone}`,
    order.note ? `ملاحظة: ${order.note}` : "",
    order.isGift
      ? `🎁 طلب إهداء:\n• المُهدى إليه: ${order.giftRecipient || "غير محدد"}\n• كرت الإهداء: "${order.giftMessage || ""}"\n• تغليف دار فلك الفاخر مجاناً`
      : "",
    `الدفع عند الاستلام`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.inset = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

export function Shop() {
  const lines = useCart((state) => state.lines);
  const add = useCart((state) => state.add);
  const setQty = useCart((state) => state.setQty);
  const clear = useCart((state) => state.clear);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [watchId, setWatchId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const wishlist = useWishlist((state) => state.ids);
  const toggleWishlist = useWishlist((state) => state.toggle);
  const hasWishlist = useWishlist((state) => state.has);

  const [storyOpen, setStoryOpen] = useState(false);
  const [storyCategory, setStoryCategory] = useState<StoryCategory>("all");
  const [wristGuideOpen, setWristGuideOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [compareA, setCompareA] = useState<string>("classic");
  const [compareB, setCompareB] = useState<string>("pulse");

  useEffect(() => {
    setReady(true);
    const id = window.location.hash.replace(/^#/, "");
    if (id === "bag") setCartOpen(true);
    else if (id === "ai" || id === "advisor") setAiOpen(true);
    else if (id === "stories") {
      setStoryCategory("all");
      setStoryOpen(true);
    } else if (id === "wrist") setWristGuideOpen(true);
    else if (id === "compare") setComparisonOpen(true);
    else if (findWatch(id)) setWatchId(id);
  }, []);

  useEffect(() => {
    if (!watchId && !cartOpen && !aiOpen && !storyOpen && !wristGuideOpen && !comparisonOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [watchId, cartOpen, aiOpen, storyOpen, wristGuideOpen, comparisonOpen]);

  const shown = useMemo(() => {
    const q = query.trim();
    return WATCHES.filter((watch) => {
      if (filter === "wishlist") {
        if (!wishlist.includes(watch.id)) return false;
      } else if (filter !== "all" && watch.kind !== filter) {
        return false;
      }
      if (!q) return true;
      return `${watch.name} ${watch.summary} ${KIND_LABEL[watch.kind]}`.includes(q);
    });
  }, [filter, query, wishlist]);

  const bagCount = ready ? countOf(lines) : 0;
  const wishlistCount = ready ? wishlist.length : 0;
  const active = watchId ? findWatch(watchId) : undefined;

  function openWatch(id: string) {
    setCartOpen(false);
    setAiOpen(false);
    setStoryOpen(false);
    setWristGuideOpen(false);
    setComparisonOpen(false);
    setWatchId(id);
    window.history.replaceState(window.history.state, "", `#${id}`);
  }

  function openCart() {
    setWatchId(null);
    setAiOpen(false);
    setStoryOpen(false);
    setWristGuideOpen(false);
    setComparisonOpen(false);
    setCartOpen(true);
    window.history.replaceState(window.history.state, "", "#bag");
  }

  function openAiAdvisor(initialText: string = "") {
    setWatchId(null);
    setCartOpen(false);
    setStoryOpen(false);
    setWristGuideOpen(false);
    setComparisonOpen(false);
    if (initialText) setAiQuery(initialText);
    setAiOpen(true);
    window.history.replaceState(window.history.state, "", "#ai");
  }

  function openCompare(firstId?: string, secondId?: string) {
    if (firstId) setCompareA(firstId);
    if (secondId) setCompareB(secondId);
    else if (firstId && firstId === compareB) {
      setCompareB(firstId === "classic" ? "pulse" : "classic");
    }
    setComparisonOpen(true);
    window.history.replaceState(window.history.state, "", "#compare");
  }

  function openWristGuide() {
    setWristGuideOpen(true);
    window.history.replaceState(window.history.state, "", "#wrist");
  }

  function closePanels() {
    setWatchId(null);
    setCartOpen(false);
    setAiOpen(false);
    setStoryOpen(false);
    setWristGuideOpen(false);
    setComparisonOpen(false);
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }

  function addWatch(id: string) {
    add(id);
    setAddedId(id);
    window.setTimeout(() => setAddedId((current) => (current === id ? null : current)), 1200);
  }

  function jump(next: Filter) {
    setFilter(next);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("catalog")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="safe-top sticky top-0 z-20 border-b border-line bg-bg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <a href="#top" className="text-xl font-semibold tracking-wide">
              فلك
            </a>
            <span className="hidden sm:inline-block rounded-full bg-brass/10 px-2 py-0.5 text-[11px] font-medium text-brass">
              ساعات فاخرة وسمارت
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => jump("wishlist")}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 border border-line bg-surface px-3 text-xs font-medium transition-[background-color,transform] duration-150 ease-out active:scale-95 ${
                wishlistCount > 0 ? "text-rose-600 border-rose-300" : "text-muted"
              }`}
              aria-label="المفضلة"
              title="قائمة المفضلة"
            >
              <Heart className={`size-4 ${wishlistCount > 0 ? "fill-rose-600 text-rose-600" : ""}`} />
              <span className="hidden sm:inline">المفضلة</span>
              <span className="tabular-nums" dir="ltr">
                {wishlistCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => openAiAdvisor()}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-brass/40 bg-brass/10 px-3.5 text-xs font-semibold text-brass transition-[background-color,transform] duration-150 ease-out active:scale-95"
              aria-label="مستشار فلك الذكي"
            >
              <Sparkles className="size-4" />
              <span>مستشار AI</span>
            </button>

            <button type="button" onClick={openCart} className={btnLine} aria-label="فتح الحقيبة">
              <ShoppingBag className="size-5" strokeWidth={1.75} aria-hidden="true" />
              <span>الحقيبة</span>
              <span className="min-w-5 text-center tabular-nums" dir="ltr">
                {bagCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Instagram Stories Bar */}
      <section className="border-b border-line bg-surface/80 py-2.5 px-4 overflow-x-auto no-scrollbar">
        <div className="mx-auto flex max-w-6xl items-center gap-3 sm:gap-5">
          <span className="text-[11px] font-semibold text-brass shrink-0 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse" />
            ستوري فلك:
          </span>

          <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
            {STORY_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setStoryCategory(ch.id);
                  setStoryOpen(true);
                }}
                className="group flex flex-col items-center gap-1 text-center shrink-0 active:scale-95 transition-transform"
              >
                <div className="size-13 sm:size-15 rounded-full p-[2px] bg-gradient-to-tr from-amber-600 via-rose-500 to-amber-300 shadow-sm transition-transform group-hover:scale-105">
                  <div className="size-full rounded-full p-[1.5px] bg-bg overflow-hidden">
                    <img
                      src={ch.avatar}
                      alt={ch.title}
                      className="size-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-ink max-w-[65px] truncate leading-tight">
                  {ch.title}
                </span>
              </button>
            ))}

            {/* Quick action circles */}
            <button
              type="button"
              onClick={openWristGuide}
              className="group flex flex-col items-center gap-1 text-center shrink-0 active:scale-95 transition-transform"
            >
              <div className="size-13 sm:size-15 rounded-full p-[2px] bg-gradient-to-tr from-brass via-amber-400 to-brass/40 shadow-sm">
                <div className="size-full rounded-full bg-bg flex items-center justify-center text-brass">
                  <Ruler className="size-5" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-ink max-w-[65px] truncate leading-tight">
                قياس المعصم
              </span>
            </button>

            <button
              type="button"
              onClick={() => openCompare("classic", "pulse")}
              className="group flex flex-col items-center gap-1 text-center shrink-0 active:scale-95 transition-transform"
            >
              <div className="size-13 sm:size-15 rounded-full p-[2px] bg-gradient-to-tr from-zinc-700 via-zinc-400 to-zinc-900 shadow-sm">
                <div className="size-full rounded-full bg-bg flex items-center justify-center text-ink">
                  <ArrowLeftRight className="size-5" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-ink max-w-[65px] truncate leading-tight">
                قارن الساعات
              </span>
            </button>
          </div>
        </div>
      </section>

      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-6 md:grid-cols-2 md:gap-12 md:py-14">
          <button
            type="button"
            onClick={() => openWatch("classic")}
            className="block w-full text-start transition-transform duration-150 ease-out active:scale-95"
          >
            <img
              src="/watches/classic.jpg"
              alt="ساعة كلاسيك 36 الذهبية على حجر فاتح"
              width={960}
              height={960}
              fetchPriority="high"
              decoding="async"
              className="aspect-square w-full bg-line object-cover"
            />
            <span className="flex items-center justify-between bg-night px-4 py-3 text-night-fg">
              <span>
                <span className="block text-xs text-night-fg/80">فاخرة</span>
                <span className="text-sm font-medium">كلاسيك 36</span>
              </span>
              <span dir="ltr" className="text-sm">
                {money(4280)}
              </span>
            </span>
          </button>

          <div>
            <p className="text-sm font-medium text-brass">دار ساعات · نابلس</p>
            <h1 className="mt-2 text-4xl leading-snug font-medium md:text-5xl">ساعات تُلبس كل يوم</h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              خط ميكانيكي فاخر، وخط سمارت. نفس الضمان، والتوصيل للضفة والقدس، والدفع عند الاستلام. الصفحة خفيفة
              وتُفتح من ستوري إنستغرام بلا انتظار.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className={btnInk} onClick={() => jump("luxury")}>
                الساعات الفاخرة
              </button>
              <button type="button" className={btnLine} onClick={() => jump("smart")}>
                ساعات السمارت
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-brass/40 bg-brass/10 px-4 text-sm font-semibold text-brass transition-[background-color,transform] duration-150 ease-out active:scale-95"
                onClick={() => openAiAdvisor()}
              >
                <Sparkles className="size-4" />
                <span>مستشار AI الذكي</span>
              </button>
            </div>
          </div>
        </section>

        <section className="border-y border-line">
          <ul className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-3">
            <Promise icon={<ShieldCheck className="size-5" strokeWidth={1.75} />} title="ضمان ٢٤ شهراً" body="على العطل المصنعي، للخطين." />
            <Promise icon={<Truck className="size-5" strokeWidth={1.75} />} title="توصيل ٣–٥ أيام" body="للضفة والقدس والداخل." />
            <Promise icon={<Banknote className="size-5" strokeWidth={1.75} />} title="دفع عند الاستلام" body="أو حوّل بعد تأكيد الطلب." />
          </ul>
        </section>

        <section id="catalog" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-brass">المجموعة</p>
              <h2 className="text-2xl leading-snug font-medium">ثماني ساعات. خطّان.</h2>
            </div>
            <div className="grid grid-cols-4 border border-line bg-surface p-1 md:min-w-96 text-xs" role="tablist" aria-label="تصفية المجموعة">
              <FilterButton current={filter} value="all" onSelect={setFilter} label="الكل" count={WATCHES.length} />
              <FilterButton current={filter} value="luxury" onSelect={setFilter} label="فاخرة" count={WATCHES.filter((watch) => watch.kind === "luxury").length} />
              <FilterButton current={filter} value="smart" onSelect={setFilter} label="سمارت" count={WATCHES.filter((watch) => watch.kind === "smart").length} />
              <FilterButton current={filter} value="wishlist" onSelect={setFilter} label="المفضلة ❤️" count={wishlistCount} />
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث باسم الساعة أو صِف ما تحتاج..."
                  className="h-11 w-full border border-line bg-surface pe-9 ps-3 text-sm text-ink outline-none transition-colors focus:border-brass placeholder:text-muted"
                  enterKeyHint="search"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    aria-label="مسح البحث"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => openAiAdvisor(query)}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-brass/40 bg-brass/10 px-4 text-xs font-semibold text-brass transition-[background-color,transform] duration-150 ease-out active:scale-95 shrink-0"
              >
                <Sparkles className="size-3.5" />
                <span>تحليل بالذكاء الاصطناعي (AI)</span>
              </button>
            </div>

            {/* Quick Prompts for Instagram users */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="shrink-0 text-muted flex items-center gap-1 text-[11px]">
                <Sparkles className="size-3 text-brass" />
                اقتراحات سريعة:
              </span>
              {QUICK_PROMPTS.slice(0, 5).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => openAiAdvisor(p.query)}
                  className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink transition-colors hover:border-brass hover:bg-bg active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Quick interactive tools */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/50 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openWristGuide}
                  className="inline-flex items-center gap-1.5 font-medium text-brass hover:underline"
                >
                  <Ruler className="size-3.5" />
                  <span>دليل مقاس المعصم</span>
                </button>
                <span className="text-line">·</span>
                <button
                  type="button"
                  onClick={() => openCompare("classic", "pulse")}
                  className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-ink hover:underline"
                >
                  <ArrowLeftRight className="size-3.5" />
                  <span>مقارنة ساعتين</span>
                </button>
              </div>

              {wishlistCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilter(filter === "wishlist" ? "all" : "wishlist")}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:underline"
                >
                  <Heart className="size-3 fill-rose-600" />
                  <span>{filter === "wishlist" ? "عرض جميع الساعات" : `لديك ${wishlistCount} في المفضلة`}</span>
                </button>
              ) : null}
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="mt-10 text-center text-muted">
              {filter === "wishlist"
                ? "لم تضف أي ساعة إلى المفضلة بعد. انقر على أيقونة القلب على أي ساعة لإضافتها هنا."
                : "لا توجد ساعة بهذا الاسم. جرّب «فاخرة» أو «سمارت»."}
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
              {shown.map((watch) => (
                <li key={watch.id}>
                  <WatchCard
                    watch={watch}
                    added={addedId === watch.id}
                    isWishlisted={wishlist.includes(watch.id)}
                    onOpen={() => openWatch(watch.id)}
                    onAdd={() => addWatch(watch.id)}
                    onToggleWishlist={() => toggleWishlist(watch.id)}
                    onCompare={() => openCompare(watch.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-t border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-brass">الدار</p>
              <h2 className="mt-2 text-2xl leading-snug font-medium">معيار واحد للترس والشاشة</h2>
              <p className="mt-3 leading-relaxed text-muted">
                فلك بيت ساعات في نابلس. نختار المينا الميكانيكية والساعة الذكية بنفس السؤال: هل تبقى على المعصم من
                الصباح حتى آخر الليل؟ ما لا ينجو من ذلك لا يدخل المجموعة.
              </p>
            </div>
            <div className="grid gap-3">
              <Faq q="هل تُفتح الصفحة من إنستغرام؟" a="نعم. صُممت لمتصفح إنستغرام الداخلي: خفيفة، بلا تمرير أفقي، والطلب يُجهَّز هنا ثم يُرسل بواتساب أو يُنسخ." />
              <Faq q="كيف أدفع؟" a="الدفع عند الاستلام. بعد إرسال الطلب عبر واتساب نؤكد المقاس والتوصيل قبل الخروج." />
              <Faq q="كم الضمان والاستبدال؟" a="ضمان ٢٤ شهراً على العطل المصنعي. الاستبدال خلال ٧ أيام إذا بقيت الساعة بحالتها وعلبتها." />
            </div>
          </div>
        </section>
      </main>

      <footer className="safe-bottom border-t border-line px-4 py-8 text-center text-sm text-muted">
        دار فلك · نابلس · ساعات فاخرة وسمارت
      </footer>

      {active ? (
        <WatchPanel
          watch={active}
          added={addedId === active.id}
          isWishlisted={wishlist.includes(active.id)}
          onClose={closePanels}
          onAdd={() => addWatch(active.id)}
          onBag={openCart}
          onAskAI={(query) => openAiAdvisor(query)}
          onToggleWishlist={() => toggleWishlist(active.id)}
          onCompare={() => openCompare(active.id)}
          onOpenWristGuide={openWristGuide}
        />
      ) : null}

      {cartOpen ? (
        <CartPanel
          onClose={closePanels}
          onOpenWatch={openWatch}
          lines={ready ? lines : []}
          setQty={setQty}
          clear={clear}
        />
      ) : null}

      {/* Floating Bottom Navigation Dock for Mobile / Instagram users */}
      <nav
        aria-label="شريط الوصول السريع"
        className="safe-bottom fixed bottom-3 inset-x-3 z-30 flex items-center justify-between gap-1.5 border border-line bg-bg/95 p-1.5 shadow-xl backdrop-blur-md sm:hidden"
      >
        <button
          type="button"
          onClick={() => {
            setStoryCategory("all");
            setStoryOpen(true);
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded border border-line bg-surface py-2.5 text-[11px] font-medium text-ink active:scale-95"
        >
          <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
          <span>ستوري</span>
        </button>
        <button
          type="button"
          onClick={() => openAiAdvisor()}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-brass/10 py-2.5 text-[11px] font-semibold text-brass active:scale-95"
        >
          <Sparkles className="size-3" />
          <span>مستشار AI</span>
        </button>
        <button
          type="button"
          onClick={() => jump("wishlist")}
          className="flex flex-1 items-center justify-center gap-1 rounded border border-line bg-surface py-2.5 text-[11px] font-medium text-ink active:scale-95"
        >
          <Heart className={`size-3 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>المفضلة ({wishlistCount})</span>
        </button>
        <button
          type="button"
          onClick={openCart}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-ink py-2.5 text-[11px] font-medium text-bg active:scale-95"
        >
          <ShoppingBag className="size-3" />
          <span>الحقيبة ({bagCount})</span>
        </button>
      </nav>

      {/* AI Advisor Modal Sheet */}
      <AiAdvisorSheet
        isOpen={aiOpen}
        onClose={closePanels}
        onOpenWatch={openWatch}
        onAddToCart={addWatch}
        initialQuery={aiQuery}
      />

      {/* Instagram Stories Modal */}
      <StoriesModal
        isOpen={storyOpen}
        category={storyCategory}
        onClose={closePanels}
        onOpenWatch={openWatch}
        onAddToCart={addWatch}
      />

      {/* Wrist Fit Guide Modal */}
      <WristGuideModal
        isOpen={wristGuideOpen}
        onClose={closePanels}
        onOpenWatch={openWatch}
      />

      {/* Smart Comparison Modal */}
      <ComparisonModal
        isOpen={comparisonOpen}
        initialWatchA={compareA}
        initialWatchB={compareB}
        onClose={closePanels}
        onOpenWatch={openWatch}
        onAddToCart={addWatch}
      />
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border border-line bg-bg px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">{q}</summary>
      <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
    </details>
  );
}

function Promise({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3 bg-bg px-4 py-4">
      <span className="mt-0.5 text-brass" aria-hidden="true">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-sm text-muted">{body}</span>
      </span>
    </li>
  );
}

function FilterButton({
  current,
  value,
  label,
  count,
  onSelect,
}: {
  current: Filter;
  value: Filter;
  label: string;
  count: number;
  onSelect: (value: Filter) => void;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => onSelect(value)}
      className={
        selected
          ? "min-h-11 bg-ink text-sm font-medium text-bg"
          : "min-h-11 text-sm font-medium text-muted"
      }
    >
      {label}
      <span className="ms-1 tabular-nums" dir="ltr">
        {count}
      </span>
    </button>
  );
}

function WatchCard({
  watch,
  added,
  isWishlisted,
  onOpen,
  onAdd,
  onToggleWishlist,
  onCompare,
}: {
  watch: Watch;
  added: boolean;
  isWishlisted: boolean;
  onOpen: () => void;
  onAdd: () => void;
  onToggleWishlist: () => void;
  onCompare: () => void;
}) {
  return (
    <article className="group relative">
      <div className="relative overflow-hidden bg-line aspect-square">
        <button type="button" onClick={onOpen} className="block size-full text-start">
          <img
            src={watch.image}
            alt={watch.name}
            width={960}
            height={960}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </button>

        {/* Wishlist Heart Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className={`absolute top-2 start-2 flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            isWishlisted
              ? "bg-rose-500 text-white shadow-md"
              : "bg-black/35 text-white/90 hover:bg-black/55"
          }`}
          aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <Heart className={`size-4 ${isWishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Compare Quick Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCompare();
          }}
          className="absolute top-2 end-2 flex size-8 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-md hover:bg-black/55 active:scale-90"
          title="مقارنة الساعة"
          aria-label="مقارنة الساعة"
        >
          <ArrowLeftRight className="size-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="min-w-0 text-start">
          <span className="block text-xs font-medium text-brass">
            {KIND_LABEL[watch.kind]}
            {watch.flag ? ` · ${watch.flag}` : ""}
          </span>
          <span className="mt-0.5 block text-base font-medium">{watch.name}</span>
          <span className="mt-1 block text-sm text-muted">
            <span dir="ltr">{money(watch.price)}</span>
          </span>
        </button>
      </div>

      <button type="button" onClick={onAdd} className={`${btnLine} mt-3 w-full`}>
        {added ? "أُضيفت للحقيبة ✓" : "أضف للحقيبة"}
      </button>
    </article>
  );
}

function WatchPanel({
  watch,
  added,
  isWishlisted,
  onClose,
  onAdd,
  onBag,
  onAskAI,
  onToggleWishlist,
  onCompare,
  onOpenWristGuide,
}: {
  watch: Watch;
  added: boolean;
  isWishlisted: boolean;
  onClose: () => void;
  onAdd: () => void;
  onBag: () => void;
  onAskAI: (query: string) => void;
  onToggleWishlist: () => void;
  onCompare: () => void;
  onOpenWristGuide: () => void;
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleShare() {
    const shareText = `ساعة «${watch.name}» من دار فلك: ${watch.summary} (${money(watch.price)})\n${window.location.origin}#${watch.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `دار فلك — ${watch.name}`,
          text: shareText,
          url: `${window.location.origin}#${watch.id}`,
        })
        .catch(() => {});
    } else {
      void copyText(`${window.location.origin}#${watch.id}`).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  }

  const whatsappInquiry = `https://api.whatsapp.com/send?phone=970598471925&text=${encodeURIComponent(
    `مرحباً دار فلك، رأيت ساعة «${watch.name}» في إنستغرام ولدي استفسار عنها قبل إتمام طلبي.`,
  )}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-labelledby="watch-title">
      <div className="safe-top flex h-14 shrink-0 items-center justify-between border-b border-line bg-bg px-4">
        <button type="button" onClick={onClose} className={btnLine}>
          <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
          رجوع
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onToggleWishlist}
            className={`inline-flex size-11 items-center justify-center border border-line bg-surface transition-transform active:scale-95 ${
              isWishlisted ? "text-rose-600 border-rose-300" : "text-ink"
            }`}
            aria-label="المفضلة"
            title="إضافة للمفضلة"
          >
            <Heart className={`size-4 ${isWishlisted ? "fill-rose-600" : ""}`} />
          </button>
          <button
            type="button"
            onClick={onCompare}
            className="inline-flex size-11 items-center justify-center border border-line bg-surface text-ink transition-transform active:scale-95"
            aria-label="مقارنة الساعة"
            title="مقارنة مع ساعة أخرى"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex size-11 items-center justify-center border border-line bg-surface text-ink transition-transform active:scale-95"
            aria-label="مشاركة الساعة"
            title="مشاركة رابط الساعة"
          >
            <Share2 className="size-4" />
          </button>
          <button type="button" onClick={onBag} className="min-h-11 px-2 text-sm font-medium text-brass">
            الحقيبة
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-2 md:py-10">
          <div className="space-y-3">
            <img
              src={watch.image}
              alt={watch.name}
              width={960}
              height={960}
              decoding="async"
              className="aspect-square w-full bg-line object-cover"
            />
            {copiedLink ? (
              <p className="text-center text-xs text-brass font-medium">✓ تم نسخ رابط الساعة لمشاركته في إنستغرام</p>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-medium text-brass">
              {KIND_LABEL[watch.kind]}
              {watch.flag ? ` · ${watch.flag}` : ""}
            </p>
            <h2 id="watch-title" className="mt-1 text-3xl leading-snug font-medium">
              {watch.name}
            </h2>
            <p className="mt-2 text-xl">
              <span dir="ltr">{money(watch.price)}</span>
            </p>
            <p className="mt-4 leading-relaxed text-muted">{watch.story}</p>

            {/* AI Advisor Contextual Trigger for this watch */}
            <button
              type="button"
              onClick={() => onAskAI(`هل تناسبني ساعة ${watch.name} (${KIND_LABEL[watch.kind]}) وهل تلائم استخدامي؟`)}
              className="mt-4 flex w-full items-center justify-between border border-brass/30 bg-brass/5 p-3 text-xs text-brass transition-colors hover:bg-brass/10"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="size-3.5" />
                هل تناسبني هذه الساعة؟ استشر مستشار AI
              </span>
              <span>تحليل الملائمة والمواصفات ←</span>
            </button>

            {/* Quick interactive tools inside product view */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={onOpenWristGuide}
                className="flex items-center justify-center gap-1.5 border border-line bg-surface p-2 text-xs font-medium text-ink transition-colors hover:border-brass"
              >
                <Ruler className="size-3.5 text-brass" />
                <span>دليل مقاس المعصم</span>
              </button>
              <button
                type="button"
                onClick={onCompare}
                className="flex items-center justify-center gap-1.5 border border-line bg-surface p-2 text-xs font-medium text-ink transition-colors hover:border-brass"
              >
                <ArrowLeftRight className="size-3.5 text-brass" />
                <span>قارن مع ساعة أخرى</span>
              </button>
            </div>

            <dl className="mt-6 divide-y divide-line border-y border-line">
              {watch.specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="safe-bottom shrink-0 border-t border-line bg-bg px-4 py-3 flex gap-2">
        <button type="button" className={`${btnInk} flex-1`} onClick={onAdd}>
          {added ? "أُضيفت إلى الحقيبة" : "أضف للحقيبة"}
        </button>
        <a
          href={whatsappInquiry}
          target="_blank"
          rel="noreferrer"
          className={`${btnLine} shrink-0 text-emerald-800 border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-xs px-3.5`}
          aria-label="استفسار واتساب"
        >
          <MessageCircle className="size-4 text-emerald-600" />
          <span className="hidden sm:inline">استفسار واتساب</span>
        </a>
      </div>
    </div>
  );
}

function CartPanel({
  onClose,
  onOpenWatch,
  lines,
  setQty,
  clear,
}: {
  onClose: () => void;
  onOpenWatch: (id: string) => void;
  lines: { id: string; qty: number }[];
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}) {
  const items = lines
    .map((line) => {
      const watch = findWatch(line.id);
      return watch ? { watch, qty: line.qty } : null;
    })
    .filter((item): item is { watch: Watch; qty: number } => item !== null);
  const total = items.reduce((sum, item) => sum + item.watch.price * item.qty, 0);
  const [step, setStep] = useState<"bag" | "form" | "done">("bag");
  const [name, setName] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    const digits = phone.replace(/[^\d]/g, "");
    if (trimmed.length < 2) {
      setError("اكتب الاسم كما تريد أن نناديك.");
      return;
    }
    if (digits.length < 9) {
      setError("رقم الهاتف ناقص. مثال: 0599000000");
      return;
    }
    if (items.length === 0) {
      setError("الحقيبة فارغة.");
      return;
    }
    const next: SavedOrder = {
      id: `F-${Date.now().toString(36).toUpperCase()}`,
      at: new Date().toISOString(),
      name: trimmed,
      city,
      phone: phone.trim(),
      note: note.trim(),
      total,
      lines: items.map((item) => ({
        name: item.watch.name,
        qty: item.qty,
        price: item.watch.price,
      })),
      isGift,
      giftRecipient: isGift ? giftRecipient.trim() : undefined,
      giftMessage: isGift ? giftMessage.trim() : undefined,
    };
    saveOrder(next);
    setOrder(next);
    setError("");
    setStep("done");
    clear();
  }

  const text = order ? orderText(order) : "";
  const whatsapp = text ? `https://api.whatsapp.com/send?phone=970598471925&text=${encodeURIComponent(text)}` : "";

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg" role="dialog" aria-modal="true" aria-labelledby="bag-title">
      <div className="safe-top sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-bg px-4">
        <button type="button" onClick={onClose} className={btnLine}>
          <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
          رجوع
        </button>
        <h2 id="bag-title" className="text-base font-medium">
          {step === "done" ? "الطلب جاهز" : step === "form" ? "بيانات التوصيل" : "الحقيبة"}
        </h2>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        {step === "bag" ? (
          items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">الحقيبة فارغة</p>
              <p className="mt-2 text-sm text-muted">اختر ساعة فاخرة أو سمارت من المجموعة.</p>
              <button type="button" className={`${btnInk} mt-6`} onClick={onClose}>
                إلى المجموعة
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line border-y border-line">
                {items.map(({ watch, qty }) => (
                  <li key={watch.id} className="flex gap-3 py-4">
                    <button type="button" onClick={() => onOpenWatch(watch.id)} className="shrink-0">
                      <img src={watch.image} alt="" width={96} height={96} className="size-20 bg-line object-cover" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={() => onOpenWatch(watch.id)} className="text-start">
                        <span className="block text-xs font-medium text-brass">{KIND_LABEL[watch.kind]}</span>
                        <span className="block font-medium">{watch.name}</span>
                      </button>
                      <span className="mt-1 block text-sm text-muted">
                        <span dir="ltr">{money(watch.price)}</span>
                      </span>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" className={btnIcon} aria-label="أنقص" onClick={() => setQty(watch.id, qty - 1)}>
                          <Minus className="size-4" strokeWidth={1.75} />
                        </button>
                        <span className="w-6 text-center tabular-nums" dir="ltr">
                          {qty}
                        </span>
                        <button type="button" className={btnIcon} aria-label="زد" onClick={() => setQty(watch.id, qty + 1)}>
                          <Plus className="size-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm text-muted">المجموع</span>
                <span dir="ltr" className="text-xl font-medium">
                  {money(total)}
                </span>
              </div>
              <button type="button" className={`${btnInk} mt-6 w-full`} onClick={() => setStep("form")}>
                إتمام الطلب
              </button>
            </>
          )
        ) : null}

        {step === "form" ? (
          <form onSubmit={submit} className="grid gap-4" noValidate>
            <p className="text-sm leading-relaxed text-muted">
              نجهّز رسالة فيها الساعات والعنوان. أرسلها عبر واتساب أو انسخها. الدفع عند الاستلام، ولا يُخصم شيء الآن.
            </p>
            <Field label="الاسم" value={name} onChange={setName} autoComplete="name" />
            <label className="grid gap-1.5 text-sm font-medium">
              المدينة
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-11 border border-line bg-surface px-3 font-normal text-ink"
              >
                {CITIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <Field label="الهاتف" value={phone} onChange={setPhone} autoComplete="tel" inputMode="tel" dir="ltr" />
            <label className="grid gap-1.5 text-sm font-medium">
              ملاحظة
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="مقاس المعصم، أو هدية، أو وقت التوصيل"
                className="border border-line bg-surface px-3 py-2 font-normal text-ink outline-none placeholder:text-muted"
              />
            </label>
            {/* Gift Options Box */}
            <div className="border border-line bg-surface p-3.5 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="size-4 accent-brass"
                />
                <span className="flex items-center gap-1.5">
                  <Gift className="size-4 text-brass" />
                  هل هذا الطلب هدية لشخص عزيز؟ (تغليف دار فلك الفاخر مجاناً)
                </span>
              </label>

              {isGift ? (
                <div className="space-y-3 pt-2 border-t border-line">
                  <Field
                    label="اسم المُهدى إليه"
                    value={giftRecipient}
                    onChange={setGiftRecipient}
                  />
                  <label className="grid gap-1.5 text-xs font-medium">
                    رسالة كرت الإهداء (تُكتب بخط اليد من دار فلك)
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      rows={2}
                      placeholder="اكتب تهنئتك وسنرفقها في كرت شمعي فاخر داخل العلبة..."
                      className="border border-line bg-bg px-3 py-2 text-xs font-normal text-ink outline-none placeholder:text-muted"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            {error ? <p className="text-sm text-brass">{error}</p> : null}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">المجموع</span>
              <span dir="ltr" className="text-lg font-medium">
                {money(total)}
              </span>
            </div>
            <button type="submit" className={`${btnInk} w-full`}>
              جهّز رسالة الطلب
            </button>
            <button type="button" className={btnLine} onClick={() => setStep("bag")}>
              رجوع للحقيبة
            </button>
          </form>
        ) : null}

        {step === "done" && order ? (
          <div>
            <p className="text-sm font-medium text-brass">رقم الطلب</p>
            <p className="mt-1 text-2xl font-medium" dir="ltr">
              {order.id}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              الرسالة محفوظة على هذا الجهاز. أرسلها عبر واتساب ليصلك التأكيد، أو انسخها والصقها في المحادثة.
            </p>
            <pre className="mt-4 overflow-x-auto border border-line bg-surface p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {text}
            </pre>
            <div className="mt-4 grid gap-3">
              <a className={btnInk} href={whatsapp}>
                إرسال عبر واتساب
              </a>
              <button
                type="button"
                className={btnLine}
                onClick={() => {
                  void copyText(text).then(() => setCopied(true));
                }}
              >
                <Copy className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {copied ? "تم النسخ" : "نسخ الطلب"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
  inputMode,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  inputMode?: "tel" | "text";
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        dir={dir}
        className="h-11 border border-line bg-surface px-3 font-normal text-ink outline-none"
      />
    </label>
  );
}
