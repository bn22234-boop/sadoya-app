"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  display_order: number;
  is_active: boolean;
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState("30");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      alert("ログインしてください");
      location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role !== "admin") {
      alert("管理者権限が必要です");
      location.href = "/";
      return;
    }

    loadQuizzes();
  }

  async function loadQuizzes() {
    const { data, error } = await supabase
      .from("wine_quizzes")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setQuizzes(data ?? []);
  }

  function resetForm() {
    setEditingQuiz(null);
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setCorrectOption("A");
    setExplanation("");
    setPoints("30");
    setShowForm(false);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(quiz: Quiz) {
    setEditingQuiz(quiz);
    setQuestion(quiz.question);
    setOptionA(quiz.option_a);
    setOptionB(quiz.option_b);
    setOptionC(quiz.option_c);
    setCorrectOption(quiz.correct_option);
    setExplanation(quiz.explanation ?? "");
    setPoints(String(quiz.points));
    setShowForm(true);
  }

  async function saveQuiz() {
    if (!question || !optionA || !optionB || !optionC) {
      alert("問題文と選択肢をすべて入力してください");
      return;
    }

    setSaving(true);

    const payload = {
      question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      correct_option: correctOption,
      explanation,
      points: Number(points),
    };

    const { error } = editingQuiz
      ? await supabase
          .from("wine_quizzes")
          .update(payload)
          .eq("id", editingQuiz.id)
      : await supabase.from("wine_quizzes").insert({
          ...payload,
          wine_id: null,
          display_order: quizzes.length + 1,
          is_active: true,
        });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    resetForm();
    loadQuizzes();
  }

  async function toggleActive(quiz: Quiz) {
    const { error } = await supabase
      .from("wine_quizzes")
      .update({ is_active: !quiz.is_active })
      .eq("id", quiz.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadQuizzes();
  }

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">Admin / Quizzes</p>
        <h1 className="mt-1 text-2xl font-bold">クイズ管理</h1>
        <p className="mt-2 text-sm opacity-90">
          ワインクイズの追加・編集・公開状態の切り替えを行います。
        </p>
      </section>

      <Link
        href="/admin"
        className="block rounded-2xl border border-red-100 bg-white py-3 text-center font-bold text-red-900"
      >
        管理者ダッシュボードへ戻る
      </Link>

      <button
        onClick={showForm ? resetForm : startCreate}
        className="w-full rounded-3xl bg-red-700 py-4 font-bold text-white shadow"
      >
        {showForm ? "フォームを閉じる" : "＋ 新しいクイズを追加"}
      </button>

      {showForm && (
        <section className="space-y-4 rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
          <h2 className="font-bold text-red-900">
            {editingQuiz ? "クイズを編集" : "新しいクイズを追加"}
          </h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="問題文"
            className="h-24 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <input
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder="選択肢A"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <input
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder="選択肢B"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <input
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
            placeholder="選択肢C"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <select
            value={correctOption}
            onChange={(e) => setCorrectOption(e.target.value)}
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          >
            <option value="A">正解：A</option>
            <option value="B">正解：B</option>
            <option value="C">正解：C</option>
          </select>

          <input
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="獲得ポイント"
            type="number"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="解説"
            className="h-28 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <button
            onClick={saveQuiz}
            disabled={saving}
            className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : editingQuiz ? "変更を保存" : "クイズを保存"}
          </button>
        </section>
      )}

      <section className="rounded-3xl bg-orange-50 p-4 text-gray-900">
        <p className="text-sm text-gray-500">登録クイズ数</p>
        <p className="mt-1 text-3xl font-bold text-red-900">
          {quizzes.length}問
        </p>
      </section>

      <section className="space-y-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-bold text-red-700">
                  {quiz.points}pt
                </p>

                <h2 className="mt-1 font-bold">
                  {quiz.question}
                </h2>

                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <p>A. {quiz.option_a}</p>
                  <p>B. {quiz.option_b}</p>
                  <p>C. {quiz.option_c}</p>
                </div>

                <p className="mt-2 text-xs text-green-700">
                  正解：{quiz.correct_option}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {quiz.is_active ? "公開中" : "非公開"}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => startEdit(quiz)}
                  className="block rounded-2xl bg-red-800 px-4 py-2 text-sm font-bold text-white"
                >
                  編集
                </button>

                <button
                  onClick={() => toggleActive(quiz)}
                  className={`block rounded-2xl px-4 py-2 text-sm font-bold ${
                    quiz.is_active
                      ? "bg-gray-100 text-gray-600"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  {quiz.is_active ? "非公開" : "公開"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}