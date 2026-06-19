import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center space-y-6 p-5">
      <section className="text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-50 text-6xl shadow-inner">
          🍇
        </div>

        <p className="mt-6 text-sm font-bold text-red-700">SADOYA Wine App</p>
        <h1 className="mt-2 text-3xl font-bold text-red-950">
          Wine Buddy
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          サドヤんと一緒に、ワインをもっと身近に楽しもう。
        </p>
      </section>

      <section className="space-y-3 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <button className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white">
          Googleでログイン
        </button>

        <button className="w-full rounded-2xl border border-red-200 bg-white py-4 font-bold text-red-900">
          メールアドレスでログイン
        </button>

        <p className="pt-2 text-center text-xs text-gray-400">
          ログインすると、ポイント・ワイン記録・サドヤんの成長が保存されます。
        </p>
      </section>

      <Link
        href="/"
        className="block text-center text-sm font-bold text-red-700"
      >
        ゲストとして見る
      </Link>
    </div>
  );
}