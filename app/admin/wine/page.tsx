"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type WineVariant = {
  id: string;
  is_active: boolean;
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
  display_order: number;
  wine_variants: WineVariant[];
};

const categories = [
  { value: "red", label: "赤" },
  { value: "white", label: "白" },
  { value: "rose", label: "ロゼ" },
  { value: "sparkling", label: "スパークリング" },
  { value: "other", label: "その他" },
];

export default function AdminWinesPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("red");
  const [beginnerScore, setBeginnerScore] = useState(5);
  const [description, setDescription] = useState("");
  const [taste, setTaste] = useState("");
  const [aroma, setAroma] = useState("");
  const [foodPairing, setFoodPairing] = useState("");
  const [alcoholPercent, setAlcoholPercent] = useState("");

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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || profile?.role !== "admin") {
      alert("管理者権限が必要です");
      location.href = "/";
      return;
    }

    await loadWines();
  }

  async function loadWines() {
    setLoading(true);

    const { data, error } = await supabase
      .from("wines")
      .select(`
        *,
        wine_variants (
          id,
          is_active
        )
      `)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("ワイン取得エラー:", error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setWines((data ?? []) as Wine[]);
    setLoading(false);
  }

  function getCategoryLabel(value: string) {
    return (
      categories.find((item) => item.value === value)?.label ??
      "その他"
    );
  }

  function resetForm() {
    setEditingWine(null);
    setName("");
    setCategory("red");
    setBeginnerScore(5);
    setDescription("");
    setTaste("");
    setAroma("");
    setFoodPairing("");
    setAlcoholPercent("");
    setShowForm(false);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  function startEdit(wine: Wine) {
    setEditingWine(wine);
    setName(wine.name);
    setCategory(wine.category);
    setBeginnerScore(wine.beginner_score);
    setDescription(wine.description ?? "");
    setTaste(wine.taste ?? "");
    setAroma(wine.aroma ?? "");
    setFoodPairing(wine.food_pairing ?? "");
    setAlcoholPercent(
      wine.alcohol_percent !== null
        ? String(wine.alcohol_percent)
        : ""
    );
    setShowForm(true);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  async function saveWine() {
    const fixedName = name.trim();

    if (!fixedName) {
      alert("ワイン名を入力してください");
      return;
    }

    const parsedAlcoholPercent =
      alcoholPercent.trim() === ""
        ? null
        : Number(alcoholPercent);

    if (
      parsedAlcoholPercent !== null &&
      (Number.isNaN(parsedAlcoholPercent) ||
        parsedAlcoholPercent < 0 ||
        parsedAlcoholPercent > 100)
    ) {
      alert("アルコール度数を正しく入力してください");
      return;
    }

    setSaving(true);

    const payload = {
      name: fixedName,
      category,
      category_label: getCategoryLabel(category),
      beginner_score: beginnerScore,
      description: description.trim() || null,
      taste: taste.trim() || null,
      aroma: aroma.trim() || null,
      food_pairing: foodPairing.trim() || null,
      alcohol_percent: parsedAlcoholPercent,
    };

    let error;

    if (editingWine) {
      const result = await supabase
        .from("wines")
        .update(payload)
        .eq("id", editingWine.id);

      error = result.error;
    } else {
      /*
       * 既存のwinesテーブルでpriceなどがNOT NULLの場合に備えて、
       * 親レコードには互換用の初期値を入れています。
       * 実際の価格・容量・画像はwine_variantsで管理します。
       */
      const result = await supabase.from("wines").insert({
        ...payload,

        price: 0,
        price_range: "under_2000",
        price_label: "容量を選択",
        volume_ml: null,
        image_url: null,
        product_url: null,

        display_order: wines.length + 1,
        is_active: true,
      });

      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error("ワイン保存エラー:", error);
      alert(error.message);
      return;
    }

    resetForm();
    await loadWines();
  }

  async function toggleActive(wine: Wine) {
    const nextActive = !wine.is_active;

    const message = nextActive
      ? `「${wine.name}」を公開しますか？`
      : `「${wine.name}」を非公開にしますか？`;

    if (!window.confirm(message)) {
      return;
    }

    const { error } = await supabase
      .from("wines")
      .update({
        is_active: nextActive,
      })
      .eq("id", wine.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadWines();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="animate-bounce text-5xl">🍷</div>

          <p className="mt-4 text-sm font-bold text-red-900">
            ワイン情報を読み込んでいます...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-5 p-5 pb-28">
      <section className="rounded-3xl bg-red-900 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">
          Admin / Wines
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          ワイン管理
        </h1>

        <p className="mt-2 text-sm leading-6 opacity-90">
          ワイン本体の情報と、容量ごとの商品情報を管理します。
        </p>
      </section>

      <Link
        href="/admin"
        className="block rounded-2xl border border-red-100 bg-white py-3 text-center font-bold text-red-900"
      >
        管理者ダッシュボードへ戻る
      </Link>

      <button
        type="button"
        onClick={showForm ? resetForm : startCreate}
        className="w-full rounded-3xl bg-red-700 py-4 font-bold text-white shadow"
      >
        {showForm
          ? "フォームを閉じる"
          : "＋ 新しいワインを追加"}
      </button>

      {showForm && (
        <section className="space-y-5 rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
          <div>
            <p className="text-xs font-bold text-red-700">
              ワイン本体
            </p>

            <h2 className="mt-1 text-xl font-bold text-red-950">
              {editingWine
                ? "ワイン情報を編集"
                : "新しいワインを追加"}
            </h2>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              容量・価格・画像は、保存後に「容量管理」から登録します。
            </p>
          </div>

          <FormField label="ワイン名">
            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="例：オーナーヴ"
              className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />
          </FormField>

          <FormField label="カテゴリ">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            >
              {categories.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <div>
            <p className="mb-2 text-sm font-bold text-red-900">
              初心者向け度
            </p>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() =>
                    setBeginnerScore(score)
                  }
                  className="text-3xl text-yellow-500"
                  aria-label={`初心者向け度${score}`}
                >
                  {score <= beginnerScore
                    ? "★"
                    : "☆"}
                </button>
              ))}
            </div>
          </div>

          <FormField label="説明">
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="ワインの特徴や初心者向けの説明"
              className="h-32 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />
          </FormField>

          <FormField label="味わい">
            <input
              value={taste}
              onChange={(event) =>
                setTaste(event.target.value)
              }
              placeholder="例：やや甘口、すっきり"
              className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />
          </FormField>

          <FormField label="香り">
            <textarea
              value={aroma}
              onChange={(event) =>
                setAroma(event.target.value)
              }
              placeholder="例：柑橘、白い花、桃のような香り"
              className="h-24 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />
          </FormField>

          <FormField label="おすすめ料理">
            <textarea
              value={foodPairing}
              onChange={(event) =>
                setFoodPairing(event.target.value)
              }
              placeholder="例：魚料理、チーズ、パスタ"
              className="h-24 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />
          </FormField>

          <FormField label="アルコール度数">
            <div className="relative">
              <input
                value={alcoholPercent}
                onChange={(event) =>
                  setAlcoholPercent(event.target.value)
                }
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="例：12.5"
                className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 pr-12 outline-none focus:border-red-700"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                %
              </span>
            </div>
          </FormField>

          <button
            type="button"
            onClick={saveWine}
            disabled={saving}
            className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "保存中..."
              : editingWine
                ? "変更を保存"
                : "ワイン本体を保存"}
          </button>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <AdminStat
          title="親ワイン数"
          value={`${wines.length}本`}
        />

        <AdminStat
          title="公開中"
          value={`${
            wines.filter((wine) => wine.is_active)
              .length
          }本`}
        />
      </section>

      <section className="space-y-3">
        {wines.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500">
            登録されたワインがありません。
          </div>
        ) : (
          wines.map((wine) => {
            const activeVariantCount =
              wine.wine_variants?.filter(
                (variant) => variant.is_active
              ).length ?? 0;

            const totalVariantCount =
              wine.wine_variants?.length ?? 0;

            return (
              <article
                key={wine.id}
                className={`rounded-3xl border p-4 text-gray-900 shadow-sm ${
                  wine.is_active
                    ? "border-red-100 bg-white"
                    : "border-gray-200 bg-gray-50 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        {wine.category_label}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          wine.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {wine.is_active
                          ? "公開中"
                          : "非公開"}
                      </span>
                    </div>

                    <h2 className="mt-3 truncate text-lg font-bold text-red-950">
                      {wine.name}
                    </h2>

                    <p className="mt-1 text-xs text-yellow-600">
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

                    <p className="mt-3 text-sm font-bold text-gray-700">
                      容量バリエーション
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      公開 {activeVariantCount}件
                      <span className="mx-1">/</span>
                      全 {totalVariantCount}件
                    </p>
                  </div>

                  <div className="w-28 shrink-0 space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(wine)
                      }
                      className="block w-full rounded-2xl bg-red-800 px-3 py-2 text-sm font-bold text-white"
                    >
                      本体編集
                    </button>

                    <Link
                      href={`/admin/wine/${wine.id}`}
                      className="block w-full rounded-2xl bg-orange-100 px-3 py-2 text-center text-sm font-bold text-orange-900"
                    >
                      容量管理
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        toggleActive(wine)
                      }
                      className={`block w-full rounded-2xl px-3 py-2 text-sm font-bold ${
                        wine.is_active
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-900"
                      }`}
                    >
                      {wine.is_active
                        ? "非公開"
                        : "公開"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-red-900">
        {label}
      </p>

      {children}
    </div>
  );
}

function AdminStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-orange-50 p-4 text-gray-900">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-red-900">
        {value}
      </p>
    </div>
  );
}