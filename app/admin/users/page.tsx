"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

type UserRow = {
  id: string;
  login_id: string;
  name: string;
  points: number;
  role: string;
  tutorial_completed: boolean;
  created_at: string | null;

  record_count: number;
  timeline_count: number;
  brewing_count: number;
  completed_wine_count: number;
};

const POINTS_PER_LEVEL = 100;
const MAX_LEVEL = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "user" | "admin"
  >("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    try {
      const { data: profiles, error: profileError } =
        await supabase
          .from("profiles")
          .select(`
            id,
            login_id,
            name,
            points,
            role,
            tutorial_completed,
            created_at
          `)
          .order("created_at", {
            ascending: false,
          });

      if (profileError) {
        console.error(
          "ユーザー一覧取得エラー:",
          profileError.message
        );

        alert(
          `ユーザー一覧を取得できませんでした。\n${profileError.message}`
        );

        setUsers([]);
        return;
      }

      const profileList = profiles ?? [];

      const normalizedUsers = await Promise.all(
        profileList.map(async (profile) => {
          const profileId = String(profile.id);

          const [
            recordResult,
            timelineResult,
            brewingResult,
            completedResult,
          ] = await Promise.all([
            supabase
              .from("wine_records")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("profile_id", profileId),

            supabase
              .from("timeline_posts")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("user_id", profileId),

            supabase
              .from("wine_batches")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("profile_id", profileId)
              .eq("status", "brewing"),

            supabase
              .from("wine_batches")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("profile_id", profileId)
              .in("status", [
                "completed",
                "received",
              ]),
          ]);

          return {
            id: profileId,
            login_id: String(
              profile.login_id ?? ""
            ),
            name: String(
              profile.name ?? "名前未設定"
            ),
            points: Number(
              profile.points ?? 0
            ),
            role: String(
              profile.role ?? "user"
            ),
            tutorial_completed: Boolean(
              profile.tutorial_completed
            ),
            created_at:
              profile.created_at !== null &&
              profile.created_at !== undefined
                ? String(profile.created_at)
                : null,

            record_count:
              recordResult.count ?? 0,

            timeline_count:
              timelineResult.count ?? 0,

            brewing_count:
              brewingResult.count ?? 0,

            completed_wine_count:
              completedResult.count ?? 0,
          } satisfies UserRow;
        })
      );

      setUsers(normalizedUsers);
    } catch (error) {
      console.error(
        "ユーザー管理画面エラー:",
        error
      );

      alert(
        "ユーザー情報の読み込み中にエラーが発生しました。"
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const keyword =
      searchText.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        keyword.length === 0 ||
        user.name
          .toLowerCase()
          .includes(keyword) ||
        user.login_id
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return (
        matchesKeyword &&
        matchesRole
      );
    });
  }, [
    users,
    searchText,
    roleFilter,
  ]);

  const totalUsers = users.length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const tutorialCompletedCount =
    users.filter(
      (user) =>
        user.tutorial_completed
    ).length;

  const totalRecords = users.reduce(
    (sum, user) =>
      sum + user.record_count,
    0
  );

  return (
    <main className="space-y-5 p-5 pb-28">
      <section className="rounded-3xl bg-red-950 p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm tracking-[0.12em] text-white/70">
              ADMIN USERS
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              ユーザー管理
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/80">
              登録ユーザーと利用状況を確認できます。
            </p>
          </div>

          <Link
            href="/admin"
            className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-bold text-red-950"
          >
            管理画面へ
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="登録ユーザー"
          value={`${totalUsers}人`}
          icon="👤"
          className="bg-red-50"
        />

        <SummaryCard
          label="管理者"
          value={`${adminCount}人`}
          icon="👑"
          className="bg-yellow-50"
        />

        <SummaryCard
          label="初期設定完了"
          value={`${tutorialCompletedCount}人`}
          icon="✅"
          className="bg-green-50"
        />

        <SummaryCard
          label="総ワイン記録"
          value={`${totalRecords}件`}
          icon="🍷"
          className="bg-orange-50"
        />
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
        <h2 className="font-bold text-red-950">
          ユーザーを検索
        </h2>

        <input
          value={searchText}
          onChange={(event) =>
            setSearchText(
              event.target.value
            )
          }
          placeholder="名前またはログインID"
          className="mt-3 w-full rounded-2xl border border-red-100 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red-400"
        />

        <div className="mt-3 grid grid-cols-3 gap-2">
          <FilterButton
            label="すべて"
            active={
              roleFilter === "all"
            }
            onClick={() =>
              setRoleFilter("all")
            }
          />

          <FilterButton
            label="一般"
            active={
              roleFilter === "user"
            }
            onClick={() =>
              setRoleFilter("user")
            }
          />

          <FilterButton
            label="管理者"
            active={
              roleFilter === "admin"
            }
            onClick={() =>
              setRoleFilter("admin")
            }
          />
        </div>

        <p className="mt-3 text-right text-xs text-gray-400">
          {filteredUsers.length}人表示
        </p>
      </section>

      {loading && (
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="animate-bounce text-5xl">
            👥
          </div>

          <p className="mt-4 text-sm font-bold text-gray-500">
            ユーザー情報を読み込んでいます...
          </p>
        </section>
      )}

      {!loading &&
        filteredUsers.length === 0 && (
          <section className="rounded-3xl bg-white p-7 text-center shadow-sm">
            <div className="text-5xl">
              🔍
            </div>

            <h2 className="mt-4 text-lg font-bold text-red-950">
              該当するユーザーがいません
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              検索条件を変更してください。
            </p>
          </section>
        )}

      {!loading &&
        filteredUsers.length > 0 && (
          <section className="space-y-4">
            {filteredUsers.map(
              (user) => {
                const level =
                  Math.min(
                    Math.floor(
                      user.points /
                        POINTS_PER_LEVEL
                    ),
                    MAX_LEVEL
                  );

                const stageName =
                  getStageName(level);

                return (
                  <article
                    key={user.id}
                    className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-lg font-bold text-red-950">
                            {user.name}
                          </h2>

                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </div>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          ID：
                          {user.login_id}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          登録日：
                          {formatDate(
                            user.created_at
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-bold text-red-900">
                          Lv.{level}
                        </p>

                        <p className="text-xs text-gray-400">
                          {user.points.toLocaleString()}
                          pt
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-4">
                      <UserStat
                        label="成長段階"
                        value={
                          stageName
                        }
                        icon="🍇"
                      />

                      <UserStat
                        label="初期設定"
                        value={
                          user.tutorial_completed
                            ? "完了"
                            : "未完了"
                        }
                        icon={
                          user.tutorial_completed
                            ? "✅"
                            : "⏳"
                        }
                      />

                      <UserStat
                        label="ワイン記録"
                        value={`${user.record_count}件`}
                        icon="📝"
                      />

                      <UserStat
                        label="投稿"
                        value={`${user.timeline_count}件`}
                        icon="👥"
                      />

                      <UserStat
                        label="醸造中"
                        value={`${user.brewing_count}本`}
                        icon="🪵"
                      />

                      <UserStat
                        label="完成ワイン"
                        value={`${user.completed_wine_count}本`}
                        icon="🍾"
                      />
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}

      <button
        type="button"
        onClick={loadUsers}
        disabled={loading}
        className="w-full rounded-2xl border border-red-200 bg-white py-4 font-bold text-red-800 shadow-sm disabled:opacity-50"
      >
        {loading
          ? "更新中..."
          : "ユーザー情報を再読み込み"}
      </button>

      <section className="rounded-3xl bg-gray-100 p-4 text-sm leading-6 text-gray-600">
        <p className="font-bold text-gray-800">
          現在の管理方法
        </p>

        <p className="mt-2">
          この画面はユーザー情報と利用状況の確認専用です。
          管理者権限の付与や変更は、現在はSupabase上で行います。
        </p>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon: string;
  className: string;
}) {
  return (
    <div
      className={`rounded-3xl p-4 text-gray-900 ${className}`}
    >
      <p className="text-2xl">
        {icon}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-red-950">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl py-3 text-sm font-bold transition ${
        active
          ? "bg-red-800 text-white"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {label}
    </button>
  );
}

function RoleBadge({
  role,
}: {
  role: string;
}) {
  if (role === "admin") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
        管理者
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
      一般
    </span>
  );
}

function UserStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {icon}
        </span>

        <p className="text-xs text-gray-500">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function getStageName(
  level: number
) {
  if (level <= 0) {
    return "種";
  }

  if (level <= 4) {
    return "赤ちゃん";
  }

  if (level <= 9) {
    return "子供";
  }

  if (level <= 14) {
    return "青年";
  }

  if (level <= 19) {
    return "大人";
  }

  return "キング";
}

function formatDate(
  dateString: string | null
) {
  if (!dateString) {
    return "不明";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "不明";
  }

  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}