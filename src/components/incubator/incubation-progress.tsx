"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Minus, Plus } from "lucide-react";

const presets = [14, 18, 21, 24, 28, 35];

export default function IncubationProgress() {
  const { data, setIncubationDay, setTotalIncubationDays, isLocked } = useIncubator();
  const { incubationDay, totalIncubationDays, eggType } = data;

  const progressPercentage = (incubationDay / totalIncubationDays) * 100;
  const remainingDays = totalIncubationDays - incubationDay;

  const handleDayChange = (change: number) => {
    setIncubationDay(incubationDay + change);
  };

  const handlePresetClick = (days: number) => {
    setTotalIncubationDays(days);
  };

  const getRemainingDaysText = () => {
    if (remainingDays < 0) return `Hatched`;
    if (remainingDays === 0) return 'Hatching Today';
    if (remainingDays === 1) return '1 day remaining';
    return `${remainingDays} days remaining`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          Incubation Progress
        </CardTitle>
        <CardDescription>
          Tracking embryo development for {eggType} eggs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="text-center">
            <p className="text-2xl font-bold">{incubationDay}<span className="text-base font-normal text-muted-foreground">/{totalIncubationDays} days</span></p>
            <p className="text-sm text-primary font-medium">{getRemainingDaysText()}</p>
        </div>
        
        <div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Day 1</span>
            <span>Day {totalIncubationDays}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground">Duration Presets</p>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((days) => (
              <Button
                key={days}
                variant={totalIncubationDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(days)}
                disabled={isLocked}
              >
                {days} days
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDayChange(-1)}
            disabled={isLocked || incubationDay <= 1}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Previous Day</span>
          </Button>
          <p className="font-semibold tabular-nums text-sm">Manual Day Adjustment</p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDayChange(1)}
            disabled={isLocked || incubationDay >= totalIncubationDays}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Next Day</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
