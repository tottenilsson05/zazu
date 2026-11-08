import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Press_Start_2P, Silkscreen, Space_Mono } from "next/font/google";
import { SITE_URL } from "@/config/site";
import "./globals.css";

const press = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press", display: "swap" });
const silk = Silkscreen({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-silk", display: "swap" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

const description = "zazu — zazu, the cat that has seen everything. the internet never forgot him. $ZAZU on pump.fun.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "zazu",
  applicationName: "zazu",
  description,
  openGraph: {
    title: "zazu",
    siteName: "zazu",
    description,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Zazu the cat on the green hills" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "zazu", description, images: ["/images/og.jpg"] },
  appleWebApp: { title: "zazu" },
};

export const viewport: Viewport = {
  themeColor: "#1238ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${press.variable} ${silk.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
