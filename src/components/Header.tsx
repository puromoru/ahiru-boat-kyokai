import { NavLink, Link } from "react-router-dom";
import { useState } from "react";

// 各ルートに対応する遅延 import とサイドエフェクト prefetch
// ホバーで早期に chunk + アセットを予熱し、クリック時の待ち時間を消す。
const prefetchHome = () => import("../pages/Home");
const prefetchMap = () => {
  void import("../pages/MapPage");
  // MapPage は大きな TopoJSON を読む。fetch でキャッシュに温めておく
  fetch("/japan-topo.json", { cache: "force-cache" }).catch(() => {});
};
const prefetchReviews = () => import("../pages/Reviews");
const prefetchEncyclopedia = () => import("../pages/Encyclopedia");

const navItems: Array<{
  to: string;
  label: string;
  end?: boolean;
  prefetch: () => void;
}> = [
  { to: "/",             label: "ホーム",       end: true, prefetch: prefetchHome },
  { to: "/map",          label: "全国マップ",              prefetch: prefetchMap },
  { to: "/reviews",      label: "レビュー",                prefetch: prefetchReviews },
  { to: "/encyclopedia", label: "図鑑",                    prefetch: prefetchEncyclopedia },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-duck-ink bg-duck-yellow shadow-retroSm">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('/paper-grain.svg')]" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-duck-ink bg-white text-2xl shadow-retroSm">
            🦆
          </span>
          <span className="kanban-title text-xl md:text-2xl text-duck-ink">
            アヒルボート協會
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onMouseEnter={item.prefetch}
              onFocus={item.prefetch}
              onTouchStart={item.prefetch}
              className={({ isActive }) =>
                [
                  "kanban-title px-4 py-2 text-sm transition border-[3px] border-transparent",
                  isActive
                    ? "bg-duck-red text-white border-duck-ink shadow-retroSm"
                    : "text-duck-ink hover:bg-duck-cream hover:border-duck-ink",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="md:hidden border-[3px] border-duck-ink bg-white p-2 text-duck-ink shadow-retroSm"
          aria-label="メニュー"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {open ? (
              <>
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t-[3px] border-duck-ink bg-duck-yellow px-4 pb-3">
          <div className="flex flex-col gap-1 pt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                onTouchStart={item.prefetch}
                className={({ isActive }) =>
                  [
                    "kanban-title px-3 py-2 text-base border-[3px]",
                    isActive
                      ? "bg-duck-red text-white border-duck-ink"
                      : "text-duck-ink border-transparent hover:bg-duck-cream",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
