"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Wine = {
  id: string;
  name: string;
};

export default function NewTimelinePostPage() {
  const router = useRouter();

  const [wines, setWines] = useState<Wine[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [selectedWineId, setSelectedWineId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    const savedUserId = localStorage.getItem("sadoya_user_id");

    if (!savedUserId) {
      alert("投稿するにはログインが必要です");
      router.replace("/login");
      return;
    }

    setUserId(savedUserId);

    const { data, error } = await supabase
      .from("wines")
      .select("id, name")
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "ワイン一覧取得エラー:",
        error.message
      );

      alert("ワイン一覧の取得に失敗しました");
      setLoading(false);
      return;
    }

    setWines((data ?? []) as Wine[]);
    setLoading(false);
  }

  async function submitPost() {
    if (!userId) {
      alert("ログイン情報が見つかりません");
      return;
    }

    if (!selectedWineId) {
      alert("ワインを選択してください");
      return;
    }

    const selectedWine = wines.find(
      (wine) => wine.id === selectedWineId
    );

    if (!selectedWine) {
      alert("選択したワインが見つかりません");
      return;
    }

    if (!comment.trim()) {
      alert("感想を入力してください");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("timeline_posts")
      .insert({
        user_id: userId,
        wine_id: selectedWine.id,
        wine_name: selectedWine.name,
        rating,
        comment: comment.trim(),
        image_url: null,
        is_public: true,
      });

    setSaving(false);

    if (error) {
      console.error(
        "タイムライン投稿エラー:",
        error
      );

      alert(error.message);
      return;
    }

    router.replace("/timeline");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="animate-bounce text-5xl">
            🍷
          </div>

          <p className="mt-4 text-sm font-bold text-red-900">
            投稿画面を準備しています...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-5 bg-[#fffaf6] p-5 pb-28 text-gray-900">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-950">
          新しい投稿
        </h1>

        <Link
          href="/timeline"
          className="text-sm font-bold text-red-700"
        >
          キャンセル
        </Link>
      </header>

      <section className="rounded-3xl bg-red-900 p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">
          ワインの感想を共有しよう
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/80">
          飲んだワインの評価や感想を、
          タイムラインへ投稿できます。
        </p>
      </section>

      <section className="space-y-5 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <div>
          <label
            htmlFor="wine"
            className="text-sm font-bold text-red-900"
          >
            飲んだワイン
          </label>

          <select
            id="wine"
            value={selectedWineId}
            onChange={(event) =>
              setSelectedWineId(event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 outline-none focus:border-red-700"
          >
            <option value="">
              ワインを選択してください
            </option>

            {wines.map((wine) => (
              <option
                key={wine.id}
                value={wine.id}
              >
                {wine.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-bold text-red-900">
            評価
          </p>

          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setRating(score)}
                className="text-4xl text-yellow-500"
                aria-label={`評価${score}`}
              >
                {score <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="text-sm font-bold text-red-900"
          >
            感想
          </label>

          <textarea
            id="comment"
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            placeholder="味わいや香り、一緒に食べた料理などを書いてみよう。"
            maxLength={300}
            className="mt-2 h-40 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 outline-none focus:border-red-700"
          />

          <p className="mt-2 text-right text-xs text-gray-400">
            {comment.length} / 300
          </p>
        </div>

        <button
          type="button"
          onClick={submitPost}
          disabled={saving}
          className="w-full rounded-2xl bg-red-900 py-4 font-bold text-white shadow-lg disabled:opacity-50"
        >
          {saving
            ? "投稿中..."
            : "タイムラインへ投稿する"}
        </button>
      </section>
    </main>
  );
}