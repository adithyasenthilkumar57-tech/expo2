import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080d14" },
    { media: "(prefers-color-scheme: light)", color: "#f0f4f8" },
  ],
};

export const metadata: Metadata = {
  title: "OPS 3.0 — Autonomous Operations Platform",
  description: "Qualified leads, recovered revenue, and scheduled conversations — all coordinated from one intelligent workspace.",
  keywords: "autonomous operations, AI platform, leads pipeline, invoices, appointments, CRM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OPS 3.0",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "OPS 3.0 — Autonomous Operations Platform",
    description: "Qualified leads, recovered revenue, and scheduled conversations — all in one intelligent workspace.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
