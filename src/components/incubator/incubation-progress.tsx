"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIncubator } from "@/contexts/incubator-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Minus, Plus, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const presets = [14, 18, 21, 24, 28, 35];

export default function IncubationProgress() {
  const { data, setCurrentDay, setTotalDays, isLocked, resetIncubation } = useIncubator();
  const { currentDay, totalDays, eggType } = data.incubation;
  const [dayInput, setDayInput] = useState(String(currentDay));

  useEffect(() => {
    setDayInput(String(currentDay));
  }, [currentDay]);

  const progressPercentage = (currentDay / totalDays) * 100;
  const remainingDays = totalDays - currentDay;

  const handleDayChange = (change: number) => {
    setCurrentDay(currentDay + change);
  };

  const handlePresetClick = (days: number) => {
    setTotalDays(days);
  };

  const handleDayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDayInput(e.target.value);
  };

  const handleDayInputBlur = () => {
    let newDay = parseInt(dayInput, 10);
    if (isNaN(newDay)) {
      setDayInput(String(currentDay));
      return;
    }
    if (newDay < 1) {
      newDay = 1;
    } else if (newDay > totalDays) {
      newDay = totalDays;
    }
    setCurrentDay(newDay);
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
            <p className="text-2xl font-bold">{currentDay}<span className="text-base font-normal text-muted-foreground">/{totalDays} days</span></p>
            <p className="text-sm text-primary font-medium">{getRemainingDaysText()}</p>
        </div>
        
        <div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Day 1</span>
            <span>Day {totalDays}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground">Duration Presets</p>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((days) => (
              <Button
                key={days}
                variant={totalDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(days)}
                disabled={isLocked}
              >
                {days} days
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleDayChange(-1)}
              disabled={isLocked || currentDay <= 1}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Previous Day</span>
            </Button>
            <Input
              type="number"
              className="w-20 text-center font-bold text-lg h-10"
              value={dayInput}
              onChange={handleDayInputChange}
              onBlur={handleDayInputBlur}
              min={1}
              max={totalDays}
              disabled={isLocked}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleDayChange(1)}
              disabled={isLocked || currentDay >= totalDays}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Next Day</span>
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={resetIncubation}
            disabled={isLocked}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Day 1
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
