import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { FirebaseProvider } from "@/firebase/provider";

export const metadata: Metadata = {
  title: "Eggcelent",
  description: "Smart Egg Incubator IoT Dashboard",
  themeColor: "#2e7d32",
  manifest: "/manifest.json",
  applicationName: "Eggcelent",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eggcelent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2e7d32" />
        <link rel="apple-touch-icon" href="/logoo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className={cn("font-body antialiased bg-background")}>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
        <Toaster />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
