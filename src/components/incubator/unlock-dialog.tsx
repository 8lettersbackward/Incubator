"use client";

import { useState, useEffect } from "react";
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
  const { data, unlock, setAccessCode } = useIncubator();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [view, setView] = useState<'unlock' | 'set-pin'>('unlock');

  const isInitialSetup = !data.control.accessCode;

  useEffect(() => {
    if (isOpen) {
      if (isInitialSetup) {
        setView('set-pin');
      } else {
        setView('unlock');
      }
    }
  }, [isOpen, isInitialSetup]);


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

  const handleSetPin = () => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      setAccessCode(newPin);
      toast({
        title: isInitialSetup ? "PIN Set Successfully" : "PIN Changed",
        description: isInitialSetup ? "You can now unlock your incubator controls." : "Your new access PIN has been set.",
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
                    <Button variant="link" className="p-0 h-auto self-center sm:self-auto" onClick={() => setView('set-pin')}>Forgot PIN?</Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={closeAndReset}>Cancel</Button>
                        <Button type="submit" onClick={handleUnlock}>Unlock</Button>
                    </div>
                </DialogFooter>
            </>
        ) : (
            <>
                <DialogHeader>
                    <DialogTitle>{isInitialSetup ? 'Set Access PIN' : 'Reset Access PIN'}</DialogTitle>
                    <DialogDescription>
                         {isInitialSetup 
                            ? "To secure your incubator, please set a new 4-digit access PIN."
                            : "Enter a new 4-digit PIN. This will replace your old one."
                         }
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
                    {!isInitialSetup && <Button type="button" variant="ghost" onClick={() => { setView('unlock'); setNewPin(''); }}>Back to Unlock</Button>}
                    <Button type="submit" onClick={handleSetPin}>{isInitialSetup ? 'Save PIN' : 'Set New PIN'}</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
