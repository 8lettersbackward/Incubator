"use client";

import { AlertSystem } from "@/contexts/incubator-context";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface SystemStatusProps {
  alertSystem: AlertSystem;
}

export default function SystemStatus({ alertSystem }: SystemStatusProps) {
  const getAlertConfig = () => {
    if (!alertSystem || !alertSystem.status) {
      return {
        bgColor: "bg-green-900/50",
        borderColor: "border-green-400/50",
        textColor: "text-green-300",
        Icon: CheckCircle2,
        title: "System OK",
        message: "All parameters are within the optimal range."
      };
    }

    switch (alertSystem.status) {
      case 'WARNING':
        return {
          bgColor: "bg-yellow-900/50",
          borderColor: "border-yellow-400/50",
          textColor: "text-yellow-300",
          Icon: AlertTriangle,
          title: 'Warning',
          message: alertSystem.message,
          blink: false,
        };
      case 'CRITICAL':
        return {
          bgColor: "bg-red-900/50",
          borderColor: "border-red-400/50",
          textColor: "text-red-300",
          Icon: XCircle,
          title: 'Critical Alert',
          message: alertSystem.message,
          blink: true,
        };
      case 'SYSTEM_OK':
      default:
        return {
          bgColor: "bg-green-900/50",
          borderColor: "border-green-400/50",
          textColor: "text-green-300",
          Icon: CheckCircle2,
          title: 'System OK',
          message: alertSystem.message,
          blink: false,
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={cn(
      "p-4 rounded-lg border-2 flex gap-4 items-start mb-6 transition-all",
      config.bgColor,
      config.borderColor,
      config.blink && "animate-pulse"
    )}>
      <config.Icon className={cn("w-7 h-7 flex-shrink-0", config.textColor)} />
      <div>
        <h4 className={cn("font-bold text-lg", config.textColor)}>{config.title}</h4>
        <p className="text-sm text-foreground/90 mt-1">{config.message}</p>
      </div>
    </div>
  );
}
