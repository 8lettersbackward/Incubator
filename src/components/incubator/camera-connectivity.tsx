"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIncubator } from '@/contexts/incubator-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import SignalStrength from '@/components/shared/signal-strength';
import { Video } from 'lucide-react';

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-baseline text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-mono text-foreground">{value}</dd>
  </div>
);

export default function CameraConnectivity() {
  const { data } = useIncubator();
  const cameraImage = PlaceHolderImages.find(img => img.id === 'camera-feed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Camera & Connectivity
        </CardTitle>
        <CardDescription>Live feed and network status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameraImage && (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <Image
              src={cameraImage.imageUrl}
              alt={cameraImage.description}
              width={600}
              height={400}
              data-ai-hint={cameraImage.imageHint}
              className="aspect-video object-cover"
            />
            <Badge variant="destructive" className="absolute top-2 left-2 animate-pulse">
              LIVE
            </Badge>
          </div>
        )}
        <dl className="space-y-1.5 text-xs">
          <StatItem label="Stream Quality" value={data.camera.quality} />
          <StatItem label="FPS" value={data.camera.fps} />
          <StatItem label="Data Usage" value={data.camera.dataUsage} />
          <hr className="border-border my-2" />
          <div className="flex justify-between items-center text-sm">
            <dt className="text-muted-foreground">WiFi</dt>
            <dd className="font-mono text-foreground flex items-center gap-2">
              {data.wifi.ssid}
              <SignalStrength strength={data.wifi.signal} />
            </dd>
          </div>
          <StatItem label="IP Address" value={data.wifi.ip} />
        </dl>
      </CardContent>
    </Card>
  );
}
