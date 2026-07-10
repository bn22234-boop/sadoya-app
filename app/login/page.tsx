"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type LoginResult = {
  id: string;
  login_id: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  // 同じブラウザですでにログイン済みならホームへ移動
  useEffect(() => {
    const savedUserId = localStorage.getItem("sadoya_user_id");

    if (savedUserId) {
      router.replace("/");
      return;
    }

    setCheckingLogin(false);
  }, [router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loginId.trim() || !password) {
      alert("IDとパスワードを入力してください");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("login_with_password", {
        p_login_id: loginId.trim(),
        p_password: password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const loginUser = data as LoginResult | null;

      if (!loginUser?.id) {
        alert("IDまたはパスワードが違います");
        return;
      }

      localStorage.setItem("sadoya_user_id", loginUser.id);
      localStorage.setItem("sadoya_login_id", loginUser.login_id);

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログイン中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  if (checkingLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="text-5xl">🍇</div>
          <p className="mt-4 text-sm font-bold text-red-900">
            ログイン状態を確認しています...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-5 py-10"
      style={{
        backgroundImage: "url('/images/sadoya-login.jpg')",
      }}
    >
      {/* 背景を暗くして文字を読みやすくする */}
      <div className="absolute inset-0 bg-black/45" />

      {/* ワイン色のグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-transparent to-red-950/60" />

      <div className="relative z-10 w-full max-w-md">
        <section className="mb-7 text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/40 bg-white/20 text-5xl shadow-lg backdrop-blur-md">
            🍇
          </div>

          <p className="mt-5 text-sm font-bold tracking-[0.2em]">
            SADOYA WINE APP
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            おかえりなさい
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/90">
            サドヤんと一緒に、
            <br />
            ワインの物語を続きを育てよう。
          </p>
        </section>

        <form
          onSubmit={login}
          className="space-y-4 rounded-[2rem] border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-md"
        >
          <div>
            <label
              htmlFor="loginId"
              className="text-sm font-bold text-red-950"
            >
              ログインID
            </label>

            <input
              id="loginId"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="例：SADOYA3108"
              autoComplete="username"
              className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-red-950"
            >
              パスワード
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="パスワード"
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-red-900 py-4 font-bold text-white shadow-md transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-red-100" />
            <span className="text-xs text-gray-400">または</span>
            <div className="h-px flex-1 bg-red-100" />
          </div>

          <Link
            href="/signup"
            className="block rounded-2xl border border-red-200 bg-white py-4 text-center font-bold text-red-950 transition hover:bg-red-50"
          >
            初めての方はこちら
          </Link>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-bold text-white underline decoration-white/50 underline-offset-4"
        >
          最初の画面へ戻る
        </Link>
      </div>
    </main>
  );
}