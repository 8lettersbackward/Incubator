"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Video, VideoOff } from 'lucide-react';
import { useIncubator } from '@/contexts/incubator-context';
import { Switch } from '@/components/ui/switch';
import { Label } from "@/components/ui/label";

export default function CameraConnectivity() {
  const { data, toggleCamera, isLocked } = useIncubator();
  const cameraImage = PlaceHolderImages.find(img => img.id === 'camera-feed');

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              Hatching Chamber
          </CardTitle>
          <CardDescription>{data.control.cameraOn ? "Live feed from inside the hatching chamber" : "Camera is currently turned off"}</CardDescription>
        </div>
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
       <CardFooter className="flex items-center justify-center pt-6">
        <div className="flex items-center gap-2">
            <Label htmlFor="camera-toggle" className="text-sm font-medium">Camera Power</Label>
            <Switch id="camera-toggle" checked={data.control.cameraOn} onCheckedChange={toggleCamera} disabled={isLocked} />
        </div>
      </CardFooter>
    </Card>
  );
}
