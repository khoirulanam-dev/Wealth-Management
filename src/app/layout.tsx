import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WEALTH OS — Private Wealth & Investment Tracker",
  description: "Personal investment and financial wealth terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

