import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "WEALTH OS — Personal Wealth & Investment Management",
  description: "Personal investment and financial wealth management platform",
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
      </body>
    </html>
  );
}
