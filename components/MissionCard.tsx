type MissionCardProps = {
  title: string;
  description: string;
  reward: number;
  done: boolean;
  icon: string;
};

export default function MissionCard({
  title,
  description,
  reward,
  done,
  icon,
}: MissionCardProps) {
  return (
    <div
      className={`rounded-3xl border p-4 shadow-sm ${
        done ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>

        <div className="flex-1">
          <h2 className="font-bold">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          <p className="mt-2 text-sm font-bold text-red-700">+{reward}pt</p>
        </div>

        <div className="text-sm">{done ? "達成済み" : "未達成"}</div>
      </div>
    </div>
  );
}