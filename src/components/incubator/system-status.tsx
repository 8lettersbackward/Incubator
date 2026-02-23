'use client';

import { useIncubator } from '@/contexts/incubator-context';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, ShieldX, BellRing } from 'lucide-react';

type SystemStatusType = 'OK' | 'Warning' | 'Critical';

const statusConfig: {
  [key in SystemStatusType]: {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    baseClass: string;
    iconClass: string;
    animation: string;
  };
} = {
  OK: {
    label: 'System OK',
    description: 'Conditions are optimal.',
    icon: ShieldCheck,
    baseClass: 'border-accent/50 bg-accent/10',
    iconClass: 'text-accent',
    animation: '',
  },
  Warning: {
    label: 'Warning',
    description: 'Environment is unbalanced.',
    icon: ShieldAlert,
    baseClass: 'border-yellow-500/50 bg-yellow-500/10',
    iconClass: 'text-yellow-500',
    animation: 'animate-pulse',
  },
  Critical: {
    label: 'Critical Alert',
    description: 'Unsafe conditions detected.',
    icon: ShieldX,
    baseClass: 'border-destructive/50 bg-destructive/10',
    iconClass: 'text-destructive',
    animation: 'animate-pulse',
  },
};


export default function SystemStatus() {
  const { data } = useIncubator();
  
  let status: SystemStatusType;
  switch (data.alertSystem?.status) {
    case 'SYSTEM_OK':
      status = 'OK';
      break;
    case 'WARNING':
      status = 'Warning';
      break;
    case 'CRITICAL':
      status = 'Critical';
      break;
    default:
      status = 'OK';
  }

  const message = data.alertSystem?.message || statusConfig[status].description;
  const config = statusConfig[status];
  const Icon = config.icon;
  const isBuzzerActive = data.alertSystem?.buzzer === true;

  return (
    <div className={cn('rounded-lg border p-4 flex items-start gap-4', config.baseClass)}>
      <Icon className={cn('h-7 w-7 shrink-0 mt-0.5', config.iconClass, config.animation)} />
      <div className="flex-1">
        <div className="flex justify-between items-center">
            <h4 className={cn('font-semibold', config.iconClass)}>{config.label}</h4>
            {isBuzzerActive && <BellRing className="w-5 h-5 text-destructive animate-pulse" />}
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        {(status === 'Warning' || status === 'Critical') && (
            <div className="text-xs mt-2 space-y-1 text-muted-foreground">
                {data.alertSystem?.temperatureState !== 'NORMAL' && (
                    <p><span className="font-semibold text-foreground">Temp:</span> {data.alertSystem?.temperatureState}</p>
                )}
                {data.alertSystem?.humidityState !== 'NORMAL' && (
                    <p><span className="font-semibold text-foreground">Humidity:</span> {data.alertSystem?.humidityState}</p>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
