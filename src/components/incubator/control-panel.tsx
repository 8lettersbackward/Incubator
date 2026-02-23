"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIncubator } from "@/contexts/incubator-context";
import { Lock, Thermometer, Wind, RotateCw, OctagonAlert, BrainCircuit, X, Delete } from "lucide-react";
import AiGuidanceDialog from "./ai-guidance-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PinPad = ({ onUnlockSuccess }: { onUnlockSuccess: () => void }) => {
    const { unlock } = useIncubator();
    const { toast } = useToast();
    const [pin, setPin] = useState('');

    const handlePinClick = (digit: string) => {
        if (pin.length < 4) {
            setPin(pin + digit);
        }
    };
    const handleBackspace = () => setPin(pin.slice(0, -1));
    const handleClear = () => setPin('');

    const handleUnlock = async () => {
        const success = await unlock(pin);
        if (success) {
            onUnlockSuccess();
        } else {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'The entered access code is incorrect.',
            });
            setPin('');
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs pt-4">
            <div className="flex items-center justify-center gap-3 h-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border-2 border-primary bg-background data-[filled=true]:bg-primary transition-colors" data-filled={i < pin.length} />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
                {[...Array(9).keys()].map(i => i + 1).map(digit => (
                    <Button key={digit} variant="outline" size="icon" className="w-14 h-14 sm:w-16 sm:h-16 text-2xl font-mono" onClick={() => handlePinClick(String(digit))}>{digit}</Button>
                ))}
                <Button variant="outline" size="icon" className="w-14 h-14 sm:w-16 sm:h-16" onClick={handleClear} aria-label="Clear"><X className="w-6 h-6"/></Button>
                <Button variant="outline" size="icon" className="w-14 h-14 sm:w-16 sm:h-16 text-2xl font-mono" onClick={() => handlePinClick('0')}>0</Button>
                <Button variant="outline" size="icon" className="w-14 h-14 sm:w-16 sm:h-16" onClick={handleBackspace} aria-label="Backspace"><Delete className="w-6 h-6"/></Button>
            </div>
            
            <Button onClick={handleUnlock} className="w-full mt-2">Unlock</Button>
        </div>
    );
};

const LockedOverlay = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="absolute inset-0 bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10 p-6 text-center">
                <Lock className="w-10 h-10 text-primary mb-2" />
                <h3 className="text-xl font-semibold">Control Panel Locked</h3>
                <p className="text-muted-foreground text-sm mb-4">Unlock to manage system controls.</p>
                <DialogTrigger asChild>
                    <Button>
                        <Lock className="mr-2" />
                        Unlock Controls
                    </Button>
                </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-center">Enter Access Code</DialogTitle>
                </DialogHeader>
                <PinPad onUnlockSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
        </Dialog>
    );
};

export default function ControlPanel() {
  const { isLocked, data, toggleHeater, toggleFan, manualTurn, emergencyStop, resetInactivityTimer } = useIncubator();

  const handleInteraction = (action: () => void) => {
    if (!isLocked) {
        action();
        resetInactivityTimer();
    }
  };

  return (
    <Card className="relative h-full">
      {isLocked && <LockedOverlay />}
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
        <CardDescription>Remote system override</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-border transition-colors">
            <Label htmlFor="heater-toggle" className="flex items-center gap-2 cursor-pointer">
              <Thermometer className="w-5 h-5 text-primary" />
              Heater
            </Label>
            <Switch id="heater-toggle" checked={data.isHeaterActive} onCheckedChange={() => handleInteraction(toggleHeater)} disabled={isLocked} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-border transition-colors">
            <Label htmlFor="fan-toggle" className="flex items-center gap-2 cursor-pointer">
              <Wind className="w-5 h-5 text-primary" />
              Ventilation Fan
            </Label>
            <Switch id="fan-toggle" checked={data.isFanActive} onCheckedChange={() => handleInteraction(toggleFan)} disabled={isLocked} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={() => handleInteraction(manualTurn)} disabled={data.isTurningMotorActive || isLocked}>
            <RotateCw className="mr-2" />
            {data.isTurningMotorActive ? 'Turning...' : 'Manual Egg Turning'}
          </Button>
          <div onClick={() => handleInteraction(() => {})}>
            <AiGuidanceDialog>
               <Button variant="outline" disabled={isLocked}>
                  <BrainCircuit className="mr-2"/>
                  AI Hatching Guidance
              </Button>
            </AiGuidanceDialog>
          </div>
        </div>
        
        <div className="pt-4">
           <Button onClick={() => handleInteraction(emergencyStop)} variant="destructive" className="w-full" disabled={isLocked}>
             <OctagonAlert className="mr-2"/>
             Emergency Stop
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
