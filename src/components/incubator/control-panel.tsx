"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useIncubator } from "@/contexts/incubator-context";
import { Thermometer, Droplets, BellRing, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const MonitorSlider = ({ label, value, unit, icon, min, max, step, optimalMin, optimalMax }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
                <Label className="flex items-center gap-2 text-base text-muted-foreground">
                    {icon}
                    {label}
                </Label>
                <span className="font-bold text-xl text-foreground">{value.toFixed(1)}{unit}</span>
            </div>
            <Slider
                value={[value]}
                min={min}
                max={max}
                step={step}
                disabled
            />
            <div className="relative h-1 w-full">
                <div 
                    className="absolute h-1 rounded-full bg-primary/50"
                    style={{
                        left: `${((optimalMin - min) / (max - min)) * 100}%`,
                        width: `${((optimalMax - optimalMin) / (max - min)) * 100}%`
                    }}
                >
                </div>
            </div>
        </div>
    );
};

export default function ControlPanel() {
  const { data } = useIncubator();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Incubator Status</CardTitle>
        <CardDescription>Real-time environmental monitoring.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-4">
        <MonitorSlider 
            label="Temperature"
            icon={<Thermometer className="h-5 w-5 text-primary" />}
            value={data.sensors.temperature}
            unit="°C"
            min={30}
            max={45}
            step={0.1}
            optimalMin={37.2}
            optimalMax={38.9}
        />
        <MonitorSlider 
            label="Humidity"
            icon={<Droplets className="h-5 w-5 text-primary" />}
            value={data.sensors.humidity}
            unit="%"
            min={40}
            max={90}
            step={1}
            optimalMin={55}
            optimalMax={65}
        />
        <div className="space-y-3">
            <Label className="text-base text-muted-foreground">System Alerts</Label>
            <div className="space-y-2">
                {data.status.criticalTemperatureAlert && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Critical Temperature Alert</AlertTitle>
                    </Alert>
                )}
                {data.status.buzzerActive && (
                    <Alert>
                        <BellRing className="h-4 w-4" />
                        <AlertTitle>Buzzer Active</AlertTitle>
                    </Alert>
                )}
                {(!data.status.criticalTemperatureAlert && !data.status.buzzerActive) && (
                    <p className="text-sm text-muted-foreground">No active alerts.</p>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
