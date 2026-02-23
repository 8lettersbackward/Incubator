"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIncubator } from "@/contexts/incubator-context";
import { Droplets } from "lucide-react";

export default function WaterManagement() {
  const { data } = useIncubator();
  const waterLevel = data.waterLevel;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-primary" />
          Water Management
        </CardTitle>
        <CardDescription>Reservoir water level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Progress value={waterLevel} className="w-full h-3" />
          <span className="text-xl font-bold text-primary">{waterLevel}%</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground pt-2">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${waterLevel < 33 ? 'bg-destructive shadow-[0_0_8px_2px_hsl(var(--destructive))]' : 'bg-muted'}`} />
            <span>Low</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${waterLevel >= 33 && waterLevel < 66 ? 'bg-yellow-500 shadow-[0_0_8px_2px_#eab308]' : 'bg-muted'}`} />
            <span>Mid</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${waterLevel >= 66 ? 'bg-accent shadow-[0_0_8px_2px_hsl(var(--accent))]' : 'bg-muted'}`} />
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
