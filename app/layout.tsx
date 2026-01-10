import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAH - Artist Portfolio",
  description: "Portfolio website for artist SAH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
