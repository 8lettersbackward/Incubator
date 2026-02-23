"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Fan, Lightbulb, Repeat, Wifi, Droplets } from "lucide-react";
import StatusIndicator from "@/components/shared/status-indicator";
import { cn } from "@/lib/utils";

const Egg = () => <div className="w-5 h-7 bg-orange-200/50 rounded-[50%/60%_60%_40%_40%] border border-orange-200/60" />;

const EggTray = () => (
  <div className="grid grid-cols-6 gap-2 p-2 bg-black/20 rounded-md">
    {Array.from({ length: 12 }).map((_, i) => (
      <Egg key={i} />
    ))}
  </div>
);

export default function IncubatorVisualization() {
  const { data } = useIncubator();

  return (
    <Card className="h-full">
      <CardContent className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-end gap-4">
            <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tighter">
              {data.temperature.toFixed(1)}°C
            </h2>
            <p className="text-2xl md:text-3xl font-medium text-accent tracking-tighter mb-1">
              {data.humidity}% RH
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-1 text-xs">
            <StatusIndicator label="Heat Lamp" isActive={data.isHeaterActive} />
            <StatusIndicator label="Ventilation" isActive={data.isFanActive} />
            <StatusIndicator label="Turning" isActive={data.isTurningMotorActive} activeColor="bg-blue-500" />
            <StatusIndicator label="Water" isActive={data.waterLevel > 20} />
            <StatusIndicator label="Camera" isActive={data.camera.isOn} />
            <StatusIndicator label="WiFi" isActive={data.wifi.connected} />
          </div>
        </div>

        <div className="flex-1 relative bg-black/20 border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-4">
          {/* Top components */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <Lightbulb className={cn("w-8 h-8 text-muted-foreground transition-all", data.isHeaterActive && "text-yellow-400 drop-shadow-[0_0_8px_theme(colors.yellow.400)]")} />
            <Fan className={cn("w-8 h-8 text-muted-foreground transition-all", data.isFanActive && "animate-spin text-accent")} />
          </div>
          
          {/* Egg Trays */}
          <div className="w-full max-w-md space-y-4">
            <EggTray />
            <EggTray />
          </div>

          <div className="absolute bottom-2 right-4 text-xs font-mono text-muted-foreground">
            EGG TYPE: {data.eggType.toUpperCase()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
