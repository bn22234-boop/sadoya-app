"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  tutorial_completed: boolean;
  character_stage?: number;
  has_sadoyan_seed?: boolean;
};

type LoggedInHomeProps = {
  profile: Profile;
  onLogout: () => void;
};

export default function HomePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userId = localStorage.getItem("sadoya_user_id");

    // 未ログインならWelcome画面
    if (!userId) {
      setProfile(null);
      setCheckingLogin(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        login_id,
        name,
        points,
        level,
        role,
        tutorial_completed,
        character_stage,
        has_sadoyan_seed
        `
      )
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(
        "プロフィール取得エラー:",
        error?.message
      );

      localStorage.removeItem("sadoya_user_id");
      localStorage.removeItem("sadoya_login_id");

      window.dispatchEvent(
        new Event("sadoya-auth-changed")
      );

      setProfile(null);
      setCheckingLogin(false);
      return;
    }

    // チュートリアル未完了ならTutorialへ
    if (!data.tutorial_completed) {
      router.replace("/tutorial");
      return;
    }

    setProfile(data);
    setCheckingLogin(false);
  }

  function logout() {
    localStorage.removeItem("sadoya_user_id");
    localStorage.removeItem("sadoya_login_id");

    window.dispatchEvent(
      new Event("sadoya-auth-changed")
    );

    setProfile(null);
    router.replace("/");
    router.refresh();
  }

  if (checkingLogin) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <WelcomePage />;
  }

  return (
    <LoggedInHome
      profile={profile}
      onLogout={logout}
    />
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
      <div className="text-center">
        <div className="animate-bounce text-6xl">
          🍇
        </div>

        <p className="mt-5 text-sm font-bold text-red-900">
          SADOYA Wine App
        </p>

        <p className="mt-2 text-sm text-gray-500">
          読み込んでいます...
        </p>
      </div>
    </main>
  );
}

function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/wine.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-red-950/90" />

      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-10 pt-16 text-white">
        <div className="mx-auto w-full max-w-md">
          <section className="mb-8 text-center">
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
          </section>

          <section className="space-y-3 rounded-[2rem] border border-white/30 bg-white/90 p-5 text-gray-900 shadow-2xl backdrop-blur-md">
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
          </section>

          <section className="mt-7 grid grid-cols-3 gap-2 text-center text-xs text-white/90">
            <div className="rounded-2xl bg-black/25 px-2 py-3 backdrop-blur-sm">
              <div className="text-2xl">
                🍷
              </div>

              <p className="mt-1">
                ワインを知る
              </p>
            </div>

            <div className="rounded-2xl bg-black/25 px-2 py-3 backdrop-blur-sm">
              <div className="text-2xl">
                📝
              </div>

              <p className="mt-1">
                記録を残す
              </p>
            </div>

            <div className="rounded-2xl bg-black/25 px-2 py-3 backdrop-blur-sm">
              <div className="text-2xl">
                🌱
              </div>

              <p className="mt-1">
                サドヤんを育てる
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function LoggedInHome({
  profile,
  onLogout,
}: LoggedInHomeProps) {
  const points = profile.points ?? 0;

  // 0〜99ptはサドヤんの種
  const isSeedStage = points < 100;

  // 100ptで子供サドヤんLv.1
  const level = isSeedStage
    ? 0
    : Math.floor((points - 100) / 100) + 1;

  // 現在の段階における進捗
  const stageProgress = isSeedStage
    ? points
    : (points - 100) % 100;

  // 次の成長まで
  const nextPoint =
    stageProgress === 0 && !isSeedStage
      ? 100
      : 100 - stageProgress;

  const progress = stageProgress;

  const stageLabel = isSeedStage
    ? "Stage 0"
    : `Stage ${level}`;

  const characterName = isSeedStage
    ? "サドヤんの種"
    : `子供サドヤん Lv.${level}`;

  const seedMessages = [
    `あと${nextPoint}ptでぼくが生まれるよ！`,
    "今日も少しずつ育ててね！",
    "ミッションに挑戦してみよう！",
  ];

  const childMessages = [
    `あと${nextPoint}ptで次の成長だよ！`,
    "今日も会いに来てくれてありがとう！",
    "ワインクイズに挑戦してみない？",
  ];

  const messages = isSeedStage
    ? seedMessages
    : childMessages;

  const message =
    messages[new Date().getDate() % messages.length];

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

            <p className="max-w-[100px] truncate font-bold text-white">
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
        <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-left shadow-sm">
          <p className="text-sm font-bold text-red-900">
            サドヤん
          </p>

          <p className="mt-1 text-sm text-gray-600">
            「{message}」
          </p>
        </div>

        <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-inner">
          {isSeedStage ? (
            <div className="text-center">
              <div className="animate-pulse text-7xl">
                🌱
              </div>

              <p className="mt-2 text-xs font-bold text-green-700">
                大切に育てよう
              </p>
            </div>
          ) : (
            <Image
              src="/images/sadoyan.png"
              alt="子供サドヤん"
              width={140}
              height={140}
              priority
              className="object-contain"
            />
          )}
        </div>

        <p className="mt-4 text-sm font-bold text-red-700">
          {stageLabel}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          {characterName}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {isSeedStage
            ? `発芽まであと ${nextPoint}pt`
            : `現在 ${points}pt / 次の成長まで ${nextPoint}pt`}
        </p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-red-100">
          <div
            className="h-full rounded-full bg-red-700 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs font-bold text-red-700">
          {progress} / 100pt
        </p>
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
          <p>
            ✅ ログインする
            <span className="float-right font-bold text-red-700">
              +10pt
            </span>
          </p>

          <p>
            □ ワインクイズに挑戦
            <span className="float-right font-bold text-red-700">
              +30pt
            </span>
          </p>

          <p>
            □ ワインを記録する
            <span className="float-right font-bold text-red-700">
              +50pt
            </span>
          </p>
        </div>

        <Link
          href="/missions"
          className="mt-4 block rounded-2xl border border-red-200 py-3 text-center text-sm font-bold text-red-800"
        >
          ミッションを見る
        </Link>
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