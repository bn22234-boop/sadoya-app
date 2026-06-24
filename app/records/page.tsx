import { records } from "@/lib/mockData";

export default function RecordsPage() {
  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">My Wine Log</p>
        <h1 className="mt-1 text-2xl font-bold">ワイン記録</h1>
        <p className="mt-2 text-sm opacity-90">
          飲んだワインを記録して、自分だけのワイン図鑑を作ろう。
        </p>
      </section>

      <button className="w-full rounded-3xl bg-red-700 py-4 font-bold text-white shadow">
        ＋ 新しく記録する
      </button>

      <section className="rounded-3xl bg-orange-50 p-4">
        <p className="text-sm text-gray-500">これまでに飲んだワイン</p>
        <p className="mt-1 text-3xl font-bold text-red-900">2本</p>
      </section>

      <section className="space-y-3">
        {records.map((record) => (
          <div
            key={record.wineName}
            className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3">
              <div className="flex h-24 w-20 items-center justify-center rounded-2xl bg-red-50 text-4xl">
                🍷
              </div>

              <div className="flex-1">
                <p className="text-xs text-gray-400">{record.date}</p>
                <h2 className="mt-1 font-bold">{record.wineName}</h2>
                <p className="mt-1 text-sm text-yellow-500">
                  {"★".repeat(record.rating)}
                  {"☆".repeat(5 - record.rating)}
                </p>
              </div>
            </div>

            <p className="mt-3 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
              {record.memo}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}