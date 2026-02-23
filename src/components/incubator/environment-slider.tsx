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
  safeMin: number;
  safeMax: number;
  step: number;
  unit: string;
  isSafe: boolean;
  onValueChange: (value: number[]) => void;
  disabled?: boolean;
}

export default function EnvironmentSlider({ label, icon, value, min, max, safeMin, safeMax, step, unit, isSafe, onValueChange, disabled }: EnvironmentSliderProps) {
  
  const safeMinPercentage = Math.max(0, Math.min(100, ((safeMin - min) / (max - min)) * 100));
  const safeWidthPercentage = Math.max(0, Math.min(100, ((safeMax - safeMin) / (max - min)) * 100));

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
        <div 
          className="absolute h-2 w-full top-1/2 -translate-y-1/2 -z-10 pointer-events-none"
        >
            <div className="relative h-full w-full rounded-full bg-secondary">
                <div
                    className="absolute h-full rounded-full bg-primary/20"
                    style={{
                        left: `${safeMinPercentage}%`,
                        width: `${safeWidthPercentage}%`,
                    }}
                />
            </div>
        </div>
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
