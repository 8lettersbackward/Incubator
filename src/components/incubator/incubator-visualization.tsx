"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Fan, Lightbulb, Egg as EggIcon } from "lucide-react";
import StatusIndicator from "@/components/shared/status-indicator";
import { cn } from "@/lib/utils";

const Egg = () => <EggIcon className="w-4 h-5 text-orange-300" />;

const EggTray = ({ eggCount }: { eggCount: number }) => (
  <div className="grid grid-cols-10 gap-1 p-1 bg-black/20 rounded-md">
    {Array.from({ length: 56 }).map((_, i) => (
      i < eggCount ? <Egg key={i} /> : <div key={i} className="w-4 h-5" />
    ))}
  </div>
);

export default function IncubatorVisualization() {
  const { data } = useIncubator();
  const { control, sensors, incubation } = data;
  const { numberOfEggs = 0, eggType } = incubation;

  const tray1Eggs = Math.min(numberOfEggs, 56);
  const tray2Eggs = Math.max(0, numberOfEggs - 56);


  return (
    <Card className="h-full">
      <CardContent className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-end gap-2 sm:gap-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tighter">
                    {sensors.temperature.toFixed(1)}°C
                </h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-medium text-accent tracking-tighter mb-0.5 sm:mb-1">
                    {sensors.humidity}% RH
                </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-3 gap-y-2 text-xs">
                <StatusIndicator label="Heat Lamp" isActive={control.heater} activeColor="bg-chart-5 shadow-[0_0_8px_2px_hsl(var(--chart-5))]" />
                <StatusIndicator label="Ventilation" isActive={control.fan} />
                <StatusIndicator label="Turning" isActive={control.motor} activeColor="bg-chart-1 shadow-[0_0_8px_2px_hsl(var(--chart-1))]" />
                <StatusIndicator label={`Water ${sensors.waterPercent}%`} isActive={sensors.waterPercent > 5} />
                <StatusIndicator label="Camera On" isActive={control.cameraOn} activeColor="bg-destructive shadow-[0_0_8px_2px_hsl(var(--destructive))]" />
            </div>
        </div>

        <div className="flex-1 relative bg-black/20 border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-4">
          {/* Top components */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <Lightbulb className={cn("w-8 h-8 text-muted-foreground transition-all", control.heater && "text-chart-5 drop-shadow-[0_0_8px_hsl(var(--chart-5))]")} />
            <Fan className={cn("w-8 h-8 text-muted-foreground transition-all", control.fan && "animate-spin text-accent")} />
          </div>
          
          {/* Egg Trays */}
          <div className="w-full max-w-md space-y-2">
            <EggTray eggCount={tray1Eggs} />
            <EggTray eggCount={tray2Eggs} />
          </div>

          <div className="absolute bottom-2 right-4 text-xs font-mono text-muted-foreground">
            {`EGGS: ${numberOfEggs} / 112 | TYPE: ${(eggType || "").toUpperCase()}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
