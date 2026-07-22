"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type WineRecord = {
  id: string;
  wine_name: string;
  rating: number;
  memo: string | null;
  created_at: string;
};

type Wine = {
  id: string;
  name: string;
};

export default function RecordsPage() {
  return (
    <Suspense fallback={<div className="p-5">読み込み中...</div>}>
      <RecordsContent />
    </Suspense>
  );
}

function RecordsContent() {
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<WineRecord[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);

  const [wineName, setWineName] = useState("");
  const [selectedWineId, setSelectedWineId] = useState("");
  const [customWineName, setCustomWineName] = useState("");

  const [rating, setRating] = useState(5);
  const [memo, setMemo] = useState("");
  const [shareToTimeline, setShareToTimeline] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingWines, setLoadingWines] = useState(true);

  useEffect(() => {
    loadRecords();
    loadWines();
  }, []);

  useEffect(() => {
    const wineFromUrl = searchParams.get("wine");

    if (!wineFromUrl || wines.length === 0) {
      return;
    }

    const matchedWine = wines.find(
      (wine) => wine.name === wineFromUrl
    );

    if (matchedWine) {
      setSelectedWineId(matchedWine.id);
      setWineName(matchedWine.name);
      setCustomWineName("");
    } else {
      setSelectedWineId("other");
      setCustomWineName(wineFromUrl);
      setWineName(wineFromUrl);
    }

    setShowForm(true);
  }, [searchParams, wines]);

  async function loadRecords() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      setLoadingRecords(false);
      return;
    }

    setLoadingRecords(true);

    const { data, error } = await supabase
      .from("wine_records")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("記録取得エラー:", error.message);
      setRecords([]);
      setLoadingRecords(false);
      return;
    }

    setRecords((data ?? []) as WineRecord[]);
    setLoadingRecords(false);
  }

  async function loadWines() {
    setLoadingWines(true);

    const { data, error } = await supabase
      .from("wines")
      .select("id, name")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("ワイン取得エラー:", error.message);
      setWines([]);
      setLoadingWines(false);
      return;
    }

    setWines((data ?? []) as Wine[]);
    setLoadingWines(false);
  }

  function handleWineSelect(value: string) {
    setSelectedWineId(value);

    if (value === "other") {
      setWineName(customWineName);
      return;
    }

    const selectedWine = wines.find(
      (wine) => wine.id === value
    );

    setCustomWineName("");
    setWineName(selectedWine?.name ?? "");
  }

  function resetForm() {
    setWineName("");
    setSelectedWineId("");
    setCustomWineName("");
    setRating(5);
    setMemo("");
    setShareToTimeline(true);
    setShowForm(false);
  }

  async function saveRecord() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      alert("ログインしてください");
      return;
    }

    const fixedWineName = wineName.trim();

    if (!fixedWineName) {
      alert("ワイン名を入力してください");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.rpc(
        "add_wine_record",
        {
          p_profile_id: userId,
          p_wine_name: fixedWineName,
          p_rating: rating,
          p_memo: memo.trim() || null,
        }
      );

      if (error) {
        alert(error.message);
        return;
      }

      if (data !== true) {
        alert("記録の保存に失敗しました");
        return;
      }

      let timelineShared = false;

      if (shareToTimeline) {
        const linkedWineId =
          selectedWineId &&
          selectedWineId !== "other"
            ? selectedWineId
            : null;

        const { error: timelineError } = await supabase
          .from("timeline_posts")
          .insert({
            user_id: userId,
            wine_id: linkedWineId,
            wine_name: fixedWineName,
            rating,
            comment: memo.trim() || null,
            image_url: null,
            is_public: true,
          });

        if (timelineError) {
          console.error(
            "タイムライン共有エラー:",
            timelineError
          );

          alert(
            "記録は保存できましたが、タイムラインへの共有に失敗しました。"
          );
        } else {
          timelineShared = true;
        }
      }

      if (shareToTimeline && timelineShared) {
        alert(
          "記録しました！ +50pt\nタイムラインにも共有しました🍷"
        );
      } else {
        alert("記録しました！ +50pt");
      }

      resetForm();
      await loadRecords();
    } catch (error) {
      console.error("記録保存エラー:", error);
      alert("記録中にエラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-5 p-5 pb-28">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">
          My Wine Log
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          ワイン記録
        </h1>

        <p className="mt-2 text-sm leading-6 opacity-90">
          飲んだワインを記録して、
          自分だけのワイン図鑑を作ろう。
        </p>
      </section>

      <button
        type="button"
        onClick={() => {
          if (showForm) {
            resetForm();
          } else {
            setShowForm(true);
          }
        }}
        className="w-full rounded-3xl bg-red-700 py-4 font-bold text-white shadow"
      >
        {showForm
          ? "フォームを閉じる"
          : "＋ 新しく記録する"}
      </button>

      {showForm && (
        <section className="space-y-5 rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
          <div>
            <label
              htmlFor="wine"
              className="text-sm font-bold text-red-900"
            >
              ワインを選択
            </label>

            <select
              id="wine"
              value={selectedWineId}
              onChange={(event) =>
                handleWineSelect(event.target.value)
              }
              disabled={loadingWines}
              className="mt-2 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none disabled:opacity-50"
            >
              <option value="">
                {loadingWines
                  ? "読み込み中..."
                  : "ワインを選んでください"}
              </option>

              {wines.map((wine) => (
                <option
                  key={wine.id}
                  value={wine.id}
                >
                  {wine.name}
                </option>
              ))}

              <option value="other">
                その他（手入力）
              </option>
            </select>

            {selectedWineId === "other" && (
              <input
                value={customWineName}
                onChange={(event) => {
                  setCustomWineName(event.target.value);
                  setWineName(event.target.value);
                }}
                placeholder="ワイン名を入力"
                className="mt-3 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
              />
            )}
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
                  className="text-3xl text-yellow-500"
                  aria-label={`評価${star}`}
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="memo"
              className="text-sm font-bold text-red-900"
            >
              感想
            </label>

            <textarea
              id="memo"
              value={memo}
              onChange={(event) =>
                setMemo(event.target.value)
              }
              placeholder="味・香り・飲みやすさなど"
              maxLength={300}
              className="mt-2 h-28 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
            />

            <p className="mt-2 text-right text-xs text-gray-400">
              {memo.length} / 300
            </p>
          </div>

          <label className="flex items-center justify-between rounded-2xl bg-red-50 p-4">
            <div className="pr-4">
              <p className="font-bold text-red-950">
                タイムラインにも共有する
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                評価と感想を、みんなのタイムラインへ公開します。
              </p>
            </div>

            <input
              type="checkbox"
              checked={shareToTimeline}
              onChange={(event) =>
                setShareToTimeline(
                  event.target.checked
                )
              }
              className="h-6 w-6 shrink-0 accent-red-800"
            />
          </label>

          <button
            type="button"
            onClick={saveRecord}
            disabled={saving}
            className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "保存中..."
              : shareToTimeline
                ? "記録して共有する +50pt"
                : "記録する +50pt"}
          </button>
        </section>
      )}

      <section className="rounded-3xl bg-orange-50 p-4 text-gray-900">
        <p className="text-sm text-gray-500">
          これまでに飲んだワイン
        </p>

        <p className="mt-1 text-3xl font-bold text-red-900">
          {records.length}本
        </p>
      </section>

      {loadingRecords && (
        <section className="rounded-3xl bg-white p-5 text-center text-sm text-gray-500">
          記録を読み込んでいます...
        </section>
      )}

      {!loadingRecords &&
        records.length === 0 && (
          <p className="rounded-3xl bg-white p-5 text-sm text-gray-500">
            まだ記録がありません。
          </p>
        )}

      {!loadingRecords &&
        records.length > 0 && (
          <section className="space-y-3">
            {records.map((record) => (
              <article
                key={record.id}
                className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-4xl">
                    🍷
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">
                      {new Date(
                        record.created_at
                      ).toLocaleDateString(
                        "ja-JP"
                      )}
                    </p>

                    <h2 className="mt-1 font-bold">
                      {record.wine_name}
                    </h2>

                    <p className="mt-1 text-sm text-yellow-500">
                      {"★".repeat(record.rating)}
                      {"☆".repeat(
                        Math.max(
                          0,
                          5 - record.rating
                        )
                      )}
                    </p>
                  </div>
                </div>

                {record.memo && (
                  <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-gray-50 p-3 text-sm leading-6 text-gray-600">
                    {record.memo}
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
    </main>
  );
}