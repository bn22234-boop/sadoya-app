"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  login_id: string;
  name: string;
  role: string;
};

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);

  const [userCount, setUserCount] = useState(0);
  const [wineCount, setWineCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) {
      setChecking(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, login_id, name, role")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
    }

    if (data?.role === "admin") {
      await loadDashboard();
    }

    setChecking(false);
  }

  async function loadDashboard() {
    const { count: users } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: wines } = await supabase
      .from("wines")
      .select("*", { count: "exact", head: true });

    const { count: quizzes } = await supabase
      .from("wine_quizzes")
      .select("*", { count: "exact", head: true });

    const { count: records } = await supabase
      .from("wine_records")
      .select("*", { count: "exact", head: true });

    setUserCount(users ?? 0);
    setWineCount(wines ?? 0);
    setQuizCount(quizzes ?? 0);
    setRecordCount(records ?? 0);
  }

  if (checking) {
    return <div className="p-5">確認中...</div>;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="space-y-5 p-5">
        <section className="rounded-3xl bg-red-900 p-5 text-white">
          <h1 className="text-2xl font-bold">管理者画面</h1>
          <p className="mt-2 text-sm opacity-90">
            管理者権限が必要です。
          </p>
        </section>

        <Link
          href="/"
          className="block rounded-2xl bg-red-800 py-3 text-center font-bold text-white"
        >
          ホームへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">SADOYA Admin</p>
        <h1 className="mt-1 text-2xl font-bold">管理者ダッシュボード</h1>
        <p className="mt-2 text-sm opacity-90">
          ワイン・クイズ・ユーザー状況を管理します。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <AdminStat title="ユーザー数" value={`${userCount}人`} />
        <AdminStat title="ワイン数" value={`${wineCount}本`} />
        <AdminStat title="クイズ数" value={`${quizCount}問`} />
        <AdminStat title="記録数" value={`${recordCount}件`} />
      </section>

      <section className="space-y-3">
        <AdminMenu
          href="/admin/wines"
          title="ワイン管理"
          description="ワインの追加・編集・非公開設定"
        />

        <AdminMenu
          href="/admin/quizzes"
          title="クイズ管理"
          description="クイズの追加・編集・非公開設定"
        />

        <AdminMenu
          href="/admin/users"
          title="ユーザー管理"
          description="登録ユーザーや利用状況を確認"
        />
      </section>
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
    <div className="rounded-3xl bg-orange-50 p-4 text-gray-900">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-red-900">{value}</p>
    </div>
  );
}

function AdminMenu({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-red-100 bg-white p-5 text-gray-900 shadow-sm"
    >
      <h2 className="font-bold text-red-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  );
}