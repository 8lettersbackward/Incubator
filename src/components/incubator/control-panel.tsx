"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useIncubator } from "@/contexts/incubator-context";
import { LockIcon, KeyRound, Bird, Thermometer, Droplets } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import UnlockDialog from "./unlock-dialog";
import { Button } from "../ui/button";
import AccessCodeDialog from "./access-code-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SystemStatus from "./system-status";
import EnvironmentSlider from "./environment-slider";

export default function ControlPanel() {
  const { data, isLocked, lock, setEggType, setSensorTemperature, setSensorHumidity } = useIncubator();
  const { sensors, alertSystem } = data;

  const handleTempChange = (value: number[]) => {
    if (setSensorTemperature) {
      setSensorTemperature(value[0]);
    }
  };

  const handleHumidityChange = (value: number[]) => {
    if (setSensorHumidity) {
      setSensorHumidity(value[0]);
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
              label="Temperature"
              icon={<Thermometer className="w-5 h-5 text-primary" />}
              value={sensors.temperature}
              min={30}
              max={45}
              step={0.1}
              safeMin={37.0}
              safeMax={38.0}
              unit="°C"
              isSafe={alertSystem.temperatureState === 'NORMAL'}
              onValueChange={handleTempChange}
              disabled={isLocked}
            />
            <EnvironmentSlider
              label="Humidity"
              icon={<Droplets className="w-5 h-5 text-primary" />}
              value={sensors.humidity}
              min={20}
              max={80}
              step={1}
              safeMin={40}
              safeMax={60}
              unit="%"
              isSafe={alertSystem.humidityState === 'NORMAL'}
              onValueChange={handleHumidityChange}
              disabled={isLocked}
            />
          </div>
          <Separator />

          <SystemStatus alertSystem={data.alertSystem} />
          
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 font-medium">
              <Bird className="w-5 h-5 text-primary" />
              Egg Type
            </Label>
            <Select
              value={data.eggType}
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
        </CardContent>
      </div>
    </Card>
  );
}
