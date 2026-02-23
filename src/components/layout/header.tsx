"use client";

import { TestTube2 } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <TestTube2 className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
          OvumView Console
        </h1>
      </div>
    </header>
  );
}
