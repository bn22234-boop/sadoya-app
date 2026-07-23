"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { missions } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  login_id: string;
  name: string;
  points: number;
  level: number;
  role: string;
  tutorial_completed: boolean;
  character_stage?: number;
  has_sadoyan_seed?: boolean;
};

type RecommendedWine = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category_label: string | null;
  beginner_score: number;
};

type PointLog = {
  action_key: string;
  points: number;
};

type SadoyanStage = {
  name: string;
  image: string;
  nextStageName: string | null;
  nextStageLevel: number | null;
  message: string;
};

type LoggedInHomeProps = {
  profile: Profile;
  onLogout: () => void;
};

const MAX_LEVEL = 20;
const POINTS_PER_LEVEL = 100;

/*
 * 現在はサドヤんタイプ1のみ。
 * 将来的にタイプを増やしたら、
 * DBから取得した番号へ置き換えられる。
 */
const SADOYAN_TYPE = 1;

export default function HomePage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [checkingLogin, setCheckingLogin] =
    useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userId =
      localStorage.getItem("sadoya_user_id");

    if (!userId) {
      setProfile(null);
      setCheckingLogin(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        login_id,
        name,
        points,
        level,
        role,
        tutorial_completed,
        character_stage,
        has_sadoyan_seed
      `)
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(
        "プロフィール取得エラー:",
        error?.message
      );

      localStorage.removeItem(
        "sadoya_user_id"
      );

      localStorage.removeItem(
        "sadoya_login_id"
      );

      window.dispatchEvent(
        new Event("sadoya-auth-changed")
      );

      setProfile(null);
      setCheckingLogin(false);
      return;
    }

    if (!data.tutorial_completed) {
      router.replace("/tutorial");
      return;
    }

    setProfile({
      id: String(data.id),
      login_id: String(data.login_id),
      name: String(data.name),
      points: Number(data.points ?? 0),
      level: Number(data.level ?? 0),
      role: String(data.role ?? "user"),
      tutorial_completed: Boolean(
        data.tutorial_completed
      ),
      character_stage:
        data.character_stage !== null &&
        data.character_stage !== undefined
          ? Number(data.character_stage)
          : undefined,
      has_sadoyan_seed:
        data.has_sadoyan_seed !== null &&
        data.has_sadoyan_seed !== undefined
          ? Boolean(data.has_sadoyan_seed)
          : undefined,
    });

    setCheckingLogin(false);
  }

  function logout() {
    localStorage.removeItem(
      "sadoya_user_id"
    );

    localStorage.removeItem(
      "sadoya_login_id"
    );

    window.dispatchEvent(
      new Event("sadoya-auth-changed")
    );

    setProfile(null);

    router.replace("/");
    router.refresh();
  }

  if (checkingLogin) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <WelcomePage />;
  }

  return (
    <LoggedInHome
      profile={profile}
      onLogout={logout}
    />
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6]">
      <div className="text-center">
        <div className="animate-bounce text-6xl">
          🍇
        </div>

        <p className="mt-5 text-sm font-bold text-red-900">
          SADOYA Wine App
        </p>

        <p className="mt-2 text-sm text-gray-500">
          読み込んでいます...
        </p>
      </div>
    </main>
  );
}

function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/sadoya-login.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-red-950/90" />

      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-10 pt-16 text-white">
        <div className="mx-auto w-full max-w-md">
          <section className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/20 text-5xl shadow-xl backdrop-blur-md">
              🍇
            </div>

            <p className="mt-5 text-sm font-bold tracking-[0.18em] text-white/90">
              SADOYA WINE APP
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              ワインの世界へ
              <br />
              ようこそ
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/90">
              サドヤんと一緒に、
              <br />
              ワインを知って、楽しんで、育てよう。
            </p>
          </section>

          <section className="space-y-3 rounded-[2rem] border border-white/30 bg-white/90 p-5 text-gray-900 shadow-2xl backdrop-blur-md">
            <Link
              href="/signup"
              className="block w-full rounded-2xl bg-red-900 py-4 text-center font-bold text-white shadow-md transition active:scale-[0.98]"
            >
              初めての方はこちら

              <span className="mt-1 block text-xs font-normal text-white/80">
                新規登録
              </span>
            </Link>

            <Link
              href="/login"
              className="block w-full rounded-2xl border border-red-200 bg-white py-4 text-center font-bold text-red-950 transition active:scale-[0.98]"
            >
              アカウントをお持ちの方

              <span className="mt-1 block text-xs font-normal text-gray-500">
                ログイン
              </span>
            </Link>
          </section>

          <section className="mt-7 grid grid-cols-3 gap-2 text-center text-xs text-white/90">
            <WelcomeFeature
              icon="🍷"
              label="ワインを知る"
            />

            <WelcomeFeature
              icon="📝"
              label="記録を残す"
            />

            <WelcomeFeature
              icon="🌱"
              label="サドヤんを育てる"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function WelcomeFeature({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-black/25 px-2 py-3 backdrop-blur-sm">
      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-1">
        {label}
      </p>
    </div>
  );
}

function LoggedInHome({
  profile,
  onLogout,
}: LoggedInHomeProps) {
  const [
    recommendedWine,
    setRecommendedWine,
  ] =
    useState<RecommendedWine | null>(
      null
    );

  const [
    completedMissionKeys,
    setCompletedMissionKeys,
  ] = useState<string[]>([]);

  const [todayPoints, setTodayPoints] =
    useState(0);

  const [
    recommendationLoading,
    setRecommendationLoading,
  ] = useState(true);

  const [
    missionsLoading,
    setMissionsLoading,
  ] = useState(true);

  useEffect(() => {
    loadRecommendedWine();
    loadTodayMissions();
  }, [profile.id]);

  async function loadRecommendedWine() {
    setRecommendationLoading(true);

    const { data, error } = await supabase
      .from("wines")
      .select(`
        id,
        name,
        description,
        image_url,
        category_label,
        beginner_score
      `)
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "おすすめワイン取得エラー:",
        error.message
      );

      setRecommendedWine(null);
      setRecommendationLoading(false);
      return;
    }

    const wines: RecommendedWine[] =
      (data ?? []).map((wine) => ({
        id: String(wine.id),

        name: String(wine.name),

        description:
          wine.description !== null
            ? String(wine.description)
            : null,

        image_url:
          wine.image_url !== null
            ? String(wine.image_url)
            : null,

        category_label:
          wine.category_label !== null
            ? String(
                wine.category_label
              )
            : null,

        beginner_score: Number(
          wine.beginner_score ?? 0
        ),
      }));

    if (wines.length === 0) {
      setRecommendedWine(null);
      setRecommendationLoading(false);
      return;
    }

    /*
     * ユーザーIDとAM4:00基準の日付から
     * その日のおすすめ番号を決定。
     *
     * 同じ日は再読み込みしても変わらず、
     * ユーザーごとに異なる候補が表示される。
     */
    const recommendationSeed =
      `${profile.id}-${getMissionDate()}`;

    const recommendedIndex =
      createStableIndex(
        recommendationSeed,
        wines.length
      );

    setRecommendedWine(
      wines[recommendedIndex]
    );

    setRecommendationLoading(false);
  }

  async function loadTodayMissions() {
    setMissionsLoading(true);

    const today =
      getMissionDate();

    const { data, error } = await supabase
      .from("point_logs")
      .select(
        "action_key, points"
      )
      .eq(
        "profile_id",
        profile.id
      )
      .eq(
        "action_date",
        today
      );

    if (error) {
      console.error(
        "ミッション状況取得エラー:",
        error.message
      );

      setCompletedMissionKeys([]);
      setTodayPoints(0);
      setMissionsLoading(false);
      return;
    }

    const logs: PointLog[] =
      (data ?? []).map((log) => ({
        action_key: String(
          log.action_key
        ),

        points: Number(
          log.points ?? 0
        ),
      }));

    setCompletedMissionKeys(
      Array.from(
        new Set(
          logs.map(
            (log) =>
              log.action_key
          )
        )
      )
    );

    setTodayPoints(
      logs.reduce(
        (total, log) =>
          total + log.points,
        0
      )
    );

    setMissionsLoading(false);
  }

  const points =
    profile.points ?? 0;

  /*
   * 0〜99pt：種 Lv.0
   * 100pt：赤ちゃん Lv.1
   * 2000pt：キング Lv.20
   */
  const level = Math.min(
    Math.floor(
      points /
        POINTS_PER_LEVEL
    ),
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

  const dailyMessage =
    getDailySadoyanMessage(
      profile.id,
      stage,
      pointsToNextLevel
    );

  return (
    <main className="space-y-5 p-5 pb-28">
      <section className="rounded-3xl bg-gradient-to-br from-red-900 to-red-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">
              SADOYA Wine App
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              サドヤんと一緒に
              <br />
              ワインを楽しもう
            </h1>

            <p className="mt-2 text-sm text-white/80">
              こんにちは、
              {profile.name}さん
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-white/70">
              ログイン中
            </p>

            <p className="max-w-[100px] truncate font-bold text-white">
              {profile.login_id}
            </p>

            <button
              type="button"
              onClick={onLogout}
              className="mt-2 rounded-xl bg-white px-3 py-1 text-xs font-bold text-red-900"
            >
              ログアウト
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-b from-red-50 to-orange-50 p-5 text-center shadow-sm">
        <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-left shadow-sm">
          <p className="text-sm font-bold text-red-900">
            {stage.name}
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            「{dailyMessage}」
          </p>
        </div>

        <div className="mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-full bg-white shadow-inner">
          <div className="flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full bg-white">
            <Image
              src={stage.image}
              alt={stage.name}
              width={180}
              height={180}
              priority
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>
        </div>

        <p className="mt-4 text-sm font-bold text-red-700">
          {stage.name}
        </p>

        <h2 className="mt-1 text-3xl font-bold text-gray-900">
          Lv.{level}
        </h2>

        <p className="mt-1 text-sm font-bold text-gray-600">
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
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-red-900">
              次のレベルまで
              あと
              {pointsToNextLevel}
              pt
            </p>

            {stage.nextStageName && (
              <p className="mt-2 text-xs text-gray-500">
                あと
                {pointsToNextStage}
                ptで
                {stage.nextStageName}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-yellow-50 p-4">
            <p className="text-3xl">
              👑🍇
            </p>

            <p className="mt-2 font-bold text-red-950">
              収穫できます！
            </p>

            <p className="mt-1 text-xs text-gray-500">
              キングサドヤンから
              ブドウを収穫しよう。
            </p>
          </div>
        )}

        <Link
          href="/character"
          className="mt-4 block rounded-2xl border border-red-200 bg-white py-3 text-center text-sm font-bold text-red-800"
        >
          育成ルームを見る
        </Link>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-red-700">
              DAILY WINE
            </p>

            <h2 className="mt-1 font-bold">
              今日のおすすめワイン
            </h2>
          </div>

          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            毎日更新
          </span>
        </div>

        {recommendationLoading ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-5 text-center">
            <div className="animate-bounce text-4xl">
              🍷
            </div>

            <p className="mt-2 text-sm text-gray-500">
              おすすめを選んでいます...
            </p>
          </div>
        ) : recommendedWine ? (
          <>
            <Link
              href={`/wine/${recommendedWine.id}`}
              className="mt-4 flex gap-4 rounded-2xl bg-red-50 p-4 transition active:scale-[0.99]"
            >
              <div className="relative flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                {isValidImageUrl(
                  recommendedWine.image_url
                ) ? (
                  <Image
                    src={
                      recommendedWine.image_url as string
                    }
                    alt={
                      recommendedWine.name
                    }
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-5xl">
                    🍷
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 text-left">
                {recommendedWine.category_label && (
                  <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700">
                    {
                      recommendedWine.category_label
                    }
                  </span>
                )}

                <h3 className="mt-2 font-bold text-red-950">
                  {recommendedWine.name}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                  {recommendedWine.description ||
                    "商品の詳しい情報は詳細画面で確認できます。"}
                </p>

                <p className="mt-2 text-sm text-yellow-500">
                  {"★".repeat(
                    recommendedWine.beginner_score
                  )}

                  {"☆".repeat(
                    Math.max(
                      0,
                      5 -
                        recommendedWine.beginner_score
                    )
                  )}
                </p>
              </div>
            </Link>

            <p className="mt-3 text-center text-xs text-gray-400">
              今日中は同じおすすめが表示されます。
            </p>
          </>
        ) : (
          <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-center">
            <p className="text-sm text-gray-500">
              おすすめワインを準備中です。
            </p>
          </div>
        )}

        <Link
          href="/wine"
          className="mt-4 block rounded-2xl bg-red-800 py-3 text-center text-sm font-bold text-white"
        >
          ワインリストを見る
        </Link>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-red-700">
              TODAY&apos;S MISSIONS
            </p>

            <h2 className="mt-1 font-bold">
              今日のミッション
            </h2>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">
              今日の獲得
            </p>

            <p className="font-bold text-red-800">
              {missionsLoading
                ? "..."
                : `${todayPoints}pt`}
            </p>
          </div>
        </div>

        {missionsLoading ? (
          <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-center">
            <p className="text-sm text-gray-500">
              ミッション状況を確認しています...
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {missions
              .filter((mission) =>
                [
                  "login",
                  "quiz",
                  "record",
                ].includes(
                  mission.key
                )
              )
              .map((mission) => {
                const completed =
                  completedMissionKeys.includes(
                    mission.key
                  );

                return (
                  <Link
                    key={mission.key}
                    href={
                      mission.key ===
                      "quiz"
                        ? "/quiz"
                        : mission.key ===
                            "record"
                          ? "/records"
                          : "/missions"
                    }
                    className={`flex items-center gap-3 rounded-2xl border p-4 transition active:scale-[0.99] ${
                      completed
                        ? "border-green-100 bg-green-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                        completed
                          ? "bg-green-100"
                          : "bg-white"
                      }`}
                    >
                      {completed
                        ? "✅"
                        : mission.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-bold ${
                          completed
                            ? "text-green-800"
                            : "text-gray-800"
                        }`}
                      >
                        {mission.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {completed
                          ? "今日のミッション達成済み"
                          : mission.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          completed
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {completed
                          ? "達成"
                          : `+${mission.points}pt`}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}

        <p className="mt-3 text-center text-xs text-gray-400">
          毎日AM4:00に更新されます。
        </p>

        <Link
          href="/missions"
          className="mt-4 block rounded-2xl border border-red-200 py-3 text-center text-sm font-bold text-red-800"
        >
          ミッションを見る
        </Link>
      </section>

      <Link
        href="/points"
        className="block rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
      >
        <h2 className="font-bold">
          ポイント履歴
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          獲得したポイントを確認する
        </p>
      </Link>

      {profile.role === "admin" && (
        <Link
          href="/admin"
          className="block rounded-3xl bg-red-900 p-4 text-white shadow-sm"
        >
          <h2 className="font-bold">
            管理者画面
          </h2>

          <p className="mt-1 text-sm text-white/80">
            ワイン・クイズ・ユーザー情報を管理する
          </p>
        </Link>
      )}
    </main>
  );
}

/*
 * 毎日AM4:00を境に日付を切り替える。
 */
function getMissionDate() {
  const now = new Date();

  now.setHours(
    now.getHours() - 4
  );

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * 同じ文字列からは毎回同じ番号を返す。
 * Math.random()と違い、ページ更新で商品が変わらない。
 */
function createStableIndex(
  value: string,
  itemCount: number
) {
  if (itemCount <= 0) {
    return 0;
  }

  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(index)) |
      0;
  }

  return (
    Math.abs(hash) %
    itemCount
  );
}

function getDailySadoyanMessage(
  profileId: string,
  stage: SadoyanStage,
  pointsToNextLevel: number
) {
  const messages =
    stage.nextStageName !== null
      ? [
          `あと${pointsToNextLevel}ptで次のレベルだよ！`,
          "今日も会いに来てくれてありがとう！",
          `${stage.nextStageName}を目指して一緒に頑張ろう！`,
          "ワインを記録すると、もっと成長できるよ！",
          "今日のミッションにも挑戦してみよう！",
        ]
      : [
          "ついにキングサドヤンになったよ！",
          "立派なブドウを収穫できるよ！",
          "ここまで育ててくれてありがとう！",
        ];

  const seed =
    `${profileId}-${getMissionDate()}-message`;

  const index =
    createStableIndex(
      seed,
      messages.length
    );

  return messages[index];
}

function isValidImageUrl(
  imageUrl: string | null
) {
  return (
    typeof imageUrl ===
      "string" &&
    (imageUrl.startsWith("/") ||
      imageUrl.startsWith(
        "https://"
      ))
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
      name: "子供サドヤン",
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
      name: "青年サドヤン",
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
      name: "大人サドヤン",
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
    name: "キングサドヤン",
    image:
      `/images/sadoyan/king${type}.png`,
    nextStageName: null,
    nextStageLevel: null,
    message:
      "ついにキングへ成長！ブドウを収穫して、ワイン造りを始めよう。",
  };
}