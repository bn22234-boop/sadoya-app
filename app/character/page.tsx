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

type SadoyanStage = {
  name: string;
  image: string;
  nextStageName: string | null;
  nextStageLevel: number | null;
  message: string;
};

const MAX_LEVEL = 20;
const POINTS_PER_LEVEL = 100;
const SADOYAN_TYPE = 1;

export default function CharacterPage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userId =
      localStorage.getItem(
        "sadoya_user_id"
      );

    if (!userId) {
      setLoading(false);
      return;
    }

    const { data, error } =
      await supabase
        .from("profiles")
        .select(
          "id, login_id, name, points"
        )
        .eq("id", userId)
        .single();

    if (error) {
      console.error(
        "プロフィール取得エラー:",
        error.message
      );

      setLoading(false);
      return;
    }

    setProfile({
      id: String(data.id),
      login_id: String(
        data.login_id
      ),
      name: String(data.name),
      points: Number(
        data.points ?? 0
      ),
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
        <div className="text-center">
          <div className="animate-bounce text-5xl">
            🍇
          </div>

          <p className="mt-4 text-sm font-bold text-red-900">
            サドヤんを呼んでいます...
          </p>
        </div>
      </main>
    );
  }

  const points =
    profile?.points ?? 0;

  const calculatedLevel =
    Math.floor(
      points / POINTS_PER_LEVEL
    );

  const level = Math.min(
    calculatedLevel,
    MAX_LEVEL
  );

  const isKing =
    level >= MAX_LEVEL;

  const stage = getSadoyanStage(
    level,
    SADOYAN_TYPE
  );

  const currentLevelProgress =
    isKing
      ? 100
      : points % POINTS_PER_LEVEL;

  const pointsToNextLevel =
    isKing
      ? 0
      : POINTS_PER_LEVEL -
        currentLevelProgress;

  const levelsToNextStage =
    stage.nextStageLevel !== null
      ? Math.max(
          0,
          stage.nextStageLevel -
            level
        )
      : 0;

  const pointsToNextStage =
    stage.nextStageLevel !== null
      ? Math.max(
          0,
          stage.nextStageLevel *
            POINTS_PER_LEVEL -
            points
        )
      : 0;

  const overallProgress =
    Math.min(
      100,
      (points /
        (MAX_LEVEL *
          POINTS_PER_LEVEL)) *
        100
    );

  return (
    <main className="space-y-5 p-5 pb-28">
      <section className="rounded-3xl bg-red-900 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">
          Sadoyan Room
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          サドヤん育成
        </h1>

        <p className="mt-2 text-sm leading-6 opacity-90">
          ワインの記録やミッションで、
          サドヤんをキングまで育てよう。
        </p>

        {profile && (
          <p className="mt-3 text-sm text-white/80">
            {profile.name}
            さんのサドヤん
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-b from-red-50 to-orange-50 text-center text-gray-900 shadow-sm">
        <div className="p-5">
          <span className="inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-red-800 shadow-sm">
            {stage.name}
          </span>

          <div className="mx-auto mt-4 flex h-64 w-64 items-center justify-center overflow-hidden rounded-full bg-white shadow-inner">
  <div className="flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-full bg-white">
    <Image
      src={stage.image}
      alt={stage.name}
      width={220}
      height={220}
      priority
      className="h-full w-full object-contain mix-blend-multiply"
    />
  </div>
</div>

          <h2 className="mt-4 text-2xl font-bold text-red-950">
            {stage.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {stage.message}
          </p>

          <div className="mt-5 flex items-end justify-center gap-2">
            <p className="text-4xl font-bold text-red-900">
              Lv.{level}
            </p>

            <p className="pb-1 text-sm text-gray-500">
              / Lv.{MAX_LEVEL}
            </p>
          </div>

          <p className="mt-1 text-sm font-bold text-gray-700">
            {points.toLocaleString()}
            pt
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>成長度</span>
              <span>
                {Math.floor(
                  overallProgress
                )}
                %
              </span>
            </div>

            <div className="mt-2 h-4 overflow-hidden rounded-full bg-red-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-700 to-orange-500 transition-all duration-500"
                style={{
                  width: `${overallProgress}%`,
                }}
              />
            </div>
          </div>

          {!isKing ? (
            <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-red-900">
                次のレベルまで
              </p>

              <p className="mt-1 text-2xl font-bold text-red-950">
                あと
                {pointsToNextLevel}
                pt
              </p>

              {stage.nextStageName && (
                <div className="mt-4 border-t border-red-50 pt-4">
                  <p className="text-xs font-bold text-gray-500">
                    次の進化
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-900">
                    {stage.nextStageName}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    あと
                    {levelsToNextStage}
                    Lv・
                    {pointsToNextStage}
                    pt
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-yellow-50 p-5 shadow-sm">
              <p className="text-4xl">
                👑🍇
              </p>

              <p className="mt-2 text-xl font-bold text-red-950">
                キングサドヤンに
                成長しました！
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                立派に育ったサドヤんから、
                ブドウを収穫できます。
              </p>

              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-2xl bg-gray-300 py-4 font-bold text-gray-500"
              >
                🍇 収穫する
                （次の実装）
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        <StatusCard
          icon="❤️"
          label="仲良し度"
          value={`${Math.min(
            100,
            Math.floor(
              overallProgress
            )
          )}%`}
          className="bg-orange-50"
        />

        <StatusCard
          icon="🍇"
          label="獲得ポイント"
          value={`${points.toLocaleString()}pt`}
          className="bg-yellow-50"
        />

        <StatusCard
          icon="✨"
          label="成長段階"
          value={`Lv.${level}`}
          className="bg-purple-50"
        />
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
        <h2 className="font-bold text-red-950">
          成長アクション
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          アプリを使って、サドヤんを育てよう。
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/missions"
            className="rounded-2xl bg-red-800 py-4 text-center font-bold text-white transition active:scale-[0.98]"
          >
            🎯 ミッション
          </Link>

          <Link
            href="/records"
            className="rounded-2xl bg-orange-100 py-4 text-center font-bold text-red-900 transition active:scale-[0.98]"
          >
            📝 記録する
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm">
        <h2 className="font-bold text-red-950">
          サドヤんの成長
        </h2>

        <div className="mt-4 space-y-3">
          <StageGuide
            icon="🌱"
            name="種"
            range="Lv.0"
            active={level === 0}
          />

          <StageGuide
            icon="👶"
            name="赤ちゃんサドヤン"
            range="Lv.1〜4"
            active={
              level >= 1 &&
              level <= 4
            }
          />

          <StageGuide
            icon="🧒"
            name="子供サドヤン"
            range="Lv.5〜9"
            active={
              level >= 5 &&
              level <= 9
            }
          />

          <StageGuide
            icon="🧑"
            name="青年サドヤン"
            range="Lv.10〜14"
            active={
              level >= 10 &&
              level <= 14
            }
          />

          <StageGuide
            icon="🍇"
            name="大人サドヤン"
            range="Lv.15〜19"
            active={
              level >= 15 &&
              level <= 19
            }
          />

          <StageGuide
            icon="👑"
            name="キングサドヤン"
            range="Lv.20"
            active={level >= 20}
          />
        </div>
      </section>
    </main>
  );
}

function StatusCard({
  icon,
  label,
  value,
  className,
}: {
  icon: string;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div
      className={`rounded-3xl p-4 text-gray-900 ${className}`}
    >
      <p className="text-2xl">
        {icon}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function StageGuide({
  icon,
  name,
  range,
  active,
}: {
  icon: string;
  name: string;
  range: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border p-4 ${
        active
          ? "border-red-300 bg-red-50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {icon}
        </div>

        <div>
          <p
            className={`font-bold ${
              active
                ? "text-red-900"
                : "text-gray-700"
            }`}
          >
            {name}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {range}
          </p>
        </div>
      </div>

      {active && (
        <span className="rounded-full bg-red-800 px-3 py-1 text-xs font-bold text-white">
          現在
        </span>
      )}
    </div>
  );
}

function getSadoyanStage(
  level: number,
  type = 1
): SadoyanStage {
  if (level <= 0) {
    return {
      name: "種",
      image:
        "/images/sadoyan/seed.png",
      nextStageName:
        "赤ちゃんサドヤン",
      nextStageLevel: 1,
      message:
        "どんなサドヤんが生まれるのか、楽しみに待とう。",
    };
  }

  if (level <= 4) {
    return {
      name: "赤ちゃんサドヤン",
      image: `/images/sadoyan/baby${type}.png`,
      nextStageName:
        "子供サドヤン",
      nextStageLevel: 5,
      message:
        "生まれたばかりのサドヤん。たくさん記録して育てよう。",
    };
  }

  if (level <= 9) {
    return {
      name: "子供サドヤン",
      image: `/images/sadoyan/child${type}.png`,
      nextStageName:
        "青年サドヤン",
      nextStageLevel: 10,
      message:
        "元気いっぱいに成長中。少しずつ頼もしくなってきました。",
    };
  }

  if (level <= 14) {
    return {
      name: "青年サドヤン",
      image: `/images/sadoyan/youth${type}.png`,
      nextStageName:
        "大人サドヤン",
      nextStageLevel: 15,
      message:
        "立派なサドヤんを目指して、ブドウのお世話をしています。",
    };
  }

  if (level <= 19) {
    return {
      name: "大人サドヤン",
      image: `/images/sadoyan/adult${type}.png`,
      nextStageName:
        "キングサドヤン",
      nextStageLevel: 20,
      message:
        "収穫まであと少し。立派なブドウが実ってきました。",
    };
  }

  return {
    name: "キングサドヤン",
    image: `/images/sadoyan/king${type}.png`,
    nextStageName: null,
    nextStageLevel: null,
    message:
      "ついにキングへ成長！ブドウを収穫して、ワイン造りを始めよう。",
  };
}