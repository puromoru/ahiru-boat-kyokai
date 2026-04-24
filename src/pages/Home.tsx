import { useMemo } from "react";
import { Link } from "react-router-dom";
import { spots } from "../data/spots";
import { ducks } from "../data/ducks";
import { news } from "../data/news";
import { chairman } from "../data/chairman";
import { useReviews } from "../store/reviews";

const features = [
  {
    to: "/map",
    emoji: "🗺️",
    title: "全国マップ",
    desc: "全国のアヒルボートスポットをひと目で。お気に入りの池を探そう。",
    bg: "bg-duck-red",
    fg: "text-white",
  },
  {
    to: "/reviews",
    emoji: "⭐",
    title: "レビュー投稿",
    desc: "あなたの乗船体験を5段階評価と写真でシェア。仲間のレビューもチェック。",
    bg: "bg-duck-yellow",
    fg: "text-duck-ink",
  },
  {
    to: "/encyclopedia",
    emoji: "📖",
    title: "アヒルボート図鑑",
    desc: "標準型から王冠付き、黒いあの子まで。全国の個性派ボートを収録。",
    bg: "bg-duck-teal",
    fg: "text-white",
  },
];

export default function Home() {
  const { reviews } = useReviews();
  // 投稿件数は reviews.length に応じて更新、他は定数。再計算を抑える。
  const reviewCount = reviews.length;
  const stats = useMemo(
    () => [
      { n: spots.length.toLocaleString(), l: "登録スポット" },
      { n: ducks.length.toLocaleString(), l: "図鑑収録種" },
      { n: reviewCount.toLocaleString(), l: "投稿レビュー" },
      { n: "1", l: "協會（非公式）" },
    ],
    [reviewCount]
  );

  return (
    <>
      {/* Hero — retro tourism poster */}
      <section className="relative overflow-hidden border-b-[3px] border-duck-ink">
        <div className="absolute inset-0 bg-duck-yellow" />
        <div className="absolute inset-0 halftone opacity-[0.14]" />
        <div className="absolute inset-0 bg-[url('/paper-grain.svg')] opacity-60 mix-blend-multiply" />
        {/* diagonal sunburst stripes */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] opacity-20"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, #2A1F14 0deg 6deg, transparent 6deg 14deg)",
            borderRadius: "9999px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border-[3px] border-duck-ink bg-white px-3 py-1 shadow-retroSm kanban-title text-xs text-duck-ink">
              <span>EST.</span>
              <span className="text-duck-red">昭和101年</span>
              <span>／非公式組織</span>
            </div>
            <h1 className="display-title mt-5 text-5xl md:text-7xl leading-[0.95] text-duck-ink">
              アヒル
              <br />
              ボート
              <br />
              <span className="text-duck-red">協會</span>
            </h1>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-[6px] w-14 bg-duck-ink" />
              <span className="h-[6px] w-3 bg-duck-ink" />
              <span className="h-[6px] w-1 bg-duck-ink" />
            </div>
            <p className="kanban-title mt-5 text-xl md:text-2xl text-duck-ink">
              全国のアヒルボートを<span className="text-duck-red">守り、愛し、</span>
              そして乗る。
            </p>
            <p className="mt-4 max-w-xl text-[15px] text-duck-ink/80 leading-relaxed">
              当協會は2026年に設立された、アヒルボートの普及と保護を目的とする
              極めて重要な非公式組織です。日本全国の池・湖・堀にひっそりと浮かぶ
              彼らの魅力を、もっと多くの人へ。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/map" className="btn-primary">
                🗺️ 全國マップを見る
              </Link>
              <Link to="/encyclopedia" className="btn-secondary">
                📖 アヒルボート圖鑑
              </Link>
            </div>
          </div>

          {/* Hero illustration (animated duck) */}
          <div className="relative flex justify-center">
            {/* corner stamp */}
            <div className="absolute -top-2 -right-2 md:top-0 md:-right-2 z-10 h-24 w-24 rotate-[10deg]">
              <div className="flex h-full w-full items-center justify-center border-[4px] border-duck-red text-duck-red bg-[#F5EAD0]/80"
                style={{ fontFamily: '"Shippori Mincho","Noto Serif JP",serif' }}>
                <div className="leading-tight text-center">
                  <div className="text-[11px] font-black tracking-widest">名物</div>
                  <div className="text-[18px] font-black">アヒル</div>
                  <div className="text-[11px] font-black tracking-widest">乗船</div>
                </div>
              </div>
            </div>

            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute top-6 left-2 text-5xl animate-sun-spin origin-center opacity-80">
                ☀️
              </div>
              <div className="absolute -top-2 right-24 text-4xl animate-sparkle opacity-90">✦</div>
              <div
                className="absolute top-16 right-10 text-2xl animate-sparkle opacity-90"
                style={{ animationDelay: "0.5s" }}
              >
                ✦
              </div>

              {/* water surface (muted teal) */}
              <div className="absolute inset-x-0 bottom-0 h-28 rounded-[50%] bg-duck-teal/50 blur-sm" />
              <div className="absolute inset-x-6 bottom-4 h-24 rounded-[50%] bg-duck-teal/70" />

              {/* ripples */}
              <div className="pointer-events-none absolute left-1/2 bottom-10 h-6 w-40 -translate-x-1/2 rounded-[50%] border-[3px] border-duck-ink/50 animate-ripple-slow" />
              <div className="pointer-events-none absolute left-1/2 bottom-10 h-6 w-40 -translate-x-1/2 rounded-[50%] border-[3px] border-duck-ink/40 animate-ripple-fast" />

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-duck-bob">
                <div className="relative animate-duck-float">
                  <span className="text-[12rem] md:text-[16rem] select-none leading-none drop-shadow-[4px_4px_0_#2A1F14]">
                    🦆
                  </span>
                  <span
                    className="absolute top-1/2 left-1/4 text-5xl md:text-6xl origin-bottom animate-wing-flap select-none"
                    aria-hidden
                  >
                    🪽
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom double rule */}
        <div className="relative border-t-[3px] border-duck-ink">
          <div className="h-1 bg-duck-ink" />
          <div className="h-[6px] bg-duck-cream" />
          <div className="h-[3px] bg-duck-ink" />
        </div>
      </section>

      {/* Feature cards */}
      <section className="cv-auto mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <div className="inline-block border-[3px] border-duck-ink bg-white px-4 py-1 shadow-retroSm kanban-title text-xs text-duck-ink">
            協會の主な活動
          </div>
          <h2 className="display-title mt-4 text-4xl md:text-5xl text-duck-ink">
            地圖・評判・圖鑑
          </h2>
          <p className="mt-3 text-sm text-duck-ink/75">
            ── アヒルボートライフをもっと豊かに ──
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group card p-0 overflow-hidden hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-retroLg transition"
            >
              <div className={`relative h-32 border-b-[3px] border-duck-ink ${f.bg} ${f.fg} flex items-center justify-center`}>
                <div className="absolute inset-0 halftone opacity-[0.18]" />
                <div className="relative text-6xl drop-shadow-[3px_3px_0_rgba(42,31,20,0.6)]">
                  {f.emoji}
                </div>
              </div>
              <div className="p-5">
                <h3 className="kanban-title text-xl text-duck-ink">{f.title}</h3>
                <p className="mt-2 text-sm text-duck-ink/80 leading-relaxed">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 kanban-title text-sm text-duck-red group-hover:gap-2 transition-all">
                  くわしく見る ▶
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Chairman's message */}
      <section className="cv-auto mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden border-[3px] border-duck-ink shadow-retro bg-[#F5EAD0]">
          <div className="absolute inset-0 bg-[url('/paper-grain.svg')] opacity-70 mix-blend-multiply pointer-events-none" />
          <div className="relative grid gap-8 md:gap-10 md:grid-cols-[280px,1fr] p-6 md:p-10 items-start">
            <figure className="mx-auto md:mx-0">
              <div className="relative w-56 h-72 md:w-64 md:h-80">
                <div className="absolute inset-0 translate-x-[8px] translate-y-[8px] bg-duck-ink" />
                <div className="relative h-full w-full overflow-hidden border-[3px] border-duck-ink bg-duck-yellowLight">
                  <img
                    src={chairman.photo}
                    alt={`${chairman.title} ${chairman.name}`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.src.endsWith("/chairman-placeholder.svg")) {
                        img.src = "/chairman-placeholder.svg";
                      }
                    }}
                    className="h-full w-full object-cover grayscale-[0.15] contrast-[0.95] sepia-[0.15]"
                  />
                </div>
              </div>
              <figcaption className="mt-4 text-center font-mincho text-sm text-duck-ink/80">
                {chairman.title}
              </figcaption>
            </figure>

            <div className="font-mincho text-duck-ink">
              <div className="flex items-center gap-3">
                <span className="h-[3px] flex-1 bg-duck-ink" />
                <h2 className="text-2xl md:text-3xl font-black tracking-[0.35em] text-duck-ink">
                  會長からのメッセージ
                </h2>
                <span className="h-[3px] flex-1 bg-duck-ink" />
              </div>

              <p className="mt-8 text-lg md:text-xl font-bold leading-relaxed">
                {chairman.greeting}
              </p>

              <div className="mt-4 space-y-4 text-[15px] md:text-base leading-[2] tracking-wide text-duck-ink/90">
                {chairman.paragraphs.map((p, i) => (
                  <p key={i} className="indent-[1em]">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-10 flex items-end justify-end gap-4">
                <div className="text-right">
                  <div className="text-sm text-duck-ink/70 font-bold tracking-widest">
                    {chairman.title}
                  </div>
                  <div className="mt-1 text-3xl md:text-4xl font-black tracking-[0.2em]">
                    {chairman.name}
                  </div>
                </div>
                <div
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center border-[3px] border-duck-red text-duck-red font-black rotate-[8deg] bg-[#F5EAD0]"
                  aria-hidden
                  style={{ fontFamily: '"Shippori Mincho","Noto Serif JP",serif' }}
                >
                  <div className="leading-none text-center">
                    <div className="text-[13px]">會長</div>
                    <div className="text-[13px] mt-0.5">之印</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="cv-auto mx-auto max-w-6xl px-4 pb-16">
        <div className="card grid grid-cols-2 md:grid-cols-4 overflow-hidden">
          {stats.map((s, i) => (
            <div
              key={s.l}
              className={`p-6 text-center ${
                i < stats.length - 1 ? "md:border-r-[3px] border-duck-ink" : ""
              } ${i < stats.length / 2 ? "border-b-[3px] md:border-b-0 border-duck-ink" : ""}`}
            >
              <div className="display-title text-4xl md:text-5xl text-duck-red tabular-nums">
                {s.n}
              </div>
              <div className="kanban-title text-xs mt-2 text-duck-ink">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Announcement */}
      <section className="cv-auto relative border-y-[3px] border-duck-ink bg-duck-ink text-duck-cream">
        <div className="absolute inset-0 bg-[url('/paper-grain.svg')] opacity-30 mix-blend-screen pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center border-[3px] border-duck-cream bg-duck-red text-2xl">
              📣
            </span>
            <div>
              <div className="kanban-title text-xs tracking-[0.3em] text-duck-yellow">
                IMPORTANT NOTICE
              </div>
              <h2 className="display-title text-3xl md:text-4xl text-duck-cream">
                協會からの重要なお知らせ
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {news.map((n) => (
              <article
                key={n.title}
                className="relative border-[3px] border-duck-cream bg-[#F5EAD0] p-5 text-duck-ink shadow-[6px_6px_0_0_#B33A2C]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-duck-ink/70">{n.date}</span>
                  <span className="kanban-title bg-duck-red text-white text-[11px] px-2 py-0.5">
                    {n.tag}
                  </span>
                </div>
                <h3 className="kanban-title mt-3 text-lg leading-snug text-duck-ink">
                  {n.title}
                </h3>
                <p className="mt-2 text-sm text-duck-ink/85 leading-relaxed">{n.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
