"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIncubator } from "@/contexts/incubator-context";
import { Fan, Thermometer, Droplets, Bell, LockIcon, KeyRound, Bird, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import UnlockDialog from "./unlock-dialog";
import { Button } from "../ui/button";
import AccessCodeDialog from "./access-code-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusIndicator from "../shared/status-indicator";

export default function ControlPanel() {
  const { data, toggleFan, isLocked, lock, setEggType, setTargetTemperature, setTargetHumidity } = useIncubator();

  const [tempTarget, setTempTarget] = useState(data.control.targetTemperature);
  const [humidityTarget, setHumidityTarget] = useState(data.control.targetHumidity);

  useEffect(() => {
    setTempTarget(data.control.targetTemperature);
  }, [data.control.targetTemperature]);

  useEffect(() => {
    setHumidityTarget(data.control.targetHumidity);
  }, [data.control.targetHumidity]);


  // Define safe ranges for chicken eggs as a default
  const tempSafeMin = 37.0;
  const tempSafeMax = 38.0;
  const humiditySafeMin = 55;
  const humiditySafeMax = 65;

  const tempIsSafe = data.sensors.temperature >= tempSafeMin && data.sensors.temperature <= tempSafeMax;
  const humidityIsSafe = data.sensors.humidity >= humiditySafeMin && data.sensors.humidity <= humiditySafeMax;

  const getSystemStatus = () => {
    const { tempAlert, humidityAlert, balanceAlert } = data.status;
    if (tempAlert !== 'OK' || humidityAlert !== 'OK') {
      return {
        level: 'CRITICAL',
        message: 'Critical Alert',
        description: 'Temp/Humidity out of safe range. Immediate action required.',
        icon: <ShieldX className="w-6 h-6 text-destructive" />,
        colorClass: 'text-destructive',
        bgClass: 'bg-destructive/20',
        pulseClass: 'animate-pulse',
      };
    }
    if (balanceAlert !== 'OK') {
      return {
        level: 'WARNING',
        message: 'Warning Alert',
        description: 'Incubator balance requires attention.',
        icon: <ShieldAlert className="w-6 h-6 text-yellow-400" />,
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-400/20',
        pulseClass: 'animate-pulse [animation-duration:3s]',
      };
    }
    return {
      level: 'OK',
      message: 'System OK',
      description: 'All systems are operating within optimal range.',
      icon: <ShieldCheck className="w-6 h-6 text-accent" />,
      colorClass: 'text-accent',
      bgClass: 'bg-accent/20',
      pulseClass: '',
    };
  };

  const systemStatus = getSystemStatus();

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
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-muted-foreground" />
                    <span>Temperature</span>
                </Label>
                <span className={cn("font-bold text-lg", !tempIsSafe && "text-destructive animate-pulse")}>
                    {data.sensors.temperature.toFixed(1)}°C
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Slider
                    value={[tempTarget]}
                    onValueChange={(value) => setTempTarget(value[0])}
                    onValueCommit={(value) => setTargetTemperature(value[0])}
                    min={30}
                    max={45}
                    step={0.1}
                    disabled={isLocked}
                    className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right tabular-nums">{tempTarget.toFixed(1)}°C</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-muted-foreground" />
                    <span>Humidity</span>
                </Label>
                <span className={cn("font-bold text-lg", !humidityIsSafe && "text-destructive animate-pulse")}>
                    {data.sensors.humidity.toFixed(1)}%
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Slider
                    value={[humidityTarget]}
                    onValueChange={(value) => setHumidityTarget(value[0])}
                    onValueCommit={(value) => setTargetHumidity(value[0])}
                    min={40}
                    max={80}
                    step={1}
                    disabled={isLocked}
                    className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right tabular-nums">{humidityTarget.toFixed(0)}%</span>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">System Status</h4>
               <div className={cn(
                  "flex items-start gap-4 p-3 rounded-lg",
                  systemStatus.bgClass,
                  systemStatus.pulseClass
              )}>
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                      {systemStatus.icon}
                  </div>
                  <div className="flex-grow">
                      <p className={cn("font-bold", systemStatus.colorClass)}>{systemStatus.message}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{systemStatus.description}</p>
                  </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Bell className="w-4 h-4" />
                      <span>Buzzer</span>
                  </div>
                  <StatusIndicator 
                    label={data.status.buzzerActive && systemStatus.level === 'CRITICAL' ? "Active" : "Off"}
                    isActive={data.status.buzzerActive && systemStatus.level === 'CRITICAL'}
                    activeColor="bg-destructive"
                  />
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
