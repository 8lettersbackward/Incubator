'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Layers,
  Lightbulb,
  Droplets,
  Fan,
  RotateCw,
  Cpu,
  Waves,
  Camera,
  PanelRight,
} from 'lucide-react';

const components = [
  {
    name: 'Transparent Door',
    description: 'Hinged one-way door',
    icon: <PanelRight className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Pull-out Trays',
    description: '56 eggs each (112 total capacity)',
    icon: <Layers className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Heat Lamp',
    description: 'Center mounted heating source',
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Water Dispenser',
    description: 'Auto-fill system with sensors',
    icon: <Droplets className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Ventilation Fan',
    description: 'Left side mounted airflow system',
    icon: <Fan className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Turning Motor',
    description: 'Automatic egg rotation mechanism',
    icon: <RotateCw className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Control Panel',
    description: 'External enclosure for Arduino/ESP32',
    icon: <Cpu className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Water Sensors',
    description: '3-level water monitoring system',
    icon: <Waves className="w-8 h-8 text-primary" />,
  },
  {
    name: 'CCTV Camera',
    description: 'WiFi live monitoring and data streaming',
    icon: <Camera className="w-8 h-8 text-primary" />,
  },
];

const ComponentItem = ({ name, description, icon }: { name: string; description: string; icon: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center text-center p-4 border border-border rounded-lg bg-card/50 transition-all hover:bg-card hover:shadow-lg hover:-translate-y-1">
    {icon}
    <h3 className="mt-4 font-semibold text-foreground">{name}</h3>
    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
  </div>
);

export default function ComponentsGuide() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Components Guide</CardTitle>
        <CardDescription>An overview of all incubator hardware modules.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {components.map((component) => (
            <ComponentItem key={component.name} {...component} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
