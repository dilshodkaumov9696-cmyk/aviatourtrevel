import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./context/settings";
import { AuthProvider } from "./context/auth";
import ChatWidget from "./components/ChatWidget";
import PWARegister from "./components/PWARegister";

// next/font сам хостит файлы и убирает внешний запрос к fonts.googleapis.com:
// нет блокирующей загрузки и нет скачка вёрстки при подмене шрифта.
// Кириллица нужна Inter и JetBrains Mono — сайт русскоязычный. Syne
// латинский, для заголовков кириллица подставится системным шрифтом,
// как это и было до перехода.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aviatour.travel — персональный навигатор в мире авиаперелётов",
  description: "Лучшие цены, проверенные авиакомпании и персональный помощник в мире авиаперелётов.",
  keywords: ["авиабилеты", "поиск рейсов", "туры", "авиаперелёты"],
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "https://aviatour.travel",
  },
  openGraph: {
    type: "website",
    title: "Aviatour.travel — персональный навигатор в мире авиаперелётов",
    description: "Лучшие цены, проверенные авиакомпании и персональный помощник в мире авиаперелётов.",
    url: "https://aviatour.travel",
    siteName: "Aviatour.travel",
    images: [
      {
        url: "https://aviatour.travel/icon.svg",
        width: 512,
        height: 512,
        alt: "Aviatour.travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviatour.travel — персональный навигатор в мире авиаперелётов",
    description: "Лучшие цены, проверенные авиакомпании и персональный помощник в мире авиаперелётов.",
    images: ["https://aviatour.travel/icon.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aviatour.travel",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const metadataBase = new URL("https://aviatour.travel");

export const viewport: Viewport = {
  themeColor: "#1E5C80",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior — подтверждаем Next, что smooth-скролл на <html> задан
    // намеренно, иначе он ругается на прыжки при переходах между маршрутами.
    <html
      lang="ru"
      className={`h-full antialiased ${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          <AuthProvider>
            {children}
            <ChatWidget />
            <PWARegister />
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
