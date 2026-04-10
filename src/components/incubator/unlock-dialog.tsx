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
  const { unlock, setAccessCode } = useIncubator();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [view, setView] = useState<'unlock' | 'reset'>('unlock');

  const handleUnlock = async () => {
    const success = await unlock(pin);
    if (success) {
      toast({
        title: "System Unlocked",
        description: "You can now control the incubator.",
      });
      closeAndReset();
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect PIN",
        description: "Please try again.",
      });
      setPin("");
    }
  };

  const handleResetPin = () => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      setAccessCode(newPin);
      toast({
        title: "PIN Changed",
        description: "Your new access PIN has been set.",
      });
      closeAndReset();
    } else {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Please enter a 4-digit numeric PIN.",
      });
    }
  }

  const closeAndReset = () => {
    setIsOpen(false);
    setPin("");
    setNewPin("");
    setView('unlock');
  };
  
  const onOpenChange = (open: boolean) => {
    if (!open) {
        closeAndReset();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {view === 'unlock' ? (
            <>
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
                <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row items-center gap-2">
                    <Button variant="link" className="p-0 h-auto self-center sm:self-auto" onClick={() => setView('reset')}>Forgot PIN?</Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={closeAndReset}>Cancel</Button>
                        <Button type="submit" onClick={handleUnlock}>Unlock</Button>
                    </div>
                </DialogFooter>
            </>
        ) : (
            <>
                <DialogHeader>
                    <DialogTitle>Reset Access PIN</DialogTitle>
                    <DialogDescription>
                        Enter a new 4-digit PIN for system access. This will replace your old one.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-pin" className="text-right">
                        New PIN
                        </Label>
                        <Input
                        id="new-pin"
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="col-span-3"
                        placeholder="4 digits"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => { setView('unlock'); setNewPin(''); }}>Back to Unlock</Button>
                    <Button type="submit" onClick={handleResetPin}>Set New PIN</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
