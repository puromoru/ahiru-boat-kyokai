import { useCallback, useEffect, useState } from "react";

export type Review = {
  id: number;
  /** フリーテキストの地名（後方互換） */
  place: string;
  /** スポットとの紐付け（マップ詳細パネルで要約に使う） */
  spotId?: string;
  boatType: string;
  rating: number;
  comment: string;
  photoDataUrl?: string;
  author: string;
  createdAt: string;
  /** 投稿者アバター絵文字（投稿時に自動付与） */
  avatar?: string;
};

/** アヒルボート関連のランダムアバター候補 */
export const AVATAR_POOL = [
  "🦆", "🦢", "🐤", "🐥", "🐣", "🪿", "🛥️", "🚣", "🛶", "⛵",
];
const pickAvatar = () =>
  AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];

const STORAGE_KEY = "ahiru.reviews.v1";
const CHANGE_EVENT = "ahiru:reviews-changed";

// ===== GAS 連携 =====
const GAS_URL = import.meta.env.VITE_REVIEWS_GAS_URL as string | undefined;
const isGasConfigured = !!GAS_URL && !GAS_URL.includes("PASTE_YOUR");

const seed: Review[] = [
  {
    id: 1,
    place: "上野公園 不忍池",
    spotId: "shinobazu",
    boatType: "標準型",
    rating: 5,
    comment: "初めての乗船。穏やかな水面と標準型の安定感が最高でした。また来ます。",
    author: "カモ山",
    createdAt: "2026-04-18",
    avatar: "🦆",
  },
  {
    id: 2,
    place: "千鳥ヶ淵",
    spotId: "chidori",
    boatType: "王冠付き",
    rating: 4,
    comment: "桜と王冠のコントラストが映える。行列は覚悟で。",
    author: "池めぐり人",
    createdAt: "2026-04-15",
    avatar: "🦢",
  },
  {
    id: 3,
    place: "相模湖",
    spotId: "sagami",
    boatType: "ブラックスワン",
    rating: 5,
    comment: "夕暮れに出会えた。圧倒的な存在感。図鑑埋まりました。",
    author: "湖面の観察者",
    createdAt: "2026-04-10",
    avatar: "🐣",
  },
];

function readFromStorage(): Review[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Review[];
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

function writeToStorage(list: Review[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** GAS からレビュー全件を取得 (GET) */
async function fetchAllFromGas(): Promise<Review[] | null> {
  if (!isGasConfigured) return null;
  try {
    const res = await fetch(GAS_URL!, {
      method: "GET",
      redirect: "follow",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok || !Array.isArray(data.reviews)) return null;
    return data.reviews as Review[];
  } catch {
    return null;
  }
}

/** GAS にレビューを投稿 (POST)。画像は base64 で送る */
async function postReviewToGas(
  review: Omit<Review, "id"> & { id?: number }
): Promise<Review | null> {
  if (!isGasConfigured) return null;
  try {
    const payload: Record<string, unknown> = { ...review };
    // data URL の写真を base64 + mime に分解
    if (
      typeof payload.photoDataUrl === "string" &&
      payload.photoDataUrl.startsWith("data:")
    ) {
      const m = payload.photoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (m) {
        payload.photoMime = m[1];
        payload.photoBase64 = m[2];
        payload.photoName = `review-${Date.now()}.${
          m[1].split("/")[1] ?? "jpg"
        }`;
      }
      delete payload.photoDataUrl;
    }
    // text/plain で CORS プリフライトを回避
    const res = await fetch(GAS_URL!, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow",
    });
    const result = await res.json().catch(() => ({}));
    if (res.ok && result?.ok && result.review) {
      return result.review as Review;
    }
    return null;
  } catch {
    return null;
  }
}

/** 2つのレビュー配列が同一内容か（id と createdAt と hidden 変動を比較）の軽量チェック */
function reviewsEqual(a: Review[], b: Review[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
    if (a[i].createdAt !== b[i].createdAt) return false;
    if ((a[i].photoDataUrl ?? "") !== (b[i].photoDataUrl ?? "")) return false;
    if (a[i].comment !== b[i].comment) return false;
    if (a[i].rating !== b[i].rating) return false;
  }
  return true;
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(readFromStorage);

  // マウント時: GAS から最新を取得。差分がある場合のみ setState（不要な再描画を抑制）
  useEffect(() => {
    let cancelled = false;
    fetchAllFromGas().then((list) => {
      if (cancelled || !list) return;
      setReviews((prev) => {
        if (reviewsEqual(prev, list)) return prev; // 参照保持 → 下流の memo が効く
        writeToStorage(list);
        return list;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // タブ間・コンポーネント間で同期
  useEffect(() => {
    const sync = () => {
      const next = readFromStorage();
      setReviews((prev) => (reviewsEqual(prev, next) ? prev : next));
    };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addReview = useCallback(
    async (
      r: Omit<Review, "id" | "createdAt"> & { createdAt?: string }
    ): Promise<{ ok: boolean; synced: boolean }> => {
      const today = r.createdAt ?? new Date().toISOString().slice(0, 10);
      const avatar = r.avatar ?? pickAvatar();
      const optimistic: Review = {
        ...r,
        id: Date.now(),
        createdAt: today,
        avatar,
      } as Review;

      // ① 楽観更新: まずローカルに即時反映
      setReviews((prev) => {
        const next = [optimistic, ...prev];
        writeToStorage(next);
        return next;
      });

      // ② GAS に POST して保存 (Canvas 圧縮済み photoDataUrl は base64 に分解して送信)
      const saved = await postReviewToGas({
        ...r,
        avatar,
        createdAt: today,
      });

      // ③ スプレッドシート全件を再取得して真実の state に置き換える
      const fresh = await fetchAllFromGas();
      if (fresh) {
        setReviews((prev) =>
          reviewsEqual(prev, fresh) ? prev : (writeToStorage(fresh), fresh)
        );
        return { ok: !!saved, synced: true };
      }

      // 再フェッチ失敗時: 保存済みレビューで楽観値を置換するフォールバック
      if (saved) {
        setReviews((prev) => {
          const next = [saved, ...prev.filter((x) => x.id !== optimistic.id)];
          writeToStorage(next);
          return next;
        });
        return { ok: true, synced: false };
      }
      return { ok: false, synced: false };
    },
    []
  );

  /** 手動で GAS から再同期（必要なら UI から呼べる） */
  const refetch = useCallback(async () => {
    const list = await fetchAllFromGas();
    if (!list) return;
    setReviews((prev) => {
      if (reviewsEqual(prev, list)) return prev;
      writeToStorage(list);
      return list;
    });
  }, []);

  return { reviews, addReview, refetch, isGasConfigured };
}
