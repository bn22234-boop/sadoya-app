import HeaderCard from "@/components/HeaderCard";
import MissionCard from "@/components/MissionCard";
const missions = [
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

export default function MissionsPage() {
  return (
    <div className="space-y-5 p-5">
      <HeaderCard
        label="Today's Missions"
        title="ミッション"
        description="達成するとポイントが貯まり、サドヤんが成長します。"
      />

      <section className="rounded-3xl bg-orange-50 p-4">
        <p className="text-sm text-gray-500">今日の獲得ポイント</p>
        <p className="mt-1 text-3xl font-bold text-red-900">10pt</p>
      </section>

      <section className="space-y-3">
        {missions.map((mission) => (
          <MissionCard key={mission.title} {...mission} />
        ))}
      </section>
    </div>
  );
}