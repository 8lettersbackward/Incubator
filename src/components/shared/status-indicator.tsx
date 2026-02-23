import { cn } from "@/lib/utils";

type StatusIndicatorProps = {
  label: string;
  isActive: boolean;
  activeColor?: string;
  inactiveColor?: string;
};

export default function StatusIndicator({
  label,
  isActive,
  activeColor = "bg-accent",
  inactiveColor = "bg-muted",
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full transition-all",
          isActive ? activeColor : inactiveColor,
          isActive && "shadow-[0_0_8px_2px_hsl(var(--accent))]"
        )}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
