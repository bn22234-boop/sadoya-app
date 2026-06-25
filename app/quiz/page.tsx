"use client";

import { useEffect, useState } from "react";
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
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    const { data, error } = await supabase
      .from("wine_quizzes")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }

    setQuizzes(data ?? []);
    setLoading(false);
  }

  async function answer(option: string) {
    if (answered) return;

    const quiz = quizzes[currentIndex];
    const correct = option === quiz.correct_option;

    setSelectedOption(option);
    setAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      const userId = localStorage.getItem("sadoya_user_id");

      if (userId) {
        await supabase.rpc("complete_quiz", {
          p_profile_id: userId,
          p_quiz_id: quiz.id,
          p_points: quiz.points,
        });
      }
    }
  }

  function nextQuiz() {
    setSelectedOption("");
    setAnswered(false);
    setIsCorrect(false);

    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  }

  if (loading) {
    return <div className="p-5">読み込み中...</div>;
  }

  if (quizzes.length === 0) {
    return (
      <div className="p-5">
        <p>クイズが登録されていません。</p>
      </div>
    );
  }

  const quiz = quizzes[currentIndex];

  const options = [
    { key: "A", text: quiz.option_a },
    { key: "B", text: quiz.option_b },
    { key: "C", text: quiz.option_c },
  ];

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">Wine Quiz</p>
        <h1 className="mt-1 text-2xl font-bold">ワインクイズ</h1>
        <p className="mt-2 text-sm opacity-90">
          正解するとポイントが貯まり、サドヤんが成長します。
        </p>
      </section>

      <section className="rounded-3xl bg-orange-50 p-4 text-gray-900">
        <p className="text-sm text-gray-500">
          第 {currentIndex + 1} 問 / {quizzes.length} 問
        </p>
        <h2 className="mt-2 text-xl font-bold text-red-900">
          {quiz.question}
        </h2>
      </section>

      <section className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.key;
          const isAnswer = quiz.correct_option === option.key;

          let className =
            "w-full rounded-3xl border p-4 text-left font-bold shadow-sm";

          if (!answered) {
            className += " border-red-100 bg-white text-gray-900";
          } else if (isAnswer) {
            className += " border-green-300 bg-green-50 text-green-700";
          } else if (isSelected && !isAnswer) {
            className += " border-red-300 bg-red-50 text-red-700";
          } else {
            className += " border-gray-100 bg-white text-gray-400";
          }

          return (
            <button
              key={option.key}
              onClick={() => answer(option.key)}
              className={className}
            >
              {option.key}. {option.text}
            </button>
          );
        })}
      </section>

      {answered && (
        <section className="rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
          <h2
            className={`text-xl font-bold ${
              isCorrect ? "text-green-700" : "text-red-700"
            }`}
          >
            {isCorrect ? `正解！ +${quiz.points}pt` : "不正解"}
          </h2>

          {quiz.explanation && (
            <p className="mt-3 text-sm text-gray-600">
              {quiz.explanation}
            </p>
          )}

          <button
            onClick={nextQuiz}
            className="mt-5 w-full rounded-2xl bg-red-800 py-3 font-bold text-white"
          >
            次の問題へ
          </button>
        </section>
      )}
    </div>
  );
}