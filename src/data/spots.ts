export type Region =
  | "北海道・東北"
  | "関東"
  | "中部・北陸"
  | "近畿"
  | "中国・四国"
  | "九州・沖縄";

export type Spot = {
  id: string;
  name: string;
  prefecture: string;
  region: Region;
  /** 地理座標 [経度, 緯度] — react-simple-maps の Marker 形式 */
  coordinates: [number, number];
  status: "調査中" | "情報募集中";
};

export type RegionMeta = {
  id: Region;
  /** クラスタ表示位置 */
  center: [number, number];
  /** クラスタの色（レトロ配色） */
  color: string;
};

export const regions: RegionMeta[] = [
  { id: "北海道・東北", center: [141.0, 40.5], color: "#2F5D5A" },
  { id: "関東",        center: [139.7, 36.1], color: "#B33A2C" },
  { id: "中部・北陸",   center: [138.0, 36.0], color: "#C56A26" },
  { id: "近畿",        center: [135.4, 34.9], color: "#B8902B" },
  { id: "中国・四国",   center: [133.2, 34.2], color: "#7B3F8C" },
  { id: "九州・沖縄",   center: [130.8, 33.1], color: "#507A2E" },
];

export const spots: Spot[] = [
  // 北海道・東北 (17)
  { id: "toya",            name: "洞爺湖",             prefecture: "北海道", region: "北海道・東北", coordinates: [140.854, 42.602], status: "調査中" },
  { id: "oonuma",          name: "大沼公園",           prefecture: "北海道", region: "北海道・東北", coordinates: [140.684, 41.987], status: "情報募集中" },
  { id: "akan",            name: "阿寒湖",             prefecture: "北海道", region: "北海道・東北", coordinates: [144.098, 43.456], status: "情報募集中" },
  { id: "abashiri",        name: "網走湖",             prefecture: "北海道", region: "北海道・東北", coordinates: [144.141, 43.935], status: "情報募集中" },
  { id: "kussharo",        name: "屈斜路湖",           prefecture: "北海道", region: "北海道・東北", coordinates: [144.327, 43.573], status: "情報募集中" },
  { id: "towada",          name: "十和田湖",           prefecture: "青森",   region: "北海道・東北", coordinates: [140.879, 40.466], status: "情報募集中" },
  { id: "utarube",         name: "宇樽部キャンプ場",   prefecture: "青森",   region: "北海道・東北", coordinates: [140.905, 40.478], status: "情報募集中" },
  { id: "goshoko",         name: "御所湖",             prefecture: "岩手",   region: "北海道・東北", coordinates: [141.022, 39.703], status: "情報募集中" },
  { id: "takamatsu-ike",   name: "高松の池",           prefecture: "岩手",   region: "北海道・東北", coordinates: [141.145, 39.721], status: "情報募集中" },
  { id: "shichikashuku",   name: "七ヶ宿湖",           prefecture: "宮城",   region: "北海道・東北", coordinates: [140.397, 37.985], status: "情報募集中" },
  { id: "hanayama",        name: "花山湖",             prefecture: "宮城",   region: "北海道・東北", coordinates: [140.820, 38.811], status: "情報募集中" },
  { id: "tazawa",          name: "田沢湖",             prefecture: "秋田",   region: "北海道・東北", coordinates: [140.665, 39.717], status: "情報募集中" },
  { id: "kajo",            name: "霞城公園",           prefecture: "山形",   region: "北海道・東北", coordinates: [140.332, 38.255], status: "情報募集中" },
  { id: "tokura",          name: "徳良湖",             prefecture: "山形",   region: "北海道・東北", coordinates: [140.416, 38.663], status: "情報募集中" },
  { id: "inawashiro",      name: "猪苗代湖",           prefecture: "福島",   region: "北海道・東北", coordinates: [140.097, 37.486], status: "調査中" },
  { id: "hibara",          name: "桧原湖",             prefecture: "福島",   region: "北海道・東北", coordinates: [140.048, 37.705], status: "情報募集中" },
  { id: "goshiki",         name: "五色沼",             prefecture: "福島",   region: "北海道・東北", coordinates: [140.072, 37.663], status: "情報募集中" },

  // 関東 (18)
  { id: "shinobazu",       name: "上野公園 不忍池",   prefecture: "東京",     region: "関東", coordinates: [139.771, 35.713], status: "情報募集中" },
  { id: "chidori",         name: "千鳥ヶ淵",           prefecture: "東京",     region: "関東", coordinates: [139.742, 35.686], status: "情報募集中" },
  { id: "senzoku",         name: "洗足池",             prefecture: "東京",     region: "関東", coordinates: [139.697, 35.598], status: "情報募集中" },
  { id: "shakujii",        name: "石神井公園",         prefecture: "東京",     region: "関東", coordinates: [139.604, 35.732], status: "情報募集中" },
  { id: "inokashira",      name: "井の頭公園",         prefecture: "東京",     region: "関東", coordinates: [139.570, 35.700], status: "調査中" },
  { id: "sagami",          name: "相模湖",             prefecture: "神奈川",   region: "関東", coordinates: [139.168, 35.614], status: "情報募集中" },
  { id: "ashinoko",        name: "芦ノ湖",             prefecture: "神奈川",   region: "関東", coordinates: [139.022, 35.207], status: "情報募集中" },
  { id: "hakoneen",        name: "箱根園",             prefecture: "神奈川",   region: "関東", coordinates: [139.016, 35.205], status: "情報募集中" },
  { id: "teganuma",        name: "手賀沼",             prefecture: "千葉",     region: "関東", coordinates: [140.032, 35.848], status: "情報募集中" },
  { id: "kameyama",        name: "亀山ダム",           prefecture: "千葉",     region: "関東", coordinates: [140.114, 35.276], status: "情報募集中" },
  { id: "shimizu",         name: "清水公園",           prefecture: "千葉",     region: "関東", coordinates: [139.906, 35.942], status: "情報募集中" },
  { id: "koshigaya",       name: "越谷レイクタウン",   prefecture: "埼玉",     region: "関東", coordinates: [139.816, 35.877], status: "情報募集中" },
  { id: "musashi-hills",   name: "武蔵丘陵森林公園",   prefecture: "埼玉",     region: "関東", coordinates: [139.343, 36.068], status: "情報募集中" },
  { id: "senba",           name: "千波湖",             prefecture: "茨城",     region: "関東", coordinates: [140.464, 36.371], status: "情報募集中" },
  { id: "kasumigaura",     name: "霞ヶ浦 ラクスマリーナ", prefecture: "茨城",  region: "関東", coordinates: [140.396, 36.099], status: "情報募集中" },
  { id: "chuzenji",        name: "中禅寺湖",           prefecture: "栃木",     region: "関東", coordinates: [139.479, 36.733], status: "情報募集中" },
  { id: "haruna",          name: "榛名湖",             prefecture: "群馬",     region: "関東", coordinates: [138.859, 36.475], status: "情報募集中" },
  { id: "akagi",           name: "赤城山 大沼",        prefecture: "群馬",     region: "関東", coordinates: [139.193, 36.557], status: "情報募集中" },

  // 中部・北陸 (14)
  { id: "yamanaka",        name: "山中湖",             prefecture: "山梨",     region: "中部・北陸", coordinates: [138.870, 35.418], status: "情報募集中" },
  { id: "kawaguchi",       name: "河口湖",             prefecture: "山梨",     region: "中部・北陸", coordinates: [138.757, 35.518], status: "情報募集中" },
  { id: "motosu",          name: "本栖湖",             prefecture: "山梨",     region: "中部・北陸", coordinates: [138.588, 35.463], status: "情報募集中" },
  { id: "suwa",            name: "諏訪湖",             prefecture: "長野",     region: "中部・北陸", coordinates: [138.090, 36.051], status: "情報募集中" },
  { id: "nojiri",          name: "野尻湖",             prefecture: "長野",     region: "中部・北陸", coordinates: [138.212, 36.830], status: "情報募集中" },
  { id: "shirakaba",       name: "白樺湖",             prefecture: "長野",     region: "中部・北陸", coordinates: [138.270, 36.147], status: "情報募集中" },
  { id: "hamana",          name: "浜名湖",             prefecture: "静岡",     region: "中部・北陸", coordinates: [137.617, 34.733], status: "情報募集中" },
  { id: "ippeki",          name: "一碧湖",             prefecture: "静岡",     region: "中部・北陸", coordinates: [139.095, 34.963], status: "情報募集中" },
  { id: "higashiyama",     name: "東山動植物園",       prefecture: "愛知",     region: "中部・北陸", coordinates: [136.977, 35.156], status: "情報募集中" },
  { id: "odaka",           name: "大高緑地",           prefecture: "愛知",     region: "中部・北陸", coordinates: [136.947, 35.077], status: "情報募集中" },
  { id: "enakyo",          name: "恵那峡",             prefecture: "岐阜",     region: "中部・北陸", coordinates: [137.385, 35.477], status: "情報募集中" },
  { id: "midori-gifu",     name: "みどり公園",         prefecture: "岐阜",     region: "中部・北陸", coordinates: [136.762, 35.422], status: "情報募集中" },
  { id: "hyoko",           name: "瓢湖",               prefecture: "新潟",     region: "中部・北陸", coordinates: [139.257, 37.893], status: "情報募集中" },
  { id: "shibayama",       name: "柴山潟",             prefecture: "石川",     region: "中部・北陸", coordinates: [136.327, 36.327], status: "情報募集中" },

  // 近畿 (7)
  { id: "biwa",            name: "琵琶湖 におの浜",    prefecture: "滋賀",     region: "近畿", coordinates: [135.886, 35.014], status: "調査中" },
  { id: "arashiyama",      name: "嵐山 桂川",          prefecture: "京都",     region: "近畿", coordinates: [135.673, 35.011], status: "情報募集中" },
  { id: "okazaki-kyoto",   name: "岡崎公園 平安神宮",  prefecture: "京都",     region: "近畿", coordinates: [135.784, 35.015], status: "情報募集中" },
  { id: "banpaku",         name: "万博記念公園",       prefecture: "大阪",     region: "近畿", coordinates: [135.530, 34.803], status: "情報募集中" },
  { id: "kinosaki",        name: "城崎温泉 円山川",    prefecture: "兵庫",     region: "近畿", coordinates: [134.810, 35.621], status: "情報募集中" },
  { id: "himeji-cp",       name: "姫路セントラルパーク", prefecture: "兵庫",   region: "近畿", coordinates: [134.730, 34.864], status: "情報募集中" },
  { id: "nara-arake",      name: "奈良公園 荒池",      prefecture: "奈良",     region: "近畿", coordinates: [135.836, 34.680], status: "情報募集中" },

  // 中国・四国 (5)
  { id: "korakuen",        name: "岡山後楽園 旭川",    prefecture: "岡山",     region: "中国・四国", coordinates: [133.935, 34.667], status: "情報募集中" },
  { id: "sandankyo",       name: "三段峡",             prefecture: "広島",     region: "中国・四国", coordinates: [132.177, 34.632], status: "情報募集中" },
  { id: "tokiwa",          name: "常盤公園",           prefecture: "山口",     region: "中国・四国", coordinates: [131.297, 33.937], status: "情報募集中" },
  { id: "ritsurin",        name: "栗林公園",           prefecture: "香川",     region: "中国・四国", coordinates: [134.042, 34.325], status: "情報募集中" },
  { id: "dogo",            name: "道後公園",           prefecture: "愛媛",     region: "中国・四国", coordinates: [132.787, 33.848], status: "情報募集中" },

  // 九州・沖縄 (6)
  { id: "ohori",           name: "大濠公園",           prefecture: "福岡",     region: "九州・沖縄", coordinates: [130.376, 33.587], status: "情報募集中" },
  { id: "uminonakamichi",  name: "海の中道海浜公園",   prefecture: "福岡",     region: "九州・沖縄", coordinates: [130.325, 33.661], status: "情報募集中" },
  { id: "konoko",          name: "神野公園",           prefecture: "佐賀",     region: "九州・沖縄", coordinates: [130.298, 33.255], status: "情報募集中" },
  { id: "shitaka",         name: "志高湖",             prefecture: "大分",     region: "九州・沖縄", coordinates: [131.453, 33.291], status: "情報募集中" },
  { id: "ezu",             name: "江津湖",             prefecture: "熊本",     region: "九州・沖縄", coordinates: [130.733, 32.768], status: "情報募集中" },
  { id: "imuta",           name: "藺牟田池",           prefecture: "鹿児島",   region: "九州・沖縄", coordinates: [130.465, 31.818], status: "情報募集中" },
];

export const SPOT_INVITATION =
  "ここに関する情報を知っている方は、レビューから投稿してください！";

export const MAP_CENTER: [number, number] = [137.5, 37.0];
export const MAP_SCALE = 1500;
