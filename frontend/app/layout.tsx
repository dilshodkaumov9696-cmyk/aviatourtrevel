import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "./context/settings";

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
    <html lang="ru" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
