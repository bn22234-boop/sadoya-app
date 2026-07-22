"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Wine = {
  id: string;
  name: string;
  category_label: string;
  is_active: boolean;
};

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

export default function AdminWineVariantsPage() {
  const params = useParams<{ id: string }>();

  const [wine, setWine] = useState<Wine | null>(null);
  const [variants, setVariants] = useState<WineVariant[]>([]);

  const [editingVariant, setEditingVariant] =
    useState<WineVariant | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [volumeMl, setVolumeMl] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (params.id) {
      checkAdminAndLoad(params.id);
    }
  }, [params.id]);

  async function checkAdminAndLoad(wineId: string) {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      alert("ログインしてください");
      location.href = "/login";
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      alert("管理者権限が必要です");
      location.href = "/";
      return;
    }

    await loadWineAndVariants(wineId);
  }

  async function loadWineAndVariants(wineId: string) {
    setLoading(true);

    const { data: wineData, error: wineError } =
      await supabase
        .from("wines")
        .select("id, name, category_label, is_active")
        .eq("id", wineId)
        .single();

    if (wineError || !wineData) {
      console.error(
        "親ワイン取得エラー:",
        wineError?.message
      );

      setWine(null);
      setVariants([]);
      setLoading(false);
      return;
    }

    const { data: variantData, error: variantError } =
      await supabase
        .from("wine_variants")
        .select("*")
        .eq("wine_id", wineId)
        .order("display_order", {
          ascending: true,
        })
        .order("volume_ml", {
          ascending: true,
        });

    if (variantError) {
      console.error(
        "容量情報取得エラー:",
        variantError.message
      );

      alert(variantError.message);
      setWine(wineData);
      setVariants([]);
      setLoading(false);
      return;
    }

    setWine(wineData);
    setVariants(
      (variantData ?? []) as WineVariant[]
    );
    setLoading(false);
  }

  function resetForm() {
    setEditingVariant(null);
    setVolumeMl("");
    setPrice("");
    setImageUrl("");
    setProductUrl("");
    setDisplayOrder("");
    setIsActive(true);
    setShowForm(false);
  }

  function startCreate() {
    resetForm();

    const nextOrder =
      variants.length > 0
        ? Math.max(
            ...variants.map(
              (variant) => variant.display_order
            )
          ) + 1
        : 1;

    setDisplayOrder(String(nextOrder));
    setIsActive(true);
    setShowForm(true);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  function startEdit(variant: WineVariant) {
    setEditingVariant(variant);

    setVolumeMl(
      variant.volume_ml !== null
        ? String(variant.volume_ml)
        : ""
    );

    setPrice(String(variant.price));
    setImageUrl(variant.image_url ?? "");
    setProductUrl(variant.product_url ?? "");
    setDisplayOrder(
      String(variant.display_order)
    );
    setIsActive(variant.is_active);
    setShowForm(true);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  async function saveVariant() {
    if (!wine) return;

    const priceNumber = Number(price);
    const volumeNumber =
      volumeMl.trim() === ""
        ? null
        : Number(volumeMl);

    const orderNumber =
      displayOrder.trim() === ""
        ? variants.length + 1
        : Number(displayOrder);

    if (
      price.trim() === "" ||
      Number.isNaN(priceNumber) ||
      priceNumber < 0
    ) {
      alert("価格を正しく入力してください");
      return;
    }

    if (
      volumeNumber !== null &&
      (Number.isNaN(volumeNumber) ||
        volumeNumber <= 0)
    ) {
      alert("容量を正しく入力してください");
      return;
    }

    if (
      Number.isNaN(orderNumber) ||
      orderNumber < 0
    ) {
      alert("表示順を正しく入力してください");
      return;
    }

    const fixedImageUrl =
      imageUrl.trim() === ""
        ? null
        : imageUrl
            .trim()
            .replaceAll("\\", "/");

    const fixedProductUrl =
      productUrl.trim() === ""
        ? null
        : productUrl.trim();

    setSaving(true);

    const payload = {
      wine_id: wine.id,
      volume_ml: volumeNumber,
      price: priceNumber,
      image_url: fixedImageUrl,
      product_url: fixedProductUrl,
      is_active: isActive,
      display_order: orderNumber,
    };

    const { error } = editingVariant
      ? await supabase
          .from("wine_variants")
          .update(payload)
          .eq("id", editingVariant.id)
      : await supabase
          .from("wine_variants")
          .insert(payload);

    setSaving(false);

    if (error) {
      console.error(
        "容量情報保存エラー:",
        error
      );

      alert(error.message);
      return;
    }

    resetForm();
    await loadWineAndVariants(wine.id);
  }

  async function toggleVariantActive(
    variant: WineVariant
  ) {
    if (!wine) return;

    const nextActive = !variant.is_active;

    const message = nextActive
      ? `${
          variant.volume_ml
            ? `${variant.volume_ml}ml`
            : "容量未設定"
        }を公開しますか？`
      : `${
          variant.volume_ml
            ? `${variant.volume_ml}ml`
            : "容量未設定"
        }を非公開にしますか？`;

    if (!window.confirm(message)) return;

    const { error } = await supabase
      .from("wine_variants")
      .update({
        is_active: nextActive,
      })
      .eq("id", variant.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadWineAndVariants(wine.id);
  }

  async function deleteVariant(
    variant: WineVariant
  ) {
    if (!wine) return;

    const label = variant.volume_ml
      ? `${variant.volume_ml}ml`
      : "容量未設定";

    const confirmed = window.confirm(
      `「${label}」を削除しますか？\nこの操作は元に戻せません。`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("wine_variants")
      .delete()
      .eq("id", variant.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (editingVariant?.id === variant.id) {
      resetForm();
    }

    await loadWineAndVariants(wine.id);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="animate-bounce text-5xl">
            🍷
          </div>

          <p className="mt-4 text-sm font-bold text-red-900">
            容量情報を読み込んでいます...
          </p>
        </div>
      </main>
    );
  }

  if (!wine) {
    return (
      <main className="min-h-screen bg-[#fffaf6] p-5">
        <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="text-6xl">🍷</div>

          <h1 className="mt-4 text-xl font-bold text-red-950">
            ワインが見つかりません
          </h1>

          <Link
            href="/admin/wines"
            className="mt-6 block rounded-2xl bg-red-800 py-3 font-bold text-white"
          >
            ワイン管理へ戻る
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-5 bg-[#fffaf6] p-5 pb-28 text-gray-900">
      <section className="rounded-3xl bg-red-900 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">
          Admin / Wine Variants
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          容量・価格管理
        </h1>

        <p className="mt-2 text-sm leading-6 opacity-90">
          {wine.name}の容量ごとの価格・画像・商品URLを管理します。
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/wines"
          className="rounded-2xl border border-red-100 bg-white py-3 text-center text-sm font-bold text-red-900"
        >
          ワイン管理へ戻る
        </Link>

        <Link
          href={`/wine/${wine.id}`}
          className="rounded-2xl border border-red-100 bg-white py-3 text-center text-sm font-bold text-red-900"
        >
          利用者画面を見る
        </Link>
      </div>

      <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-red-700">
              {wine.category_label}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-red-950">
              {wine.name}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {wine.is_active
                ? "ワイン本体は公開中です"
                : "ワイン本体は非公開です"}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center">
            <p className="text-xs text-gray-500">
              容量数
            </p>

            <p className="mt-1 text-2xl font-bold text-red-900">
              {variants.length}
            </p>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={
          showForm ? resetForm : startCreate
        }
        className="w-full rounded-3xl bg-red-700 py-4 font-bold text-white shadow"
      >
        {showForm
          ? "フォームを閉じる"
          : "＋ 新しい容量を追加"}
      </button>

      {showForm && (
        <section className="space-y-5 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold text-red-700">
              容量バリエーション
            </p>

            <h2 className="mt-1 text-xl font-bold text-red-950">
              {editingVariant
                ? "容量情報を編集"
                : "新しい容量を追加"}
            </h2>
          </div>

          <FormField label="容量">
            <div className="relative">
              <input
                value={volumeMl}
                onChange={(event) =>
                  setVolumeMl(event.target.value)
                }
                type="number"
                min="1"
                placeholder="例：750"
                className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 pr-14 outline-none focus:border-red-700"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                ml
              </span>
            </div>
          </FormField>

          <FormField label="価格">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                ¥
              </span>

              <input
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                type="number"
                min="0"
                placeholder="例：1650"
                className="w-full rounded-2xl border border-red-100 bg-white py-3 pl-9 pr-4 outline-none focus:border-red-700"
              />
            </div>
          </FormField>

          <FormField label="画像URL">
            <input
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(event.target.value)
              }
              placeholder="/wines/owner-750.jpg"
              className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />

            {imageUrl && (
              <ImagePreview
                imageUrl={imageUrl}
                wineName={wine.name}
              />
            )}
          </FormField>

          <FormField label="公式商品URL">
            <input
              value={productUrl}
              onChange={(event) =>
                setProductUrl(event.target.value)
              }
              placeholder="https://..."
              className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />
          </FormField>

          <FormField label="表示順">
            <input
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(event.target.value)
              }
              type="number"
              min="0"
              placeholder="例：1"
              className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />
          </FormField>

          <label className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-4">
            <div>
              <p className="font-bold text-red-950">
                公開する
              </p>

              <p className="mt-1 text-xs text-gray-500">
                オフにすると利用者画面には表示されません。
              </p>
            </div>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
              className="h-6 w-6 accent-red-800"
            />
          </label>

          <button
            type="button"
            onClick={saveVariant}
            disabled={saving}
            className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "保存中..."
              : editingVariant
                ? "変更を保存"
                : "容量を追加"}
          </button>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <AdminStat
          title="登録容量"
          value={`${variants.length}件`}
        />

        <AdminStat
          title="公開中"
          value={`${
            variants.filter(
              (variant) => variant.is_active
            ).length
          }件`}
        />
      </section>

      <section className="space-y-4">
        {variants.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <div className="text-5xl">🍾</div>

            <p className="mt-3 font-bold text-red-950">
              容量情報がありません
            </p>

            <p className="mt-2 text-sm text-gray-500">
              「新しい容量を追加」から登録してください。
            </p>
          </div>
        ) : (
          variants.map((variant) => {
            const validImageUrl =
              typeof variant.image_url ===
                "string" &&
              (variant.image_url.startsWith("/") ||
                variant.image_url.startsWith(
                  "https://"
                ));

            return (
              <article
                key={variant.id}
                className={`rounded-3xl border p-4 shadow-sm ${
                  variant.is_active
                    ? "border-red-100 bg-white"
                    : "border-gray-200 bg-gray-50 opacity-75"
                }`}
              >
                <div className="flex gap-4">
                  <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-2xl border border-red-100 bg-white">
                    {validImageUrl ? (
                      <Image
                        src={
                          variant.image_url as string
                        }
                        alt={`${wine.name} ${
                          variant.volume_ml ?? ""
                        }ml`}
                        fill
                        sizes="96px"
                        className="object-contain scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🍷
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        {variant.volume_ml
                          ? `${variant.volume_ml}ml`
                          : "容量未設定"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          variant.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {variant.is_active
                          ? "公開中"
                          : "非公開"}
                      </span>
                    </div>

                    <p className="mt-3 text-2xl font-bold text-red-950">
                      ¥
                      {variant.price.toLocaleString()}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      表示順：
                      {variant.display_order}
                    </p>

                    {variant.product_url && (
                      <p className="mt-1 truncate text-xs text-gray-400">
                        商品URLあり
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startEdit(variant)
                    }
                    className="rounded-2xl bg-red-800 py-2 text-sm font-bold text-white"
                  >
                    編集
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleVariantActive(variant)
                    }
                    className={`rounded-2xl py-2 text-sm font-bold ${
                      variant.is_active
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-900"
                    }`}
                  >
                    {variant.is_active
                      ? "非公開"
                      : "公開"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteVariant(variant)
                    }
                    className="rounded-2xl bg-red-50 py-2 text-sm font-bold text-red-700"
                  >
                    削除
                  </button>
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
    <div className="rounded-3xl bg-orange-50 p-4">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-red-900">
        {value}
      </p>
    </div>
  );
}

function ImagePreview({
  imageUrl,
  wineName,
}: {
  imageUrl: string;
  wineName: string;
}) {
  const fixedUrl = imageUrl
    .trim()
    .replaceAll("\\", "/");

  const validImageUrl =
    fixedUrl.startsWith("/") ||
    fixedUrl.startsWith("https://");

  if (!validImageUrl) {
    return (
      <p className="mt-2 text-xs font-bold text-red-600">
        画像URLは「/」または「https://」から始めてください。
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-2xl bg-red-50 p-3">
      <p className="mb-2 text-xs font-bold text-red-700">
        プレビュー
      </p>

      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white">
        <Image
          src={fixedUrl}
          alt={`${wineName} プレビュー`}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}