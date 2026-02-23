"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function WaterManagement() {
  const { data, refillWater, isLocked } = useIncubator();
  const waterLevel = data.sensors.waterLevel.toUpperCase();

  const getWaterPercentage = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 90;
      case 'MEDIUM':
        return 50;
      case 'LOW':
        return 10;
      default:
        return 0;
    }
  };

  const percentage = getWaterPercentage(waterLevel);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-primary" />
          Water Management
        </CardTitle>
        <CardDescription>Reservoir water level for humidity control.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center pt-6 space-y-4">
        <div className="w-full">
            <Progress value={percentage} className="h-4" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Empty</span>
                <span>Full</span>
            </div>
        </div>
        <p className="text-center text-2xl font-bold text-foreground">{percentage}%</p>
        <div className="pt-2">
          <Button onClick={refillWater} variant="outline" disabled={waterLevel === 'HIGH' || isLocked} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Refill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
