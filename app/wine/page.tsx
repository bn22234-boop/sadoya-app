import HeaderCard from "@/components/HeaderCard";
import WineCard from "@/components/WineCard";
const wines = [
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

export default function WinePage() {
  return (
    <div className="space-y-5 p-5">
      <HeaderCard
        label="Wine Guide"
        title="ワイン紹介"
        description="難しい言葉を使わずに、初心者でも選びやすく紹介します。"
      />

      <section className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-2xl bg-red-50 p-3">🍷 赤</div>
        <div className="rounded-2xl bg-yellow-50 p-3">🥂 白</div>
        <div className="rounded-2xl bg-pink-50 p-3">✨ 泡</div>
      </section>

      <section className="space-y-4">
        {wines.map((wine) => (
          <WineCard key={wine.name} {...wine} />
        ))}
      </section>
    </div>
  );
}