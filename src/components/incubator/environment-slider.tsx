"use client";

import { cn } from "@/lib/utils";
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface EnvironmentSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  isSafe: boolean;
  onValueChange: (value: number[]) => void;
  disabled?: boolean;
}

export default function EnvironmentSlider({ label, icon, value, min, max, step, unit, isSafe, onValueChange, disabled }: EnvironmentSliderProps) {
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            {icon}
            <label className="text-sm font-medium text-foreground">{label}</label>
        </div>
        <span className={cn(
          "font-bold text-lg",
          isSafe ? "text-foreground" : "text-destructive animate-pulse"
        )}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="relative pt-2">
         <Slider
          value={[value]}
          onValueChange={onValueChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(!isSafe && "[&_.absolute.h-full.bg-primary]:bg-destructive")}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
