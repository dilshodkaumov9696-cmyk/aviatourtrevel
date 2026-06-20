import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "./context/settings";
import ChatWidget from "./components/ChatWidget";
import PWARegister from "./components/PWARegister";

export const metadata: Metadata = {
  title: "Aviator — дешёвые авиабилеты онлайн",
  description: "Поиск и бронирование авиабилетов по лучшим ценам. Сравните предложения сотен авиакомпаний.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aviator",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E5C80",
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
        <SettingsProvider>
          {children}
          <ChatWidget />
          <PWARegister />
        </SettingsProvider>
      </body>
    </html>
  );
}
