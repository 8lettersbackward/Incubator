"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIncubator } from '@/contexts/incubator-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Video, Wifi } from 'lucide-react';
import StatusIndicator from '../shared/status-indicator';

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
            {data.status.deviceOnline && (
              <Badge variant="destructive" className="absolute top-2 left-2 animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
        )}
        <div className="flex justify-between items-center text-sm pt-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Wifi className="w-5 h-5"/>
                <span>Network Status</span>
            </div>
            <StatusIndicator label={data.status.wifiConnected ? "Connected" : "Disconnected"} isActive={data.status.wifiConnected} />
        </div>
      </CardContent>
    </Card>
  );
}
