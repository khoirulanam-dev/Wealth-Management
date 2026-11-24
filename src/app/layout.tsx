import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { PwaInstallPrompt } from "@/presentation/components/pwa/pwa-install-prompt";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#007AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wealth-management-teal-three.vercel.app"),
  title: "WEALTH OS — Personal Wealth & Investment Management",
  description: "Sistem Manajemen Portofolio & Keuangan Pribadi Privat",
  applicationName: "Wealth OS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wealth OS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
