import { memo, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useReviews, type Review } from "../store/reviews";
import { spots, regions, type Spot } from "../data/spots";
import { ducks, RARITY_ORDER, type Rarity } from "../data/ducks";

const CUSTOM_SPOT = "__custom__";
const UNKNOWN_BOAT = "__unknown__";
const TIMELINE_LIMIT = 4;
const HOUR_MS = 60 * 60 * 1000;

/** レア度バッジ色（フォーム選択プレビュー用） */
const rarityBadgeCls: Record<Rarity, string> = {
  N:   "bg-slate-200 text-slate-700 border border-slate-400",
  R:   "bg-sky-200 text-sky-800 border border-sky-500",
  SR:  "bg-violet-200 text-violet-800 border border-violet-600",
  SSR: "bg-duck-orange text-white border border-duck-ink",
  UR:  "rarity-ur-badge",
};
const rarityBgCls: Record<Rarity, string> = {
  N:   "rarity-n-bg",
  R:   "rarity-r-bg",
  SR:  "rarity-sr-bg",
  SSR: "rarity-ssr-bg",
  UR:  "rarity-ur-bg",
};

/** 図鑑から動的に生成したボート種別の選択肢（レア度降順） */
const boatOptions = [...ducks].sort(
  (a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
);

/** File → dataURL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

/** dataURL → HTMLImageElement */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

/**
 * 画像を Canvas で横幅 maxWidth まで縮小し、JPEG で圧縮した dataURL を返す。
 * 写真の縦横比は維持。元画像が maxWidth 以下なら縮小せず圧縮だけ行う。
 */
async function resizeImageToJpeg(
  file: File,
  maxWidth = 800,
  quality = 0.82
): Promise<string> {
  const srcDataUrl = await fileToDataUrl(file);
  const img = await loadImage(srcDataUrl);
  const scale = Math.min(1, maxWidth / Math.max(1, img.naturalWidth));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return srcDataUrl;

  // 高品質なスケーリングを指示
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // JPEG は透過を扱わないので白背景で塗る
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/** base64 dataURL の（概算）バイトサイズ */
function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return dataUrl.length;
  const b64 = dataUrl.slice(comma + 1);
  // base64 4 文字 ≒ 3 バイト
  return Math.round((b64.length * 3) / 4);
}

/**
 * ヘッダ直下に常時 sticky 表示するクイックナビバー。
 * 絞り込み状況の可視化 + 全スポットピッカーの起動 + 上へ戻る。
 */
function QuickNavBar({
  filteredSpot,
  displayedCount,
  totalCount,
  onOpenPicker,
  onClear,
  onScrollTop,
}: {
  filteredSpot: Spot | null;
  displayedCount: number;
  totalCount: number;
  onOpenPicker: () => void;
  onClear: () => void;
  onScrollTop: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-duck-paper border-y-[3px] border-duck-ink shadow-retroSm mb-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="kanban-title text-[11px] text-duck-ink tracking-widest">
          📜 NAV
        </span>

        {filteredSpot ? (
          <>
            <span className="inline-flex items-center gap-1.5 border-[2.5px] border-duck-red bg-white px-2 py-1 shadow-retroSm">
              <span className="text-duck-red">📍</span>
              <span className="kanban-title text-[12px] text-duck-ink">
                {filteredSpot.name}
              </span>
              <span className="font-mono text-[10px] text-duck-ink/60">
                ({filteredSpot.prefecture})
              </span>
            </span>
            <span className="font-mono text-[11px] bg-white border border-duck-ink px-1.5 py-0.5">
              {displayedCount}件 / 全{totalCount}件
            </span>
          </>
        ) : (
          <>
            <span className="font-mono text-[11px] text-duck-ink/75">
              全 {totalCount} 件の投稿を表示中（{spots.length} スポット対応）
            </span>
          </>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            onClick={onOpenPicker}
            className="kanban-title border-[2.5px] border-duck-ink bg-duck-yellow px-3 py-1 text-[11px] text-duck-ink shadow-retroSm hover:bg-duck-yellowDark transition"
          >
            📍 {filteredSpot ? "別のスポット" : "スポットで絞り込む"}
          </button>
          {filteredSpot && (
            <button
              onClick={onClear}
              className="kanban-title border-[2.5px] border-duck-ink bg-white px-3 py-1 text-[11px] text-duck-ink shadow-retroSm hover:bg-duck-cream transition"
            >
              絞り込み解除
            </button>
          )}
          <button
            onClick={onScrollTop}
            className="kanban-title border-[2.5px] border-duck-ink bg-white px-2 py-1 text-[11px] text-duck-ink shadow-retroSm hover:bg-duck-cream transition"
            title="一番上に戻る"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 全スポットをモーダルで選択するピッカー。
 * 地域別グルーピング・検索・件数バッジ付き。
 */
function SpotPickerModal({
  open,
  onClose,
  onSelect,
  reviewCounts,
  currentSpotId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  reviewCounts: Map<string, number>;
  currentSpotId: string;
}) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const q = query.trim();

  return (
    <div
      className="fixed inset-0 z-[60] bg-duck-ink/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col border-[4px] border-duck-ink bg-[#F5EAD0] shadow-retroLg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダ */}
        <div className="flex items-center gap-3 border-b-[3px] border-duck-ink bg-duck-ink text-duck-yellow px-4 py-3">
          <span className="text-xl" aria-hidden>📜</span>
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-[0.3em] text-duck-yellow/70">
              SPOT PICKER
            </div>
            <h3 className="kanban-title text-sm tracking-widest">
              スポットを選んで絞り込み
            </h3>
          </div>
          <button
            onClick={onClose}
            className="kanban-title border-[2px] border-duck-yellow bg-transparent hover:bg-duck-yellow hover:text-duck-ink px-2 py-0.5 text-xs"
            aria-label="閉じる"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* 検索 */}
        <div className="p-3 border-b-[2px] border-duck-ink bg-duck-paper flex flex-wrap items-center gap-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 スポット名・都道府県で検索"
            className="flex-1 min-w-[180px] border-[2px] border-duck-ink bg-white px-3 py-1.5 text-sm outline-none focus:bg-duck-yellowLight"
          />
          <span className="font-mono text-[10px] text-duck-ink/70">
            全 {spots.length} スポット
          </span>
        </div>

        {/* グリッド */}
        <div className="overflow-auto p-4 flex-1">
          <div className="grid gap-4 md:grid-cols-2">
            {regions.map((r) => {
              const spotsInRegion = spots.filter((s) => s.region === r.id);
              const visibleSpots = q
                ? spotsInRegion.filter(
                    (s) => s.name.includes(q) || s.prefecture.includes(q)
                  )
                : spotsInRegion;
              if (visibleSpots.length === 0) return null;
              return (
                <div key={r.id} className="border-[2px] border-duck-ink bg-white">
                  <div
                    className="kanban-title text-white text-[11px] tracking-widest px-3 py-1.5 flex items-center justify-between"
                    style={{ background: r.color }}
                  >
                    <span>{r.id}</span>
                    <span className="font-mono text-[10px] opacity-90">
                      {visibleSpots.length} / {spotsInRegion.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-duck-ink/10 max-h-64 overflow-auto">
                    {visibleSpots.map((s) => {
                      const c = reviewCounts.get(s.id) ?? 0;
                      const active = s.id === currentSpotId;
                      return (
                        <li key={s.id}>
                          <button
                            onClick={() => onSelect(s.id)}
                            className={`w-full flex items-center justify-between py-2 px-3 text-left transition ${
                              active
                                ? "bg-duck-yellow"
                                : "hover:bg-duck-cream"
                            }`}
                          >
                            <div>
                              <div className="kanban-title text-[13px] text-duck-ink">
                                {active && "✓ "}{s.name}
                              </div>
                              <div className="font-mono text-[10px] text-duck-ink/60">
                                {s.prefecture}
                              </div>
                            </div>
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.5 border whitespace-nowrap ${
                                c > 0
                                  ? "border-duck-red bg-duck-red/10 text-duck-red font-bold"
                                  : "border-duck-ink/30 bg-white text-duck-ink/50"
                              }`}
                            >
                              {c} 件
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          {q && spots.filter(s => s.name.includes(q) || s.prefecture.includes(q)).length === 0 && (
            <div className="text-center text-duck-ink/60 py-8 font-mono text-sm">
              「{q}」に一致するスポットはありません
            </div>
          )}
        </div>

        {/* フッタ */}
        <div className="border-t-[2px] border-duck-ink bg-duck-paper px-4 py-2 flex items-center justify-between font-mono text-[10px] text-duck-ink/70">
          <span>選択するとタイムラインが絞り込まれます</span>
          <span>ESC または外側クリックで閉じる</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 1件分のレビューカード。React.memo で props 不変時の再描画をスキップ。
 * 画像は loading=lazy + decoding=async で描画コストを抑制、
 * cv-auto クラスでオフスクリーン時は描画スキップ（content-visibility: auto）。
 */
const ReviewCard = memo(function ReviewCard({ r }: { r: Review }) {
  return (
    <li className="card cv-auto p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-duck-yellow flex items-center justify-center text-lg border-[2px] border-duck-ink">
          {r.avatar ?? "🦆"}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-slate-900">{r.author}</span>
            <span className="text-slate-500">・{r.createdAt}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-duck-yellowLight px-2 py-0.5 font-bold">
              📍 {r.place}
            </span>
            <span className="rounded-full bg-white ring-1 ring-duck-orange/40 px-2 py-0.5 font-bold text-duck-orangeDark">
              {r.boatType}
            </span>
            <span className="text-duck-orange">
              {"★".repeat(r.rating)}
              <span className="text-slate-300">
                {"★".repeat(5 - r.rating)}
              </span>
            </span>
          </div>
          {r.photoDataUrl && (
            <img
              src={r.photoDataUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="mt-3 max-h-72 rounded-xl object-cover"
            />
          )}
          <p className="mt-3 text-slate-700 leading-relaxed whitespace-pre-wrap">
            {r.comment}
          </p>
        </div>
      </div>
    </li>
  );
});

export default function Reviews() {
  const { reviews, addReview } = useReviews();
  const [searchParams, setSearchParams] = useSearchParams();
  const spotIdFilter = searchParams.get("spotId") ?? "";
  const filteredSpot = useMemo(
    () => (spotIdFilter ? spots.find((s) => s.id === spotIdFilter) ?? null : null),
    [spotIdFilter]
  );

  // スポット選択: 既存スポットID / CUSTOM_SPOT / ""（未選択）
  const [spotValue, setSpotValue] = useState<string>(filteredSpot?.id ?? "");
  const [customPlace, setCustomPlace] = useState("");
  // ボート種別: ducks のID / ""
  const [boatTypeId, setBoatTypeId] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoBusy, setPhotoBusy] = useState(false);
  /** GAS への送信中フラグ。二重送信防止 + ボタン表記切替。 */
  const [submitting, setSubmitting] = useState(false);
  const [photoStats, setPhotoStats] = useState<{
    origKB: number;
    compKB: number;
    width: number;
    height: number;
  } | null>(null);

  // ピッカー状態
  const [pickerOpen, setPickerOpen] = useState(false);

  // 「全部見る」トグル
  const [expandAll, setExpandAll] = useState(false);

  // 1時間おきに再計算するための tick
  const [hourTick, setHourTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setHourTick((t) => t + 1), HOUR_MS);
    return () => window.clearInterval(id);
  }, []);

  // URL の spotId が変わったらフォームにも反映
  useEffect(() => {
    if (filteredSpot) {
      setSpotValue(filteredSpot.id);
      setCustomPlace("");
    }
  }, [filteredSpot]);

  // 選択されたスポット / ボート
  const selectedSpot = useMemo(
    () =>
      spotValue && spotValue !== CUSTOM_SPOT
        ? spots.find((s) => s.id === spotValue) ?? null
        : null,
    [spotValue]
  );
  const selectedDuck = useMemo(
    () => (boatTypeId ? ducks.find((d) => d.id === boatTypeId) ?? null : null),
    [boatTypeId]
  );

  // spot 側変更ハンドラ: 既存スポットを選び直したら自由入力は自動クリア
  const onChangeSpot = (v: string) => {
    setSpotValue(v);
    if (v !== CUSTOM_SPOT) setCustomPlace("");
  };
  const resetSpot = () => {
    setSpotValue("");
    setCustomPlace("");
  };
  const resetBoat = () => setBoatTypeId("");

  // バリデーション
  const spotReady =
    spotValue === CUSTOM_SPOT
      ? customPlace.trim().length > 0
      : spotValue !== "";
  const boatReady = boatTypeId !== "";
  const commentReady = comment.trim().length > 0;
  const canSubmit = spotReady && boatReady && commentReady;

  // ESC キーでピッカーを閉じる
  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(undefined);
      setPhotoStats(null);
      return;
    }
    setPhotoBusy(true);
    try {
      const origKB = file.size / 1024;
      const resized = await resizeImageToJpeg(file, 800, 0.82);
      const compKB = dataUrlBytes(resized) / 1024;
      // 寸法取得
      const img = await loadImage(resized);
      setPhoto(resized);
      setPhotoStats({
        origKB,
        compKB,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    } catch {
      // フォールバック: そのまま data URL で使う
      try {
        const raw = await fileToDataUrl(file);
        setPhoto(raw);
        setPhotoStats(null);
      } catch {
        setPhoto(undefined);
        setPhotoStats(null);
      }
    } finally {
      setPhotoBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    // 場所情報: 既存スポット選択なら name + spotId、自由入力なら text のみ
    let placeText: string;
    let spotId: string | undefined;
    if (spotValue === CUSTOM_SPOT) {
      placeText = customPlace.trim();
      // 自由入力でも既存スポット名と一致すれば拾う
      const fuzzy = spots.find(
        (s) =>
          s.name === placeText ||
          placeText.includes(s.name) ||
          s.name.includes(placeText)
      );
      spotId = fuzzy?.id;
    } else {
      const sp = spots.find((s) => s.id === spotValue)!;
      placeText = sp.name;
      spotId = sp.id;
    }
    const boatName =
      boatTypeId === UNKNOWN_BOAT
        ? "不明"
        : ducks.find((d) => d.id === boatTypeId)!.name;

    try {
      // GAS への POST → スプレッドシート全件の再取得 まで完全に待機
      await addReview({
        place: placeText,
        spotId,
        boatType: boatName,
        rating,
        comment: comment.trim(),
        // Canvas リサイズ済みの軽量な画像 (JPEG / ~800px) がそのまま渡る
        photoDataUrl: photo,
        author: author.trim() || "匿名アヒラー",
      });

      // フォームリセット（URL 絞り込み中はスポット選択を維持）
      if (!filteredSpot) {
        setSpotValue("");
        setCustomPlace("");
      }
      setBoatTypeId("");
      setRating(5);
      setComment("");
      setAuthor("");
      setPhoto(undefined);
      setPhotoStats(null);
    } finally {
      setSubmitting(false);
    }
  };

  const clearSpotFilter = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const selectSpot = useCallback(
    (id: string) => {
      setSearchParams({ spotId: id });
      setPickerOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const reviewCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reviews) {
      let matchId: string | undefined = r.spotId;
      if (!matchId) {
        const matched = spots.find(
          (s) =>
            s.name === r.place ||
            r.place.includes(s.name) ||
            s.name.includes(r.place)
        );
        matchId = matched?.id;
      }
      if (matchId) counts.set(matchId, (counts.get(matchId) ?? 0) + 1);
    }
    return counts;
  }, [reviews]);

  // 現在のフィルタ条件に該当するレビュー全件（ヘッダの総数表示用）
  const matchingReviews = useMemo(() => {
    if (!filteredSpot) return reviews;
    return reviews.filter(
      (r) =>
        r.spotId === filteredSpot.id ||
        r.place === filteredSpot.name ||
        r.place.includes(filteredSpot.name) ||
        filteredSpot.name.includes(r.place)
    );
  }, [reviews, filteredSpot]);

  /**
   * 右パネルに表示するレビュー。
   * ルール: 写真あり優先 → 新しい順、最大 TIMELINE_LIMIT(4) 件。
   * 1時間おきに自動再計算（hourTick を依存に含める）。
   * expandAll が true の時は全件表示。
   */
  const displayedReviews = useMemo(() => {
    const sorted = [...matchingReviews].sort((a, b) => {
      const ap = a.photoDataUrl ? 1 : 0;
      const bp = b.photoDataUrl ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return expandAll ? sorted : sorted.slice(0, TIMELINE_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingReviews, expandAll, hourTick]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="display-title text-4xl md:text-5xl text-duck-ink">
          評判・投稿
        </h1>
        <p className="mt-2 text-duck-ink/75">
          あなたのアヒルボート乗船体験をシェアしましょう。
        </p>
      </header>

      {/* sticky top のナビバー（常時アクセス可能） */}
      <QuickNavBar
        filteredSpot={filteredSpot}
        displayedCount={displayedReviews.length}
        totalCount={reviews.length}
        onOpenPicker={() => setPickerOpen(true)}
        onClear={() => {
          clearSpotFilter();
          scrollTop();
        }}
        onScrollTop={scrollTop}
      />

      {/* マップへの導線（絞り込み中のみ） */}
      {filteredSpot && (
        <div className="mb-6 text-right">
          <Link
            to="/map"
            className="font-mono text-xs text-duck-ink/70 hover:underline"
          >
            ← マップで {filteredSpot.name} を確認する
          </Link>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
        {/* 投稿フォーム */}
        <form
          id="post"
          onSubmit={submit}
          className="card p-6 space-y-5 h-fit lg:sticky lg:top-24"
        >
          <h2 className="kanban-title text-xl text-duck-ink">
            {filteredSpot
              ? `「${filteredSpot.name}」への投稿`
              : "新しい評判を投稿"}
          </h2>

          {/* 場所 */}
          <div>
            <label className="block text-sm font-bold mb-1 flex items-center justify-between">
              <span>場所 <span className="text-duck-red">*</span></span>
              {spotValue && !filteredSpot && (
                <button
                  type="button"
                  onClick={resetSpot}
                  title="場所をリセット"
                  className="text-[11px] font-mono border border-duck-ink/40 bg-white px-1.5 py-0.5 hover:bg-duck-cream"
                >
                  ✕ リセット
                </button>
              )}
            </label>
            <select
              value={spotValue}
              onChange={(e) => onChangeSpot(e.target.value)}
              disabled={!!filteredSpot}
              className="w-full rounded-xl border-2 border-duck-yellow/60 bg-white px-4 py-2 outline-none focus:border-duck-orange disabled:bg-duck-yellowLight disabled:cursor-not-allowed"
              required
            >
              <option value="">── スポットを選択 ──</option>
              {regions.map((r) => (
                <optgroup key={r.id} label={r.id}>
                  {spots
                    .filter((s) => s.region === r.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}（{s.prefecture}）
                      </option>
                    ))}
                </optgroup>
              ))}
              <option value={CUSTOM_SPOT}>＋ 未登録の場所を入力する</option>
            </select>

            {/* 自由入力（選択時のみスライドダウン） */}
            {spotValue === CUSTOM_SPOT && (
              <div className="mt-2 animate-slide-down">
                <input
                  autoFocus
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  placeholder="例: まだ図鑑にない〇〇湖、XX動物園のあのボート…"
                  className="w-full rounded-xl border-2 border-duck-red bg-white px-4 py-2 outline-none focus:bg-duck-yellowLight"
                />
                <div className="mt-1 font-mono text-[10px] text-duck-red">
                  ⚠ 協会査察部で精査後に正式登録されます。
                </div>
              </div>
            )}

            {/* 既存スポット選択プレビュー */}
            {selectedSpot && (
              <div className="mt-2 flex items-center gap-2 border-[2px] border-duck-ink bg-duck-yellowLight px-3 py-2 animate-slide-down">
                <span>📍</span>
                <div className="flex-1">
                  <div className="kanban-title text-sm text-duck-ink">
                    {selectedSpot.name}
                  </div>
                  <div className="font-mono text-[10px] text-duck-ink/70">
                    {selectedSpot.region} ／ {selectedSpot.prefecture}
                  </div>
                </div>
              </div>
            )}

            {!filteredSpot && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-1 text-[11px] text-duck-red hover:underline font-mono"
              >
                📜 スポット一覧から選ぶ（絞り込み連動）
              </button>
            )}
          </div>

          {/* ボートの種類 */}
          <div>
            <label className="block text-sm font-bold mb-1 flex items-center justify-between">
              <span>ボートの種類 <span className="text-duck-red">*</span></span>
              {boatTypeId && (
                <button
                  type="button"
                  onClick={resetBoat}
                  title="ボート選択をリセット"
                  className="text-[11px] font-mono border border-duck-ink/40 bg-white px-1.5 py-0.5 hover:bg-duck-cream"
                >
                  ✕ リセット
                </button>
              )}
            </label>
            <select
              value={boatTypeId}
              onChange={(e) => setBoatTypeId(e.target.value)}
              className="w-full rounded-xl border-2 border-duck-yellow/60 bg-white px-4 py-2 outline-none focus:border-duck-orange"
              required
            >
              <option value="">── ボート種別を選択 ──</option>
              <optgroup label="協会認定個体（図鑑より）">
                {boatOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.emoji} {d.name} ［{d.rarity}］
                  </option>
                ))}
              </optgroup>
              <optgroup label="その他">
                <option value={UNKNOWN_BOAT}>
                  🤷 ボートの種類がわからない
                </option>
              </optgroup>
            </select>

            {/* 「わからない」選択時の専用プレビュー */}
            {boatTypeId === UNKNOWN_BOAT && (
              <div className="mt-2 flex items-center gap-3 border-[2px] border-dashed border-duck-ink bg-[#F5EAD0] px-3 py-2 animate-slide-down">
                <div className="text-3xl">🤷</div>
                <div className="flex-1">
                  <div className="kanban-title text-sm text-duck-ink">
                    種別不明
                  </div>
                  <div className="font-mono text-[10px] text-duck-ink/70">
                    わからなくても大丈夫です
                  </div>
                </div>
              </div>
            )}

            {/* 選択中ボートのプレビュー（レア度背景・色変種フィルタ付き） */}
            {selectedDuck && (
              <div
                className={`mt-2 relative flex items-center gap-3 border-[2px] border-duck-ink overflow-hidden px-3 py-2 animate-slide-down ${rarityBgCls[selectedDuck.rarity]}`}
              >
                <div
                  className="text-3xl relative z-10"
                  style={
                    selectedDuck.emojiFilter
                      ? { filter: selectedDuck.emojiFilter }
                      : undefined
                  }
                >
                  {selectedDuck.emoji}
                </div>
                <div className="flex-1 relative z-10">
                  <div className="kanban-title text-sm text-duck-ink">
                    {selectedDuck.name}
                  </div>
                  <div className="font-mono text-[10px] text-duck-ink/70">
                    {selectedDuck.category} ／ {selectedDuck.spec}
                  </div>
                </div>
                <span
                  className={`kanban-title text-[10px] px-2 py-0.5 rounded-full relative z-10 ${rarityBadgeCls[selectedDuck.rarity]}`}
                >
                  {selectedDuck.rarity}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">評価</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className="text-3xl leading-none transition hover:scale-110"
                  aria-label={`${n}つ星`}
                >
                  <span className={n <= rating ? "text-duck-orange" : "text-slate-300"}>
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-slate-600">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">写真（任意）</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              disabled={photoBusy}
              className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-duck-yellow file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-900 hover:file:bg-duck-yellowDark disabled:opacity-60"
            />
            <div className="mt-1 font-mono text-[10px] text-duck-ink/60 leading-relaxed">
              送信前に Canvas で <b>800px 幅 / JPEG 82%</b> に自動リサイズ・圧縮します。
            </div>
            {photoBusy && (
              <div className="mt-2 font-mono text-xs text-duck-red">
                🔄 画像をリサイズ中...
              </div>
            )}
            {photo && !photoBusy && (
              <div className="mt-3 space-y-1">
                <img
                  src={photo}
                  alt="プレビュー"
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-full object-cover rounded-xl border border-duck-yellow/60"
                />
                {photoStats && (
                  <div className="font-mono text-[10px] text-duck-ink/70 flex flex-wrap gap-2">
                    <span>📐 {photoStats.width}×{photoStats.height}px</span>
                    <span>
                      📦 {photoStats.origKB.toFixed(0)}KB →{" "}
                      <b className="text-duck-red">
                        {photoStats.compKB.toFixed(0)}KB
                      </b>{" "}
                      (
                      {photoStats.origKB > 0
                        ? Math.round(
                            (1 - photoStats.compKB / photoStats.origKB) * 100
                          )
                        : 0}
                      % 削減)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">コメント *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="乗船時の感想、天気、同行したアヒル仲間など…"
              className="w-full rounded-xl border-2 border-duck-yellow/60 bg-white px-4 py-2 outline-none focus:border-duck-orange resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">お名前（任意）</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="匿名アヒラー"
              className="w-full rounded-xl border-2 border-duck-yellow/60 bg-white px-4 py-2 outline-none focus:border-duck-orange"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {submitting
                ? "🔎 査察中..."
                : canSubmit
                ? "🦆 レビューを投稿する"
                : "🔒 必須項目を埋めてください"}
            </button>
            {submitting && (
              <div className="mt-2 font-mono text-[10px] text-duck-red leading-relaxed">
                協会の台帳に書き込んでいます。完了まで暫くお待ちください…
              </div>
            )}
            {!canSubmit && !submitting && (
              <div className="mt-2 font-mono text-[10px] text-duck-ink/70 leading-relaxed space-y-0.5">
                {!spotReady && <div>・場所の選択（または自由入力）が必要です</div>}
                {!boatReady && <div>・ボートの種類を選択してください</div>}
                {!commentReady && <div>・コメントを入力してください</div>}
              </div>
            )}
          </div>
        </form>

        {/* タイムライン */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="kanban-title text-xl text-duck-ink">
              {filteredSpot ? `${filteredSpot.name} の投稿` : "皆の投稿"}
            </h2>
            <span className="text-sm text-slate-500">
              {expandAll
                ? `${matchingReviews.length} 件`
                : `${displayedReviews.length} / 全 ${matchingReviews.length} 件`}
            </span>
          </div>
          <div className="mb-4 font-mono text-[10px] text-duck-ink/60 leading-relaxed">
            {expandAll
              ? "すべての投稿を表示中。"
              : `注目の ${TIMELINE_LIMIT} 件を厳選表示（写真あり優先・新しい順、約1時間ごとに更新）`}
          </div>
          {displayedReviews.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              {filteredSpot
                ? `「${filteredSpot.name}」への投稿はまだありません。左のフォームから最初の一件を！`
                : "まだ投稿がありません。"}
            </div>
          ) : (
            <>
            <ol id="reviews-timeline" className="space-y-4">
              {displayedReviews.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </ol>
            {/* 展開トグル */}
            {matchingReviews.length > TIMELINE_LIMIT && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setExpandAll((v) => !v)}
                  className="kanban-title border-[2.5px] border-duck-ink bg-white px-4 py-2 text-xs text-duck-ink shadow-retroSm hover:bg-duck-yellowLight transition"
                >
                  {expandAll
                    ? `↑ 注目の ${TIMELINE_LIMIT} 件に畳む`
                    : `↓ 残り ${matchingReviews.length - TIMELINE_LIMIT} 件も見る`}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* スポット選択モーダル */}
      <SpotPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={selectSpot}
        reviewCounts={reviewCounts}
        currentSpotId={spotIdFilter}
      />
    </section>
  );
}
