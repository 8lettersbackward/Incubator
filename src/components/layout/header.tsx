"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Unlock,
  Settings,
  ShieldAlert,
  TestTube2,
  BrainCircuit,
} from "lucide-react";
import UnlockDialog from "@/components/incubator/unlock-dialog";
import AccessCodeDialog from "@/components/incubator/access-code-dialog";
import AiGuidanceDialog from "@/components/incubator/ai-guidance-dialog";
import { useIncubator } from "@/contexts/incubator-context";
import { EmergencyStopDialog } from "@/components/incubator/emergency-stop-dialog";

export default function Header() {
  const { isLocked, lock } = useIncubator();

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <TestTube2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tighter text-foreground">
          OvumView Console
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>System Control</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {isLocked ? (
                <UnlockDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Unlock className="mr-2 h-4 w-4" />
                    <span>Unlock System</span>
                  </DropdownMenuItem>
                </UnlockDialog>
              ) : (
                <DropdownMenuItem onClick={lock}>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Lock System</span>
                </DropdownMenuItem>
              )}
              <AccessCodeDialog>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isLocked}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Change PIN</span>
                 </DropdownMenuItem>
              </AccessCodeDialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <AiGuidanceDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        <span>AI Guidance</span>
                    </DropdownMenuItem>
                </AiGuidanceDialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <EmergencyStopDialog>
                <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()} 
                    disabled={isLocked}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Emergency Stop</span>
                </DropdownMenuItem>
            </EmergencyStopDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
