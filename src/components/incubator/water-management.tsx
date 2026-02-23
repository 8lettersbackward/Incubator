"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Droplets, Plus, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WaterManagement() {
  const { data, refillWater } = useIncubator();
  const waterLevel = data.sensors.waterLevel.toUpperCase();

  const getLevelProps = () => {
    switch (waterLevel) {
      case 'HIGH':
        return { height: '85%', color: 'bg-sky-500' };
      case 'MEDIUM':
        return { height: '50%', color: 'bg-yellow-500' };
      case 'LOW':
        return { height: '15%', color: 'bg-destructive' };
      default:
        return { height: '0%', color: 'bg-muted' };
    }
  };

  const { height, color } = getLevelProps();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            Water Management
          </div>
          <Button onClick={refillWater} size="sm" variant="outline" disabled={waterLevel === 'HIGH'}>
            <Plus className="mr-2 h-4 w-4" />
            Refill
          </Button>
        </CardTitle>
        <CardDescription>Reservoir water level for humidity control.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-8 space-y-4">
        <div className="relative w-20 h-36 rounded-lg bg-muted/20 border-2 border-border p-1 flex flex-col justify-end">
            <div 
                className={cn("w-full rounded-sm transition-all duration-700 ease-in-out", color)}
                style={{ height }}
            >
              <Waves className="w-full h-4 text-white/20 animate-pulse" />
            </div>
        </div>
        <p className="text-sm font-semibold text-foreground">{waterLevel}</p>
        <p className="text-xs text-muted-foreground -mt-3">Current Water Level</p>
      </CardContent>
    </Card>
  );
}
