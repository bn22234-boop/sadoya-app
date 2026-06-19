"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {

  useEffect(() => {
    test();
  }, []);

  async function test() {
    const { data, error } =
      await supabase
        .from("users")
        .select("*");

    console.log("data =", data);
    console.log("error =", error);
  }

  return (
    <div>
      Supabase接続テスト
    </div>
  );
}