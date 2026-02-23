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
        <Progress value={waterLevel} className="w-full h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Empty</span>
          <span>Full</span>
        </div>
        <div className="text-center text-2xl font-bold text-primary pt-2">
          {waterLevel.toFixed(0)}%
        </div>
      </CardContent>
    </Card>
  );
}
