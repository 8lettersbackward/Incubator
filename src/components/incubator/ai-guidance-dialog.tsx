"use client";

import { useState, ReactNode } from "react";
import { useIncubator } from "@/contexts/incubator-context";
import { getAiGuidance } from "@/app/actions";
import { type AiHatchingGuidanceOutput } from "@/ai/flows/ai-hatching-guidance-flow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Lightbulb, AlertTriangle, Thermometer, Droplets, RotateCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function waterLevelToPercentage(level: string): number {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 90;
      case 'MEDIUM':
        return 50;
      case 'LOW':
        return 10;
      default:
        return 0;
    }
  }

export default function AiGuidanceDialog({ children }: { children: ReactNode }) {
  const { data: incubatorData } = useIncubator();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiHatchingGuidanceOutput | null>(null);

  const handleGetGuidance = async () => {
    setIsLoading(true);
    setResult(null);

    const input = {
      currentTemperature: incubatorData.sensors.temperature,
      currentHumidity: incubatorData.sensors.humidity,
      isHeaterActive: incubatorData.control.heater,
      isFanActive: incubatorData.control.fan,
      isTurningMotorActive: incubatorData.control.motor,
      waterLevelPercentage: waterLevelToPercentage(incubatorData.sensors.waterLevel),
      eggType: incubatorData.eggType,
    };

    const response = await getAiGuidance(input);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "AI Guidance Failed",
        description: response.error || "Could not retrieve guidance from the AI model.",
      });
      setIsOpen(false);
    }
    setIsLoading(false);
  };
  
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setResult(null);
    }
  }

  const GuidanceResult = () => {
    if (!result) return null;
    return (
      <div className="space-y-4 text-sm">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>General Guidance</AlertTitle>
          <AlertDescription>{result.generalGuidance}</AlertDescription>
        </Alert>

        {result.alerts && result.alerts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Proactive Alerts</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {result.alerts.map((alert, i) => <li key={i}>{alert}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-2"><Thermometer className="text-primary w-5 h-5"/> Temp: <strong>{result.recommendedTemperatureC}°C</strong></div>
            <div className="flex items-center gap-2"><Droplets className="text-primary w-5 h-5"/> Humidity: <strong>{result.recommendedHumidityRH}%</strong></div>
            <div className="flex items-center gap-2"><RotateCw className="text-primary w-5 h-5"/> Turning: <strong>{result.recommendedTurningSchedule}</strong></div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-3 gap-4 pt-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Assisted Hatching Guidance</DialogTitle>
          <DialogDescription>
            Get optimized environmental settings and proactive alerts from our AI embryologist.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? <LoadingSkeleton /> : result ? <GuidanceResult /> : (
            <div className="text-center py-8 text-muted-foreground">
              Click "Get Guidance" to analyze current conditions.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button type="button" onClick={handleGetGuidance} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Get Guidance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
