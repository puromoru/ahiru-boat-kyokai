import { Link } from "react-router-dom";

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const linkCls =
  "text-duck-cream/90 hover:text-duck-yellow hover:underline transition";

export default function Footer() {
  return (
    <footer className="mt-16 relative bg-duck-ink text-duck-cream border-t-[3px] border-duck-ink">
      <div className="absolute inset-0 bg-[url('/paper-grain.svg')] opacity-30 mix-blend-screen pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        {/* ロゴ + 概要 */}
        <div>
          <Link to="/" onClick={scrollTop} className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-duck-cream bg-duck-yellow text-2xl">
              🦆
            </span>
            <span className="display-title text-xl text-duck-yellow">
              アヒルボート協會
            </span>
          </Link>
          <p className="mt-3 text-sm text-duck-cream/80 leading-relaxed">
            全国のアヒルボートを守り、愛し、そして乗る。
          </p>
        </div>

        {/* 案内 */}
        <div className="text-sm">
          <h3 className="kanban-title text-duck-yellow tracking-widest">案内</h3>
          <ul className="mt-3 space-y-1.5">
            <li><Link to="/" onClick={scrollTop} className={linkCls}>ホーム</Link></li>
            <li><Link to="/map" onClick={scrollTop} className={linkCls}>全国マップ</Link></li>
            <li><Link to="/reviews" onClick={scrollTop} className={linkCls}>レビュー</Link></li>
            <li><Link to="/encyclopedia" onClick={scrollTop} className={linkCls}>図鑑</Link></li>
          </ul>
        </div>

        {/* 連絡 */}
        <div className="text-sm">
          <h3 className="kanban-title text-duck-yellow tracking-widest">連絡</h3>
          <p className="mt-3">
            <a href="mailto:ahiruboat.kyokai@gmail.com" className={linkCls}>
              ahiruboat.kyokai@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div className="relative border-t border-duck-cream/20 py-4 text-center text-xs text-duck-cream/60 font-mono tracking-widest">
        © 2026 アヒルボート協會 — ALL QUACKS RESERVED
      </div>
    </footer>
  );
}
