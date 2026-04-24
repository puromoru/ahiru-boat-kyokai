import { memo, useState, useMemo, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ducks, RARITY_ORDER, type Duck, type Rarity } from "../data/ducks";

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

const powerIcon: Record<string, string> = {
  "人力": "⚙",
  "内燃機関": "🔥",
  "電気動力": "⚡",
};

// =========================================================================
// 📮 Google Apps Script (GAS) Web App の URL をここに貼り付けてください
// デプロイ手順: スプレッドシート → 拡張機能 → Apps Script → コード貼付 → デプロイ
// （`.env.local` に VITE_GAS_WEB_APP_URL を書けば上書きされます）
// =========================================================================
const GAS_WEB_APP_URL =
  (import.meta.env.VITE_GAS_WEB_APP_URL as string | undefined) ??
  "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYED_URL_HERE/exec";

/** File を base64 文字列（data URL プレフィックスなし）に変換 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SsrParticles = memo(function SsrParticles() {
  const marks = ["✦", "✧", "★", "✦", "✧", "★", "✦"];
  return (
    <>
      {marks.map((c, i) => (
        <span
          key={i}
          className="rarity-ssr-particle"
          style={{
            left: `${8 + i * 13}%`,
            animationDelay: `${(i * 0.55) % 4}s`,
            fontSize: `${12 + (i % 3) * 3}px`,
          }}
        >
          {c}
        </span>
      ))}
    </>
  );
});

/** 1個体のカード。props不変なら再描画しない。cv-auto でオフスクリーン描画スキップ */
const DuckCard = memo(function DuckCard({ d }: { d: Duck }) {
  return (
    <Link
      to={`/encyclopedia/${d.id}`}
      className="card cv-auto p-5 group hover:-translate-y-1 hover:shadow-duck transition"
    >
      <div
        className={`relative h-36 rounded-2xl overflow-hidden flex items-center justify-center ${rarityBg[d.rarity]}`}
      >
        {d.rarity === "SSR" && <SsrParticles />}
        <div
          className="relative z-10 text-6xl"
          style={d.emojiFilter ? { filter: d.emojiFilter } : undefined}
        >
          {d.emoji}
        </div>
        <span
          className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${rarityBadge[d.rarity]}`}
        >
          {d.rarity}
        </span>
        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-white/85 text-slate-700 px-2 py-0.5 rounded-full">
          {d.category}
        </span>
        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-duck-ink/80 text-duck-yellow px-2 py-0.5 rounded-full">
          {powerIcon[d.power]} {d.power}
        </span>
      </div>
      <h3 className="kanban-title mt-4 text-lg text-duck-ink">{d.name}</h3>
      <div className="font-mono text-[10px] text-duck-ink/60 mt-0.5">
        {d.spec}
      </div>
      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{d.tagline}</p>
      <span className="mt-3 inline-flex text-sm font-bold text-duck-orangeDark group-hover:underline">
        詳細を見る →
      </span>
    </Link>
  );
});

export default function Encyclopedia() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("すべて");
  const [rarity, setRarity] = useState<"すべて" | Rarity>("すべて");

  // 報告フォームの状態
  const [submitting, setSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(ducks.map((d) => d.category));
    return ["すべて", ...set];
  }, []);

  const foundCount = ducks.filter((d) => d.found).length;

  // 絞り込み条件を共通関数化して、発見済み / 未確認 それぞれに適用
  const { foundFiltered, unfoundFiltered } = useMemo(() => {
    const q = query.trim();
    const bySort = (a: (typeof ducks)[number], b: (typeof ducks)[number]) =>
      RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
    const match = (d: (typeof ducks)[number]) => {
      const hitQ =
        !q ||
        (d.found
          ? d.name.includes(q) ||
            d.tagline.includes(q) ||
            d.description.includes(q) ||
            d.spec.includes(q)
          : (d.hint ?? "").includes(q));
      const hitC = category === "すべて" || d.category === category;
      const hitR = rarity === "すべて" || d.rarity === rarity;
      return hitQ && hitC && hitR;
    };
    return {
      foundFiltered:   ducks.filter((d) => d.found && match(d)).sort(bySort),
      unfoundFiltered: ducks.filter((d) => !d.found && match(d)).sort(bySort),
    };
  }, [query, category, rarity]);

  const [receiptId, setReceiptId] = useState<string>("");

  const submitReport = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("PASTE_YOUR_DEPLOYED_URL_HERE")) {
      setSubmitError(
        "送信先 URL が未設定です。図鑑ページのコード冒頭 `GAS_WEB_APP_URL` を確認してください。"
      );
      return;
    }
    const form = e.currentTarget;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData(form);
      // JSON ペイロードを組み立て
      const payload: Record<string, string> = {
        submittedAt: new Date().toISOString(),
      };
      for (const [key, value] of fd.entries()) {
        if (key === "photo" || key === "_gotcha") continue;
        if (typeof value === "string") payload[key] = value;
      }
      const photoFile = fd.get("photo") as File | null;
      if (photoFile && photoFile.size > 0) {
        payload.photoBase64 = await fileToBase64(photoFile);
        payload.photoName = photoFile.name;
        payload.photoType = photoFile.type || "image/jpeg";
      }

      // text/plain を使うと CORS プリフライトを回避できる（GAS で標準的な回避策）
      const res = await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      const result = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        receiptId?: string;
        error?: string;
      };
      if (res.ok && result.ok !== false) {
        form.reset();
        setReceiptId(
          result.receiptId ?? "#" + Date.now().toString(36).toUpperCase()
        );
        setShowThanks(true);
      } else {
        setSubmitError(
          result.error ?? "送信に失敗しました。時間を置いて再送してください。"
        );
      }
    } catch {
      setSubmitError("通信エラー。ネットワークを確認のうえ再送してください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="display-title text-4xl md:text-5xl text-duck-ink">
          アヒルボート圖鑑
        </h1>
        <p className="mt-2 text-duck-ink/75">
          協会認定 全{ducks.length}種（発見済 {foundCount} / 未発見{" "}
          {ducks.length - foundCount}）。クリックで詳細ページへ。
        </p>
      </header>

      <div className="card p-4 space-y-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            placeholder="🔍 名前・特徴・スペックで検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[180px] rounded-full border-2 border-duck-yellow/60 bg-white px-4 py-2 outline-none focus:border-duck-orange"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="kanban-title text-[11px] text-duck-ink mr-1 self-center">
            系統:
          </span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                category === c
                  ? "bg-duck-orange text-white shadow"
                  : "bg-white text-slate-700 ring-1 ring-duck-yellow hover:bg-duck-yellowLight"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="kanban-title text-[11px] text-duck-ink mr-1 self-center">
            レア度:
          </span>
          {(["すべて", ...RARITY_ORDER] as Array<"すべて" | Rarity>).map((r) => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                rarity === r
                  ? "bg-duck-ink text-white shadow"
                  : "bg-white text-slate-700 ring-1 ring-duck-ink/30 hover:bg-duck-cream"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 発見済みの本編グリッド */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {foundFiltered.map((d) => (
          <DuckCard key={d.id} d={d} />
        ))}
        {foundFiltered.length === 0 && unfoundFiltered.length === 0 && (
          <div className="col-span-full card p-10 text-center text-slate-500">
            該当するアヒルが見つかりませんでした。
          </div>
        )}
      </div>

      {/* ========================= 未確認個体セクション ========================= */}
      <section className="mt-16">
        <div className="text-center mb-6">
          <div className="font-mono text-[11px] tracking-[0.4em] text-duck-red">
            ◆ UNKNOWN SPECIMEN ／ 全国会員からの報告受付枠 ◆
          </div>
          <h2 className="display-title text-3xl md:text-4xl text-duck-ink mt-2">
            未確認個体 ・ 目撃情報求む
          </h2>
          <p className="mt-2 text-sm text-duck-ink/75 max-w-xl mx-auto leading-relaxed">
            協会がまだ把握していない未知のアヒルボートを、全国会員からの報告で収集する枠です。<br />
            あなたが発見した「図鑑にない個体」を、直下のフォームから協会へお知らせください。
          </p>
          <div className="mx-auto my-4 h-[2px] w-48 bg-duck-red" />
        </div>

        <div className="relative border-[3px] border-dashed border-duck-red bg-duck-ink/[0.06] p-6 md:p-8">
          {unfoundFiltered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {unfoundFiltered.map((d) => (
                <Link
                  to={`/encyclopedia/${d.id}`}
                  key={d.id}
                  className="card p-5 group hover:-translate-y-1 hover:shadow-duck transition"
                >
                  <div className="relative h-36 rounded-2xl overflow-hidden flex items-center justify-center unfound-bg">
                    <div className="absolute inset-0 unfound-stripe pointer-events-none" />
                    <div className="relative z-10 text-6xl silhouette">
                      {d.emoji}
                    </div>
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${rarityBadge[d.rarity]}`}
                    >
                      {d.rarity}
                    </span>
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/70 text-duck-yellow px-2 py-0.5 rounded-full">
                      未確認
                    </span>
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-duck-red text-white px-2 py-0.5 rounded-full">
                      目撃情報求む
                    </span>
                  </div>
                  <h3 className="kanban-title mt-4 text-lg text-duck-ink/60 tracking-widest">
                    ？？？
                  </h3>
                  <div className="font-mono text-[10px] text-duck-ink/40 mt-0.5">
                    SPEC ／ 分類未確定
                  </div>
                  <p className="mt-2 text-sm text-duck-ink/65 line-clamp-2">
                    協会未確認の個体。断片的な目撃情報のみが寄せられている。
                  </p>
                  <span className="mt-3 inline-flex text-sm font-bold text-duck-red group-hover:underline">
                    目撃ヒントを見る →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            // ── 空きスロット（現在、未確認個体なし） ──
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="card p-5 border-dashed bg-[#F5EAD0]/50"
                  style={{ opacity: 0.55 - i * 0.12 }}
                >
                  <div className="relative h-36 rounded-2xl overflow-hidden flex items-center justify-center unfound-bg">
                    <div className="absolute inset-0 unfound-stripe pointer-events-none" />
                    <div
                      className="relative z-10 text-6xl font-black tracking-[0.3em] text-duck-yellow/40"
                      style={{ fontFamily: "'Dela Gothic One',sans-serif" }}
                    >
                      ？
                    </div>
                    <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-duck-ink/40 text-duck-yellow/70">
                      ？
                    </span>
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 text-duck-yellow px-2 py-0.5 rounded-full">
                      空きスロット
                    </span>
                  </div>
                  <h3 className="kanban-title mt-4 text-lg text-duck-ink/40 tracking-widest">
                    未発見
                  </h3>
                  <p className="mt-2 text-xs text-duck-ink/50 leading-relaxed">
                    報告受付中。あなたの1件目がここに登録されます。
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 受付状況ステータス */}
          <div className="mt-6 border-t-2 border-dashed border-duck-red/40 pt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-duck-ink/70">
            <span>
              🔎 現在の登録: {unfoundFiltered.length} 件 ／ 査察待ち
            </span>
            <span>
              📮 報告受付: <span className="text-duck-red font-black">OPEN</span>
            </span>
          </div>
        </div>

        {/* フォームへの誘導矢印 */}
        <div className="text-center mt-6 text-duck-red font-mono text-sm animate-bounce">
          ↓ あなたの目撃情報はこちらから ↓
        </div>
      </section>

      {/* ========================= 新種報告フォーム ========================= */}
      <section className="mt-16">
        <div className="relative border-[5px] border-double border-duck-ink bg-[#F5EAD0] shadow-retro p-6 md:p-10">
          {/* 内側の細罫 */}
          <div className="pointer-events-none absolute inset-2 border border-duck-ink/40" />

          <div className="relative text-center">
            <div className="font-mono text-[11px] tracking-[0.3em] text-duck-ink/70">
              様式 第七号 ／ 協會内部文書
            </div>
            <h2 className="display-title text-2xl md:text-3xl text-duck-ink mt-2">
              新種・未発見個体の報告
            </h2>
            <div className="font-mono text-xs text-duck-ink/70 mt-1">
              ── アヒルボート協會 査察部 宛 ──
            </div>
            <div className="mx-auto my-4 h-[2px] w-40 bg-duck-ink" />
            <p className="text-xs md:text-sm text-duck-ink/85 max-w-2xl mx-auto leading-relaxed">
              貴殿が発見・目撃された未確認個体について、以下の様式にてご報告ください。
              報告は査察部にて厳正に審査され、事実が確認され次第、本図鑑に正式登録されます。
            </p>
          </div>

          <form onSubmit={submitReport} className="relative mt-6">
            {/* honeypot (ボット対策) */}
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />

            <div className="border-y-[2px] border-duck-ink divide-y-[2px] divide-duck-ink/30 font-mono text-sm text-duck-ink">
              {/* 発見場所 */}
              <div className="grid grid-cols-[10rem,1fr] items-center min-h-[3rem]">
                <label className="bg-duck-ink/5 px-3 py-2 text-[12px] tracking-widest border-r-[2px] border-duck-ink">
                  発見場所
                </label>
                <input
                  name="location"
                  required
                  placeholder="例: 北海道・○○湖、関東地方の某公園池 など"
                  className="bg-transparent px-4 py-2 w-full outline-none focus:bg-white"
                />
              </div>
              {/* 特徴 */}
              <div className="grid grid-cols-[10rem,1fr] items-start">
                <label className="bg-duck-ink/5 px-3 py-2 text-[12px] tracking-widest border-r-[2px] border-duck-ink h-full">
                  アヒルの特徴
                </label>
                <textarea
                  name="features"
                  required
                  rows={5}
                  placeholder="色・サイズ・動力・表情・気配など、目撃された個体の特徴をできる限り詳細に…"
                  className="bg-transparent px-4 py-2 w-full outline-none focus:bg-white resize-none"
                />
              </div>
              {/* 目撃日時 */}
              <div className="grid grid-cols-[10rem,1fr] items-center min-h-[3rem]">
                <label className="bg-duck-ink/5 px-3 py-2 text-[12px] tracking-widest border-r-[2px] border-duck-ink">
                  目撃日時
                </label>
                <input
                  name="seenAt"
                  type="datetime-local"
                  className="bg-transparent px-4 py-2 w-full outline-none focus:bg-white"
                />
              </div>
              {/* 写真 */}
              <div className="grid grid-cols-[10rem,1fr] items-center min-h-[3rem]">
                <label className="bg-duck-ink/5 px-3 py-2 text-[12px] tracking-widest border-r-[2px] border-duck-ink">
                  添付写真
                </label>
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="px-4 py-2 w-full text-sm file:mr-3 file:border-[2px] file:border-duck-ink file:bg-duck-yellow file:px-3 file:py-1 file:text-xs file:font-bold file:text-duck-ink hover:file:bg-duck-yellowDark"
                />
              </div>
              {/* 報告者名 (任意) */}
              <div className="grid grid-cols-[10rem,1fr] items-center min-h-[3rem]">
                <label className="bg-duck-ink/5 px-3 py-2 text-[12px] tracking-widest border-r-[2px] border-duck-ink">
                  報告者名（任意）
                </label>
                <input
                  name="reporter"
                  placeholder="例: 匿名アヒラー"
                  className="bg-transparent px-4 py-2 w-full outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* フッター行 */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-[11px] text-duck-ink/70 leading-relaxed">
                ※ 虚偽の報告は協会規定 第三条に基づき除籍処分の対象となります。<br />
                ※ 記入日：{new Date().toISOString().slice(0, 10)}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-60 disabled:cursor-wait"
              >
                {submitting ? "🔎 査察中..." : "📬 報告を提出する"}
              </button>
            </div>

            {submitError && (
              <div className="mt-4 border-[2px] border-duck-red bg-white text-duck-red p-3 text-xs font-mono">
                ⚠ {submitError}
              </div>
            )}
          </form>

          {/* 朱印 */}
          <div
            className="absolute -top-3 -right-3 h-16 w-16 rotate-[12deg] flex items-center justify-center border-[3px] border-duck-red text-duck-red bg-[#F5EAD0]"
            style={{ fontFamily: '"Shippori Mincho","Noto Serif JP",serif' }}
            aria-hidden
          >
            <div className="leading-tight text-center">
              <div className="text-[10px] font-black tracking-widest">査察</div>
              <div className="text-[12px] font-black">之印</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= 査察受理モーダル ========================= */}
      {showThanks && (
        <div
          className="fixed inset-0 z-[60] bg-duck-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowThanks(false)}
        >
          <div
            className="relative max-w-md w-full border-[5px] border-double border-duck-ink bg-[#F5EAD0] shadow-retroLg p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-2 border border-duck-ink/40" />

            <div className="relative">
              <div className="text-5xl mb-3" aria-hidden>
                🦆📜
              </div>
              <div className="font-mono text-[11px] tracking-[0.3em] text-duck-ink/70">
                協會公式受理通知書
              </div>
              <h3 className="display-title text-2xl text-duck-ink mt-2">
                報告を受け付けました
              </h3>
              <div className="mx-auto my-3 h-[2px] w-32 bg-duck-ink" />
              <p className="text-sm text-duck-ink/85 leading-relaxed">
                協会で厳正な審査（査察）を行います。<br />
                結果が判明し次第、追ってご連絡いたします。
              </p>
              <p className="mt-2 text-[11px] font-mono text-duck-ink/60">
                受理番号：{receiptId}
              </p>

              <button
                onClick={() => setShowThanks(false)}
                className="btn-primary mt-6"
              >
                承知した
              </button>
            </div>

            {/* 朱印 */}
            <div
              className="absolute -top-4 -left-4 h-16 w-16 rotate-[-10deg] flex items-center justify-center border-[3px] border-duck-red text-duck-red bg-[#F5EAD0]"
              style={{ fontFamily: '"Shippori Mincho","Noto Serif JP",serif' }}
              aria-hidden
            >
              <div className="leading-tight text-center">
                <div className="text-[10px] font-black tracking-widest">受理</div>
                <div className="text-[12px] font-black">済</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
