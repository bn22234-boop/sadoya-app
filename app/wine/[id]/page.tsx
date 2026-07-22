"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  beginner_score: number;
  description: string | null;
  alcohol_percent: number | null;
  taste: string | null;
  aroma: string | null;
  food_pairing: string | null;
  is_active: boolean;
  wine_variants: WineVariant[];
};

export default function WineDetailPage() {
  const params = useParams<{ id: string }>();

  const [wine, setWine] = useState<Wine | null>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<WineVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchWine(params.id);
    }
  }, [params.id]);

  async function fetchWine(id: string) {
    setLoading(true);

    const { data, error } = await supabase
      .from("wines")
      .select(
        `
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
        `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      console.error(
        "ワイン詳細取得エラー:",
        error?.message
      );

      setWine(null);
      setSelectedVariant(null);
      setLoading(false);
      return;
    }

    const activeVariants = (
      (data.wine_variants ?? []) as WineVariant[]
    )
      .filter((variant) => variant.is_active)
      .sort(
        (a, b) =>
          a.display_order - b.display_order ||
          (a.volume_ml ?? 0) - (b.volume_ml ?? 0)
      );

    const normalizedWine: Wine = {
      ...data,
      wine_variants: activeVariants,
    };

    setWine(normalizedWine);
    setSelectedVariant(activeVariants[0] ?? null);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="animate-bounce text-5xl">
            🍷
          </div>

          <p className="mt-4 text-sm font-bold text-red-900">
            ワイン情報を読み込んでいます...
          </p>
        </div>
      </main>
    );
  }

  if (!wine) {
    return (
      <main className="min-h-screen bg-[#fffaf6] p-5">
        <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="text-6xl">
            🍷
          </div>

          <h1 className="mt-4 text-xl font-bold text-red-950">
            ワインが見つかりません
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            非公開になっているか、削除された可能性があります。
          </p>

          <Link
            href="/wine"
            className="mt-6 block rounded-2xl bg-red-800 py-3 font-bold text-white"
          >
            ワインリストへ戻る
          </Link>
        </section>
      </main>
    );
  }

  const validImageUrl =
    typeof selectedVariant?.image_url === "string" &&
    (selectedVariant.image_url.startsWith("/") ||
      selectedVariant.image_url.startsWith("https://"));

  return (
    <main className="min-h-screen space-y-5 bg-[#fffaf6] p-5 pb-28 text-gray-900">
      <header className="flex items-center justify-between">
        <Link
          href="/wine"
          className="text-sm font-bold text-red-700"
        >
          ← ワインリスト
        </Link>

        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
          {wine.category_label}
        </span>
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-sm">
        <div className="relative h-80 bg-gradient-to-b from-red-50 to-white">
          {validImageUrl ? (
            <Image
              src={selectedVariant?.image_url as string}
              alt={`${wine.name}${
                selectedVariant?.volume_ml
                  ? ` ${selectedVariant.volume_ml}ml`
                  : ""
              }`}
              fill
              priority
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-contain p-6 transition-all duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              🍷
            </div>
          )}
        </div>

        <div className="p-6">
          <p className="text-xs font-bold tracking-[0.18em] text-red-700">
            SADOYA WINE
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-tight text-red-950">
            {wine.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
              {wine.category_label}
            </span>

            {selectedVariant?.volume_ml && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                {selectedVariant.volume_ml}ml
              </span>
            )}
          </div>

          {wine.wine_variants.length > 0 ? (
            <>
              <div className="mt-5">
                <p className="text-sm font-bold text-red-900">
                  容量を選ぶ
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {wine.wine_variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() =>
                        setSelectedVariant(variant)
                      }
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                        selectedVariant?.id === variant.id
                          ? "bg-red-900 text-white"
                          : "bg-red-50 text-red-900"
                      }`}
                    >
                      {variant.volume_ml
                        ? `${variant.volume_ml}ml`
                        : "容量未設定"}
                    </button>
                  ))}
                </div>
              </div>

              {selectedVariant && (
                <p className="mt-5 text-2xl font-bold">
                  ¥{selectedVariant.price.toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <div className="mt-5 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              容量・価格情報は準備中です。
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-red-50 p-4">
            <p className="text-xs font-bold text-red-700">
              初心者向け度
            </p>

            <p className="mt-1 text-2xl text-yellow-500">
              {"★".repeat(wine.beginner_score)}
              {"☆".repeat(
                Math.max(0, 5 - wine.beginner_score)
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-red-950">
          ワインについて
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
          {wine.description || "説明は準備中です。"}
        </p>
      </section>

      {(wine.taste ||
        wine.aroma ||
        wine.food_pairing ||
        wine.alcohol_percent !== null) && (
        <section className="space-y-4 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-red-950">
            詳細情報
          </h2>

          {wine.taste && (
            <DetailRow
              label="味わい"
              value={wine.taste}
            />
          )}

          {wine.aroma && (
            <DetailRow
              label="香り"
              value={wine.aroma}
            />
          )}

          {wine.food_pairing && (
            <DetailRow
              label="おすすめ料理"
              value={wine.food_pairing}
            />
          )}

          {wine.alcohol_percent !== null && (
            <DetailRow
              label="アルコール度数"
              value={`${wine.alcohol_percent}%`}
            />
          )}
        </section>
      )}

      <section className="space-y-3">
        <Link
          href={`/records?wine=${encodeURIComponent(
            wine.name
          )}&variant=${encodeURIComponent(
            selectedVariant?.id ?? ""
          )}`}
          className={`block rounded-2xl py-4 text-center font-bold text-white shadow-lg transition active:scale-[0.98] ${
            selectedVariant
              ? "bg-red-900"
              : "pointer-events-none bg-gray-400"
          }`}
        >
          このワインを記録する
        </Link>

        {selectedVariant?.product_url && (
          <a
            href={selectedVariant.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-red-200 bg-white py-4 text-center font-bold text-red-900"
          >
            選択した容量の商品ページを見る
          </a>
        )}
      </section>
    </main>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-red-50 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs font-bold text-red-700">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
        {value}
      </p>
    </div>
  );
}