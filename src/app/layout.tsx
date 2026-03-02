import type { Metadata } from "next";
import "./globals.css";

import { IncubatorProvider } from "@/contexts/incubator-context";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

export const metadata: Metadata = {
  title: "Eggcelent",
  description: "Smart Egg Incubator IoT Dashboard",
  themeColor: "#2e7d32",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#2e7d32" />

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
        <IncubatorProvider>
          {children}
          <Toaster />
        </IncubatorProvider>

        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
