type MissionCardProps = {
  icon: string;
  title: string;
  description: string;
  points: number;
  completed?: boolean;
  onComplete?: () => void;
};

export default function MissionCard({
  icon,
  title,
  description,
  points,
  completed = false,
  onComplete,
}: MissionCardProps) {
  return (
    <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl">
          {icon}
        </div>

        <div className="flex-1">
          <h2 className="font-bold">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
          <p className="mt-1 text-xs font-bold text-red-700">
            +{points}pt
          </p>
        </div>

        <button
          onClick={onComplete}
          disabled={completed}
          className={`rounded-2xl px-4 py-2 text-sm font-bold ${
            completed
              ? "bg-gray-100 text-gray-400"
              : "bg-red-800 text-white"
          }`}
        >
          {completed ? "達成済み" : "達成"}
        </button>
      </div>
    </section>
  );
}