"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Video, VideoOff } from 'lucide-react';
import { useIncubator } from '@/contexts/incubator-context';

export default function CameraConnectivity() {
  const { data } = useIncubator();
  const cameraImage = PlaceHolderImages.find(img => img.id === 'camera-feed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Camera Feed
        </CardTitle>
        <CardDescription>{data.control.cameraOn ? "Live feed from inside the incubator" : "Camera is currently turned off"}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.control.cameraOn && cameraImage ? (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <Image
              src={cameraImage.imageUrl}
              alt={cameraImage.description}
              width={600}
              height={400}
              data-ai-hint={cameraImage.imageHint}
              className="aspect-video object-cover"
            />
          </div>
        ) : (
           <div className="relative rounded-lg border-2 border-dashed border-border aspect-video flex flex-col items-center justify-center bg-card/50">
              <VideoOff className="w-12 h-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Camera is offline</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
