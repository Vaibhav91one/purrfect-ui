import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Intro } from "@/components/providers/intro";
import { PageFade } from "@/components/providers/page-fade";
import { SoundProvider } from "@/components/providers/sound-provider";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_OG, SITE_URL } from "@/lib/site";

const DESCRIPTION = "Animated React components with sound, built from real projects. Install with the shadcn CLI or copy the source.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "purrfect ui", template: "%s · purrfect ui" },
  description: DESCRIPTION,
  applicationName: "purrfect ui",
  authors: [{ name: "Vaibhav Tomar", url: "https://vaibhavtomar.com" }],
  creator: "Vaibhav Tomar",
  keywords: ["react components", "animated components", "shadcn registry", "tailwind css", "motion", "gsap", "ui library", "copy and paste components"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "purrfect ui", title: "purrfect ui", description: DESCRIPTION, url: "/", locale: "en_US", images: [DEFAULT_OG] },
  twitter: { card: "summary_large_image", title: "purrfect ui", description: DESCRIPTION, images: [DEFAULT_OG.url] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Saved choice wins, otherwise the OS setting; runs before first paint so there is no flash
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light")document.documentElement.classList.add("dark")}catch(e){}`;

// Tab already saw the intro: hide the loader and show the page before first paint (no flash, no replay)
const introScript = `try{if(sessionStorage.getItem("purrfect-intro")){var d=document.documentElement;d.dataset.seen="";d.dataset.intro="ready";d.dataset.landed=""}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript }} />
      </head>
      {/* suppressHydrationWarning: extensions (e.g. ColorZilla) add attributes to <body> before React hydrates */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SoundProvider>
          <PageFade>{children}</PageFade>
        </SoundProvider>
        <Toaster />
        <Intro />
      </body>
    </html>
  );
}
