"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function LayoutClient() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    function checkLoginStatus() {
      const userId = localStorage.getItem("sadoya_user_id");

      setIsLoggedIn(Boolean(userId));
      setCheckingLogin(false);
    }

    checkLoginStatus();

    // 同じブラウザ内でログイン状態が変わったとき
    window.addEventListener("sadoya-auth-changed", checkLoginStatus);

    // 別タブでログイン・ログアウトしたとき
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener(
        "sadoya-auth-changed",
        checkLoginStatus
      );

      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [pathname]);

  if (checkingLogin) {
    return null;
  }

  const publicPages = [
    "/login",
    "/signup",
    "/tutorial",
  ];

  // 認証系ページでは非表示
  if (publicPages.includes(pathname)) {
    return null;
  }

  // 未ログインなら、どのページでも非表示
  if (!isLoggedIn) {
    return null;
  }

  // ログイン済みならホームを含めて表示
  return <BottomNav />;
}