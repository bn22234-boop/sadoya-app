"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Wine = {
  id: string;
  name: string;
  category: string;
  category_label: string;
  price: number;
  price_range: string;
  price_label: string;
  description: string | null;
  beginner_score: number;
  image_emoji: string;
};

const categories = [
  { value: "all", label: "すべて" },
  { value: "red", label: "赤" },
  { value: "white", label: "白" },
  { value: "sparkling", label: "泡" },
  { value: "rose", label: "ロゼ" },
];

const priceRanges = [
  { value: "all", label: "すべて" },
  { value: "under_2000", label: "〜2,000円" },
  { value: "2000_4000", label: "2,000〜4,000円" },
  { value: "over_4000", label: "4,000円〜" },
];

export default function WinePage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWines();
  }, [category, priceRange]);

  async function fetchWines() {
    setLoading(true);

    let query = supabase
      .from("wines")
      .select("*")
      .order("created_at", { ascending: true });

    if (category !== "all") {
      query = query.eq("category", category);
    }

    if (priceRange !== "all") {
      query = query.eq("price_range", priceRange);
    }

    const { data, error } = await query;

    console.log("wines data =", data);
    console.log("wines error =", error);

    if (data) {
      setWines(data);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-5 p-5 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-red-900">
          ワインリスト
        </h1>

        <Link href="/" className="font-bold text-red-700">
          ホームへ
        </Link>
      </div>

      <section className="rounded-3xl bg-red-900 p-5 text-white shadow">
        <h2 className="text-xl font-bold">
          好みに合うワインを探そう
        </h2>
        <p className="mt-2 text-sm opacity-80">
          種類や価格帯で絞り込んで、初心者でも選びやすく。
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
        <div>
          <p className="mb-2 text-sm font-bold text-red-900">
            種類
          </p>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map((item) => (
              <button
                key={item.value}
                onClick={() => setCategory(item.value)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                  category === item.value
                    ? "bg-red-900 text-white"
                    : "bg-red-50 text-red-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-red-900">
            価格帯
          </p>

          <div className="flex gap-2 overflow-x-auto">
            {priceRanges.map((item) => (
              <button
                key={item.value}
                onClick={() => setPriceRange(item.value)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                  priceRange === item.value
                    ? "bg-red-900 text-white"
                    : "bg-red-50 text-red-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading && (
        <p className="rounded-3xl bg-white p-5 text-sm text-gray-500">
          読み込み中...
        </p>
      )}

      {!loading && wines.length === 0 && (
        <p className="rounded-3xl bg-white p-5 text-sm text-gray-500">
          条件に合うワインがありません。
        </p>
      )}

      <div className="space-y-4">
        {wines.map((wine) => (
          <section
            key={wine.id}
            className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-red-100 text-5xl">
                {wine.image_emoji}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    {wine.category_label}
                  </span>

                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                    {wine.price_label}
                  </span>
                </div>

                <h2 className="mt-2 text-lg font-bold">
                  {wine.name}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {wine.description}
                </p>

                <p className="mt-2 text-xs text-red-700">
                  初心者向け {"★".repeat(wine.beginner_score)}
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  ¥{wine.price.toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}