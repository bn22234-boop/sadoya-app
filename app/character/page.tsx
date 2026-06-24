"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  login_id: string;
  name: string;
  points: number;
};

export default function CharacterPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, login_id, name, points")
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error.message);
      return;
    }

    setProfile(data);
  }

  const points = profile?.points ?? 0;
  const level = Math.floor(points / 100) + 1;
  const nextPoint = 100 - (points % 100);
  const progress = points % 100;

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">Sadoyan Room</p>
        <h1 className="mt-1 text-2xl font-bold">サドヤん育成</h1>
        <p className="mt-2 text-sm opacity-90">
          ポイントを貯めて、サドヤんを成長させよう。
        </p>

        {profile && (
          <p className="mt-3 text-sm text-white/80">
            {profile.name}さんのサドヤん
          </p>
        )}
      </section>

      <section className="rounded-3xl bg-red-50 p-5 text-center text-gray-900">
        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-white shadow-inner">
          <Image
            src="/images/sadoyan.png"
            alt="サドヤん"
            width={170}
            height={170}
            className="object-contain"
          />
        </div>

        <h2 className="mt-4 text-2xl font-bold">サドヤん</h2>

        <p className="text-sm text-gray-500">
          Lv.{level} / {points}pt
        </p>

        <div className="mt-4 h-3 rounded-full bg-red-100">
          <div
            className="h-3 rounded-full bg-red-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-gray-500">
          次のLvまで {nextPoint}pt
        </p>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-3xl bg-orange-50 p-4 text-gray-900">
          <p className="text-2xl">❤️</p>
          <p className="mt-1 text-xs text-gray-500">仲良し度</p>
          <p className="font-bold">{Math.min(points, 100)}%</p>
        </div>

        <div className="rounded-3xl bg-yellow-50 p-4 text-gray-900">
          <p className="text-2xl">🍽️</p>
          <p className="mt-1 text-xs text-gray-500">満足度</p>
          <p className="font-bold">{Math.min(level * 10, 100)}%</p>
        </div>

        <div className="rounded-3xl bg-purple-50 p-4 text-gray-900">
          <p className="text-2xl">✨</p>
          <p className="mt-1 text-xs text-gray-500">成長度</p>
          <p className="font-bold">Lv.{level}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">成長アクション</h2>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/missions"
            className="rounded-2xl bg-red-700 py-3 text-center font-bold text-white"
          >
            クイズする
          </Link>

          <Link
            href="/records"
            className="rounded-2xl bg-orange-100 py-3 text-center font-bold text-red-900"
          >
            記録する
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900">
        <h2 className="font-bold">レベル目安</h2>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p>Lv.1：0pt〜</p>
          <p>Lv.2：100pt〜</p>
          <p>Lv.3：200pt〜</p>
          <p>Lv.5：400pt〜</p>
          <p>Lv.10：900pt〜</p>
        </div>
      </section>
    </div>
  );
}