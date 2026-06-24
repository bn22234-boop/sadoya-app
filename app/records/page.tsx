"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WineRecord = {
  id: string;
  wine_name: string;
  rating: number;
  memo: string | null;
  created_at: string;
};

export default function RecordsPage() {
  const [records, setRecords] = useState<WineRecord[]>([]);
  const [wineName, setWineName] = useState("");
  const [rating, setRating] = useState(5);
  const [memo, setMemo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) return;

    const { data, error } = await supabase
      .from("wine_records")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      return;
    }

    setRecords(data ?? []);
  }

  async function saveRecord() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      alert("ログインしてください");
      return;
    }

    if (!wineName) {
      alert("ワイン名を入力してください");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc("add_wine_record", {
      p_profile_id: userId,
      p_wine_name: wineName,
      p_rating: rating,
      p_memo: memo,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (data === true) {
      alert("記録しました！ +50pt");
      setWineName("");
      setRating(5);
      setMemo("");
      setShowForm(false);
      loadRecords();
    }
  }

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">My Wine Log</p>
        <h1 className="mt-1 text-2xl font-bold">ワイン記録</h1>
        <p className="mt-2 text-sm opacity-90">
          飲んだワインを記録して、自分だけのワイン図鑑を作ろう。
        </p>
      </section>

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full rounded-3xl bg-red-700 py-4 font-bold text-white shadow"
      >
        {showForm ? "閉じる" : "＋ 新しく記録する"}
      </button>

      {showForm && (
        <section className="space-y-4 rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
          <div>
            <label className="text-sm font-bold text-red-900">
              ワイン名
            </label>
            <input
              value={wineName}
              onChange={(e) => setWineName(e.target.value)}
              placeholder="例：サドヤ オルロージュ"
              className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-red-900">
              評価
            </p>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl"
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-red-900">
              感想
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="味・香り・飲みやすさなど"
              className="mt-2 h-28 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={saveRecord}
            disabled={saving}
            className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : "記録して +50pt"}
          </button>
        </section>
      )}

      <section className="rounded-3xl bg-orange-50 p-4 text-gray-900">
        <p className="text-sm text-gray-500">これまでに飲んだワイン</p>
        <p className="mt-1 text-3xl font-bold text-red-900">
          {records.length}本
        </p>
      </section>

      <section className="space-y-3">
        {records.length === 0 && (
          <p className="rounded-3xl bg-white p-5 text-sm text-gray-500">
            まだ記録がありません。
          </p>
        )}

        {records.map((record) => (
          <div
            key={record.id}
            className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
          >
            <div className="flex gap-3">
              <div className="flex h-24 w-20 items-center justify-center rounded-2xl bg-red-50 text-4xl">
                🍷
              </div>

              <div className="flex-1">
                <p className="text-xs text-gray-400">
                  {new Date(record.created_at).toLocaleDateString("ja-JP")}
                </p>

                <h2 className="mt-1 font-bold">
                  {record.wine_name}
                </h2>

                <p className="mt-1 text-sm text-yellow-500">
                  {"★".repeat(record.rating)}
                  {"☆".repeat(5 - record.rating)}
                </p>
              </div>
            </div>

            {record.memo && (
              <p className="mt-3 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
                {record.memo}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}