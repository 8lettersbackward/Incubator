"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIncubator } from "@/contexts/incubator-context";
import { Fan, Thermometer, Droplets, Bell } from "lucide-react";
import EnvironmentSlider from "./environment-slider";
import { Separator } from "@/components/ui/separator";
import StatusIndicator from "../shared/status-indicator";

export default function ControlPanel() {
  const { data, toggleFan } = useIncubator();

  // Define safe ranges for chicken eggs as a default
  const tempSafeMin = 37.0;
  const tempSafeMax = 38.0;
  const humiditySafeMin = 55;
  const humiditySafeMax = 65;

  const tempIsSafe = data.sensors.temperature >= tempSafeMin && data.sensors.temperature <= tempSafeMax;
  const humidityIsSafe = data.sensors.humidity >= humiditySafeMin && data.sensors.humidity <= humiditySafeMax;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Environmental Monitoring</CardTitle>
        <CardDescription>Live sensor data and system alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
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
            <Switch id="fan-switch" checked={data.control.fan} onCheckedChange={toggleFan} />
        </div>
      </CardContent>
    </Card>
  );
}
