import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster } from "@/components/ui/toaster";
import ClientSessionProvider from "@/providers/session-provider";
import ReactQueryProvider from "@/components/providers/query-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "K2KAI Social Flow",
  description: "Luxury dark social hub powered by EnmaSco",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <ReactQueryProvider>
          <ClientSessionProvider>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </ClientSessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
