type WineCardProps = {
  name: string;
  type: string;
  level: string;
  comment: string;
  pairing: string;
};

export default function WineCard({
  name,
  type,
  level,
  comment,
  pairing,
}: WineCardProps) {
  return (
    <div className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-5xl">
          🍷
        </div>

        <div>
          <p className="text-xs text-red-700">{type}</p>
          <h2 className="mt-1 font-bold">{name}</h2>
          <p className="mt-1 text-xs text-red-600">{level}</p>
          <p className="mt-2 text-sm text-gray-600">{comment}</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-orange-50 p-3 text-sm">
        <p className="font-bold">合う料理</p>
        <p className="mt-1 text-gray-600">{pairing}</p>
      </div>
    </div>
  );
}