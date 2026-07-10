import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "./LayoutClient";

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

        <LayoutClient />
      </body>
    </html>
  );
}