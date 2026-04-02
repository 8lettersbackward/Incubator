"use client";

import { Egg, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useView, ViewType } from "@/contexts/view-context";

export default function Header() {
  const { setFocusedView } = useView();

  const menuItems: { label: string, view: ViewType }[] = [
    { label: "Control Panel", view: "controls" },
    { label: "Water Management", view: "water" },
    { label: "Camera Feed", view: "camera" },
    { label: "System Controls", view: "system" },
    { label: "Incubation Progress", view: "progress" },
    { label: "Components Guide", view: "components" },
  ];

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Egg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tighter text-foreground">
          Eggcelent
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.view} onClick={() => setFocusedView(item.view)}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
