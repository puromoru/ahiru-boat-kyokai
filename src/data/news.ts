export type NewsTag = "開催" | "更新" | "注意" | "募集" | "お知らせ";

export type NewsItem = {
  date: string; // 例: "2026.04.20"
  tag: NewsTag;
  title: string;
  body: string;
};

// ▼ ここを編集するとトップページのお知らせ欄が更新されます
export const news: NewsItem[] = [
  {
    date: "2026.04.20",
    tag: "開催",
    title: "春の全国アヒルボート乗船週間",
    body: "全国のアヒルボートが君を待ってる！！クワっ！",
  },
  {
    date: "2026.04.12",
    tag: "更新",
    title: "図鑑に新種「ブラックスワン」を追加",
    body: "千鳥ヶ淵で目撃情報が相次ぐ個体群を正式収録しました。",
  },
  {
    date: "2026.03.30",
    tag: "注意",
    title: "強風時の乗船自粛のお願い",
    body: "安全第一で。風速7m/s以上では乗船をお控えください。",
  },
];
