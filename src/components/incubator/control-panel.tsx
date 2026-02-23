"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIncubator } from "@/contexts/incubator-context";
import { Fan, Thermometer, Droplets, Bell, LockIcon, KeyRound, Bird } from "lucide-react";
import EnvironmentSlider from "./environment-slider";
import { Separator } from "@/components/ui/separator";
import StatusIndicator from "../shared/status-indicator";
import { cn } from "@/lib/utils";
import UnlockDialog from "./unlock-dialog";
import { Button } from "../ui/button";
import AccessCodeDialog from "./access-code-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ControlPanel() {
  const { data, toggleFan, isLocked, lock, setEggType } = useIncubator();

  // Define safe ranges for chicken eggs as a default
  const tempSafeMin = 37.0;
  const tempSafeMax = 38.0;
  const humiditySafeMin = 55;
  const humiditySafeMax = 65;

  const tempIsSafe = data.sensors.temperature >= tempSafeMin && data.sensors.temperature <= tempSafeMax;
  const humidityIsSafe = data.sensors.humidity >= humiditySafeMin && data.sensors.humidity <= humiditySafeMax;

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
          <EnvironmentSlider
            label="Temperature"
            icon={<Thermometer className="w-5 h-5 text-muted-foreground" />}
            value={data.sensors.temperature}
            min={30}
            max={45}
            safeMin={tempSafeMin}
            safeMax={tempSafeMax}
            unit="°C"
            isSafe={tempIsSafe}
          />
          <EnvironmentSlider
            label="Humidity"
            icon={<Droplets className="w-5 h-5 text-muted-foreground" />}
            value={data.sensors.humidity}
            min={40}
            max={80}
            safeMin={humiditySafeMin}
            safeMax={humiditySafeMax}
            unit="%"
            isSafe={humidityIsSafe}
          />
          
          <Separator />

          <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">System Alerts</h4>
              <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Bell className="w-4 h-4" />
                      <span>Buzzer</span>
                  </div>
                  <StatusIndicator label={data.status.buzzerActive ? "Active" : "Off"} isActive={data.status.buzzerActive} activeColor="bg-destructive" />
              </div>
              <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Thermometer className="w-4 h-4" />
                      <span>Temp. Alert</span>
                  </div>
                  <StatusIndicator label={data.status.criticalTempAlert ? "Active" : "OK"} isActive={data.status.criticalTempAlert} activeColor="bg-destructive" />
              </div>
          </div>

          <Separator />
          
          <div className="flex items-center justify-between">
              <Label htmlFor="fan-switch" className="flex items-center gap-2 font-medium">
                  <Fan className="w-5 h-5 text-primary" />
                  Ventilation Fan
              </Label>
              <Switch id="fan-switch" checked={data.control.fan} onCheckedChange={toggleFan} disabled={isLocked} />
          </div>

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
