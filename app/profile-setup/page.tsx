"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfileSetupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [wineExperience, setWineExperience] = useState("");
  const [favoriteTaste, setFavoriteTaste] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    if (!name || !wineExperience || !favoriteTaste) {
      alert("すべて入力してください");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("ログインしてください");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name,
      wine_experience: wineExperience,
      favorite_taste: favoriteTaste,
      points: 0,
      level: 1,
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] p-5 text-gray-900">
      <section className="pt-10 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl shadow-inner">
          🍇
        </div>

        <h1 className="mt-5 text-3xl font-bold text-red-950">
          プロフィール設定
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          あなたに合ったワイン体験をおすすめします。
        </p>
      </section>

      <section className="mt-8 space-y-5 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <div>
          <label className="text-sm font-bold text-red-900">
            ニックネーム
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：Keita"
            className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-red-900">
            ワイン経験
          </label>

          <div className="mt-2 grid grid-cols-1 gap-2">
            {["ほぼ飲んだことがない", "たまに飲む", "よく飲む"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setWineExperience(item)}
                  className={`rounded-2xl border px-4 py-3 text-left font-bold ${
                    wineExperience === item
                      ? "border-red-800 bg-red-800 text-white"
                      : "border-red-100 bg-red-50 text-red-900"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-red-900">
            好きな味
          </label>

          <div className="mt-2 grid grid-cols-2 gap-2">
            {["甘め", "すっきり", "フルーティー", "濃いめ"].map((item) => (
              <button
                key={item}
                onClick={() => setFavoriteTaste(item)}
                className={`rounded-2xl border px-4 py-3 font-bold ${
                  favoriteTaste === item
                    ? "border-red-800 bg-red-800 text-white"
                    : "border-red-100 bg-red-50 text-red-900"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
        >
          {saving ? "保存中..." : "プロフィールを保存"}
        </button>
      </section>
    </div>
  );
}