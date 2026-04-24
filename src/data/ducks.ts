export type Rarity = "N" | "R" | "SR" | "SSR" | "UR";

export type DuckCategory =
  | "オリジン系"
  | "メカニカル系"
  | "キメラ系"
  | "秘蔵系";

export type DuckPower = "人力" | "内燃機関" | "電気動力";

export type Duck = {
  id: string;
  name: string;
  category: DuckCategory;
  rarity: Rarity;
  emoji: string;
  /** 絵文字の追加CSS filter（色変種の表現用） */
  emojiFilter?: string;
  tagline: string;
  /** 技術仕様スペック（短い1行） */
  spec: string;
  habitat: string[];
  description: string;
  power: DuckPower;
  stats: { cuteness: number; speed: number; stability: number };
  /** 協会による発見・認定済みフラグ */
  found: boolean;
  /** 未発見個体のみ: 目撃情報の地域ヒント */
  hint?: string;
};

export const RARITY_ORDER: Rarity[] = ["N", "R", "SR", "SSR", "UR"];

export const ducks: Duck[] = [
  // ───────── [N] ─────────
  {
    id: "standard-swan",
    name: "スタンダード・スワン",
    category: "オリジン系",
    rarity: "N",
    emoji: "🦢",
    tagline: "すべてはここから始まる。全国の池の8割を占める基本種。",
    spec: "人力（足漕ぎ）／3人乗り",
    habitat: ["上野公園 不忍池", "井の頭公園", "千波湖", "大濠公園"],
    description:
      "1970年代の誕生以来、国内大手造船所製として50年以上にわたり作り続けられる基準機。国内の厳しい安全基準をクリアした堅牢な構造と素直な操舵性で、初心者からベテランまで幅広く対応する。協会の調査報告によれば、全国の稼働個体の実に8割をこの系統が占めるとされる。",
    power: "人力",
    stats: { cuteness: 4, speed: 2, stability: 5 },
    found: true,
  },
  {
    id: "pair-swan",
    name: "ペア・スワン",
    category: "オリジン系",
    rarity: "N",
    emoji: "🦢",
    tagline: "少し小型のカップル専用機。",
    spec: "人力（足漕ぎ）／2人乗り",
    habitat: ["河口湖", "千鳥ヶ淵", "石神井公園", "一碧湖"],
    description:
      "スタンダード・スワンを一回りコンパクトに設計し直した2人乗り。老舗工房の傑作として、観光地のデートスポットで不動の地位を築く。二人で息を合わせないと真っ直ぐ進まない仕様は、協会内で「関係性を測る儀式的機能」と呼ばれることもある。",
    power: "人力",
    stats: { cuteness: 5, speed: 2, stability: 4 },
    found: true,
  },

  // ───────── [R] ─────────
  {
    id: "new-swan",
    name: "ニュー・スワン",
    category: "オリジン系",
    rarity: "R",
    emoji: "🦢",
    tagline: "視界の広い、現代風改良モデル。",
    spec: "人力／3人乗り／現代風内装",
    habitat: ["浜名湖", "芦ノ湖", "中禅寺湖", "諏訪湖"],
    description:
      "2000年代以降に国内大手造船所が全面刷新した現代派。キャノピーとパノラマ設計により視界が飛躍的に広がり、操舵フィードバックも改善。快適性を重視する観光地に優先配備されており、協会の遭遇率統計でも上昇傾向にある注目の系統。",
    power: "人力",
    stats: { cuteness: 4, speed: 3, stability: 5 },
    found: true,
  },
  {
    id: "yellow-duck",
    name: "イエロー・ダック",
    category: "キメラ系",
    rarity: "R",
    emoji: "🦆",
    tagline: "白鳥ではなく「アヒル」そのものを模した黄色い変種。",
    spec: "人力／短首・丸ボディ",
    habitat: ["洗足池", "東山動植物園", "大濠公園", "石神井公園"],
    description:
      "長頸の白鳥ボディを根本から再設計し、短首・丸型の本来の「アヒル」像に回帰させた愛嬌系。老舗工房が玩具文化との接続を意識したと伝わる。協会的には「アヒルボート協会の名にふさわしい純血」との声もあり、ファンからの支持は根強い。",
    power: "人力",
    stats: { cuteness: 5, speed: 2, stability: 3 },
    found: true,
  },
  {
    id: "pink-swan",
    name: "桃色スワン",
    category: "秘蔵系",
    rarity: "R",
    emoji: "🦢",
    emojiFilter: "sepia(0.9) saturate(5) hue-rotate(310deg) brightness(1.05)",
    tagline: "縁結びスポットに放流される傾向がある、ピンクの使者。",
    spec: "人力／ピンク塗装",
    habitat: ["嵐山 桂川", "奈良公園 荒池", "栗林公園", "岡崎公園 平安神宮"],
    description:
      "桜色の特殊塗装を纏った変種。国内大手造船所が観光需要に応える形で少量受注生産しており、縁結び神社の近辺・春の観光地に優先的に配備される。協会調査によれば、桃色に乗船したペアの復縁率には一定の相関が見られる（検証中）。",
    power: "人力",
    stats: { cuteness: 5, speed: 2, stability: 4 },
    found: true,
  },

  // ───────── [SR] ─────────
  {
    id: "crown-swan",
    name: "クラウン・スワン",
    category: "オリジン系",
    rarity: "SR",
    emoji: "👑",
    tagline: "観光地の「顔」として君臨する、少し優越感の個体。",
    spec: "人力／頭部に王冠を戴く",
    habitat: ["千鳥ヶ淵", "岡崎公園 平安神宮", "姫路セントラルパーク", "大濠公園"],
    description:
      "頭部に精巧な装飾冠を載せた格式派で、式典シーズンや観光地のメインステージに配される。老舗工房の熟練職人が一点ずつ仕上げるとされ、乗船者の背筋が自然と伸びる独特の気品を放つ。協会では「観光地の顔役」として扱われる重要個体。",
    power: "人力",
    stats: { cuteness: 5, speed: 2, stability: 4 },
    found: true,
  },
  {
    id: "panda-maru",
    name: "パンダ丸",
    category: "キメラ系",
    rarity: "SR",
    emoji: "🐼",
    tagline: "白鳥以外の動物系では最大勢力。表情の個体差が激しい。",
    spec: "人力／熊猫外装",
    habitat: ["上野公園 不忍池", "東山動植物園", "大濠公園"],
    description:
      "スワンの骨格を流用しつつ、外装を白黒の熊猫仕様に再構成した異端系統。パンダ動物園近隣の池を中心に配備が進んでおり、白鳥以外の動物系の中では最大の勢力を誇る。顔の造形が職人の手作業ゆえに個体差が激しく、コレクター心をくすぐる。",
    power: "人力",
    stats: { cuteness: 5, speed: 3, stability: 3 },
    found: true,
  },
  {
    id: "koala-with-child",
    name: "子連れコアラ",
    category: "キメラ系",
    rarity: "SR",
    emoji: "🐨",
    tagline: "親子の絆を象徴するが、漕ぐのは親（大人）だけ。",
    spec: "人力／背負い型",
    habitat: ["石神井公園", "清水公園", "万博記念公園", "洗足池"],
    description:
      "コアラの親子を象った珍しい構造。親の背中に子コアラが固定された二層設計で、操縦は専ら親側が担当する。国内の老舗工房がファミリー層向けに企画した特注モデルとされ、「本体はどちらか」論争が協会内で定期的に勃発する。",
    power: "人力",
    stats: { cuteness: 5, speed: 2, stability: 4 },
    found: true,
  },
  {
    id: "mega-swan",
    name: "メガ・スワン",
    category: "オリジン系",
    rarity: "SR",
    emoji: "🦢",
    tagline: "圧倒的な巨体。一家族全員を飲み込む。",
    spec: "人力／6人乗り",
    habitat: ["琵琶湖 におの浜", "山中湖", "中禅寺湖", "洞爺湖"],
    description:
      "標準型を大幅にスケールアップした最大級の受注生産モデル。国内大手造船所の特注ラインで少数が組み上げられ、大型観光地にのみ配備される。6人乗りの荘厳な姿から「動く要塞」と呼称され、家族・団体客からの支持は絶大。",
    power: "人力",
    stats: { cuteness: 4, speed: 1, stability: 5 },
    found: true,
  },

  // ───────── [SSR] ─────────
  {
    id: "black-swan",
    name: "ブラック・スワン",
    category: "秘蔵系",
    rarity: "SSR",
    emoji: "🦢",
    emojiFilter: "brightness(0.2) saturate(0.4) drop-shadow(0 0 4px rgba(180,0,0,0.6))",
    tagline: "夕暮れ時の視認性は極めて低い、漆黒の刺客。",
    spec: "人力／漆黒塗装／赤クチバシ",
    habitat: ["相模湖", "河口湖", "榛名湖"],
    description:
      "漆黒のボディに紅いくちばしという対比が象徴的な闇の系統。特定の県や湖にのみ生息し、夕暮れ時の湖面では視認性が極めて低くなる。広義のアヒルボートとしてか認定されているものの、アヒル科としての純血性は協会内でも議論の絶えないところ。",
    power: "人力",
    stats: { cuteness: 4, speed: 4, stability: 3 },
    found: true,
  },
  {
    id: "gold-swan",
    name: "ゴールド・スワン",
    category: "秘蔵系",
    rarity: "SSR",
    emoji: "🦢",
    emojiFilter: "sepia(1) saturate(4) hue-rotate(-10deg) brightness(1.15) drop-shadow(0 0 6px rgba(255,215,0,0.8))",
    tagline: "日本の数カ所にのみ生息する「動くパワースポット」。",
    spec: "人力／金色塗装",
    habitat: ["琵琶湖 におの浜", "中禅寺湖"],
    description:
      "全身に金色の特殊塗装を施した超希少個体。国内大手造船所が協会認定の聖地湖にのみ配備するとされ、晴天下での姿は湖面を黄金色に染め上げる。目撃した者は幸運に恵まれるとされ、会員間では「動くパワースポット」として静かに伝承される。",
    power: "人力",
    stats: { cuteness: 5, speed: 3, stability: 4 },
    found: true,
  },
  {
    id: "sky-swan",
    name: "スカイ・スワン",
    category: "キメラ系",
    rarity: "SSR",
    emoji: "🛩️",
    tagline: "翼はあるが飛ばない。子供たちからの人気は絶大。",
    spec: "人力／ヘリコプター・ジェット型",
    habitat: ["海の中道海浜公園", "大濠公園", "浜名湖"],
    description:
      "水上飛行艇・ヘリコプター・戦闘機の意匠を大胆に取り入れた機種。翼と操縦桿は完全に装飾で、水面を滑走しながら「空を駆ける気分」を乗船者に提供する。老舗工房の遊び心と職人技が結実した協会認定の変種として、男児から圧倒的な支持を得る。",
    power: "人力",
    stats: { cuteness: 4, speed: 4, stability: 2 },
    found: true,
  },
  {
    id: "ancient-dinosaur",
    name: "古代種（恐竜型）",
    category: "キメラ系",
    rarity: "SSR",
    emoji: "🦕",
    tagline: "スワンの首の長さを利用した先祖返りモデル。非常に珍しい。",
    spec: "人力／ブラキオサウルス等",
    habitat: ["恵那峡", "榛名湖", "桧原湖"],
    description:
      "スワンの長い頸を活かし、古代水棲恐竜の姿を再現した伝説級個体。出自は諸説あり、国内某所の工房による試作が野に放たれた説・湖で自然発生した突然変異説などが協会内で真面目に議論されている。遭遇は文字通り「運命」とされる。",
    power: "人力",
    stats: { cuteness: 4, speed: 3, stability: 3 },
    found: true,
  },

  // ───────── [UR] ─────────
  {
    id: "engine-2hp",
    name: "2馬力エンジン機",
    category: "メカニカル系",
    rarity: "UR",
    emoji: "🛥️",
    tagline: "免許不要の限界に挑んだ機械化個体。広大な湖でのみ確認。",
    spec: "内燃機関（エンジン）",
    habitat: ["猪苗代湖", "十和田湖", "阿寒湖", "田沢湖"],
    description:
      "国内の厳しい排気・騒音・出力基準の「免許不要」枠ギリギリを攻めた機械化モデル。老舗造船所と動力系サプライヤーの共同開発とされ、稼働は広大な湖に限定される。協会の実地調査では「人力では到達し得なかった沖合い」への到達を可能にする異次元の一機。",
    power: "内燃機関",
    stats: { cuteness: 3, speed: 5, stability: 3 },
    found: true,
  },
  {
    id: "silent-electric",
    name: "サイレント・エレキ",
    category: "メカニカル系",
    rarity: "UR",
    emoji: "⚡",
    tagline: "最新のテクノロジーを積んだ静かなる刺客。まさに次世代機。",
    spec: "電気動力（モーター）",
    habitat: ["諏訪湖", "箱根園", "海の中道海浜公園", "琵琶湖 におの浜"],
    description:
      "リチウムイオン駆動の静音電動モーターを搭載した次世代個体。稼働音は湖面の水音に溶け込み、自然環境保護区でも認可される唯一のモーター型。協会報告書では「もっとも未来を感じさせる機体」と評価され、充電インフラが整備された湖を中心に配備が進行中。",
    power: "電気動力",
    stats: { cuteness: 4, speed: 4, stability: 4 },
    found: true,
  },
  {
    id: "classic-paddle",
    name: "クラシック・パドル",
    category: "メカニカル系",
    rarity: "UR",
    emoji: "🚣",
    tagline: "外装はスワンだが、中身は手漕ぎ。絶滅危惧種。",
    spec: "手漕ぎ（オール）",
    habitat: ["霞城公園", "常盤公園", "徳良湖"],
    description:
      "外装はあくまでスワンでありながら、中身は伝統的な手漕ぎ式という矛盾を内包する奇跡の一機。1970年代以前の原初的製法を今に伝え、稼働可能な個体は協会の推定でも数えるほど。老舗工房の長老職人のみが修繕できるとされ、事実上の絶滅危惧種として保護対象。",
    power: "人力",
    stats: { cuteness: 4, speed: 2, stability: 3 },
    found: true,
  },
];
