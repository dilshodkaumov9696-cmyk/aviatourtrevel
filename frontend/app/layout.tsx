import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aviator — дешёвые авиабилеты онлайн",
  description: "Поиск и бронирование авиабилетов по лучшим ценам. Сравните предложения сотен авиакомпаний.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
