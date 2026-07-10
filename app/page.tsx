"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userId = localStorage.getItem("sadoya_user_id");

    // 未ログインならウェルカム画面を表示
    if (!userId) {
      setCheckingLogin(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, login_id, name, points, level, role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("プロフィール取得エラー:", error?.message);

      // 保存されたIDが無効ならログイン情報を削除
      localStorage.removeItem("sadoya_user_id");
      localStorage.removeItem("sadoya_login_id");

      setProfile(null);
      setCheckingLogin(false);
      return;
    }

    setProfile(data);
    setCheckingLogin(false);
  }

  function logout() {
    localStorage.removeItem("sadoya_user_id");
    localStorage.removeItem("sadoya_login_id");
    setProfile(null);
  }

  // ログイン状態を確認している間の画面
  if (checkingLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="animate-bounce text-6xl">🍇</div>

          <p className="mt-5 text-sm font-bold text-red-900">
            SADOYA Wine App
          </p>

          <p className="mt-2 text-sm text-gray-500">
            読み込んでいます...
          </p>
        </div>
      </div>
    );
  }

  // 未ログイン時はウェルカム画面
  if (!profile) {
    return <WelcomePage />;
  }

  // ログイン済みなら通常ホーム
  return <LoggedInHome profile={profile} onLogout={logout} />;
}

function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {"sadoya-login.jpg"}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/wine.jpg')",
        }}
      />

      {/* 写真を少し暗くして文字を読みやすくする */}
      <div className="absolute inset-0 bg-black/35" />

      {/* 下側をワイン色にするグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-red-950/90" />

      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-10 pt-16 text-white">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/20 text-5xl shadow-xl backdrop-blur-md">
              🍇
            </div>

            <p className="mt-5 text-sm font-bold tracking-[0.18em] text-white/90">
              SADOYA WINE APP
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              ワインの世界へ
              <br />
              ようこそ
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/90">
              サドヤんと一緒に、
              <br />
              ワインを知って、楽しんで、育てよう。
            </p>
          </div>

          <div className="space-y-3 rounded-[2rem] border border-white/30 bg-white/90 p-5 text-gray-900 shadow-2xl backdrop-blur-md">
            <Link
              href="/signup"
              className="block w-full rounded-2xl bg-red-900 py-4 text-center font-bold text-white shadow-md transition active:scale-[0.98]"
            >
              初めての方はこちら
              <span className="mt-1 block text-xs font-normal text-white/80">
                新規登録
              </span>
            </Link>

            <Link
              href="/login"
              className="block w-full rounded-2xl border border-red-200 bg-white py-4 text-center font-bold text-red-950 transition active:scale-[0.98]"
            >
              アカウントをお持ちの方
              <span className="mt-1 block text-xs font-normal text-gray-500">
                ログイン
              </span>
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 text-center text-xs text-white/90">
            <div className="rounded-2xl bg-black/25 px-2 py-3 backdrop-blur-sm">
              <div className="text-2xl">🍷</div>
              <p className="mt-1">ワインを知る</p>
            </div>

            <div className="rounded-2xl bg-black/25 px-2 py-3 backdrop-blur-sm">
              <div className="text-2xl">📝</div>
              <p className="mt-1">記録を残す</p>
            </div>

            <div className="rounded-2xl bg-black/25 px-2 py-3 backdrop-blur-sm">
              <div className="text-2xl">🍇</div>
              <p className="mt-1">サドヤんを育てる</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

type LoggedInHomeProps = {
  profile: Profile;
  onLogout: () => void;
};

function LoggedInHome({
  profile,
  onLogout,
}: LoggedInHomeProps) {
  const points = profile.points ?? 0;

  // 100ポイントごとにレベルアップ
  const level = Math.floor(points / 100) + 1;

  // 次のレベルまでに必要なポイント
  const pointRemainder = points % 100;
  const nextPoint = pointRemainder === 0 && points > 0
    ? 100
    : 100 - pointRemainder;

  // プログレスバー
  const progress = pointRemainder;

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-gradient-to-br from-red-900 to-red-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">
              SADOYA Wine App
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              サドヤんと一緒に
              <br />
              ワインを楽しもう
            </h1>

            <p className="mt-2 text-sm text-white/80">
              こんにちは、{profile.name}さん
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-white/70">
              ログイン中
            </p>

            <p className="font-bold text-white">
              {profile.login_id}
            </p>

            <button
              type="button"
              onClick={onLogout}
              className="mt-2 rounded-xl bg-white px-3 py-1 text-xs font-bold text-red-900"
            >
              ログアウト
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-red-50 p-5 text-center">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-inner">
          <Image
            src="/images/sadoyan.png"
            alt="サドヤん"
            width={130}
            height={130}
            priority
            className="object-contain"
          />
        </div>

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          サドヤん Lv.{level}
        </h2>

        <p className="text-sm text-gray-500">
          現在 {points}pt / 次のLvまで {nextPoint}pt
        </p>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-red-100">
          <div
            className="h-full rounded-full bg-red-700 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">
          今日のおすすめワイン
        </h2>

        <div className="mt-3 flex gap-3">
          <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-4xl">
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

        <Link
          href="/wine"
          className="mt-4 block rounded-2xl bg-red-800 py-3 text-center text-sm font-bold text-white"
        >
          ワインリストを見る
        </Link>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">
          今日のミッション
        </h2>

        <div className="mt-3 space-y-2 text-sm">
          <p>✅ ログインする +10pt</p>
          <p>□ ワインクイズに挑戦 +30pt</p>
          <p>□ ワインを記録する +50pt</p>
        </div>
      </section>

      <Link
        href="/points"
        className="block rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
      >
        <h2 className="font-bold">
          ポイント履歴
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          獲得したポイントを確認する
        </p>
      </Link>

      {profile.role === "admin" && (
        <Link
          href="/admin"
          className="block rounded-3xl bg-red-900 p-4 text-white shadow-sm"
        >
          <h2 className="font-bold">
            管理者画面
          </h2>

          <p className="mt-1 text-sm text-white/80">
            ワイン・クイズ・ユーザー情報を管理する
          </p>
        </Link>
      )}
    </div>
  );
}