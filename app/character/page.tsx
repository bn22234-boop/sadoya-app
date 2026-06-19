export default function CharacterPage() {
  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">Sadoyan Room</p>
        <h1 className="mt-1 text-2xl font-bold">サドヤん育成</h1>
        <p className="mt-2 text-sm opacity-90">
          ポイントを貯めて、サドヤんを成長させよう。
        </p>
      </section>

      <section className="rounded-3xl bg-red-50 p-5 text-center">
        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-white text-8xl shadow-inner">
          🍇
        </div>

        <h2 className="mt-4 text-2xl font-bold">サドヤん</h2>
        <p className="text-sm text-gray-500">Lv.3 / 620pt</p>

        <div className="mt-4 h-3 rounded-full bg-red-100">
          <div className="h-3 w-3/5 rounded-full bg-red-700" />
        </div>

        <p className="mt-2 text-xs text-gray-500">次の進化まで 380pt</p>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-3xl bg-orange-50 p-4">
          <p className="text-2xl">❤️</p>
          <p className="mt-1 text-xs text-gray-500">なつき度</p>
          <p className="font-bold">80%</p>
        </div>

        <div className="rounded-3xl bg-yellow-50 p-4">
          <p className="text-2xl">🍽️</p>
          <p className="mt-1 text-xs text-gray-500">満足度</p>
          <p className="font-bold">65%</p>
        </div>

        <div className="rounded-3xl bg-purple-50 p-4">
          <p className="text-2xl">✨</p>
          <p className="mt-1 text-xs text-gray-500">進化度</p>
          <p className="font-bold">Lv.3</p>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 p-4">
        <h2 className="font-bold">成長アクション</h2>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button className="rounded-2xl bg-red-700 py-3 font-bold text-white">
            クイズする
          </button>
          <button className="rounded-2xl bg-orange-100 py-3 font-bold text-red-900">
            記録する
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 p-4">
        <h2 className="font-bold">進化予定</h2>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p>Lv.1：ぶどうのたね</p>
          <p>Lv.3：サドヤん</p>
          <p>Lv.5：ソムリエサドヤん</p>
          <p>Lv.10：ワインマスターサドヤん</p>
        </div>
      </section>
    </div>
  );
}