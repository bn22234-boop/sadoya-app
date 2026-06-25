"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Profile = {
  id: string;
  login_id: string;
  name: string;
  points: number;
  level: number;
  role: string;
};

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, login_id, name, points, level, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error.message);
      return;
    }

    setProfile(data);
  }

  function logout() {
    localStorage.removeItem("sadoya_user_id");
    localStorage.removeItem("sadoya_login_id");
    setProfile(null);
  }

const points = profile?.points ?? 0;

// 100ptごとにレベルアップ
const level = Math.floor(points / 100) + 1;

// 次レベルまで
const nextPoint = 100 - (points % 100);

// プログレスバー
const progress = points % 100;

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-gradient-to-br from-red-900 to-red-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">SADOYA Wine App</p>
            <h1 className="mt-1 text-2xl font-bold">
              サドヤんと一緒に
              <br />
              ワインを楽しもう
            </h1>

            {profile && (
              <p className="mt-2 text-sm text-white/80">
                こんにちは、{profile.name}さん
              </p>
            )}
          </div>

          {profile ? (
            <div className="text-right">
              <p className="text-xs text-white/70">ログイン中</p>
              <p className="font-bold text-white">{profile.login_id}</p>

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
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-inner">
  <Image
    src="/images/sadoyan.png"
    alt="サドヤん"
    width={130}
    height={130}
    className="object-contain"
  />
</div>

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          サドヤん Lv.{level}
        </h2>

        <p className="text-sm text-gray-500">
          {profile
            ? `現在 ${points}pt / 次のLvまで ${nextPoint}pt`
            : "ログインするとサドヤんの成長が保存されます"}
        </p>

        <div className="mt-3 h-3 rounded-full bg-red-100">
          <div
  className="h-3 rounded-full bg-red-700"
  style={{ width: `${progress}%` }}
/>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">今日のおすすめワイン</h2>

        <div className="mt-3 flex gap-3">
          <div className="flex h-24 w-20 items-center justify-center rounded-2xl bg-red-100 text-4xl">
            🍷
          </div>

          <div>
            <p className="font-bold">サドヤ オルロージュ</p>
            <p className="mt-1 text-sm text-gray-500">
              フルーティーで初心者にも飲みやすい一本。
            </p>
            <p className="mt-2 text-xs text-red-700">
              初心者向け ★★★★★
            </p>
          </div>
        </div>

        <Link
          href="/wine"
          className="mt-4 block rounded-2xl bg-red-800 py-3 text-center text-sm font-bold text-white"
        >
          ワインリストを見る
        </Link>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">今日のミッション</h2>

        <div className="mt-3 space-y-2 text-sm">
          <p>{profile ? "✅" : "□"} ログインする +10pt</p>
          <p>□ ワインクイズに挑戦 +30pt</p>
          <p>□ ワインを記録する +50pt</p>
        </div>
      </section>
      <Link
  href="/points"
  className="block rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
>
  <h2 className="font-bold">ポイント履歴</h2>
  <p className="mt-1 text-sm text-gray-500">
    獲得したポイントを確認する
  </p>
</Link>
{profile?.role === "admin" && (
  <Link
    href="/admin"
    className="block rounded-3xl bg-red-900 p-4 text-white shadow-sm"
  >
    <h2 className="font-bold">管理者画面</h2>
    <p className="mt-1 text-sm text-white/80">
      ワイン・クイズ・ユーザー情報を管理する
    </p>
  </Link>
)}
    </div>
  );
}