"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkProfile();
  }, []);

  async function checkProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (user.email) {
      setUserEmail(user.email);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      router.push("/profile-setup");
    }
  }

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-gradient-to-br from-red-900 to-red-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">SADOYA Wine App</p>
            <h1 className="mt-1 text-2xl font-bold">
              サドヤんと一緒に
              <br />
              ワインを楽しもう
            </h1>

            {userEmail && (
              <p className="mt-2 text-xs text-white/80">
                ログイン中: {userEmail}
              </p>
            )}
          </div>

          <Link
            href="/login"
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-900"
          >
            {userEmail ? "設定" : "ログイン"}
          </Link>
        </div>
      </section>

      <section className="rounded-3xl bg-red-50 p-5 text-center">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-white text-7xl shadow-inner">
          🍇
        </div>

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          サドヤん Lv.3
        </h2>

        <p className="text-sm text-gray-500">
          次の進化まで 380pt
        </p>

        <div className="mt-3 h-3 rounded-full bg-red-100">
          <div className="h-3 w-3/5 rounded-full bg-red-700" />
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">今日のおすすめワイン</h2>

        <div className="mt-3 flex gap-3">
          <div className="flex h-24 w-20 items-center justify-center rounded-2xl bg-red-100 text-4xl">
            🍷
          </div>

          <div>
            <p className="font-bold">サドヤ オルロージュ</p>
            <p className="mt-1 text-sm text-gray-500">
              フルーティーで初心者にも飲みやすい一本。
            </p>
            <p className="mt-2 text-xs text-red-700">
              初心者向け ★★★★★
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">今日のミッション</h2>

        <div className="mt-3 space-y-2 text-sm">
          <p>✅ ログインする +10pt</p>
          <p>□ ワインクイズに挑戦 +30pt</p>
          <p>□ ワインを記録する +50pt</p>
        </div>
      </section>
    </div>
  );
}