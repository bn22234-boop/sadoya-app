"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  profiles: {
    name: string;
  }[];
};

export default function TimelinePage() {
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

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
        profiles (
          name
        )
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("タイムライン取得エラー:", error);
      setPosts([]);
      setLoading(false);
      return;
    }

    const normalizedPosts: TimelinePost[] = (data ?? []).map(
      (post) => ({
        id: String(post.id),
        user_id: String(post.user_id),
        wine_id:
          post.wine_id !== null
            ? String(post.wine_id)
            : null,
        wine_name: String(post.wine_name),
        rating: Number(post.rating),
        comment:
          post.comment !== null
            ? String(post.comment)
            : null,
        image_url:
          post.image_url !== null
            ? String(post.image_url)
            : null,
        is_public: Boolean(post.is_public),
        created_at: String(post.created_at),
        profiles: Array.isArray(post.profiles)
          ? post.profiles.map((profile) => ({
              name: String(profile.name),
            }))
          : [],
      })
    );

    setPosts(normalizedPosts);
    setLoading(false);
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
      </section>

      <Link
        href="/timeline/new"
        className="block rounded-2xl bg-red-800 py-4 text-center font-bold text-white shadow"
      >
        ＋ 投稿する
      </Link>

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

      {!loading && posts.length === 0 && (
        <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="text-6xl">
            🍷
          </div>

          <h2 className="mt-4 text-lg font-bold text-red-950">
            まだ投稿がありません
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            最初のワイン記録を投稿してみよう。
          </p>
        </section>
      )}

      {!loading && posts.length > 0 && (
        <section className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-red-950">
                    {post.profiles[0]?.name || "ユーザー"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(post.created_at)}
                  </p>
                </div>

                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  公開
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold text-red-700">
                  飲んだワイン
                </p>

                <h2 className="mt-1 text-xl font-bold text-red-950">
                  {post.wine_name}
                </h2>

                <p className="mt-2 text-xl text-yellow-500">
                  {"★".repeat(post.rating)}
                  {"☆".repeat(
                    Math.max(0, 5 - post.rating)
                  )}
                </p>
              </div>

              {post.comment && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {post.comment}
                </p>
              )}

              {post.wine_id && (
                <Link
                  href={`/wine/${post.wine_id}`}
                  className="mt-4 block rounded-2xl border border-red-200 py-3 text-center text-sm font-bold text-red-800"
                >
                  ワインの詳細を見る
                </Link>
              )}
            </article>
          ))}
        </section>
      )}
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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}