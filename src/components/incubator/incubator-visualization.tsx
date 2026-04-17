"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Fan, Lightbulb, Egg as EggIcon, CloudDrizzle } from "lucide-react";
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
            <div className="flex items-baseline gap-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tighter">
                    {sensors.temperature.toFixed(1)}°C
                </h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-medium text-accent tracking-tighter">
                    {sensors.humidity}%
                </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 text-xs">
                <StatusIndicator label="Heat Lamp" isActive={control.heater} activeColor="bg-destructive shadow-[0_0_8px_2px_hsl(var(--destructive))]" />
                <StatusIndicator label="Ventilation" isActive={control.fan} activeColor="bg-yellow-400 shadow-[0_0_8px_2px_#facc15]" />
                <StatusIndicator label="Turning" isActive={control.motor} activeColor="bg-chart-1 shadow-[0_0_8px_2px_hsl(var(--chart-1))]" />
                <StatusIndicator label="Mist" isActive={control.mist} activeColor="bg-chart-3 shadow-[0_0_8px_2px_hsl(var(--chart-3))]" />
                <StatusIndicator label={`Water ${sensors.waterPercent}%`} isActive={sensors.waterPercent > 5} />
                <StatusIndicator label="Camera On" isActive={control.cameraOn} activeColor="bg-orange-500 shadow-[0_0_8px_2px_#f97316]" />
            </div>
        </div>

        <div className="flex-1 relative bg-black/20 border border-border rounded-lg p-4 flex flex-col items-center justify-center">
          {/* Top components */}
          <div className="w-full max-w-md flex justify-around items-center px-1 mb-2">
            <Lightbulb className={cn("w-8 h-8 text-muted-foreground transition-all", control.heater && "text-destructive drop-shadow-[0_0_8px_hsl(var(--destructive))]")} />
            <CloudDrizzle className={cn("w-8 h-8 text-muted-foreground transition-all", control.mist && "text-chart-3 drop-shadow-[0_0_8px_hsl(var(--chart-3))]")} />
            <Fan className={cn("w-8 h-8 text-muted-foreground transition-all", control.fan && "animate-spin text-yellow-400")} />
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
