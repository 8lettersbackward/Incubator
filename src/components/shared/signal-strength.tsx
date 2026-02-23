import { cn } from '@/lib/utils';

type SignalStrengthProps = {
  strength: number; // 0-100
};

export default function SignalStrength({ strength }: SignalStrengthProps) {
  const bars = [
    { threshold: 20, height: 'h-1' },
    { threshold: 40, height: 'h-2' },
    { threshold: 60, height: 'h-3' },
    { threshold: 80, height: 'h-4' },
  ];

  return (
    <div className="flex items-end gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className={cn(
            'w-1 rounded-sm transition-colors',
            bar.height,
            strength >= bar.threshold ? 'bg-accent' : 'bg-muted-foreground/50'
          )}
        />
      ))}
    </div>
  );
}
