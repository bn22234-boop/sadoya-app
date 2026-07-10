"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TutorialStep = {
  title: string;
  message: string;
  type: "sadoyan" | "wine" | "growth" | "seed" | "start";
};

const tutorialSteps: TutorialStep[] = [
  {
    title: "ワインの世界へようこそ！",
    message:
      "こんにちは！ぼくはサドヤん。これから君と一緒に、ワインの世界を旅していくよ！",
    type: "sadoyan",
  },
  {
    title: "ワインを楽しもう",
    message:
      "サドヤのワインを知ったり、飲んだワインを記録したり、クイズで楽しく学んだりできるよ。",
    type: "wine",
  },
  {
    title: "一緒に成長しよう",
    message:
      "ミッションやクイズに挑戦すると、ぼくは少しずつ成長していくよ。毎日一緒に頑張ろう！",
    type: "growth",
  },
  {
    title: "君に渡したいもの",
    message:
      "これは、ぼくが生まれる特別なブドウの種。君の力で、大切に育ててくれる？",
    type: "seed",
  },
  {
    title: "物語の始まり",
    message:
      "ぼくはまだ小さな種。でも、君と一緒なら立派なサドヤんになれる。今日からよろしくね！",
    type: "start",
  },
];

export default function TutorialPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [checkingUser, setCheckingUser] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [seedReceived, setSeedReceived] = useState(false);

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
      console.error("ユーザー情報取得エラー:", error?.message);
      router.replace("/");
      return;
    }

    if (data.tutorial_completed) {
      router.replace("/");
      return;
    }

    setCheckingUser(false);
  }

  function goNext() {
    if (step.type === "seed" && !seedReceived) {
      setSeedReceived(true);

      window.setTimeout(() => {
        setCurrentStep((previous) => previous + 1);
      }, 900);

      return;
    }

    if (isLastStep) {
      finishTutorial();
      return;
    }

    setCurrentStep((previous) => previous + 1);
  }

  function goBack() {
    if (currentStep === 0 || finishing) return;

    setSeedReceived(false);
    setCurrentStep((previous) => previous - 1);
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
      console.error("チュートリアル保存エラー:", error.message);
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
    <main className="relative flex min-h-screen overflow-hidden bg-[#fffaf6] px-6 pb-8 pt-8 text-gray-900">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-100/70" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-orange-100/70" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.18em] text-red-900">
            SADOYA WINE APP
          </p>

          <p className="text-sm font-bold text-gray-400">
            {currentStep + 1} / {tutorialSteps.length}
          </p>
        </header>

        <div className="mt-4 flex gap-2">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                index <= currentStep ? "bg-red-800" : "bg-red-100"
              }`}
            />
          ))}
        </div>

        <section className="my-auto py-8">
          <div className="rounded-[2rem] border border-red-100 bg-white p-7 text-center shadow-xl">
            <TutorialVisual
              type={step.type}
              seedReceived={seedReceived}
            />

            <h1 className="mt-7 text-3xl font-bold leading-tight text-red-950">
              {step.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-600">
              {step.message}
            </p>

            {step.type === "wine" && (
              <div className="mt-6 grid grid-cols-3 gap-2 text-xs font-bold">
                <div className="rounded-2xl bg-red-50 px-2 py-4 text-red-900">
                  <div className="text-3xl">🍷</div>
                  <p className="mt-2">ワインを知る</p>
                </div>

                <div className="rounded-2xl bg-red-50 px-2 py-4 text-red-900">
                  <div className="text-3xl">📝</div>
                  <p className="mt-2">記録する</p>
                </div>

                <div className="rounded-2xl bg-red-50 px-2 py-4 text-red-900">
                  <div className="text-3xl">❓</div>
                  <p className="mt-2">クイズに挑戦</p>
                </div>
              </div>
            )}

            {step.type === "growth" && (
              <div className="mt-6 rounded-2xl bg-red-50 p-4">
                <div className="flex items-center justify-center gap-2 text-3xl">
                  <span>🌱</span>
                  <span className="text-lg text-red-400">→</span>
                  <span>👶</span>
                  <span className="text-lg text-red-400">→</span>
                  <span>🍇</span>
                  <span className="text-lg text-red-400">→</span>
                  <span>🍷</span>
                </div>

                <p className="mt-3 text-xs font-bold text-red-900">
                  挑戦するほどサドヤんが成長！
                </p>
              </div>
            )}

            {step.type === "seed" && seedReceived && (
              <div className="mt-5 animate-pulse rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800">
                サドヤんの種を手に入れた！
              </div>
            )}

            {step.type === "start" && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-[#fffaf6] p-4">
                <p className="text-xs font-bold text-gray-500">
                  あなたの最初のサドヤん
                </p>

                <p className="mt-2 text-lg font-bold text-red-950">
                  🌱 サドヤんの種
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  100ptで子供サドヤんが誕生します
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={goNext}
            disabled={finishing || (step.type === "seed" && seedReceived)}
            className="w-full rounded-2xl bg-red-900 py-4 font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60"
          >
            {finishing
              ? "物語を準備しています..."
              : step.type === "seed"
                ? seedReceived
                  ? "種を受け取りました"
                  : "🌱 サドヤんの種を受け取る"
                : isLastStep
                  ? "サドヤんと一緒に始める"
                  : "次へ"}
          </button>

          {currentStep > 0 && step.type !== "seed" && (
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

type TutorialVisualProps = {
  type: TutorialStep["type"];
  seedReceived: boolean;
};

function TutorialVisual({
  type,
  seedReceived,
}: TutorialVisualProps) {
  if (type === "sadoyan") {
    return (
      <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-red-50 shadow-inner">
        <Image
          src="/images/sadoyan.png"
          alt="サドヤん"
          width={170}
          height={170}
          priority
          className="object-contain"
        />
      </div>
    );
  }

  if (type === "wine") {
    return (
      <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-red-50 text-8xl shadow-inner">
        🍷
      </div>
    );
  }

  if (type === "growth") {
    return (
      <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-green-50 text-8xl shadow-inner">
        🌱
      </div>
    );
  }

  if (type === "seed") {
    return (
      <div
        className={`mx-auto flex h-52 w-52 items-center justify-center rounded-full shadow-inner transition-all duration-700 ${
          seedReceived
            ? "scale-110 bg-yellow-50 shadow-yellow-200"
            : "bg-red-50"
        }`}
      >
        <div
          className={`transition-all duration-700 ${
            seedReceived
              ? "scale-125 animate-bounce"
              : "scale-100"
          }`}
        >
          <div className="text-8xl">🌱</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-green-50 text-8xl shadow-inner">
      🌱
    </div>
  );
}