"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

type CellarWine = {
  id: string;
  batch_number: number;
  wine_name: string;
  started_at: string;
  finish_at: string;
  completed_at: string | null;
  created_at: string;
};

export default function CellarPage() {
  const [wines, setWines] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCellarWines();
  }, []);

  async function loadCellarWines() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("wine_batches")
      .select(`
        id,
        batch_number,
        wine_name,
        started_at,
        finish_at,
        completed_at,
        created_at
      `)
      .eq("profile_id", userId)
      .eq("status", "received")
      .order("completed_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "ワインセラー取得エラー:",
        error.message
      );

      setWines([]);
      setLoading(false);
      return;
    }

    const normalizedWines: CellarWine[] = (data ?? []).map(
      (wine) => ({
        id: String(wine.id),
        batch_number: Number(wine.batch_number),
        wine_name: String(wine.wine_name),
        started_at: String(wine.started_at),
        finish_at: String(wine.finish_at),
        completed_at:
          wine.completed_at !== null
            ? String(wine.completed_at)
            : null,
        created_at: String(wine.created_at),
      })
    );

    setWines(normalizedWines);
    setLoading(false);
  }

  return (
    <main className="space-y-5 p-5 pb-28">
      <section className="rounded-3xl bg-gradient-to-br from-red-950 to-red-700 p-5 text-white shadow-lg">
        <p className="text-sm tracking-[0.16em] text-white/70">
          MY WINE CELLAR
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          ワインセラー
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/80">
          サドヤんと一緒に完成させたワインを、
          ここにコレクションできます。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-red-50 p-4 text-gray-900">
          <p className="text-sm text-gray-500">
            完成したワイン
          </p>

          <p className="mt-2 text-3xl font-bold text-red-900">
            {wines.length}
            <span className="ml-1 text-base">
              本
            </span>
          </p>
        </div>

        <div className="rounded-3xl bg-orange-50 p-4 text-gray-900">
          <p className="text-sm text-gray-500">
            最新の完成
          </p>

          <p className="mt-2 text-sm font-bold text-red-900">
            {wines.length > 0
              ? formatDate(
                  wines[0].completed_at ??
                    wines[0].finish_at
                )
              : "まだありません"}
          </p>
        </div>
      </section>

      {loading && (
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="relative mx-auto h-28 w-28 animate-pulse">
            <Image
              src="/images/brewing/wine-bottle.png"
              alt="ワインを読み込み中"
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>

          <p className="mt-4 text-sm font-bold text-gray-500">
            ワインセラーを確認しています...
          </p>
        </section>
      )}

      {!loading && wines.length === 0 && (
        <section className="rounded-3xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <div className="relative mx-auto h-36 w-36 opacity-50">
            <Image
              src="/images/brewing/wine-bottle.png"
              alt="空のワインセラー"
              fill
              sizes="144px"
              className="object-contain"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-red-950">
            セラーはまだ空です
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            サドヤんをキングまで育て、
            収穫したワインを完成させよう。
          </p>

          <Link
            href="/character"
            className="mt-5 block rounded-2xl bg-red-800 py-4 font-bold text-white"
          >
            サドヤんを育てる
          </Link>
        </section>
      )}

      {!loading && wines.length > 0 && (
        <section className="space-y-4">
          {wines.map((wine, index) => (
            <article
              key={wine.id}
              className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm"
            >
              <div className="bg-gradient-to-r from-red-950 to-red-800 px-5 py-3 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold tracking-[0.16em] text-white/70">
                    SADOYA COLLECTION
                  </p>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                    #{wines.length - index}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 p-5">
                <div className="relative h-36 w-24 shrink-0">
                  <Image
                    src="/images/brewing/wine-bottle.png"
                    alt={`${wine.wine_name}のボトル`}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-red-700">
                    No.{wine.batch_number}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-red-950">
                    {wine.wine_name}
                  </h2>

                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p>
                      <span className="font-bold text-gray-700">
                        醸造開始：
                      </span>
                      {formatDate(wine.started_at)}
                    </p>

                    <p>
                      <span className="font-bold text-gray-700">
                        完成日：
                      </span>
                      {formatDate(
                        wine.completed_at ??
                          wine.finish_at
                      )}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3">
                    <p className="text-xs font-bold text-red-800">
                      サドヤんと完成させたワイン
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <Link
        href="/character"
        className="block rounded-3xl border border-red-200 bg-white p-4 text-center font-bold text-red-800 shadow-sm"
      >
        サドヤん育成ルームへ
      </Link>
    </main>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "日時不明";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}