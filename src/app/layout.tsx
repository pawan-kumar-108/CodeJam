import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CodeJam",
  description: "Join the ultimate gamified coding platform.",
};

import { ConvexClientProvider } from "./ConvexClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-nav-black text-nav-cream`}
      >
        <ConvexClientProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ConvexClientProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
