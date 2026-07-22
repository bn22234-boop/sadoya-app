"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type WineVariant = {
  id: string;
  wine_id: string;
  volume_ml: number | null;
  price: number;
  image_url: string | null;
  product_url: string | null;
  is_active: boolean;
  display_order: number;
};

type Wine = {
  id: string;
  name: string;
  category: string;
  category_label: string;
  description: string | null;
  beginner_score: number;
  image_emoji: string | null;
  is_active: boolean;
  display_order: number;
  wine_variants: WineVariant[];
};

const categories = [
  { value: "all", label: "すべて" },
  { value: "red", label: "赤" },
  { value: "white", label: "白" },
  { value: "sparkling", label: "泡" },
  { value: "rose", label: "ロゼ" },
  { value: "other", label: "その他" },
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
  }, []);

  async function fetchWines() {
    setLoading(true);

    const { data, error } = await supabase
      .from("wines")
      .select(`
        *,
        wine_variants (
          id,
          wine_id,
          volume_ml,
          price,
          image_url,
          product_url,
          is_active,
          display_order
        )
      `)
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "ワイン取得エラー:",
        error.message
      );

      setWines([]);
      setLoading(false);
      return;
    }

    const normalizedWines = (data ?? []).map(
      (wine) => {
        const activeVariants = (
          (wine.wine_variants ??
            []) as WineVariant[]
        )
          .filter((variant) => variant.is_active)
          .sort(
            (a, b) =>
              a.display_order -
                b.display_order ||
              (a.volume_ml ?? 0) -
                (b.volume_ml ?? 0)
          );

        return {
          ...wine,
          wine_variants: activeVariants,
        } as Wine;
      }
    );

    setWines(normalizedWines);
    setLoading(false);
  }

  const filteredWines = useMemo(() => {
    return wines.filter((wine) => {
      const categoryMatches =
        category === "all" ||
        wine.category === category;

      const priceMatches =
        priceRange === "all" ||
        wine.wine_variants.some((variant) =>
          matchesPriceRange(
            variant.price,
            priceRange
          )
        );

      return categoryMatches && priceMatches;
    });
  }, [wines, category, priceRange]);

  return (
    <main className="space-y-5 p-5 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-red-900">
          ワインリスト
        </h1>

        <Link
          href="/"
          className="font-bold text-red-700"
        >
          ホームへ
        </Link>
      </header>

      <section className="rounded-3xl bg-red-900 p-5 text-white shadow">
        <h2 className="text-xl font-bold">
          好みに合うワインを探そう
        </h2>

        <p className="mt-2 text-sm opacity-80">
          種類や価格帯で絞り込んで、
          初心者でも選びやすく。
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
        <div>
          <p className="mb-2 text-sm font-bold text-red-900">
            種類
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setCategory(item.value)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
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

          <div className="flex gap-2 overflow-x-auto pb-1">
            {priceRanges.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setPriceRange(item.value)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
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

      {loading && <LoadingCard />}

      {!loading &&
        filteredWines.length === 0 && (
          <EmptyCard />
        )}

      {!loading &&
        filteredWines.length > 0 && (
          <section className="space-y-4">
            {filteredWines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
              />
            ))}
          </section>
        )}
    </main>
  );
}

function WineCard({
  wine,
}: {
  wine: Wine;
}) {
  const firstVariant =
    wine.wine_variants[0] ?? null;

  const imageUrl =
    firstVariant?.image_url ?? null;

  const validImageUrl =
    typeof imageUrl === "string" &&
    (imageUrl.startsWith("/") ||
      imageUrl.startsWith("https://"));

  const prices = wine.wine_variants.map(
    (variant) => variant.price
  );

  const minPrice =
    prices.length > 0
      ? Math.min(...prices)
      : null;

  const maxPrice =
    prices.length > 0
      ? Math.max(...prices)
      : null;

  return (
    <article className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
      <Link
        href={`/wine/${wine.id}`}
        className="flex gap-4"
      >
        <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
          {validImageUrl ? (
            <Image
              src={imageUrl}
              alt={wine.name}
              fill
              sizes="112px"
              className="object-contain scale-125 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              {wine.image_emoji || "🍷"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            {wine.category_label}
          </span>

          <h2 className="mt-2 text-lg font-bold text-gray-900">
            {wine.name}
          </h2>

          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-gray-500">
            {wine.description ||
              "説明は準備中です。"}
          </p>

          {wine.wine_variants.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {wine.wine_variants.map(
                (variant) => (
                  <span
                    key={variant.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600"
                  >
                    {variant.volume_ml
                      ? `${variant.volume_ml}ml`
                      : "容量未設定"}
                  </span>
                )
              )}
            </div>
          )}

          <p className="mt-3 text-xs text-red-700">
            初心者向け{" "}
            {"★".repeat(
              wine.beginner_score
            )}
            {"☆".repeat(
              Math.max(
                0,
                5 - wine.beginner_score
              )
            )}
          </p>

          <PriceDisplay
            minPrice={minPrice}
            maxPrice={maxPrice}
          />

          <p className="mt-3 text-xs font-bold text-red-700">
            容量・価格を見る →
          </p>
        </div>
      </Link>

      <Link
        href={`/records?wine=${encodeURIComponent(
          wine.name
        )}`}
        className="mt-4 block rounded-2xl bg-red-800 py-3 text-center text-sm font-bold text-white transition active:scale-[0.98]"
      >
        このワインを記録する
      </Link>
    </article>
  );
}

function PriceDisplay({
  minPrice,
  maxPrice,
}: {
  minPrice: number | null;
  maxPrice: number | null;
}) {
  if (
    minPrice === null ||
    maxPrice === null
  ) {
    return (
      <p className="mt-2 text-sm font-bold text-gray-500">
        価格情報は準備中です
      </p>
    );
  }

  if (minPrice === maxPrice) {
    return (
      <p className="mt-2 text-sm font-bold text-gray-800">
        ¥{minPrice.toLocaleString()}
      </p>
    );
  }

  return (
    <p className="mt-2 text-sm font-bold text-gray-800">
      ¥{minPrice.toLocaleString()}
      〜
      ¥{maxPrice.toLocaleString()}
    </p>
  );
}

function LoadingCard() {
  return (
    <section className="rounded-3xl bg-white p-5 text-center shadow-sm">
      <div className="animate-bounce text-4xl">
        🍷
      </div>

      <p className="mt-3 text-sm font-bold text-gray-500">
        読み込み中...
      </p>
    </section>
  );
}

function EmptyCard() {
  return (
    <section className="rounded-3xl bg-white p-5 text-center shadow-sm">
      <div className="text-5xl">
        🍷
      </div>

      <p className="mt-3 text-sm text-gray-500">
        条件に合うワインがありません。
      </p>
    </section>
  );
}

function matchesPriceRange(
  price: number,
  range: string
) {
  if (range === "under_2000") {
    return price < 2000;
  }

  if (range === "2000_4000") {
    return (
      price >= 2000 &&
      price <= 4000
    );
  }

  if (range === "over_4000") {
    return price > 4000;
  }

  return true;
}