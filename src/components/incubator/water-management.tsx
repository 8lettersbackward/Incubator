"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIncubator } from "@/contexts/incubator-context";
import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WaterManagement() {
  const { data, refillWater } = useIncubator();
  const waterLevel = data.waterLevel;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            Water Management
          </div>
          <Button onClick={refillWater} size="sm" variant="outline" disabled={waterLevel === 100}>
            <Plus className="mr-2 h-4 w-4" />
            Refill
          </Button>
        </CardTitle>
        <CardDescription>Reservoir water level for humidity control.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <div className="flex items-center gap-4">
          <Progress value={waterLevel} className="w-full h-3" />
          <span className="text-xl font-bold text-primary">{waterLevel.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>Empty</span>
          <span>Full</span>
        </div>
      </CardContent>
    </Card>
  );
}
