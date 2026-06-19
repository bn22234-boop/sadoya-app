export const wines = [
  {
    name: "サドヤ オルロージュ",
    type: "赤ワイン",
    level: "初心者向け ★★★★★",
    comment: "フルーティーで飲みやすく、ワイン初心者にもおすすめの一本。",
    pairing: "チーズ・ハンバーグ・トマト料理",
  },
  {
    name: "シャトーブリヤン 白",
    type: "白ワイン",
    level: "初心者向け ★★★★☆",
    comment: "すっきりした味わいで、魚料理や軽い食事に合わせやすい。",
    pairing: "魚料理・サラダ・鶏肉料理",
  },
  {
    name: "サドヤ スパークリング",
    type: "スパークリング",
    level: "初心者向け ★★★★★",
    comment: "乾杯にぴったり。友達と楽しみやすい華やかなワイン。",
    pairing: "前菜・パスタ・デザート",
  },
];

export const missions = [
  {
    title: "ログインする",
    description: "今日もアプリを開いてサドヤんに会おう",
    reward: 10,
    done: true,
    icon: "✅",
  },
  {
    title: "ワインクイズに挑戦",
    description: "初心者向けクイズでワイン知識をゲット",
    reward: 30,
    done: false,
    icon: "🧠",
  },
  {
    title: "ワインを記録する",
    description: "飲んだワインを自分だけの図鑑に追加",
    reward: 50,
    done: false,
    icon: "📝",
  },
  {
    title: "友達に共有する",
    description: "おすすめワインをLINEやSNSで共有",
    reward: 100,
    done: false,
    icon: "🤝",
  },
];

export const records = [
  {
    wine: "サドヤ オルロージュ",
    date: "2026/06/12",
    rating: 5,
    memo: "思ったより飲みやすかった。友達にもすすめたい。",
  },
  {
    wine: "シャトーブリヤン 白",
    date: "2026/06/10",
    rating: 4,
    memo: "すっきりしていてご飯に合いそう。",
  },
];