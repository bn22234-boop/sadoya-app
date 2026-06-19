"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [wineExperience, setWineExperience] = useState("");
  const [favoriteTaste, setFavoriteTaste] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!loginId) {
      alert("IDを入力してください");
      return;
    }

    setLoading(true);

    const fixedLoginId = loginId.trim();

    const { data: existingUser, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("login_id", fixedLoginId)
      .maybeSingle();

    if (findError) {
      alert(findError.message);
      setLoading(false);
      return;
    }

    if (existingUser) {
      localStorage.setItem("sadoya_user_id", existingUser.id);
      localStorage.setItem("sadoya_login_id", existingUser.login_id);
      router.push("/");
      return;
    }

    if (!name || !wineExperience || !favoriteTaste) {
      alert("初回登録のため、プロフィールをすべて入力してください");
      setLoading(false);
      return;
    }

    const { data: newUser, error: insertError } = await supabase
      .from("profiles")
      .insert({
        login_id: fixedLoginId,
        name,
        wine_experience: wineExperience,
        favorite_taste: favoriteTaste,
        points: 0,
        level: 1,
      })
      .select()
      .single();

    if (insertError) {
      alert(insertError.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("sadoya_user_id", newUser.id);
    localStorage.setItem("sadoya_login_id", newUser.login_id);

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
          Wine Buddy
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          IDだけでかんたんに始められます。
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
            placeholder="例：keita123"
            className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            すでに登録済みなら、このIDだけでログインできます。
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 p-4">
          <p className="text-sm font-bold text-red-900">
            初回登録の方はこちらも入力
          </p>

          <div className="mt-4 space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ニックネーム"
              className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-gray-900 outline-none"
            />

            <div>
              <p className="mb-2 text-sm font-bold text-red-900">
                ワイン経験
              </p>

              <div className="space-y-2">
                {["ほぼ飲んだことがない", "たまに飲む", "よく飲む"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setWineExperience(item)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left font-bold ${
                        wineExperience === item
                          ? "border-red-800 bg-red-800 text-white"
                          : "border-red-100 bg-white text-red-900"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-red-900">
                好きな味
              </p>

              <div className="grid grid-cols-2 gap-2">
                {["甘め", "すっきり", "フルーティー", "濃いめ"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFavoriteTaste(item)}
                      className={`rounded-2xl border px-4 py-3 font-bold ${
                        favoriteTaste === item
                          ? "border-red-800 bg-red-800 text-white"
                          : "border-red-100 bg-white text-red-900"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
        >
          {loading ? "処理中..." : "ログイン / 新規登録"}
        </button>

        <p className="text-center text-xs text-gray-400">
          このプロトタイプでは端末内にログイン状態を保存します。
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