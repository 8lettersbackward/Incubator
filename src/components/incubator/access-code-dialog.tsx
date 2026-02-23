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

export default function AccessCodeDialog({ children }: { children: React.ReactNode }) {
  const { setAccessCode } = useIncubator();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newPin, setNewPin] = useState("");

  const handleSave = () => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      setAccessCode(newPin);
      toast({
        title: "Access Code Changed",
        description: "Your new access code has been set.",
      });
      setIsOpen(false);
      setNewPin("");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Please enter a 4-digit numeric PIN.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Access Code</DialogTitle>
          <DialogDescription>
            Enter a new 4-digit PIN for system access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pin" className="text-right">
              New PIN
            </Label>
            <Input
              id="pin"
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
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
