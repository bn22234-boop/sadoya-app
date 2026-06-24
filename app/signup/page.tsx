"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [wineExperience, setWineExperience] = useState("");
  const [favoriteTaste, setFavoriteTaste] = useState("");
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [checkingId, setCheckingId] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkLoginId();
    }, 400);

    return () => clearTimeout(timer);
  }, [loginId]);

  async function checkLoginId() {
    const fixedLoginId = loginId.trim();

    if (!fixedLoginId) {
      setIdAvailable(null);
      return;
    }

    setCheckingId(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("login_id", fixedLoginId)
      .maybeSingle();

    if (error) {
      setIdAvailable(null);
      setCheckingId(false);
      return;
    }

    setIdAvailable(!data);
    setCheckingId(false);
  }

  async function signup() {
    const fixedLoginId = loginId.trim();

    if (!fixedLoginId || !password || !name || !wineExperience || !favoriteTaste) {
      alert("すべて入力してください");
      return;
    }

    if (password.length < 4) {
      alert("パスワードは4文字以上にしてください");
      return;
    }

    if (idAvailable === false) {
      alert("このIDはすでに使われています");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.rpc(
      "create_profile_with_password",
      {
        p_login_id: fixedLoginId,
        p_password: password,
        p_name: name,
        p_wine_experience: wineExperience,
        p_favorite_taste: favoriteTaste,
      }
    );

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("sadoya_user_id", data.id);
    localStorage.setItem("sadoya_login_id", data.login_id);

    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] p-5 text-gray-900">
      <section className="pt-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl shadow-inner">
          🍇
        </div>

        <h1 className="mt-5 text-3xl font-bold text-red-950">
          新規登録
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          IDとパスワードを設定して始めましょう。
        </p>
      </section>

      <section className="mt-6 space-y-4 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <div>
          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="ログインID"
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none"
          />

          {checkingId && (
            <p className="mt-2 text-xs font-bold text-gray-500">
              IDを確認中...
            </p>
          )}

          {idAvailable === true && !checkingId && (
            <p className="mt-2 text-xs font-bold text-green-600">
              このIDは使用できます
            </p>
          )}

          {idAvailable === false && !checkingId && (
            <p className="mt-2 text-xs font-bold text-red-600">
              このIDはすでに使われています
            </p>
          )}
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード（4文字以上）"
          className="w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none"
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ニックネーム"
          className="w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-gray-900 outline-none"
        />

        <div>
          <p className="mb-2 text-sm font-bold text-red-900">
            ワイン経験
          </p>

          <div className="space-y-2">
            {["ほぼ飲んだことがない", "たまに飲む", "よく飲む"].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setWineExperience(item)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left font-bold ${
                    wineExperience === item
                      ? "border-red-800 bg-red-800 text-white"
                      : "border-red-100 bg-red-50 text-red-900"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-red-900">
            好きな味
          </p>

          <div className="grid grid-cols-2 gap-2">
            {["甘め", "すっきり", "フルーティー", "濃いめ"].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFavoriteTaste(item)}
                  className={`rounded-2xl border px-4 py-3 font-bold ${
                    favoriteTaste === item
                      ? "border-red-800 bg-red-800 text-white"
                      : "border-red-100 bg-red-50 text-red-900"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        <button
          onClick={signup}
          disabled={loading || checkingId || idAvailable === false}
          className="w-full rounded-2xl bg-red-800 py-4 font-bold text-white disabled:opacity-50"
        >
          {loading ? "登録中..." : "登録して始める"}
        </button>

        <Link
          href="/login"
          className="block text-center text-sm font-bold text-red-700"
        >
          ログインはこちら
        </Link>
      </section>
    </div>
  );
}