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

type WineBatch = {
  id: string;
  batch_number: number;
  wine_name: string;
  status: "brewing" | "completed" | "received";
  started_at: string;
  finish_at: string;
  completed_at: string | null;
};

const MAX_LEVEL = 20;
const POINTS_PER_LEVEL = 100;
const SADOYAN_TYPE = 1;

export default function CharacterPage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [wineBatches, setWineBatches] =
    useState<WineBatch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [batchesLoading, setBatchesLoading] =
    useState(true);

  const [harvesting, setHarvesting] =
    useState(false);

  const [
    receivingBatchId,
    setReceivingBatchId,
  ] = useState<string | null>(null);

  const [currentTime, setCurrentTime] =
    useState(Date.now());

  useEffect(() => {
    initializePage();

    const intervalId =
      window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function initializePage() {
    await Promise.all([
      loadProfile(),
      loadWineBatches(),
    ]);
  }

  async function loadProfile() {
    const userId =
      localStorage.getItem(
        "sadoya_user_id"
      );

    if (!userId) {
      setProfile(null);
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

    if (error || !data) {
      console.error(
        "プロフィール取得エラー:",
        error?.message
      );

      setProfile(null);
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

  async function loadWineBatches() {
    const userId =
      localStorage.getItem(
        "sadoya_user_id"
      );

    if (!userId) {
      setWineBatches([]);
      setBatchesLoading(false);
      return;
    }

    setBatchesLoading(true);

    /*
     * finish_atを過ぎている醸造を
     * completedへ更新する。
     */
    const {
      error: completionError,
    } = await supabase.rpc(
      "complete_finished_batches",
      {
        p_profile_id: userId,
      }
    );

    if (completionError) {
      console.error(
        "醸造完了更新エラー:",
        completionError.message
      );
    }

    const { data, error } =
      await supabase
        .from("wine_batches")
        .select(`
          id,
          batch_number,
          wine_name,
          status,
          started_at,
          finish_at,
          completed_at
        `)
        .eq(
          "profile_id",
          userId
        )
        .in("status", [
          "brewing",
          "completed",
        ])
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "醸造状況取得エラー:",
        error.message
      );

      setWineBatches([]);
      setBatchesLoading(false);
      return;
    }

    const normalizedBatches:
      WineBatch[] =
      (data ?? []).map(
        (batch) => ({
          id: String(batch.id),

          batch_number: Number(
            batch.batch_number
          ),

          wine_name: String(
            batch.wine_name
          ),

          status:
            batch.status as
              | "brewing"
              | "completed"
              | "received",

          started_at: String(
            batch.started_at
          ),

          finish_at: String(
            batch.finish_at
          ),

          completed_at:
            batch.completed_at !==
            null
              ? String(
                  batch.completed_at
                )
              : null,
        })
      );

    setWineBatches(
      normalizedBatches
    );

    setBatchesLoading(false);
  }

  async function harvestSadoyan() {
    if (!profile) {
      alert(
        "プロフィールを読み込めませんでした"
      );
      return;
    }

    if (harvesting) {
      return;
    }

    const confirmed =
      window.confirm(
        [
          "キングサドヤンからブドウを収穫しますか？",
          "",
          "収穫後はワインの醸造が始まり、",
          "新しいサドヤんは種から育成開始となります。",
        ].join("\n")
      );

    if (!confirmed) {
      return;
    }

    setHarvesting(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "harvest_sadoyan",
          {
            p_profile_id:
              profile.id,
          }
        );

      if (error) {
        console.error(
          "収穫エラー:",
          error
        );

        alert(error.message);
        return;
      }

      if (!data) {
        alert(
          "収穫処理に失敗しました"
        );
        return;
      }

      alert(
        [
          "収穫が完了しました！🍇",
          "",
          "ワインの醸造が始まりました。",
          "新しいサドヤんを種から育てよう🌱",
        ].join("\n")
      );

      await Promise.all([
        loadProfile(),
        loadWineBatches(),
      ]);
    } finally {
      setHarvesting(false);
    }
  }

  async function receiveWine(
    batch: WineBatch
  ) {
    if (!profile) {
      alert(
        "ログイン情報を確認できません"
      );
      return;
    }

    if (receivingBatchId) {
      return;
    }

    const confirmed =
      window.confirm(
        [
          `「${batch.wine_name}」を受け取りますか？`,
          "",
          "受け取ったワインは、",
          "今後作成するワインセラーへ保存されます。",
        ].join("\n")
      );

    if (!confirmed) {
      return;
    }

    setReceivingBatchId(
      batch.id
    );

    try {
      const { data, error } =
        await supabase.rpc(
          "receive_wine_batch",
          {
            p_profile_id:
              profile.id,

            p_batch_id:
              batch.id,
          }
        );

      if (error) {
        console.error(
          "ワイン受け取りエラー:",
          error
        );

        alert(error.message);
        return;
      }

      if (data !== true) {
        alert(
          "ワインの受け取りに失敗しました"
        );
        return;
      }

      alert(
        [
          "ワインを受け取りました！🍷",
          "",
          `${batch.wine_name}が完成ワインとして保存されました。`,
        ].join("\n")
      );

      await loadWineBatches();
    } finally {
      setReceivingBatchId(
        null
      );
    }
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

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] p-5">
        <section className="w-full rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="text-5xl">
            🌱
          </div>

          <h1 className="mt-4 text-xl font-bold text-red-950">
            サドヤんを読み込めませんでした
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            ログイン状態を確認してください。
          </p>

          <Link
            href="/"
            className="mt-5 block rounded-2xl bg-red-800 py-3 font-bold text-white"
          >
            ホームへ戻る
          </Link>
        </section>
      </main>
    );
  }

  const points =
    profile.points ?? 0;

  const calculatedLevel =
    Math.floor(
      points /
        POINTS_PER_LEVEL
    );

  const level =
    Math.min(
      calculatedLevel,
      MAX_LEVEL
    );

  const isKing =
    level >= MAX_LEVEL;

  const stage =
    getSadoyanStage(
      level,
      SADOYAN_TYPE
    );

  const currentLevelProgress =
    isKing
      ? 100
      : points %
        POINTS_PER_LEVEL;

  const pointsToNextLevel =
    isKing
      ? 0
      : currentLevelProgress === 0
        ? POINTS_PER_LEVEL
        : POINTS_PER_LEVEL -
          currentLevelProgress;

  const levelsToNextStage =
    stage.nextStageLevel !==
    null
      ? Math.max(
          0,
          stage.nextStageLevel -
            level
        )
      : 0;

  const pointsToNextStage =
    stage.nextStageLevel !==
    null
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

        <p className="mt-3 text-sm text-white/80">
          {profile.name}
          さんのサドヤん
        </p>
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
              <span>
                キングまでの成長度
              </span>

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
                  width:
                    `${overallProgress}%`,
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
            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
              <p className="text-5xl">
                👑🍇
              </p>

              <p className="mt-3 text-xl font-bold text-red-950">
                キングサドヤンに
                成長しました！
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                立派に育ったサドヤんから
                ブドウを収穫し、
                ワイン造りを始められます。
              </p>

              <button
                type="button"
                onClick={
                  harvestSadoyan
                }
                disabled={
                  harvesting
                }
                className="mt-5 w-full rounded-2xl bg-red-800 py-4 font-bold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {harvesting
                  ? "収穫しています..."
                  : "🍇 収穫する"}
              </button>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                収穫後は新しい種から育成が始まります。
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-orange-100 bg-white p-5 text-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-orange-700">
              SADOYA BREWERY
            </p>

            <h2 className="mt-1 text-lg font-bold text-red-950">
              ワイン醸造
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              歴代サドヤんが育てたブドウを醸造しています。
            </p>
          </div>

          <div className="relative h-16 w-16 shrink-0">
            <Image
              src="/images/brewing/barrel.png"
              alt="ワイン樽"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
        </div>

        {batchesLoading ? (
          <div className="mt-5 rounded-2xl bg-orange-50 p-5 text-center">
            <div className="relative mx-auto h-20 w-20 animate-pulse">
              <Image
                src="/images/brewing/barrel.png"
                alt="ワイン樽"
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              醸造状況を確認しています...
            </p>
          </div>
        ) : wineBatches.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-orange-50 p-5 text-center">
            <div className="relative mx-auto h-24 w-24">
              <Image
                src="/images/brewing/barrel.png"
                alt="空のワイン樽"
                fill
                sizes="96px"
                className="object-contain opacity-50"
              />
            </div>

            <p className="mt-3 font-bold text-red-950">
              まだ醸造中のワインはありません
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              サドヤんをキングまで育てて、
              ブドウを収穫しよう。
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {wineBatches.map(
              (batch) => {
                const brewingInfo =
                  getBrewingInfo(
                    batch,
                    currentTime
                  );

                const completed =
                  batch.status ===
                  "completed";

                return (
                  <article
                    key={batch.id}
                    className={`overflow-hidden rounded-3xl border ${
                      completed
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-orange-100 bg-orange-50"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 shrink-0">
                          <Image
                            src={
                              completed
                                ? "/images/brewing/wine-bottle.png"
                                : "/images/brewing/barrel.png"
                            }
                            alt={
                              completed
                                ? "完成したワイン"
                                : "醸造中のワイン樽"
                            }
                            fill
                            sizes="96px"
                            className="object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-orange-700">
                            No.
                            {
                              batch.batch_number
                            }
                          </p>

                          <h3 className="mt-1 font-bold text-red-950">
                            {
                              batch.wine_name
                            }
                          </h3>

                          <p className="mt-2 text-sm font-bold text-orange-700">
                            {
                              brewingInfo.stage
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              brewingInfo.remaining
                            }
                          </p>
                        </div>
                      </div>

                      {!completed && (
                        <div className="mt-4">
                          <div className="h-3 overflow-hidden rounded-full bg-orange-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-700 transition-all duration-500"
                              style={{
                                width:
                                  `${brewingInfo.progress}%`,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-right text-xs font-bold text-orange-700">
                            {
                              brewingInfo.progress
                            }
                            %
                          </p>
                        </div>
                      )}

                      {completed && (
                        <>
                          <div className="mt-4 rounded-2xl bg-white p-3 text-center">
                            <p className="text-sm font-bold text-red-950">
                              ワインが完成しました！
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              受け取ると完成ワインとして保存されます。
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              receiveWine(
                                batch
                              )
                            }
                            disabled={
                              receivingBatchId ===
                              batch.id
                            }
                            className="mt-4 w-full rounded-2xl bg-red-800 py-4 font-bold text-white shadow transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {receivingBatchId ===
                            batch.id
                              ? "受け取っています..."
                              : "🍷 完成したワインを受け取る"}
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
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
          アプリを使って、
          サドヤんを育てよう。
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
            active={
              level === 0
            }
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
            active={
              level >= 20
            }
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

function getBrewingInfo(
  batch: WineBatch,
  now: number
) {
  if (
    batch.status ===
    "completed"
  ) {
    return {
      stage:
        "ワインが完成しました！",
      remaining:
        "受け取りボタンを押してください",
      progress: 100,
    };
  }

  const startedAt =
    new Date(
      batch.started_at
    ).getTime();

  const finishAt =
    new Date(
      batch.finish_at
    ).getTime();

  if (
    Number.isNaN(startedAt) ||
    Number.isNaN(finishAt)
  ) {
    return {
      stage:
        "醸造状況を確認中",
      remaining:
        "日時情報を確認できません",
      progress: 0,
    };
  }

  const totalTime =
    Math.max(
      finishAt -
        startedAt,
      1
    );

  const elapsedTime =
    Math.max(
      now -
        startedAt,
      0
    );

  const ratio =
    Math.min(
      elapsedTime /
        totalTime,
      1
    );

  let stage =
    "発酵が始まりました";

  if (ratio >= 0.85) {
    stage =
      "瓶詰めの準備をしています";
  } else if (
    ratio >= 0.6
  ) {
    stage =
      "樽の中で熟成しています";
  } else if (
    ratio >= 0.3
  ) {
    stage =
      "香りと味わいを育てています";
  }

  return {
    stage,

    remaining:
      formatRemainingTime(
        finishAt - now
      ),

    progress:
      Math.min(
        100,
        Math.max(
          0,
          Math.floor(
            ratio * 100
          )
        )
      ),
  };
}

function formatRemainingTime(
  milliseconds: number
) {
  if (milliseconds <= 0) {
    return "まもなく完成します";
  }

  const totalMinutes =
    Math.ceil(
      milliseconds / 60000
    );

  if (totalMinutes < 60) {
    return `完成まであと${totalMinutes}分`;
  }

  const totalHours =
    Math.ceil(
      totalMinutes / 60
    );

  if (totalHours < 24) {
    return `完成まであと${totalHours}時間`;
  }

  const totalDays =
    Math.ceil(
      totalHours / 24
    );

  return `完成まであと${totalDays}日`;
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
      name:
        "赤ちゃんサドヤン",
      image:
        `/images/sadoyan/baby${type}.png`,
      nextStageName:
        "子供サドヤン",
      nextStageLevel: 5,
      message:
        "生まれたばかりのサドヤん。たくさん記録して育てよう。",
    };
  }

  if (level <= 9) {
    return {
      name:
        "子供サドヤン",
      image:
        `/images/sadoyan/child${type}.png`,
      nextStageName:
        "青年サドヤン",
      nextStageLevel: 10,
      message:
        "元気いっぱいに成長中。少しずつ頼もしくなってきました。",
    };
  }

  if (level <= 14) {
    return {
      name:
        "青年サドヤン",
      image:
        `/images/sadoyan/youth${type}.png`,
      nextStageName:
        "大人サドヤン",
      nextStageLevel: 15,
      message:
        "立派なサドヤんを目指して、ブドウのお世話をしています。",
    };
  }

  if (level <= 19) {
    return {
      name:
        "大人サドヤン",
      image:
        `/images/sadoyan/adult${type}.png`,
      nextStageName:
        "キングサドヤン",
      nextStageLevel: 20,
      message:
        "収穫まであと少し。立派なブドウが実ってきました。",
    };
  }

  return {
    name:
      "キングサドヤン",
    image:
      `/images/sadoyan/king${type}.png`,
    nextStageName: null,
    nextStageLevel: null,
    message:
      "ついにキングへ成長！ブドウを収穫して、ワイン造りを始めよう。",
  };
}