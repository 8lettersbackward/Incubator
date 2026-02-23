"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIncubator } from "@/contexts/incubator-context";
import { Lock, Thermometer, Wind, RotateCw, OctagonAlert, BrainCircuit } from "lucide-react";
import AiGuidanceDialog from "./ai-guidance-dialog";

export default function ControlPanel() {
  const { isLoggedIn, data, toggleHeater, toggleFan, manualTurn, emergencyStop } = useIncubator();

  return (
    <Card className="relative h-full">
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
        <CardDescription>Remote system override</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isLoggedIn && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
            <Lock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold">System Locked</h3>
            <p className="text-muted-foreground">Authentication Required</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-border transition-colors">
            <Label htmlFor="heater-toggle" className="flex items-center gap-2 cursor-pointer">
              <Thermometer className="w-5 h-5 text-primary" />
              Heater
            </Label>
            <Switch id="heater-toggle" checked={data.isHeaterActive} onCheckedChange={toggleHeater} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-border transition-colors">
            <Label htmlFor="fan-toggle" className="flex items-center gap-2 cursor-pointer">
              <Wind className="w-5 h-5 text-primary" />
              Ventilation Fan
            </Label>
            <Switch id="fan-toggle" checked={data.isFanActive} onCheckedChange={toggleFan} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={manualTurn} disabled={data.isTurningMotorActive}>
            <RotateCw className="mr-2" />
            {data.isTurningMotorActive ? 'Turning...' : 'Manual Egg Turning'}
          </Button>
          <AiGuidanceDialog>
             <Button variant="outline">
                <BrainCircuit className="mr-2"/>
                AI Hatching Guidance
            </Button>
          </AiGuidanceDialog>
        </div>
        
        <div className="pt-4">
           <Button onClick={emergencyStop} variant="destructive" className="w-full">
             <OctagonAlert className="mr-2"/>
             Emergency Stop
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
