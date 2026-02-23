"use client";

import { useState } from "react";
import { useIncubator } from "@/contexts/incubator-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function UnlockDialog({ children }: { children: React.ReactNode }) {
  const { unlock } = useIncubator();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState("");

  const handleUnlock = async () => {
    const success = await unlock(pin);
    if (success) {
      toast({
        title: "System Unlocked",
        description: "You can now control the incubator.",
      });
      setIsOpen(false);
      setPin("");
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect PIN",
        description: "Please try again.",
      });
      setPin("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unlock Controls</DialogTitle>
          <DialogDescription>
            Enter the 4-digit PIN to access system controls.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pin" className="text-right">
              PIN
            </Label>
            <Input
              id="pin"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="col-span-3"
              placeholder="****"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleUnlock}>Unlock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
