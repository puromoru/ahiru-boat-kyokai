export type ChairmanMessage = {
  name: string;
  title: string;
  /** 会長の写真。public/ に画像を置いて `/ファイル名.jpg` で参照する */
  photo: string;
  greeting: string;
  paragraphs: string[];
};

// ▼ ここを編集すると「会長からのメッセージ」欄が更新されます
export const chairman: ChairmanMessage = {
  name: "ダクタル・落合",
  title: "アヒルボート協会 会長",
  photo: "/chairman2.jpg",
  greeting: "拝啓、アヒルボートを愛する全ての皆様へ。",
  paragraphs: [
    "私がアヒルボートと出会ったのは、2019年の春。東京・井の頭公園の湖畔でした。黄色いアヒルの目と視線が合った瞬間、私は確信しました。「これは普通の乗り物ではない」と。",
    "当協会はその知見を全国民に届けるべく、極めて真剣に設立された組織です。",
    "アヒルボートは単なる遊具ではありません。それは、水面を漂う人類の英知です。",
  ],
};
