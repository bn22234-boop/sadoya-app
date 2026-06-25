"use client";

import { useEffect, useState } from "react";
import HeaderCard from "@/components/HeaderCard";
import MissionCard from "@/components/MissionCard";
import { missions } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";

type PointLog = {
  action_key: string;
  points: number;
};

export default function MissionsPage() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [todayPoints, setTodayPoints] = useState(0);

  useEffect(() => {
    loadMissionStatus();
  }, []);

  async function loadMissionStatus() {
    const userId = localStorage.getItem("sadoya_user_id");

    if (!userId) return;

    setProfileId(userId);

    const today = getMissionDate();

    const { data, error } = await supabase
      .from("point_logs")
      .select("action_key, points")
      .eq("profile_id", userId)
      .eq("action_date", today);

    if (error) {
      console.log(error.message);
      return;
    }

    const logs = (data ?? []) as PointLog[];

    setCompletedKeys(logs.map((log) => log.action_key));
    setTodayPoints(logs.reduce((sum, log) => sum + log.points, 0));
  }

  function getMissionDate() {
    const now = new Date();
    now.setHours(now.getHours() - 4);

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  async function completeMission(missionKey: string, points: number) {
    if (!profileId) {
      alert("ログインしてください");
      return;
    }

    if (missionKey === "quiz") {
      window.location.href = "/quiz";
      return;
    }

    if (missionKey === "record") {
      window.location.href = "/records";
      return;
    }

    const { data, error } = await supabase.rpc("add_points_once_per_day", {
      p_profile_id: profileId,
      p_action_type: "mission",
      p_action_key: missionKey,
      p_points: points,
      p_memo: "ミッション達成",
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data === false) {
      alert("このミッションは今日すでに達成済みです");
      return;
    }

    alert(`+${points}pt 獲得しました！`);
    loadMissionStatus();
  }

  return (
    <div className="space-y-5 p-5">
      <HeaderCard
        label="Today's Missions"
        title="ミッション"
        description="達成するとポイントが貯まり、サドヤんが成長します。"
      />

      <section className="rounded-3xl bg-orange-50 p-4 text-gray-900">
        <p className="text-sm text-gray-500">今日の獲得ポイント</p>
        <p className="mt-1 text-3xl font-bold text-red-900">
          {todayPoints}pt
        </p>
        <p className="mt-1 text-xs text-gray-500">
          毎日AM4:00にリセット
        </p>
      </section>

      <section className="space-y-3">
        {missions.map((mission) => (
          <MissionCard
            key={mission.key}
            icon={mission.icon}
            title={mission.title}
            description={mission.description}
            points={mission.points}
            completed={completedKeys.includes(mission.key)}
            onComplete={() =>
              completeMission(mission.key, mission.points)
            }
          />
        ))}
      </section>
    </div>
  );
}