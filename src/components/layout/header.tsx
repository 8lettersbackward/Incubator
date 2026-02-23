"use client";

import { useIncubator } from "@/contexts/incubator-context";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, TestTube2 } from "lucide-react";

export default function Header() {
  const { isLoggedIn, login, logout } = useIncubator();

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <TestTube2 className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
          OvumView Console
        </h1>
      </div>
      <Button onClick={isLoggedIn ? logout : login} variant="ghost" size="sm">
        {isLoggedIn ? <LogOut className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
        {isLoggedIn ? "Logout" : "Login"}
      </Button>
    </header>
  );
}
