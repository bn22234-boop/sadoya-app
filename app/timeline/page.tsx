"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";

import WineShareCard from "@/components/WineShareCard";
import { supabase } from "@/lib/supabase";

type WineVariantForShare = {
  image_url: string | null;
  is_active: boolean;
  display_order: number;
};

type TimelineWine = {
  category: string | null;
  wine_variants: WineVariantForShare[];
};

type TimelinePost = {
  id: string;
  user_id: string;
  wine_id: string | null;
  wine_name: string;
  rating: number;
  comment: string | null;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  edited_at: string | null;

  profiles: {
    name: string;
  }[];

  wines: TimelineWine[];
};

type Profile = {
  id: string;
  role: string;
};

export default function TimelinePage() {
  const [posts, setPosts] =
    useState<TimelinePost[]>([]);

  const [currentProfile, setCurrentProfile] =
    useState<Profile | null>(null);

  const [editingPost, setEditingPost] =
    useState<TimelinePost | null>(null);

  const [editRating, setEditRating] =
    useState(5);

  const [editComment, setEditComment] =
    useState("");

  const [editIsPublic, setEditIsPublic] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [shareTargetPost, setShareTargetPost] =
    useState<TimelinePost | null>(null);

  const [generatingCard, setGeneratingCard] =
    useState(false);

  const shareCardRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    await loadCurrentProfile();
    await loadPosts();
  }

  async function loadCurrentProfile() {
    const userId = localStorage.getItem(
      "sadoya_user_id"
    );

    if (!userId) {
      setCurrentProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(
        "プロフィール取得エラー:",
        error?.message
      );

      setCurrentProfile(null);
      return;
    }

    setCurrentProfile({
      id: String(data.id),
      role: String(data.role),
    });
  }

  async function loadPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("timeline_posts")
      .select(`
        id,
        user_id,
        wine_id,
        wine_name,
        rating,
        comment,
        image_url,
        is_public,
        created_at,
        edited_at,

        profiles!timeline_posts_user_id_fkey (
          name
        ),

        wines!timeline_posts_wine_id_fkey (
          category,
          wine_variants (
            image_url,
            is_active,
            display_order
          )
        )
      `)
      .eq("is_public", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "タイムライン取得エラー:",
        error
      );

      setPosts([]);
      setLoading(false);
      return;
    }

    const normalizedPosts: TimelinePost[] =
      (data ?? []).map((post) => {
        const rawProfiles = Array.isArray(
          post.profiles
        )
          ? post.profiles
          : post.profiles
            ? [post.profiles]
            : [];

        const rawWines = Array.isArray(
          post.wines
        )
          ? post.wines
          : post.wines
            ? [post.wines]
            : [];

        return {
          id: String(post.id),

          user_id: String(post.user_id),

          wine_id:
            post.wine_id !== null
              ? String(post.wine_id)
              : null,

          wine_name: String(
            post.wine_name
          ),

          rating: Number(post.rating),

          comment:
            post.comment !== null
              ? String(post.comment)
              : null,

          image_url:
            post.image_url !== null
              ? String(post.image_url)
              : null,

          is_public: Boolean(
            post.is_public
          ),

          created_at: String(
            post.created_at
          ),

          edited_at:
            post.edited_at !== null
              ? String(post.edited_at)
              : null,

          profiles: rawProfiles.map(
            (profile) => ({
              name: String(profile.name),
            })
          ),

          wines: rawWines.map((wine) => {
            const rawVariants =
              Array.isArray(
                wine.wine_variants
              )
                ? wine.wine_variants
                : wine.wine_variants
                  ? [
                      wine.wine_variants,
                    ]
                  : [];

            return {
              category:
                wine.category !== null
                  ? String(wine.category)
                  : null,

              wine_variants:
                rawVariants.map(
                  (variant) => ({
                    image_url:
                      variant.image_url !==
                      null
                        ? String(
                            variant.image_url
                          )
                        : null,

                    is_active:
                      Boolean(
                        variant.is_active
                      ),

                    display_order:
                      Number(
                        variant.display_order
                      ),
                  })
                ),
            };
          }),
        };
      });

    setPosts(normalizedPosts);
    setLoading(false);
  }

  function canManagePost(
    post: TimelinePost
  ) {
    if (!currentProfile) {
      return false;
    }

    return (
      currentProfile.id ===
        post.user_id ||
      currentProfile.role === "admin"
    );
  }

  function isOwnPost(
    post: TimelinePost
  ) {
    return (
      currentProfile?.id ===
      post.user_id
    );
  }

  function getOfficialWineImage(
    post: TimelinePost
  ) {
    const variants =
      post.wines[0]?.wine_variants ??
      [];

    const activeVariants = variants
      .filter(
        (variant) =>
          variant.is_active &&
          Boolean(variant.image_url)
      )
      .sort(
        (a, b) =>
          a.display_order -
          b.display_order
      );

    return (
      activeVariants[0]?.image_url ??
      null
    );
  }

  function getWineCategory(
    post: TimelinePost
  ) {
    return (
      post.wines[0]?.category ?? null
    );
  }

  function startEdit(
    post: TimelinePost
  ) {
    setEditingPost(post);
    setEditRating(post.rating);
    setEditComment(
      post.comment ?? ""
    );
    setEditIsPublic(post.is_public);
    setOpenMenuId(null);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  function cancelEdit() {
    setEditingPost(null);
    setEditRating(5);
    setEditComment("");
    setEditIsPublic(true);
  }

  async function saveEdit() {
    if (
      !editingPost ||
      !currentProfile
    ) {
      return;
    }

    setSaving(true);

    const { data, error } =
      await supabase.rpc(
        "update_timeline_post",
        {
          p_actor_id:
            currentProfile.id,

          p_post_id:
            editingPost.id,

          p_rating: editRating,

          p_comment:
            editComment.trim() ||
            null,

          p_is_public:
            editIsPublic,
        }
      );

    setSaving(false);

    if (error) {
      console.error(
        "投稿編集エラー:",
        error
      );

      alert(error.message);
      return;
    }

    if (data !== true) {
      alert(
        "投稿の更新に失敗しました"
      );
      return;
    }

    alert(
      editIsPublic
        ? "投稿を更新しました"
        : "投稿を非公開にしました"
    );

    cancelEdit();
    await loadPosts();
  }

  async function deletePost(
    post: TimelinePost
  ) {
    if (!currentProfile) {
      alert(
        "ログインしてください"
      );
      return;
    }

    const confirmed =
      window.confirm(
        `「${post.wine_name}」の投稿を削除しますか？\nこの操作は元に戻せません。`
      );

    if (!confirmed) {
      return;
    }

    const { data, error } =
      await supabase.rpc(
        "delete_timeline_post",
        {
          p_actor_id:
            currentProfile.id,

          p_post_id: post.id,
        }
      );

    if (error) {
      console.error(
        "投稿削除エラー:",
        error
      );

      alert(error.message);
      return;
    }

    if (data !== true) {
      alert(
        "投稿の削除に失敗しました"
      );
      return;
    }

    setOpenMenuId(null);
    await loadPosts();
  }

  async function hidePost(
    post: TimelinePost
  ) {
    if (!currentProfile) {
      return;
    }

    const confirmed =
      window.confirm(
        `「${post.wine_name}」の投稿を非公開にしますか？`
      );

    if (!confirmed) {
      return;
    }

    const { data, error } =
      await supabase.rpc(
        "update_timeline_post",
        {
          p_actor_id:
            currentProfile.id,

          p_post_id: post.id,

          p_rating: post.rating,

          p_comment: post.comment,

          p_is_public: false,
        }
      );

    if (error) {
      console.error(
        "投稿非公開エラー:",
        error
      );

      alert(error.message);
      return;
    }

    if (data !== true) {
      alert(
        "投稿の非公開処理に失敗しました"
      );
      return;
    }

    setOpenMenuId(null);
    await loadPosts();
  }

  async function waitForCardImages(
    element: HTMLElement
  ) {
    const images = Array.from(
      element.querySelectorAll("img")
    );

    await Promise.all(
      images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>(
          (resolve) => {
            const finish = () =>
              resolve();

            image.addEventListener(
              "load",
              finish,
              { once: true }
            );

            image.addEventListener(
              "error",
              finish,
              { once: true }
            );
          }
        );
      })
    );
  }

  async function createWineCard(
    post: TimelinePost
  ) {
    if (!isOwnPost(post)) {
      alert(
        "ワインカードを作成できるのは自分の投稿だけです"
      );
      return;
    }

    if (generatingCard) {
      return;
    }

    setGeneratingCard(true);
    setShareTargetPost(post);

    try {
      await new Promise<void>(
        (resolve) => {
          window.setTimeout(
            resolve,
            400
          );
        }
      );

      if (!shareCardRef.current) {
        throw new Error(
          "ワインカードを準備できませんでした"
        );
      }

      await waitForCardImages(
        shareCardRef.current
      );

      await new Promise<void>(
        (resolve) => {
          window.setTimeout(
            resolve,
            300
          );
        }
      );

      const dataUrl = await toPng(
        shareCardRef.current,
        {
          cacheBust: true,
          pixelRatio: 1,
          backgroundColor:
            "#f8f1e7",
        }
      );

      const response =
        await fetch(dataUrl);

      if (!response.ok) {
        throw new Error(
          "画像データの作成に失敗しました"
        );
      }

      const blob =
        await response.blob();

      const safeWineName =
        post.wine_name
          .replace(
            /[\\/:*?"<>|]/g,
            "-"
          )
          .slice(0, 40);

      const filename =
        `sadoya-${safeWineName}.png`;

      const file = new File(
        [blob],
        filename,
        {
          type: "image/png",
        }
      );

      const shareText = [
        `🍷 ${post.wine_name}`,

        `${"★".repeat(
          post.rating
        )}${"☆".repeat(
          Math.max(
            0,
            5 - post.rating
          )
        )}`,

        post.comment ?? "",

        "SADOYA Wine App",
      ]
        .filter(Boolean)
        .join("\n");

      const canShareFiles =
        typeof navigator.canShare ===
          "function" &&
        navigator.canShare({
          files: [file],
        });

      if (
        typeof navigator.share ===
          "function" &&
        canShareFiles
      ) {
        await navigator.share({
          title:
            `${post.wine_name}のワインメモリー`,

          text: shareText,

          files: [file],
        });

        return;
      }

      const downloadLink =
        document.createElement("a");

      downloadLink.href = dataUrl;
      downloadLink.download =
        filename;

      document.body.appendChild(
        downloadLink
      );

      downloadLink.click();
      downloadLink.remove();

      alert(
        "ワインカードを保存しました。\nSNSアプリから画像を選択して共有してください。"
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "ワインカード生成エラー:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "ワインカードの生成に失敗しました"
      );
    } finally {
      setGeneratingCard(false);
      setShareTargetPost(null);
    }
  }

  return (
    <main className="space-y-5 p-5 pb-28">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-red-900">
          タイムライン
        </h1>

        <Link
          href="/"
          className="font-bold text-red-700"
        >
          ホームへ
        </Link>
      </header>

      <section className="rounded-3xl bg-red-900 p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">
          みんなのワイン記録
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/80">
          飲んだワインの感想やお気に入りを共有しよう。
        </p>

        {currentProfile?.role ===
          "admin" && (
          <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            管理者モード
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
        <p className="font-bold text-red-950">
          ワインの記録を共有しよう
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          メモリーでワインを記録するときに
          「タイムラインにも共有する」を選択してください。
        </p>

        <Link
          href="/records"
          className="mt-4 block rounded-2xl bg-red-800 py-3 text-center text-sm font-bold text-white"
        >
          ワインを記録する
        </Link>
      </section>

      {editingPost && (
        <section className="space-y-5 rounded-3xl border border-red-200 bg-white p-5 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-red-700">
                投稿編集
              </p>

              <h2 className="mt-1 text-xl font-bold text-red-950">
                {editingPost.wine_name}
              </h2>
            </div>

            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm font-bold text-gray-500"
            >
              キャンセル
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-red-900">
              評価
            </p>

            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map(
                (score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() =>
                      setEditRating(
                        score
                      )
                    }
                    className="text-4xl text-yellow-500"
                    aria-label={`評価${score}`}
                  >
                    {score <=
                    editRating
                      ? "★"
                      : "☆"}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="editComment"
              className="text-sm font-bold text-red-900"
            >
              感想
            </label>

            <textarea
              id="editComment"
              value={editComment}
              onChange={(event) =>
                setEditComment(
                  event.target.value
                )
              }
              maxLength={300}
              className="mt-2 h-32 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-700"
            />

            <p className="mt-2 text-right text-xs text-gray-400">
              {editComment.length} / 300
            </p>
          </div>

          <label className="flex items-center justify-between rounded-2xl bg-red-50 p-4">
            <div>
              <p className="font-bold text-red-950">
                公開する
              </p>

              <p className="mt-1 text-xs text-gray-500">
                オフにするとタイムラインから非表示になります。
              </p>
            </div>

            <input
              type="checkbox"
              checked={editIsPublic}
              onChange={(event) =>
                setEditIsPublic(
                  event.target.checked
                )
              }
              className="h-6 w-6 accent-red-800"
            />
          </label>

          <button
            type="button"
            onClick={saveEdit}
            disabled={saving}
            className="w-full rounded-2xl bg-red-900 py-4 font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "保存中..."
              : "変更を保存"}
          </button>
        </section>
      )}

      {loading && (
        <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="animate-bounce text-5xl">
            🍷
          </div>

          <p className="mt-3 text-sm font-bold text-gray-500">
            投稿を読み込んでいます...
          </p>
        </section>
      )}

      {!loading &&
        posts.length === 0 && (
          <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <div className="text-6xl">
              🍷
            </div>

            <h2 className="mt-4 text-lg font-bold text-red-950">
              まだ投稿がありません
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              ワインを記録して、タイムラインへ共有してみよう。
            </p>
          </section>
        )}

      {!loading &&
        posts.length > 0 && (
          <section className="space-y-4">
            {posts.map((post) => {
              const manageable =
                canManagePost(post);

              const ownPost =
                isOwnPost(post);

              const validImageUrl =
                typeof post.image_url ===
                  "string" &&
                post.image_url.startsWith(
                  "https://"
                );

              const isGeneratingThisCard =
                generatingCard &&
                shareTargetPost?.id ===
                  post.id;

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-red-950">
                          {post
                            .profiles[0]
                            ?.name ||
                            "ユーザー"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(
                            post.created_at
                          )}

                          {post.edited_at && (
                            <span className="ml-2">
                              編集済み
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="relative flex items-center gap-2">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                          公開
                        </span>

                        {manageable && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId ===
                                  post.id
                                  ? null
                                  : post.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600"
                            aria-label="投稿メニュー"
                          >
                            ・・・
                          </button>
                        )}

                        {openMenuId ===
                          post.id && (
                          <div className="absolute right-0 top-11 z-20 w-36 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                            <button
                              type="button"
                              onClick={() =>
                                startEdit(
                                  post
                                )
                              }
                              className="block w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50"
                            >
                              編集
                            </button>

                            {currentProfile?.role ===
                              "admin" && (
                              <button
                                type="button"
                                onClick={() =>
                                  hidePost(
                                    post
                                  )
                                }
                                className="block w-full px-4 py-3 text-left text-sm font-bold text-orange-700 hover:bg-orange-50"
                              >
                                非公開にする
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                deletePost(
                                  post
                                )
                              }
                              className="block w-full px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50"
                            >
                              削除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {validImageUrl && (
                    <div className="relative h-72 w-full bg-gray-100">
                      <Image
                        src={
                          post.image_url as string
                        }
                        alt={`${post.wine_name}の投稿写真`}
                        fill
                        sizes="(max-width: 448px) 100vw, 448px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 pt-4">
                    <div className="rounded-2xl bg-red-50 p-4">
                      <p className="text-xs font-bold text-red-700">
                        飲んだワイン
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-red-950">
                        {post.wine_name}
                      </h2>

                      <p className="mt-2 text-xl text-yellow-500">
                        {"★".repeat(
                          post.rating
                        )}

                        {"☆".repeat(
                          Math.max(
                            0,
                            5 -
                              post.rating
                          )
                        )}
                      </p>
                    </div>

                    {post.comment && (
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                        {post.comment}
                      </p>
                    )}

                    <div
                      className={`mt-4 grid gap-2 ${
                        ownPost
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {ownPost && (
                        <button
                          type="button"
                          onClick={() =>
                            createWineCard(
                              post
                            )
                          }
                          disabled={
                            generatingCard
                          }
                          className="rounded-2xl bg-red-50 py-3 text-sm font-bold text-red-800 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isGeneratingThisCard
                            ? "カード生成中..."
                            : "✨ ワインカードを作る"}
                        </button>
                      )}

                      {post.wine_id ? (
                        <Link
                          href={`/wine/${post.wine_id}`}
                          className="rounded-2xl border border-red-200 py-3 text-center text-sm font-bold text-red-800 transition active:scale-[0.98]"
                        >
                          🍷 ワイン詳細を見る
                        </Link>
                      ) : (
                        <div className="rounded-2xl bg-gray-50 py-3 text-center text-sm font-bold text-gray-400">
                          ワイン詳細なし
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

      {shareTargetPost && (
        <div
          className="fixed left-[-20000px] top-0"
          aria-hidden="true"
        >
          <WineShareCard
            ref={shareCardRef}
            wineName={
              shareTargetPost.wine_name
            }
            rating={
              shareTargetPost.rating
            }
            comment={
              shareTargetPost.comment
            }
            recordImageUrl={
              shareTargetPost.image_url
            }
            officialWineImageUrl={getOfficialWineImage(
              shareTargetPost
            )}
            userName={
              shareTargetPost
                .profiles[0]?.name ||
              "ユーザー"
            }
            createdAt={formatCardDate(
              shareTargetPost.created_at
            )}
            category={getWineCategory(
              shareTargetPost
            )}
          />
        </div>
      )}
    </main>
  );
}

function formatDate(
  dateString: string
) {
  const date =
    new Date(dateString);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "日時不明";
  }

  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function formatCardDate(
  dateString: string
) {
  const date =
    new Date(dateString);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date);
}