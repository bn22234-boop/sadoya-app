"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 async function login() {
  if (!loginId || !password) {
    alert("IDとパスワードを入力してください");
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.rpc("login_with_password", {
    p_login_id: loginId.trim(),
    p_password: password,
  });

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  if (!data?.id) {
    alert("IDまたはパスワードが違います");
    setLoading(false);
    return;
  }

  localStorage.setItem("sadoya_user_id", data.id);
  localStorage.setItem("sadoya_login_id", data.login_id);

  router.push("/");
}

  return (
    <div className="flex min-h-screen flex-col justify-center space-y-6 bg-[#fffaf6] p-5 text-gray-900">
      <section className="text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-50 text-6xl shadow-inner">
          🍇
        </div>

        <p className="mt-6 text-sm font-bold text-red-700">
          SADOYA Wine App
        </p>

        <h1 className="mt-2 text-3xl font-bold text-red-950">
          ログイン
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          登録済みのIDとパスワードでログインできます。
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <div>
          <label className="text-sm font-bold text-red-900">
            ログインID
          </label>

          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="例：SADOYA3108"
            className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-red-900">
            パスワード
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none"
          />
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        <Link
          href="/signup"
          className="block rounded-2xl border border-red-200 bg-white py-4 text-center font-bold text-red-900"
        >
          新規登録はこちら
        </Link>
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