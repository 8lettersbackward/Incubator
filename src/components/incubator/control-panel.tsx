"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useIncubator } from "@/contexts/incubator-context";
import { LockIcon, KeyRound, Bird, Thermometer, Droplets, Egg, Minus, Plus, Bot } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import UnlockDialog from "./unlock-dialog";
import { Button } from "../ui/button";
import AccessCodeDialog from "./access-code-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SystemStatus from "./system-status";
import EnvironmentSlider from "./environment-slider";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";

export default function ControlPanel() {
  const { data, isLocked, lock, setEggType, setTargetTemperature, setTargetHumidity, setNumberOfEggs, setAutonomousClimate } = useIncubator();
  const { alertSystem, incubation, control } = data;
  const { numberOfEggs, eggType } = incubation;
  const [eggInput, setEggInput] = useState(String(numberOfEggs || ''));

  useEffect(() => {
    if (numberOfEggs) {
        setEggInput(String(numberOfEggs));
    }
  }, [numberOfEggs]);

  const handleEggCountChange = (change: number) => {
    const newCount = (numberOfEggs || 0) + change;
    if (newCount >= 1 && newCount <= 112) {
      if (setNumberOfEggs) {
        setNumberOfEggs(newCount);
      }
    }
  };

  const handleEggInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEggInput(e.target.value);
  };

  const handleEggInputBlur = () => {
      let newCount = parseInt(eggInput, 10);
      if (isNaN(newCount) || newCount < 1) {
          newCount = 1;
      } else if (newCount > 112) {
          newCount = 112;
      }
      if (setNumberOfEggs) {
        setNumberOfEggs(newCount);
      }
      setEggInput(String(newCount));
  };


  const handleTempChange = (value: number[]) => {
    if (setTargetTemperature) {
      setTargetTemperature(value[0]);
    }
  };

  const handleHumidityChange = (value: number[]) => {
    if (setTargetHumidity) {
      setTargetHumidity(value[0]);
    }
  };


  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
        <CardDescription>Live sensor data and system alerts.</CardDescription>
      </CardHeader>
      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-b-lg -mt-6">
            <LockIcon className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground">Controls Locked</h3>
            <p className="text-muted-foreground mb-4">Enter PIN to make changes.</p>
            <UnlockDialog>
              <Button>
                <LockIcon className="mr-2" />
                Unlock Controls
              </Button>
            </UnlockDialog>
          </div>
        )}
        <CardContent 
          className={cn(
            "space-y-6 pt-4 transition-all",
            isLocked && "blur-sm opacity-50 pointer-events-none"
          )}
        >
          <div className="space-y-4">
            <EnvironmentSlider
              label="Target Temperature"
              icon={<Thermometer className="w-5 h-5 text-primary" />}
              value={control.targetTemperature}
              min={25}
              max={50}
              step={0.1}
              unit="°C"
              isSafe={alertSystem.temperatureState === 'NORMAL'}
              onValueChange={handleTempChange}
              disabled={isLocked}
            />
            <EnvironmentSlider
              label="Target Humidity"
              icon={<Droplets className="w-5 h-5 text-primary" />}
              value={control.targetHumidity}
              min={20}
              max={80}
              step={1}
              unit="%"
              isSafe={alertSystem.humidityState === 'NORMAL'}
              onValueChange={handleHumidityChange}
              disabled={isLocked}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="autonomous-climate-switch" className="flex items-center gap-2 font-medium">
              <Bot className="w-5 h-5 text-primary" />
              Autonomous Climate
            </Label>
            <Switch
              id="autonomous-climate-switch"
              checked={control.autonomousClimate}
              onCheckedChange={setAutonomousClimate}
              disabled={isLocked}
            />
          </div>
          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-medium">
              <Egg className="w-5 h-5 text-primary" />
              Number of Eggs
            </Label>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleEggCountChange(-1)}
                disabled={isLocked || (numberOfEggs || 0) <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease egg count</span>
              </Button>
              <Input
                type="number"
                className="w-20 text-center font-bold text-lg h-10"
                value={eggInput}
                onChange={handleEggInput}
                onBlur={handleEggInputBlur}
                min={1}
                max={112}
                disabled={isLocked}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleEggCountChange(1)}
                disabled={isLocked || (numberOfEggs || 0) >= 112}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase egg count</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Max capacity: 112 eggs</p>
          </div>
          
          <Separator />

          <SystemStatus alertSystem={data.alertSystem} />
          
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 font-medium">
              <Bird className="w-5 h-5 text-primary" />
              Egg Type
            </Label>
            <Select
              value={eggType}
              onValueChange={setEggType}
              disabled={isLocked}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select egg type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chicken">Chicken</SelectItem>
                <SelectItem value="Duck">Duck</SelectItem>
                <SelectItem value="Quail">Quail</SelectItem>
                <SelectItem value="Turkey">Turkey</SelectItem>
              </SelectContent>
            </Select>
          </div>

           <Separator />

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <Button variant="outline" onClick={lock} className="w-full">
                      <LockIcon className="mr-2" /> Lock Controls
                  </Button>
                  <AccessCodeDialog>
                      <Button variant="secondary" className="w-full">
                          <KeyRound className="mr-2" /> Change PIN
                      </Button>
                  </AccessCodeDialog>
              </div>
            </div>
        </CardContent>
      </div>
    </Card>
  );
}
