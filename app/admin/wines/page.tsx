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
  volume_ml: number | null;
  beginner_score: number;
  description: string | null;
  is_active: boolean;
  display_order: number;
};

export default function AdminWinesPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("red");
  const [price, setPrice] = useState("");
  const [volumeMl, setVolumeMl] = useState("");
  const [beginnerScore, setBeginnerScore] = useState(5);
  const [description, setDescription] = useState("");

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

    loadWines();
  }

  async function loadWines() {
    const { data, error } = await supabase
      .from("wines")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setWines(data ?? []);
  }

  function getCategoryLabel(value: string) {
    if (value === "red") return "赤";
    if (value === "white") return "白";
    if (value === "rose") return "ロゼ";
    if (value === "sparkling") return "スパークリング";
    return "その他";
  }

  function getPriceRange(value: number) {
    if (value < 2000) {
      return {
        price_range: "under_2000",
        price_label: "〜2,000円",
      };
    }

    if (value <= 4000) {
      return {
        price_range: "2000_4000",
        price_label: "2,000〜4,000円",
      };
    }

    return {
      price_range: "over_4000",
      price_label: "4,000円〜",
    };
  }

  async function addWine() {
    if (!name || !price) {
      alert("ワイン名と価格を入力してください");
      return;
    }

    setSaving(true);

    const priceNumber = Number(price);
    const range = getPriceRange(priceNumber);

    const { error } = await supabase.from("wines").insert({
      name,
      category,
      category_label: getCategoryLabel(category),
      price: priceNumber,
      price_range: range.price_range,
      price_label: range.price_label,
      volume_ml: volumeMl ? Number(volumeMl) : null,
      alcohol_percent: null,
      description,
      beginner_score: beginnerScore,
      taste: null,
      aroma: null,
      food_pairing: null,
      image_url: null,
      product_url: null,
      display_order: wines.length + 1,
      is_active: true,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    setCategory("red");
    setPrice("");
    setVolumeMl("");
    setBeginnerScore(5);
    setDescription("");
    setShowForm(false);

    loadWines();
  }

  async function toggleActive(wine: Wine) {
    const { error } = await supabase
      .from("wines")
      .update({ is_active: !wine.is_active })
      .eq("id", wine.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadWines();
  }

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">Admin / Wines</p>
        <h1 className="mt-1 text-2xl font-bold">ワイン管理</h1>
        <p className="mt-2 text-sm opacity-90">
          ワインの追加・公開状態の切り替えを行います。
        </p>
      </section>

      <Link
        href="/admin"
        className="block rounded-2xl border border-red-100 bg-white py-3 text-center font-bold text-red-900"
      >
        管理者ダッシュボードへ戻る
      </Link>

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full rounded-3xl bg-red-700 py-4 font-bold text-white shadow"
      >
        {showForm ? "追加フォームを閉じる" : "＋ 新しいワインを追加"}
      </button>

      {showForm && (
        <section className="space-y-4 rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ワイン名"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          >
            <option value="red">赤</option>
            <option value="white">白</option>
            <option value="rose">ロゼ</option>
            <option value="sparkling">スパークリング</option>
          </select>

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="価格 例：2970"
            type="number"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <input
            value={volumeMl}
            onChange={(e) => setVolumeMl(e.target.value)}
            placeholder="容量 ml 例：750 ※不明なら空欄"
            type="number"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <div>
            <p className="mb-2 text-sm font-bold text-red-900">
              初心者向け度
            </p>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setBeginnerScore(score)}
                  className="text-3xl text-yellow-500"
                >
                  {score <= beginnerScore ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明"
            className="h-28 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none"
          />

          <button
            onClick={addWine}
            disabled={saving}
            className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : "ワインを保存"}
          </button>
        </section>
      )}

      <section className="rounded-3xl bg-orange-50 p-4 text-gray-900">
        <p className="text-sm text-gray-500">登録ワイン数</p>
        <p className="mt-1 text-3xl font-bold text-red-900">
          {wines.length}本
        </p>
      </section>

      <section className="space-y-3">
        {wines.map((wine) => (
          <div
            key={wine.id}
            className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-red-700">
                  {wine.category_label}
                </p>

                <h2 className="mt-1 font-bold">{wine.name}</h2>

                <p className="mt-1 text-sm text-gray-500">
                  ¥{wine.price.toLocaleString()}
                  {wine.volume_ml ? ` / ${wine.volume_ml}ml` : ""}
                </p>

                <p className="mt-1 text-xs text-yellow-600">
                  {"★".repeat(wine.beginner_score)}
                  {"☆".repeat(5 - wine.beginner_score)}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {wine.is_active ? "公開中" : "非公開"}
                </p>
              </div>

              <button
                onClick={() => toggleActive(wine)}
                className={`rounded-2xl px-4 py-2 text-sm font-bold ${
                  wine.is_active
                    ? "bg-gray-100 text-gray-600"
                    : "bg-red-800 text-white"
                }`}
              >
                {wine.is_active ? "非公開にする" : "公開する"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}