"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/wine", label: "ワイン", icon: "🍷" },
  { href: "/missions", label: "ミッション", icon: "🎯" },
  { href: "/records", label: "記録", icon: "📝" },
  { href: "/character", label: "キャラ", icon: "🍇" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-red-100 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 text-xs ${
                isActive ? "text-red-700 font-bold" : "text-gray-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}