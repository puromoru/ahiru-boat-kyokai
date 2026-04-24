import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import * as amplitude from "@amplitude/analytics-browser";
import Header from "./components/Header";
import Footer from "./components/Footer";

function AnalyticsPageviewTracker() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const path = pathname + search;
    ReactGA.send({ hitType: "pageview", page: path });
    amplitude.track("page_view", { path });
  }, [pathname, search]);
  return null;
}

// ルート単位のコード分割: 初回は Home のみロード、他ページは遷移時にオンデマンド取得
const Home = lazy(() => import("./pages/Home"));
const MapPage = lazy(() => import("./pages/MapPage"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Encyclopedia = lazy(() => import("./pages/Encyclopedia"));
const DuckDetail = lazy(() => import("./pages/DuckDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <div className="text-6xl animate-duck-bob" aria-hidden>🦆</div>
      <p className="mt-4 font-mono text-sm text-duck-ink/70 tracking-widest">
        読み込み中...
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnalyticsPageviewTracker />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/encyclopedia" element={<Encyclopedia />} />
            <Route path="/encyclopedia/:id" element={<DuckDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
