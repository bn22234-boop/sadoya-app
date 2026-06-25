"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Quiz = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  correct_option: string;
  explanation: string | null;
  points: number;
};

export default function QuizPage() {
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [resultText, setResultText] = useState("");

  useEffect(() => {
    loadDailyQuiz();
  }, []);

  async function loadDailyQuiz() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      alert("ログインしてください");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase.rpc("get_daily_quiz", {
      p_profile_id: userId,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!data?.id) {
      setQuiz(null);
      setLoading(false);
      return;
    }

    setQuiz(data);
    setLoading(false);
  }

  async function answer(option: string) {
    if (!quiz || answered) return;

    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      alert("ログインしてください");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase.rpc("complete_daily_quiz", {
      p_profile_id: userId,
      p_quiz_id: quiz.id,
      p_selected_option: option,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setAnswered(true);

    if (data.already_completed) {
      setResultText("今日はすでにクイズに回答済みです。");
      return;
    }

    if (data.is_correct) {
      setResultText(`正解！ +${data.points}pt 獲得しました！`);
    } else {
      setResultText("不正解！また明日チャレンジしよう。");
    }
  }

  if (loading) {
    return <div className="p-5">読み込み中...</div>;
  }

  if (!quiz) {
    return (
      <div className="space-y-5 p-5">
        <section className="rounded-3xl bg-red-900 p-5 text-white">
          <p className="text-sm opacity-80">Wine Quiz</p>
          <h1 className="mt-1 text-2xl font-bold">今日のクイズ</h1>
        </section>

        <section className="rounded-3xl bg-white p-5 text-center text-gray-900">
          <p className="font-bold">今日はすでに回答済みです。</p>
          <p className="mt-2 text-sm text-gray-500">
            毎日AM4:00に新しいクイズへ切り替わります。
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-5 w-full rounded-2xl bg-red-800 py-3 font-bold text-white"
          >
            ホームへ戻る
          </button>
        </section>
      </div>
    );
  }

  const options = [
    { key: "A", text: quiz.option_a },
    { key: "B", text: quiz.option_b },
    { key: "C", text: quiz.option_c },
  ];

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">Daily Wine Quiz</p>
        <h1 className="mt-1 text-2xl font-bold">今日のワインクイズ</h1>
        <p className="mt-2 text-sm opacity-90">
          1日1問。正解するとポイントが貯まります。
        </p>
      </section>

      <section className="rounded-3xl bg-orange-50 p-5 text-gray-900">
        <p className="text-sm text-gray-500">今日の問題</p>
        <h2 className="mt-2 text-xl font-bold text-red-900">
          {quiz.question}
        </h2>
      </section>

      <section className="space-y-3">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => answer(option.key)}
            disabled={answered}
            className="w-full rounded-3xl border border-red-100 bg-white p-4 text-left font-bold text-gray-900 shadow-sm disabled:opacity-60"
          >
            {option.key}. {option.text}
          </button>
        ))}
      </section>

      {answered && (
        <section className="rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
          <h2 className="text-xl font-bold text-red-900">
            {resultText}
          </h2>

          {quiz.explanation && (
            <p className="mt-3 text-sm text-gray-600">
              {quiz.explanation}
            </p>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-5 w-full rounded-2xl bg-red-800 py-3 font-bold text-white"
          >
            ホームへ戻る
          </button>
        </section>
      )}
    </div>
  );
}