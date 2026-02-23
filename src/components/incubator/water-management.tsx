"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WaterManagement() {
  const { data, refillWater } = useIncubator();
  const waterLevel = data.sensors.waterLevel;

  const getBadgeVariant = () => {
    switch (waterLevel.toUpperCase()) {
      case 'HIGH':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            Water Management
          </div>
          <Button onClick={refillWater} size="sm" variant="outline" disabled={waterLevel.toUpperCase() === 'HIGH'}>
            <Plus className="mr-2 h-4 w-4" />
            Refill
          </Button>
        </CardTitle>
        <CardDescription>Reservoir water level for humidity control.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4 space-y-2">
        <Badge variant={getBadgeVariant()} className="text-lg px-4 py-2">
          {waterLevel.toUpperCase()}
        </Badge>
        <p className="text-xs text-muted-foreground">Current Water Level</p>
      </CardContent>
    </Card>
  );
}
