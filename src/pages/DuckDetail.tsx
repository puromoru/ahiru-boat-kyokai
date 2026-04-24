import { memo } from "react";
import { useParams, Link } from "react-router-dom";
import { ducks, type Rarity } from "../data/ducks";

const rarityBadge: Record<Rarity, string> = {
  N:   "bg-slate-200 text-slate-700 border border-slate-400",
  R:   "bg-sky-200 text-sky-800 border border-sky-500",
  SR:  "bg-violet-200 text-violet-800 border border-violet-600",
  SSR: "bg-duck-orange text-white border border-duck-ink",
  UR:  "rarity-ur-badge",
};

const rarityBg: Record<Rarity, string> = {
  N:   "rarity-n-bg",
  R:   "rarity-r-bg",
  SR:  "rarity-sr-bg",
  SSR: "rarity-ssr-bg",
  UR:  "rarity-ur-bg",
};

const powerBadge: Record<string, string> = {
  "人力": "⚙ 人力",
  "内燃機関": "🔥 内燃機関",
  "電気動力": "⚡ 電気動力",
};

const SsrParticles = memo(function SsrParticles() {
  const marks = ["✦", "✧", "★", "✦", "✧", "★", "✦", "✧"];
  return (
    <>
      {marks.map((c, i) => (
        <span
          key={i}
          className="rarity-ssr-particle"
          style={{
            left: `${5 + i * 12}%`,
            animationDelay: `${(i * 0.45) % 4}s`,
            fontSize: `${16 + (i % 3) * 4}px`,
          }}
        >
          {c}
        </span>
      ))}
    </>
  );
});

const StatBar = memo(function StatBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{value} / 5</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-duck-yellow to-duck-orange"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
});

export default function DuckDetail() {
  const { id } = useParams<{ id: string }>();
  const duck = ducks.find((d) => d.id === id);

  if (!duck) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="text-5xl">🦆❓</div>
        <h1 className="display-title mt-4 text-3xl text-duck-ink">
          該当する個体が見つかりません
        </h1>
        <Link to="/encyclopedia" className="btn-primary mt-6">
          図鑑へ戻る
        </Link>
      </section>
    );
  }

  // ── 未発見個体: ミステリー表示 ──
  if (!duck.found) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10">
        <Link
          to="/encyclopedia"
          className="text-sm font-bold text-duck-orangeDark hover:underline"
        >
          ← 図鑑へ戻る
        </Link>

        <div className="mt-4 grid gap-8 md:grid-cols-[1fr,1.2fr]">
          <div className="card overflow-hidden">
            <div className="relative aspect-square flex items-center justify-center overflow-hidden unfound-bg">
              <div className="absolute inset-0 unfound-stripe pointer-events-none" />
              <div className="relative z-10 text-[10rem] silhouette drop-shadow-xl">
                {duck.emoji}
              </div>
              <span
                className={`absolute top-3 right-3 text-xs font-black px-2 py-1 rounded-full ${rarityBadge[duck.rarity]}`}
              >
                {duck.rarity}
              </span>
              <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-duck-red text-white px-2 py-0.5 rounded-full">
                未確認個体
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-sm font-black text-slate-700 mb-3">能力値</h3>
              <div className="space-y-3">
                <StatBar label="かわいさ" value={0} />
                <StatBar label="スピード" value={0} />
                <StatBar label="安定感" value={0} />
              </div>
              <p className="mt-3 font-mono text-[10px] text-duck-ink/50">
                ※ 査察未実施のためデータ未公開
              </p>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-duck-ink/10 px-3 py-1 text-xs font-bold text-duck-ink/60 tracking-widest">
                分類未確定
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-black ${rarityBadge[duck.rarity]}`}
              >
                [{duck.rarity}]
              </span>
            </div>
            <h1 className="display-title mt-3 text-5xl md:text-6xl text-duck-ink/50 tracking-[0.3em]">
              ？？？
            </h1>

            <div className="mt-8 border-[3px] border-duck-red bg-[#F5EAD0] p-5 shadow-retroSm">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>📮</span>
                <h2 className="kanban-title text-sm text-duck-red tracking-widest">
                  目撃情報求む
                </h2>
              </div>
              <p className="mt-3 text-duck-ink leading-relaxed">
                {duck.hint ?? "協会は引き続き情報を募集しています。"}
              </p>
            </div>

            <p className="mt-6 font-mono text-xs text-duck-ink/70 leading-relaxed">
              本個体は協会査察部による正式な確認が取れていません。ご存知の方は
              図鑑下部の「新種・未発見個体の報告」フォームよりご一報ください。
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/encyclopedia" className="btn-primary">
                📬 目撃情報を報告する
              </Link>
              <Link to="/map" className="btn-secondary">
                🗺️ マップで探す
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── 発見済みの通常表示 ──
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <Link
        to="/encyclopedia"
        className="text-sm font-bold text-duck-orangeDark hover:underline"
      >
        ← 図鑑へ戻る
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[1fr,1.2fr]">
        <div className="card overflow-hidden">
          <div
            className={`relative aspect-square flex items-center justify-center overflow-hidden ${rarityBg[duck.rarity]}`}
          >
            {duck.rarity === "SSR" && <SsrParticles />}
            <div
              className="relative z-10 text-[10rem] drop-shadow-xl"
              style={duck.emojiFilter ? { filter: duck.emojiFilter } : undefined}
            >
              {duck.emoji}
            </div>
            <span
              className={`absolute top-3 right-3 text-xs font-black px-2 py-1 rounded-full ${rarityBadge[duck.rarity]}`}
            >
              {duck.rarity}
            </span>
          </div>
          <div className="p-5">
            <h3 className="text-sm font-black text-slate-700 mb-3">能力値</h3>
            <div className="space-y-3">
              <StatBar label="かわいさ" value={duck.stats.cuteness} />
              <StatBar label="スピード" value={duck.stats.speed} />
              <StatBar label="安定感" value={duck.stats.stability} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-duck-yellowLight px-3 py-1 text-xs font-bold text-slate-800">
              {duck.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border-[2px] border-duck-ink bg-white px-3 py-0.5 text-xs font-bold text-duck-ink">
              {powerBadge[duck.power]}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-black ${rarityBadge[duck.rarity]}`}
            >
              [{duck.rarity}]
            </span>
          </div>
          <h1 className="display-title mt-3 text-4xl md:text-5xl text-duck-ink">
            {duck.name}
          </h1>
          <div className="mt-1 font-mono text-xs text-duck-ink/70">
            SPEC: {duck.spec}
          </div>
          <p className="mt-3 text-lg font-bold text-duck-orangeDark">
            {duck.tagline}
          </p>

          <p className="mt-6 text-slate-700 leading-relaxed">
            {duck.description}
          </p>

          <h2 className="mt-8 text-sm font-black text-slate-700">主な生息地</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {duck.habitat.map((h) => (
              <li
                key={h}
                className="rounded-full bg-white ring-1 ring-duck-orange/40 px-3 py-1 text-sm font-bold text-slate-700"
              >
                📍 {h}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/map" className="btn-primary">
              🗺️ マップで見る
            </Link>
            <Link to="/reviews" className="btn-secondary">
              ⭐ この個体のレビュー
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
