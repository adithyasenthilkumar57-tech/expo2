import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPS 3.0 — Autonomous Operations Platform",
  description: "Qualified leads, recovered revenue, and scheduled conversations — all coordinated from one intelligent workspace.",
  keywords: "autonomous operations, AI platform, leads pipeline, invoices, appointments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
