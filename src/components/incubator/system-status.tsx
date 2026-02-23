'use client';

import { useIncubator } from '@/contexts/incubator-context';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

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
  const { tempAlert, humidityAlert, balanceAlert } = data.status;

  const getSystemStatus = (): SystemStatusType => {
    if (tempAlert !== 'OK' || humidityAlert !== 'OK') {
      return 'Critical';
    }
    if (balanceAlert !== 'OK') {
      return 'Warning';
    }
    return 'OK';
  };

  const status = getSystemStatus();
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg border p-4 flex items-center gap-4', config.baseClass)}>
      <Icon className={cn('h-7 w-7 shrink-0', config.iconClass, config.animation)} />
      <div>
        <h4 className={cn('font-semibold', config.iconClass)}>{config.label}</h4>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
    </div>
  );
}
