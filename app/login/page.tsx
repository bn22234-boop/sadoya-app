"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function signInWithEmail() {
    if (!email) {
      setMessage("メールアドレスを入力してください");
      return;
    }

    setSending(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://sadoya-app.vercel.app",
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("ログイン用メールを送信しました。メールを確認してください。");
    }

    setSending(false);
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
          Wine Buddy
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          サドヤんと一緒に、ワインをもっと身近に楽しもう。
        </p>
      </section>

      <section className="space-y-3 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none"
        />

        <button
          onClick={signInWithEmail}
          disabled={sending}
          className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
        >
          {sending ? "送信中..." : "メールでログイン"}
        </button>

        {message && (
          <p className="pt-2 text-center text-xs text-red-700">
            {message}
          </p>
        )}

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