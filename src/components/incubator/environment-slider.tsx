"use client";

import { cn } from "@/lib/utils";
import React from 'react';

interface EnvironmentSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  safeMin: number;
  safeMax: number;
  unit: string;
  isSafe: boolean;
}

export default function EnvironmentSlider({ label, icon, value, min, max, safeMin, safeMax, unit, isSafe }: EnvironmentSliderProps) {
  const valuePercentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const safeMinPercentage = ((safeMin - min) / (max - min)) * 100;
  const safeWidthPercentage = ((safeMax - safeMin) / (max - min)) * 100;

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
      <div className="relative h-2 w-full rounded-full bg-secondary">
        {/* Safe Range Area */}
        <div
          className="absolute h-full rounded-full bg-primary/30"
          style={{
            left: `${safeMinPercentage}%`,
            width: `${safeWidthPercentage}%`,
          }}
        />
        {/* Slider Thumb */}
        <div
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-background shadow",
            isSafe ? "bg-primary" : "bg-destructive"
          )}
          style={{ left: `calc(${valuePercentage}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
