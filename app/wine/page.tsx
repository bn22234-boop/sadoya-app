"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Wine = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  beginner_score: number;
  image_emoji: string;
};

export default function WinesPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWines();
  }, []);

  async function fetchWines() {
    const { data, error } = await supabase
      .from("wines")
      .select("*")
      .order("created_at", { ascending: true });

    console.log("wines data =", data);
    console.log("wines error =", error);

    if (data) setWines(data);
    setLoading(false);
  }

  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-900">ワインリスト</h1>

        <Link href="/" className="text-sm font-bold text-red-700">
          ホームへ
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">読み込み中...</p>
      )}

      {!loading && wines.length === 0 && (
        <p className="text-sm text-gray-500">
          ワインが登録されていません。
        </p>
      )}

      <div className="space-y-4">
        {wines.map((wine) => (
          <section
            key={wine.id}
            className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="flex h-24 w-20 items-center justify-center rounded-2xl bg-red-100 text-4xl">
                {wine.image_emoji}
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-red-700">
                  {wine.type}
                </p>

                <h2 className="mt-1 font-bold">
                  {wine.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {wine.description}
                </p>

                <p className="mt-2 text-xs text-red-700">
                  初心者向け {"★".repeat(wine.beginner_score)}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}