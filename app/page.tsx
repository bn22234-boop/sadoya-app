"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [loginId, setLoginId] = useState("");

  useEffect(() => {
    const storedLoginId =
      localStorage.getItem("sadoya_login_id");

    if (storedLoginId) {
      setLoginId(storedLoginId);
    }
  }, []);

  function logout() {
    localStorage.removeItem("sadoya_user_id");
    localStorage.removeItem("sadoya_login_id");

    setLoginId("");

    window.location.reload();
  }

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-gradient-to-br from-red-900 to-red-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">
              SADOYA Wine App
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              サドヤんと一緒に
              <br />
              ワインを楽しもう
            </h1>
          </div>

          {loginId ? (
            <div className="text-right">
              <p className="text-xs text-white/70">
                ログイン中
              </p>

              <p className="font-bold text-white">
                {loginId}
              </p>

              <button
                onClick={logout}
                className="mt-2 rounded-xl bg-white px-3 py-1 text-xs font-bold text-red-900"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-900"
            >
              ログイン
            </Link>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-red-50 p-5 text-center">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-white text-7xl shadow-inner">
          🍇
        </div>

        <h2 className="mt-4 text-xl font-bold">
          サドヤん Lv.3
        </h2>

        <p className="text-sm text-gray-500">
          次の進化まで 380pt
        </p>

        <div className="mt-3 h-3 rounded-full bg-red-100">
          <div className="h-3 w-3/5 rounded-full bg-red-700" />
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 p-4">
        <h2 className="font-bold">
          今日のおすすめワイン
        </h2>

        <div className="mt-3 flex gap-3">
          <div className="flex h-24 w-20 items-center justify-center rounded-2xl bg-red-100 text-4xl">
            🍷
          </div>

          <div>
            <p className="font-bold">
              サドヤ オルロージュ
            </p>

            <p className="mt-1 text-sm text-gray-500">
              フルーティーで初心者にも飲みやすい一本。
            </p>

            <p className="mt-2 text-xs text-red-700">
              初心者向け ★★★★★
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 p-4">
        <h2 className="font-bold">
          今日のミッション
        </h2>

        <div className="mt-3 space-y-2 text-sm">
          <p>✅ ログインする +10pt</p>
          <p>□ ワインクイズに挑戦 +30pt</p>
          <p>□ ワインを記録する +50pt</p>
        </div>
      </section>
    </div>
  );
}