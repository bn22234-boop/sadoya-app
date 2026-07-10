"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function LayoutClient() {
  const pathname = usePathname();

  const hideBottomNav = [
    "/",
    "/login",
    "/signup",
    "/tutorial",
  ].includes(pathname);

  if (hideBottomNav) return null;

  return <BottomNav />;
}