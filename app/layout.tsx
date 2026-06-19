import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "../components/BottomNav";

export const metadata: Metadata = {
  title: "SADOYA Wine App",
  description: "サドヤんとワインを楽しむアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-red-50 text-gray-900">
        <main className="mx-auto min-h-screen max-w-md bg-white pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}