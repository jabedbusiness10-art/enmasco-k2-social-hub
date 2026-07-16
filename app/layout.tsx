import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster } from "@/components/ui/toaster";
import ClientSessionProvider from "@/providers/session-provider";
import ReactQueryProvider from "@/components/providers/query-provider";
import { PageTransition, AnimatedBackground } from "@/components/anim/motion";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "K2KAI Social Flow",
  description: "Luxury dark social hub powered by EnmaSco",
  applicationName: "K2KAI Social Flow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "K2KAI",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }, { url: "/icons/icon-512.png", sizes: "512x512" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  other: {
    "theme-color": "#0a0a14",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#030305",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <AnimatedBackground />
        <ReactQueryProvider>
          <ClientSessionProvider>
            <ToastProvider>
              <PageTransition>{children}</PageTransition>
              <Toaster />
            </ToastProvider>
          </ClientSessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
