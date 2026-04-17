"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIncubator } from "@/contexts/incubator-context";
import { Lightbulb, Fan, RotateCw, LockIcon, CloudDrizzle } from "lucide-react";
import { cn } from "@/lib/utils";

const ControlItem = ({ icon, label, description, checked, onCheckedChange, disabled }: { icon: React.ReactNode; label: string; description: string; checked: boolean; onCheckedChange: () => void; disabled: boolean; }) => (
    <div className="flex items-start justify-between space-x-4">
        <div className="flex items-center gap-4">
            {icon}
            <div>
                <Label htmlFor={`${label.toLowerCase().replace(' ', '-')}-switch`} className="font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
        <Switch id={`${label.toLowerCase().replace(' ', '-')}-switch`} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
);

export default function SystemControls() {
    const { data, isLocked, toggleHeater, toggleFan, toggleMotor, toggleMist } = useIncubator();

    const controls = [
        {
            icon: <Lightbulb className="w-6 h-6 text-primary" />,
            label: "Heat Lamp",
            description: "Heating element status",
            checked: data.control.heater,
            onCheckedChange: toggleHeater,
        },
        {
            icon: <Fan className={cn("w-6 h-6 text-primary", data.control.fan && "animate-spin")} />,
            label: "Ventilation Fan",
            description: "Air circulation system",
            checked: data.control.fan,
            onCheckedChange: toggleFan,
        },
        {
            icon: <RotateCw className="w-6 h-6 text-primary" />,
            label: "Turning Motor",
            description: "Automatic egg rotation",
            checked: data.control.motor,
            onCheckedChange: toggleMotor,
        },
        {
            icon: <CloudDrizzle className="w-6 h-6 text-primary" />,
            label: "Mist Generator",
            description: "Humidity misting system",
            checked: data.control.mist,
            onCheckedChange: toggleMist,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Controls</CardTitle>
                <CardDescription>Manual override for core components.</CardDescription>
            </CardHeader>
            <div className="relative">
                 {isLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-b-lg -mt-6">
                        <LockIcon className="w-8 h-8 text-primary" />
                        <p className="text-sm text-muted-foreground mt-2">Locked</p>
                    </div>
                )}
                <CardContent className={cn("space-y-6 pt-4 transition-all", isLocked && "blur-sm opacity-50 pointer-events-none")}>
                    {controls.map(control => (
                        <ControlItem
                            key={control.label}
                            icon={control.icon}
                            label={control.label}
                            description={control.description}
                            checked={control.checked}
                            onCheckedChange={control.onCheckedChange}
                            disabled={isLocked}
                        />
                    ))}
                </CardContent>
            </div>
        </Card>
    );
}
