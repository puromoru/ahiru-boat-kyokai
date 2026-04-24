import { memo, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import Supercluster from "supercluster";
import { geoMercator } from "d3-geo";
import {
  spots,
  regions,
  SPOT_INVITATION,
  MAP_CENTER,
  MAP_SCALE,
  type Spot,
  type Region,
} from "../data/spots";
import { useReviews, type Review } from "../store/reviews";

const TOPO_URL = "/japan-topo.json";
const MAP_WIDTH = 800;
const MAP_HEIGHT = 800;
const MIN_ZOOM = 1;
const MAX_ZOOM = 14;

// supercluster の maxZoom。これより高いスーパークラスタ zoom では全て個別表示
const SC_MAX_ZOOM = 12;
const SC_RADIUS = 85; // クラスタ半径(px)。大きいほど積極的にマージ → 画面の余白を確保

/** 投影は設定値のみで決まるのでモジュール定数化（毎レンダー生成しない） */
const BASE_PROJECTION = geoMercator()
  .scale(MAP_SCALE)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
  .center(MAP_CENTER);

type Position = { coordinates: [number, number]; zoom: number };

/** react-simple-maps の zoom ↔ supercluster tile zoom の対応
 *  rsm=1 で sc≒3（広域でアグレッシブに1つにまとまる）、
 *  rsm=14 で sc≒11（最大ズームではクラスタが完全に展開）。
 */
const rsmZoomToScZoom = (rsmZoom: number) =>
  Math.max(0, Math.round(3 + 2 * Math.log2(Math.max(rsmZoom, 1))));
/** rsmZoomToScZoom の逆関数: sc zoom を rsm zoom に戻す */
const scZoomToRsmZoom = (scZoom: number) =>
  Math.pow(2, Math.max(0, scZoom - 3) / 2);

/** 点群のバウンディングボックスから、それらが画面に綺麗に収まる中心・ズームを計算 */
function fitBounds(
  coords: Array<[number, number]>,
  minZoom: number,
  maxZoom: number,
  padding = 0.7
): Position {
  if (coords.length === 0) return { coordinates: MAP_CENTER, zoom: 1 };
  if (coords.length === 1) {
    return { coordinates: coords[0], zoom: Math.min(maxZoom, 8) };
  }
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const tl = BASE_PROJECTION([minLon, maxLat]);
  const br = BASE_PROJECTION([maxLon, minLat]);
  if (!tl || !br) return { coordinates: MAP_CENTER, zoom: 1 };

  const widthPx = Math.max(1, br[0] - tl[0]);
  const heightPx = Math.max(1, br[1] - tl[1]);
  const zoomX = (MAP_WIDTH * padding) / widthPx;
  const zoomY = (MAP_HEIGHT * padding) / heightPx;
  const zoom = Math.max(minZoom, Math.min(maxZoom, Math.min(zoomX, zoomY)));

  return {
    coordinates: [(minLon + maxLon) / 2, (minLat + maxLat) / 2],
    zoom,
  };
}

function CompassRose() {
  return (
    <svg viewBox="0 0 40 40" className="h-14 w-14 md:h-16 md:w-16" aria-hidden>
      <circle cx="20" cy="20" r="18" fill="#F5EAD0" stroke="#2A1F14" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#2A1F14" strokeWidth="0.5" strokeDasharray="1 1" />
      <path d="M 20,4 L 23,20 L 20,36 L 17,20 Z" fill="#B33A2C" stroke="#2A1F14" strokeWidth="0.5" />
      <path d="M 4,20 L 20,17 L 36,20 L 20,23 Z" fill="#2A1F14" opacity="0.85" />
      <text x="20" y="11" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#F5EAD0">N</text>
      <text x="20" y="32" textAnchor="middle" fontSize="3" fontWeight="900" fill="#2A1F14">S</text>
      <text x="8" y="22" textAnchor="middle" fontSize="3" fontWeight="900" fill="#F5EAD0">W</text>
      <text x="33" y="22" textAnchor="middle" fontSize="3" fontWeight="900" fill="#F5EAD0">E</text>
    </svg>
  );
}

type DuckMarkerProps = {
  spot: Spot;
  active: boolean;
  hovered: boolean;
  zoom: number;
  onSelect: (spot: Spot) => void;
  onHover: (key: string | null) => void;
};

const DuckMarker = memo(function DuckMarker({
  spot,
  active,
  hovered,
  zoom,
  onSelect,
  onHover,
}: DuckMarkerProps) {
  const handleClick = useCallback(() => onSelect(spot), [onSelect, spot]);
  const handleEnter = useCallback(
    () => onHover(`pin-${spot.id}`),
    [onHover, spot.id]
  );
  const handleLeave = useCallback(() => onHover(null), [onHover]);
  const cls = `marker-lift${hovered ? " is-hovered" : ""}${active ? " is-active" : ""}`;
  const inv = 1 / zoom; // ZoomableGroup の scale(zoom) を打ち消して常に同じ見た目サイズ
  return (
    <Marker
      coordinates={spot.coordinates}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <g transform={`scale(${inv})`}>
        <g className={cls} style={{ cursor: "pointer" }}>
          {/* 透明ヒット領域: 世界 r=27 → ≒40px 直径 */}
          <circle r="27" fill="transparent" />
          {/* 頭 ≒ 18px 直径 */}
          <circle
            r="9"
            cy="-2"
            fill={active ? "#B33A2C" : "#E3B84A"}
            stroke="#2A1F14"
            strokeWidth="1.6"
          />
          <text
            y="1.5"
            textAnchor="middle"
            fontSize="11"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            🦆
          </text>
        </g>
      </g>
    </Marker>
  );
});

type Placement = "top" | "bottom" | "left" | "right";

/** 海域ラベル（緯度経度で配置されズーム・パンに追従。inverse-scale で常に同サイズ描画） */
const SeaLabel = memo(function SeaLabel({
  coordinates,
  text,
  zoom,
  fontSize,
}: {
  coordinates: [number, number];
  text: string;
  zoom: number;
  fontSize: number;
}) {
  const inv = 1 / zoom;
  return (
    <Marker coordinates={coordinates}>
      <g transform={`scale(${inv})`} style={{ pointerEvents: "none" }}>
        <text
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={700}
          fill="#5A7A86"
          opacity="0.55"
          style={{
            fontFamily: "'Shippori Mincho','Noto Serif JP',serif",
            letterSpacing: "0.35em",
          }}
        >
          {text}
        </text>
      </g>
    </Marker>
  );
});

/** AI要約: レビュー群から「偵察部隊報告」風の短文サマリーを生成 */
function summarizeReviews(reviews: Review[]): {
  count: number;
  avg: number;
  tone: string;
  overallLine: string;
  /** 表示用の上位3件（写真あり優先・新しい順） */
  displayReviews: Review[];
  topBoatTypes: string[];
} | null {
  if (reviews.length === 0) return null;
  const count = reviews.length;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / count;
  const tone =
    avg >= 4.5 ? "絶賛"
      : avg >= 4 ? "高評価"
      : avg >= 3 ? "おおむね好評"
      : avg >= 2 ? "賛否両論"
      : "厳しい評価";

  // 写真あり優先 → そのあと新しい順、最大3件
  const displayReviews = [...reviews]
    .sort((a, b) => {
      const ap = a.photoDataUrl ? 1 : 0;
      const bp = b.photoDataUrl ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 3);

  // 頻出ボート型ランキング (上位2)
  const boatCounts = new Map<string, number>();
  for (const r of reviews) boatCounts.set(r.boatType, (boatCounts.get(r.boatType) ?? 0) + 1);
  const topBoatTypes = [...boatCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k);
  const overallLine =
    `${count}件の投稿を分析。平均 ${avg.toFixed(1)}★ で ${tone} の声が多い。` +
    (topBoatTypes.length > 0
      ? `人気の機種は「${topBoatTypes.join("」「")}」。`
      : "");
  return { count, avg, tone, overallLine, displayReviews, topBoatTypes };
}

const ScoutReport = memo(function ScoutReport({
  reviews,
  spotName,
  spotId,
}: {
  reviews: Review[];
  spotName: string;
  spotId: string;
}) {
  const summary = summarizeReviews(reviews);
  return (
    <div className="relative border-[2.5px] border-duck-ink bg-[#F5EAD0] p-4 shadow-retroSm">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>⚓</span>
        <h3 className="kanban-title text-sm text-duck-ink">偵察部隊からの報告</h3>
        <span className="ml-auto font-mono text-[9px] text-duck-ink/60 border border-duck-ink/40 px-1.5 py-0.5">
          AI要約
        </span>
      </div>

      {!summary ? (
        <p className="mt-3 text-sm leading-relaxed text-duck-ink/85">
          {SPOT_INVITATION}
          <br />
          <span className="text-[11px] text-duck-ink/60">
            （{spotName} についての投稿はまだ届いていません）
          </span>
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] bg-white border border-duck-ink/40 px-1.5 py-0.5">
              {summary.count} 件
            </span>
            <span className="text-duck-orange text-sm leading-none">
              {"★".repeat(Math.round(summary.avg))}
              <span className="text-duck-ink/25">
                {"★".repeat(5 - Math.round(summary.avg))}
              </span>
            </span>
            <span className="font-mono text-[11px] text-duck-ink/80">
              平均 {summary.avg.toFixed(1)}
            </span>
            <span className="kanban-title text-[10px] bg-duck-red text-white px-1.5 py-0.5">
              {summary.tone}
            </span>
          </div>

          <p className="text-[13px] leading-relaxed text-duck-ink">
            {summary.overallLine}
          </p>

          <div className="space-y-2">
            {summary.displayReviews.map((r) => (
              <blockquote
                key={r.id}
                className="border-l-[3px] border-duck-red bg-white/70 pl-2 pr-2 py-1.5 text-[12px] text-duck-ink/85 leading-relaxed"
              >
                {r.photoDataUrl && (
                  <img
                    src={r.photoDataUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="float-right ml-2 h-14 w-14 object-cover border border-duck-ink/40"
                  />
                )}
                <div className="italic">
                  「
                  {r.comment.length > 70
                    ? r.comment.slice(0, 70) + "…"
                    : r.comment}
                  」
                </div>
                <div className="mt-1 font-mono text-[10px] text-duck-ink/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm">{r.avatar ?? "🦆"}</span>
                  <span>— {r.author}（{r.createdAt}）</span>
                  <span className="text-duck-orange leading-none">
                    {"★".repeat(r.rating)}
                  </span>
                  {r.photoDataUrl && (
                    <span className="text-[9px] text-duck-red">📷</span>
                  )}
                </div>
                <div className="clear-both" />
              </blockquote>
            ))}
          </div>

          <Link
            to={`/reviews?spotId=${encodeURIComponent(spotId)}`}
            className="inline-block kanban-title text-[11px] text-duck-red hover:underline"
          >
            この場所の全レビュー（{summary.count}件）を見る ▶
          </Link>
        </div>
      )}
    </div>
  );
});

const SEA_LABELS: Array<{
  id: string;
  text: string;
  coordinates: [number, number];
  fontSize: number;
}> = [
  { id: "pacific",     text: "太平洋",     coordinates: [143.5, 35.5], fontSize: 22 },
  { id: "japan-sea",   text: "日本海",     coordinates: [134.0, 38.5], fontSize: 18 },
  { id: "east-china",  text: "東シナ海",   coordinates: [127.5, 30.5], fontSize: 14 },
  { id: "okhotsk",     text: "オホーツク海", coordinates: [145.0, 45.5], fontSize: 14 },
  { id: "seto",        text: "瀬戸内海",   coordinates: [132.8, 34.2], fontSize: 10 },
];

/** ホバー/選択スポットのラベル — zoom対応 + 方向指定で近接マーカーとの衝突を自動回避 */
const HoverLabel = memo(function HoverLabel({
  spot,
  zoom,
  placement,
}: {
  spot: Spot;
  zoom: number;
  placement: Placement;
}) {
  const inv = 1 / zoom;
  // 画面上の見た目ピクセルは世界単位 × container_scale。ここは世界単位で設計する
  const LABEL_W = 140;
  const LABEL_H = 26;
  const OFF_Y = 28;
  const OFF_X = LABEL_W / 2 + 14;
  let tx = 0;
  let ty = 0;
  switch (placement) {
    case "top":    tx = 0;       ty = -OFF_Y; break;
    case "bottom": tx = 0;       ty = OFF_Y;  break;
    case "left":   tx = -OFF_X;  ty = 0;      break;
    case "right":  tx = OFF_X;   ty = 0;      break;
  }
  return (
    <Marker coordinates={spot.coordinates}>
      <g transform={`scale(${inv})`} style={{ pointerEvents: "none" }}>
        <g transform={`translate(${tx}, ${ty})`}>
          <rect
            x={-LABEL_W / 2}
            y={-LABEL_H / 2}
            width={LABEL_W}
            height={LABEL_H}
            fill="#F5EAD0"
            stroke="#2A1F14"
            strokeWidth="1.8"
          />
          <text
            textAnchor="middle"
            y="5"
            fontSize="13"
            fontWeight="900"
            fill="#2A1F14"
            style={{ fontFamily: "'RocknRoll One','Dela Gothic One',sans-serif" }}
          >
            {spot.name}
          </text>
        </g>
      </g>
    </Marker>
  );
});

type ClusterPinProps = {
  clusterId: number;
  count: number;
  coordinates: [number, number];
  hovered: boolean;
  zoom: number;
  onExpand: (clusterId: number, coordinates: [number, number]) => void;
  onHover: (key: string | null) => void;
};

const ClusterPin = memo(function ClusterPin({
  clusterId,
  count,
  coordinates,
  hovered,
  zoom,
  onExpand,
  onHover,
}: ClusterPinProps) {
  // 見た目: 16-20px 直径に正規化（世界単位 r=10/11/12 ≒ 画面 17-20px 直径）
  const r = count < 10 ? 10 : count < 100 ? 11 : 12;
  const fs = count < 10 ? 12 : count < 100 ? 11 : 10;
  const key = `cluster-${clusterId}`;
  const handleClick = useCallback(
    () => onExpand(clusterId, coordinates),
    [onExpand, clusterId, coordinates]
  );
  const handleEnter = useCallback(() => onHover(key), [onHover, key]);
  const handleLeave = useCallback(() => onHover(null), [onHover]);
  const cls = `marker-lift is-cluster${hovered ? " is-hovered" : ""}`;
  const inv = 1 / zoom;
  return (
    <Marker
      coordinates={coordinates}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <g transform={`scale(${inv})`}>
        <g className={cls} style={{ cursor: "pointer" }}>
          {/* 透明ヒット領域 ≒40px 直径 */}
          <circle r="27" fill="transparent" />
          <circle r={r} fill="#E3B84A" stroke="#2A1F14" strokeWidth="1.8" />
          <text
            textAnchor="middle"
            y={fs / 3}
            fontSize={fs}
            fontWeight="900"
            fill="#2A1F14"
            style={{
              fontFamily: "'Dela Gothic One','RocknRoll One',sans-serif",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {count}
          </text>
        </g>
      </g>
    </Marker>
  );
});

export default function MapPage() {
  const [selected, setSelected] = useState<Spot | null>(spots[0]);
  const { reviews: allReviews } = useReviews();
  const [position, setPosition] = useState<Position>({
    coordinates: MAP_CENTER,
    zoom: 1,
  });
  const [enabled, setEnabled] = useState<Set<Region>>(
    () => new Set(regions.map((r) => r.id))
  );
  /** ホバー中の要素のキー（`pin-<id>` / `cluster-<id>`）。最前面に浮かせるために使用 */
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const spotsByRegion = useMemo(() => {
    const m: Record<Region, Spot[]> = {
      "北海道・東北": [], "関東": [], "中部・北陸": [],
      "近畿": [], "中国・四国": [], "九州・沖縄": [],
    };
    for (const s of spots) m[s.region].push(s);
    return m;
  }, []);

  const visibleSpots = useMemo(
    () => spots.filter((s) => enabled.has(s.region)),
    [enabled]
  );

  /** 選択中スポットに紐づくレビュー（spotId 一致または place が名前と一致） */
  const reviewsForSelected = useMemo(() => {
    if (!selected) return [];
    return allReviews.filter(
      (r) =>
        r.spotId === selected.id ||
        r.place === selected.name ||
        r.place.includes(selected.name) ||
        selected.name.includes(r.place)
    );
  }, [allReviews, selected]);

  // supercluster index（フィルタ変化時に再構築）
  const index = useMemo(() => {
    const sc = new Supercluster<Spot>({
      radius: SC_RADIUS,
      maxZoom: SC_MAX_ZOOM,
      minZoom: 0,
    });
    sc.load(
      visibleSpots.map((spot) => ({
        type: "Feature",
        properties: spot,
        geometry: { type: "Point", coordinates: spot.coordinates },
      }))
    );
    return sc;
  }, [visibleSpots]);

  // 現在の表示範囲を lon/lat bbox で算出（投影は再利用）
  const bbox = useMemo<[number, number, number, number]>(() => {
    const p = BASE_PROJECTION(position.coordinates);
    if (!p) return [-180, -85, 180, 85];
    const [pcx, pcy] = p;
    const halfW = MAP_WIDTH / (2 * position.zoom);
    const halfH = MAP_HEIGHT / (2 * position.zoom);
    const tl = BASE_PROJECTION.invert?.([pcx - halfW, pcy - halfH]);
    const br = BASE_PROJECTION.invert?.([pcx + halfW, pcy + halfH]);
    if (!tl || !br) return [-180, -85, 180, 85];
    return [
      Math.max(-180, tl[0]),
      Math.max(-85, br[1]),
      Math.min(180, br[0]),
      Math.min(85, tl[1]),
    ];
  }, [position]);

  const scZoom = rsmZoomToScZoom(position.zoom);
  const clusterFeatures = useMemo(
    () => index.getClusters(bbox, scZoom),
    [index, bbox, scZoom]
  );

  const clusters = clusterFeatures.filter(
    (f) => (f.properties as { cluster?: boolean }).cluster
  );
  const singles = clusterFeatures.filter(
    (f) => !(f.properties as { cluster?: boolean }).cluster
  );

  /**
   * ラベル表示対象: ホバー優先 → 選択。ただし個別ピンとして描画されているスポットのみ。
   * （クラスタに吸収されているときはラベルを出さない）
   */
  const labelSpot = useMemo<Spot | null>(() => {
    // hover している pin があれば最優先
    if (hoveredKey && hoveredKey.startsWith("pin-")) {
      const id = hoveredKey.slice(4);
      const found = singles.find((p) => (p.properties as Spot).id === id);
      if (found) return found.properties as Spot;
    }
    // hover 無し or hover がクラスタ → 選択スポットを出す
    if (selected) {
      const isSingle = singles.some(
        (p) => (p.properties as Spot).id === selected.id
      );
      if (isSingle) return selected;
    }
    return null;
  }, [hoveredKey, selected, singles]);

  /** 描画順リスト（背面→active→hovered）。レンダー毎のソートを useMemo で回避 */
  type RenderItem =
    | { kind: "cluster"; key: string; lon: number; lat: number; clusterId: number; count: number }
    | { kind: "pin"; key: string; spot: Spot };
  const orderedItems = useMemo<RenderItem[]>(() => {
    const items: RenderItem[] = [
      ...clusters.map((c) => {
        const p = c.properties as { cluster_id: number; point_count: number };
        const [lon, lat] = c.geometry.coordinates as [number, number];
        return {
          kind: "cluster" as const,
          key: `cluster-${p.cluster_id}`,
          lon,
          lat,
          clusterId: p.cluster_id,
          count: p.point_count,
        };
      }),
      ...singles.map((p) => {
        const spot = p.properties as Spot;
        return { kind: "pin" as const, key: `pin-${spot.id}`, spot };
      }),
    ];
    const selId = selected?.id;
    const score = (it: RenderItem) => {
      if (it.key === hoveredKey) return 2;
      if (it.kind === "pin" && it.spot.id === selId) return 1;
      return 0;
    };
    return items.sort((a, b) => score(a) - score(b));
  }, [clusters, singles, hoveredKey, selected?.id]);

  /** ラベルの配置方向 — 近隣マーカーが少ない方向へ自動回避 */
  const labelPlacement = useMemo<Placement>(() => {
    if (!labelSpot) return "top";
    const [sLon, sLat] = labelSpot.coordinates;
    const thresh = 3 / Math.max(position.zoom, 1);
    const count = { top: 0, bottom: 0, left: 0, right: 0 };
    for (const it of orderedItems) {
      const [nLon, nLat] =
        it.kind === "cluster" ? [it.lon, it.lat] : it.spot.coordinates;
      if (it.kind === "pin" && it.spot.id === labelSpot.id) continue;
      const dLon = nLon - sLon;
      const dLat = nLat - sLat;
      if (Math.hypot(dLon, dLat) > thresh) continue;
      if (Math.abs(dLat) > Math.abs(dLon)) {
        if (dLat > 0) count.top++;
        else count.bottom++;
      } else {
        if (dLon > 0) count.right++;
        else count.left++;
      }
    }
    // 最も空いている方向を選択（top 優先でタイブレーク）
    const order: Placement[] = ["top", "bottom", "right", "left"];
    return order.reduce((best, d) =>
      count[d] < count[best] ? d : best
    ) as Placement;
  }, [labelSpot, orderedItems, position.zoom]);

  const toggleRegion = useCallback((id: Region) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const enableAll = useCallback(
    () => setEnabled(new Set(regions.map((r) => r.id))),
    []
  );
  const disableAll = useCallback(() => setEnabled(new Set()), []);

  const handleZoom = useCallback((delta: number) => {
    setPosition((p) => ({
      ...p,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p.zoom + delta)),
    }));
  }, []);
  const handleReset = useCallback(
    () => setPosition({ coordinates: MAP_CENTER, zoom: 1 }),
    []
  );

  const handleSelect = useCallback((s: Spot) => setSelected(s), []);
  const handleHover = useCallback((k: string | null) => setHoveredKey(k), []);

  /**
   * クラスタクリック: getClusterExpansionZoom（クラスタが分解する最小スーパーズーム）と
   * 子ノード bbox の fit を併用し、1発で最適な位置・ズームへ飛ぶ。
   */
  const handleClusterClick = useCallback(
    (clusterId: number, fallback: [number, number]) => {
      try {
        const expansionSc = index.getClusterExpansionZoom(clusterId);
        const leaves = index.getLeaves(clusterId, Infinity);
        const coords = leaves.map(
          (l) => l.geometry.coordinates as [number, number]
        );
        const fit = fitBounds(coords, MIN_ZOOM, MAX_ZOOM, 0.85);
        // expansion zoom を rsm に戻し、fit との大きい方を採用（必ずクラスタが分解する保証）
        const expansionRsm = scZoomToRsmZoom(expansionSc);
        const target = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, Math.max(fit.zoom, expansionRsm))
        );
        setPosition({ coordinates: fit.coordinates, zoom: target });
      } catch {
        setPosition({ coordinates: fallback, zoom: Math.min(MAX_ZOOM, 8) });
      }
    },
    [index]
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="display-title text-4xl md:text-5xl text-duck-ink">
          全國アヒルボート地圖
        </h1>
        <p className="mt-2 text-duck-ink/75">
          全国 {spots.length} スポット。ドラッグ移動／ホイール拡大縮小／クラスタは
          クリックで展開。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
        {/* Map canvas */}
        <div className="card overflow-hidden">
          <div className="relative border-b-[3px] border-duck-ink bg-duck-paper px-4 py-2 flex items-center justify-between">
            <span className="kanban-title text-sm text-duck-ink tracking-widest">
              ◆ 全國アヒルボート地圖 ◆
            </span>
            <span className="font-mono text-[10px] text-duck-ink/70">
              {clusters.length} CLUSTERS / {singles.length} PINS
            </span>
          </div>

          {/* region filter toolbar */}
          <div className="border-b-[3px] border-duck-ink bg-[#F5EAD0] px-3 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="kanban-title text-[11px] text-duck-ink pr-1">
                エリア絞込:
              </span>
              {regions.map((r) => {
                const on = enabled.has(r.id);
                const count = spotsByRegion[r.id].length;
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRegion(r.id)}
                    className={`inline-flex items-center gap-1.5 border-[2px] px-2 py-1 text-[11px] kanban-title transition ${
                      on
                        ? "border-duck-ink bg-white text-duck-ink shadow-retroSm"
                        : "border-duck-ink/30 bg-duck-cream/50 text-duck-ink/40"
                    }`}
                    aria-pressed={on}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full border border-duck-ink"
                      style={{ background: on ? r.color : "transparent" }}
                    />
                    <span>{r.id}</span>
                    <span className="font-mono opacity-70">({count})</span>
                    <span className={on ? "text-duck-red" : "opacity-0"}>✓</span>
                  </button>
                );
              })}
              <div className="ml-auto flex gap-1">
                <button
                  onClick={enableAll}
                  className="border-[2px] border-duck-ink bg-duck-yellow px-2 py-1 text-[10px] kanban-title shadow-retroSm"
                >
                  全表示
                </button>
                <button
                  onClick={disableAll}
                  className="border-[2px] border-duck-ink bg-white px-2 py-1 text-[10px] kanban-title shadow-retroSm"
                >
                  全解除
                </button>
              </div>
            </div>
          </div>

          <div className="relative aspect-square overflow-hidden bg-[#D6E8EF]">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: MAP_SCALE, center: MAP_CENTER }}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <ZoomableGroup
                center={position.coordinates}
                zoom={position.zoom}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                onMoveEnd={(pos) =>
                  setPosition({
                    coordinates: pos.coordinates as [number, number],
                    zoom: pos.zoom,
                  })
                }
              >
                <Geographies geography={TOPO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#F0DFB5"
                        stroke="#8B6F47"
                        strokeWidth={0.7}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#EBD798", outline: "none" },
                          pressed: { fill: "#E3B84A", outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* 海域ラベル（地理座標に紐付け、zoom/pan に追従） */}
                {SEA_LABELS.map((s) => (
                  <SeaLabel
                    key={s.id}
                    coordinates={s.coordinates}
                    text={s.text}
                    fontSize={s.fontSize}
                    zoom={position.zoom}
                  />
                ))}

                {/* 描画順: 背面 → active → hovered */}
                {orderedItems.map((it) =>
                  it.kind === "cluster" ? (
                    <ClusterPin
                      key={it.key}
                      clusterId={it.clusterId}
                      count={it.count}
                      coordinates={[it.lon, it.lat]}
                      hovered={hoveredKey === it.key}
                      zoom={position.zoom}
                      onExpand={handleClusterClick}
                      onHover={handleHover}
                    />
                  ) : (
                    <DuckMarker
                      key={it.key}
                      spot={it.spot}
                      active={selected?.id === it.spot.id}
                      hovered={hoveredKey === it.key}
                      zoom={position.zoom}
                      onSelect={handleSelect}
                      onHover={handleHover}
                    />
                  )
                )}

                {/* ラベル — 絶対最前面（ZoomableGroup 最後の子） */}
                {labelSpot && (
                  <HoverLabel
                    key={`label-${labelSpot.id}`}
                    spot={labelSpot}
                    zoom={position.zoom}
                    placement={labelPlacement}
                  />
                )}
              </ZoomableGroup>
            </ComposableMap>

            {/* 装飾オーバーレイ（ズーム非連動の純粋UI要素のみ） */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-3 top-3 drop-shadow-[2px_2px_0_#2A1F14]">
                <CompassRose />
              </div>
              <div
                className="absolute left-3 bottom-3 h-12 w-12 rotate-[-8deg] flex items-center justify-center border-[2.5px] border-duck-red text-duck-red bg-[#F5EAD0]/85"
                style={{ fontFamily: '"Shippori Mincho","Noto Serif JP",serif' }}
                aria-hidden
              >
                <div className="leading-tight text-center">
                  <div className="text-[9px] font-black tracking-widest">協會</div>
                  <div className="text-[11px] font-black">認定</div>
                </div>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute right-3 bottom-3 flex flex-col gap-1">
              <button
                onClick={() => handleZoom(0.6)}
                className="h-9 w-9 border-[2.5px] border-duck-ink bg-white text-xl font-black text-duck-ink shadow-retroSm hover:bg-duck-yellow"
                aria-label="拡大"
              >
                +
              </button>
              <button
                onClick={() => handleZoom(-0.6)}
                className="h-9 w-9 border-[2.5px] border-duck-ink bg-white text-xl font-black text-duck-ink shadow-retroSm hover:bg-duck-yellow"
                aria-label="縮小"
              >
                −
              </button>
              <button
                onClick={handleReset}
                className="h-9 w-9 border-[2.5px] border-duck-ink bg-white text-[10px] font-black text-duck-ink shadow-retroSm hover:bg-duck-yellow"
                aria-label="リセット"
                title="初期位置に戻す"
              >
                ⌂
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t-[3px] border-duck-ink bg-duck-paper px-4 py-2 text-[11px] font-mono text-duck-ink/80">
            <span className="flex items-center gap-1">🦆 個別スポット</span>
            <span className="flex items-center gap-1">● クラスタ</span>
            <span className="ml-auto">
              ズーム {position.zoom.toFixed(1)}× ／ 表示 {visibleSpots.length} 件
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {selected && (
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border border-duck-ink"
                  style={{
                    background:
                      regions.find((r) => r.id === selected.region)?.color,
                  }}
                />
                <div className="font-mono text-xs text-duck-ink/70">
                  {selected.region} / {selected.prefecture}
                </div>
              </div>
              <h2 className="kanban-title mt-2 text-2xl text-duck-ink">
                {selected.name}
              </h2>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 border-[2.5px] border-duck-ink px-3 py-1 kanban-title text-xs shadow-retroSm ${
                    selected.status === "調査中"
                      ? "bg-duck-yellow text-duck-ink"
                      : "bg-duck-red text-white"
                  }`}
                >
                  {selected.status === "調査中" ? "🔍 調査中" : "📮 情報募集中"}
                </span>
              </div>

              {/* 偵察部隊からの報告 (AI要約) */}
              <div className="mt-4">
                <ScoutReport
                  reviews={reviewsForSelected}
                  spotName={selected.name}
                  spotId={selected.id}
                />
              </div>

              <div className="mt-4 font-mono text-[10px] text-duck-ink/60">
                座標 {selected.coordinates[1].toFixed(3)}°N,{" "}
                {selected.coordinates[0].toFixed(3)}°E
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  to={`/reviews?spotId=${encodeURIComponent(selected.id)}`}
                  className="btn-secondary justify-center text-xs"
                >
                  📖 全レビュー（{reviewsForSelected.length}件）
                </Link>
                <Link
                  to={`/reviews?spotId=${encodeURIComponent(selected.id)}#post`}
                  className="btn-primary justify-center text-xs"
                >
                  ⭐ 投稿する
                </Link>
              </div>
            </div>
          )}

          <div className="card p-4">
            <h3 className="kanban-title text-sm text-duck-ink mb-2">
              スポット一覧 ({visibleSpots.length})
            </h3>
            <div className="max-h-[26rem] overflow-auto">
              {regions
                .filter((r) => enabled.has(r.id))
                .map((r) => (
                  <div key={r.id} className="mb-3">
                    <div
                      className="kanban-title sticky top-0 z-10 -mx-1 mb-1 px-2 py-1 text-[11px] text-white"
                      style={{ background: r.color }}
                    >
                      {r.id} ({spotsByRegion[r.id].length})
                    </div>
                    <ul className="divide-y-[2px] divide-duck-ink/10">
                      {spotsByRegion[r.id].map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => {
                              setSelected(s);
                              setPosition({
                                coordinates: s.coordinates,
                                zoom: Math.max(position.zoom, 6),
                              });
                            }}
                            className={`w-full flex items-center justify-between py-1.5 px-2 text-left transition border-[2px] border-transparent ${
                              selected?.id === s.id
                                ? "bg-duck-yellow border-duck-ink"
                                : "hover:bg-duck-cream"
                            }`}
                          >
                            <div>
                              <div className="kanban-title text-[12px] text-duck-ink">
                                {s.name}
                              </div>
                              <div className="font-mono text-[10px] text-duck-ink/60">
                                {s.prefecture}
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 border whitespace-nowrap ${
                                s.status === "調査中"
                                  ? "border-duck-ink text-duck-ink bg-duck-yellowLight"
                                  : "border-duck-red text-duck-red bg-white"
                              }`}
                            >
                              {s.status}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              {enabled.size === 0 && (
                <div className="py-6 text-center text-[11px] text-duck-ink/60 font-mono">
                  表示するエリアがありません。上のフィルタで追加してください。
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-duck-ink/70 font-mono leading-relaxed px-2">
            ※ 協会会長の実地調査はこれから。正確性を期すため、稼働状況・料金・営業時間等は非公開です。
          </p>
        </div>
      </div>
    </section>
  );
}
