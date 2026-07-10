"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TutorialStep = {
  title: string;
  message: string;
  image?: string;
  emoji?: string;
};

const tutorialSteps: TutorialStep[] = [
  {
    title: "はじめまして！",
    message:
      "ぼくはサドヤん！これから君と一緒に、ワインの世界を楽しんでいくよ。",
    image: "/images/sadoyan.png",
  },
  {
    title: "ワインを知ろう",
    message:
      "サドヤのワインを見たり、クイズに挑戦したりしながら、ワインについて楽しく学べるよ。",
    emoji: "🍷",
  },
  {
    title: "ミッションに挑戦",
    message:
      "毎日のミッションをクリアするとポイントがもらえるよ。ポイントを集めて、ぼくを成長させてね！",
    emoji: "🎯",
  },
  {
    title: "ワインの思い出を記録",
    message:
      "飲んだワインの評価や感想を記録できるよ。お気に入りのワインをたくさん見つけよう！",
    emoji: "📝",
  },
  {
    title: "一緒に始めよう！",
    message:
      "ブドウを育てて、収穫して、いつか素敵なワインを完成させよう。君との物語が、ここから始まるよ！",
    image: "/images/sadoyan.png",
  },
];

export default function TutorialPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [checkingUser, setCheckingUser] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("tutorial_completed")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(
        "チュートリアル情報の取得に失敗しました:",
        error?.message
      );
      router.replace("/");
      return;
    }

    // すでに完了している場合は通常ホームへ
    if (data.tutorial_completed) {
      router.replace("/");
      return;
    }

    setCheckingUser(false);
  }

  function goNext() {
    if (isLastStep) {
      finishTutorial();
      return;
    }

    setCurrentStep((previousStep) => previousStep + 1);
  }

  function goBack() {
    if (currentStep === 0) return;

    setCurrentStep((previousStep) => previousStep - 1);
  }

  async function finishTutorial() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      router.replace("/login");
      return;
    }

    setFinishing(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        tutorial_completed: true,
      })
      .eq("id", userId);

    if (error) {
      console.error(
        "チュートリアル完了処理に失敗しました:",
        error.message
      );
      alert("チュートリアルの保存に失敗しました");
      setFinishing(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="animate-bounce text-6xl">🍇</div>

          <p className="mt-4 text-sm font-bold text-red-900">
            サドヤんが準備しています...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#fffaf6] px-6 pb-8 pt-8 text-gray-900">
      {/* 背景装飾 */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-100/70" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-100/70" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* 上部 */}
        <header className="flex items-center justify-between">
          <p className="text-sm font-bold tracking-[0.12em] text-red-900">
            SADOYA WINE APP
          </p>

          <p className="text-sm font-bold text-gray-400">
            {currentStep + 1} / {tutorialSteps.length}
          </p>
        </header>

        {/* プログレスバー */}
        <div className="mt-4 flex gap-2">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                index <= currentStep ? "bg-red-800" : "bg-red-100"
              }`}
            />
          ))}
        </div>

        {/* メインカード */}
        <section className="my-auto py-10">
          <div className="rounded-[2rem] border border-red-100 bg-white p-7 text-center shadow-xl">
            <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-red-50 shadow-inner">
              {step.image ? (
                <Image
                  src={step.image}
                  alt="サドヤん"
                  width={170}
                  height={170}
                  priority
                  className="object-contain"
                />
              ) : (
                <span className="text-8xl">{step.emoji}</span>
              )}
            </div>

            <h1 className="mt-7 text-3xl font-bold text-red-950">
              {step.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-600">
              {step.message}
            </p>

            {currentStep === 2 && (
              <div className="mt-6 space-y-2 text-left text-sm">
                <div className="rounded-2xl bg-red-50 px-4 py-3">
                  ✅ ログインする
                  <span className="float-right font-bold text-red-800">
                    +10pt
                  </span>
                </div>

                <div className="rounded-2xl bg-red-50 px-4 py-3">
                  □ クイズに挑戦する
                  <span className="float-right font-bold text-red-800">
                    +30pt
                  </span>
                </div>

                <div className="rounded-2xl bg-red-50 px-4 py-3">
                  □ ワインを記録する
                  <span className="float-right font-bold text-red-800">
                    +50pt
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 操作ボタン */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={goNext}
            disabled={finishing}
            className="w-full rounded-2xl bg-red-900 py-4 font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            {finishing
              ? "準備中..."
              : isLastStep
                ? "サドヤんと始める"
                : "次へ"}
          </button>

          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={finishing}
              className="w-full py-2 text-sm font-bold text-red-800 disabled:opacity-50"
            >
              前へ戻る
            </button>
          )}
        </div>
      </div>
    </main>
  );
}