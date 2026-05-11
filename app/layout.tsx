import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CursorGlow } from "@/components/ambient/CursorGlow";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sanath Swaroop Mulky - AI Engineer",
  description: "AI engineer · systems · security · product. A live console portfolio.",
  metadataBase: new URL("https://sanathswaroop.com"),
  openGraph: {
    title: "Sanath Swaroop Mulky - AI Engineer",
    description: "AI engineer · systems · security · product.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrains.variable} h-full antialiased`}>
      <body className="relative min-h-full overflow-x-hidden">
        <CursorGlow />
        <main className="relative z-10 min-h-full">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
