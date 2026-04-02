"use client";

import { Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useView, ViewType } from "@/contexts/view-context";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import Logo from "../logo";

export default function Header() {
  const { setFocusedView } = useView();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Sign out error:", error);
       toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: "Could not sign you out. Please try again.",
      });
    }
  };

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
      <Logo className="h-8" />

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
          {user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
