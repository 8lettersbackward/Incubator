"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Droplets } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function WaterManagement() {
  const { data } = useIncubator();
  const percentage = data.sensors.waterPercent;

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
      </CardContent>
    </Card>
  );
}
