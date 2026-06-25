"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PointLog = {
  id: string;
  action_type: string;
  action_key: string;
  points: number;
  memo: string | null;
  created_at: string;
};

export default function PointsPage() {
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadPointLogs();
  }, []);

  async function loadPointLogs() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single();

    if (profile) {
      setTotalPoints(profile.points);
    }

    const { data, error } = await supabase
      .from("point_logs")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      return;
    }

    setLogs(data ?? []);
  }

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-3xl bg-red-900 p-5 text-white">
        <p className="text-sm opacity-80">Point History</p>
        <h1 className="mt-1 text-2xl font-bold">ポイント履歴</h1>
        <p className="mt-2 text-sm opacity-90">
          サドヤんの成長につながる活動を確認できます。
        </p>
      </section>

      <section className="rounded-3xl bg-orange-50 p-5 text-gray-900">
        <p className="text-sm text-gray-500">現在の総ポイント</p>
        <p className="mt-1 text-4xl font-bold text-red-900">
          {totalPoints}pt
        </p>
      </section>

      <section className="space-y-3">
        {logs.length === 0 && (
          <p className="rounded-3xl bg-white p-5 text-sm text-gray-500">
            まだポイント履歴がありません。
          </p>
        )}

        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-3xl border border-red-100 bg-white p-4 text-gray-900 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">
                  {log.memo ?? log.action_key}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleString("ja-JP")}
                </p>
              </div>

              <p className="text-xl font-bold text-red-900">
                +{log.points}pt
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}