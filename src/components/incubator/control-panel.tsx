"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIncubator } from "@/contexts/incubator-context";
import { Fan, Lightbulb, Repeat, AlertTriangle, Cog, Bot } from "lucide-react";
import UnlockDialog from "./unlock-dialog";
import AccessCodeDialog from "./access-code-dialog";
import AiGuidanceDialog from "./ai-guidance-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function ControlPanel() {
  const { data, isLocked, toggleHeater, toggleFan, manualTurn, emergencyStop, setEggType } = useIncubator();

  const eggTypes = ["Chicken", "Quail", "Duck", "Turkey", "Goose"];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
        <CardDescription>Manual controls and system settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="egg-type-select">Egg Type</Label>
          <Select value={data.eggType} onValueChange={setEggType} disabled={isLocked}>
            <SelectTrigger id="egg-type-select" className="w-full">
              <SelectValue placeholder="Select Egg Type" />
            </SelectTrigger>
            <SelectContent>
              {eggTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="heater-switch" checked={data.control.heater} onCheckedChange={toggleHeater} disabled={isLocked} />
            <Label htmlFor="heater-switch" className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Heater
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="fan-switch" checked={data.control.fan} onCheckedChange={toggleFan} disabled={isLocked} />
            <Label htmlFor="fan-switch" className="flex items-center gap-2">
                <Fan className="w-5 h-5 text-primary" />
                Fan
            </Label>
          </div>
        </div>

        <Button onClick={manualTurn} disabled={isLocked || data.control.motor} className="w-full">
          <Repeat className="mr-2 h-4 w-4" />
          Manual Turn
        </Button>
        
        <div className="border-t border-border pt-6 space-y-4">
            <div className="flex justify-between items-center">
                <Label className="text-base font-medium">System Access</Label>
                <UnlockDialog>
                    <Button variant={isLocked ? "default" : "secondary"}>
                        {isLocked ? "Unlock" : "Locked"}
                    </Button>
                </UnlockDialog>
            </div>
            <div className="flex gap-2">
                <AccessCodeDialog>
                    <Button variant="outline" className="w-full" disabled={isLocked}>
                        <Cog className="mr-2 h-4 w-4" /> Change PIN
                    </Button>
                </AccessCodeDialog>

                <AiGuidanceDialog>
                    <Button variant="outline" className="w-full">
                        <Bot className="mr-2 h-4 w-4" /> AI Guidance
                    </Button>
                </AiGuidanceDialog>
            </div>
            <Button onClick={emergencyStop} variant="destructive" className="w-full" disabled={isLocked}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency Stop
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
