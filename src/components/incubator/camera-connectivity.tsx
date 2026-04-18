"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Video, VideoOff } from 'lucide-react';
import { useIncubator } from '@/contexts/incubator-context';
import { Switch } from '@/components/ui/switch';
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

export default function CameraConnectivity() {
  const { data, toggleCamera, isLocked } = useIncubator();
  
  // The liveFeedUrl is the single source of truth from Firebase, updated by the ESP32.
  const liveImageUrl = data.incubation?.liveFeedUrl || '';
  
  // This state holds a timestamp to force the image to refresh, combating browser caching.
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // This effect listens for changes to the liveImageUrl from Firebase.
  // When it changes, we generate a new key to force the <Image> component to re-fetch.
  useEffect(() => {
    if (liveImageUrl) {
      setRefreshKey(Date.now());
    }
  }, [liveImageUrl]);

  const handleToggle = (checked: boolean) => {
    // This just updates the 'cameraOn' boolean in Firebase to signal the device.
    toggleCamera(checked);
  };
  
  // The final URL includes the cache-busting query parameter.
  const displayUrl = liveImageUrl ? `${liveImageUrl}?t=${refreshKey}` : '';

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              Hatching Chamber
          </CardTitle>
          <CardDescription>
            {data.control.cameraOn 
              ? "Live feed from the hatching chamber. Click image to zoom." 
              : "Camera is currently off. Showing last available snapshot."
            }
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {displayUrl ? (
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative rounded-lg overflow-hidden border border-border cursor-pointer transition-transform hover:scale-[1.02]">
                <Image
                  key={displayUrl} // The key ensures React replaces the component when the URL changes
                  src={displayUrl}
                  alt="Latest snapshot from hatching chamber"
                  width={600}
                  height={400}
                  unoptimized // Bypasses Next.js image optimization, good for frequently changing images
                  className="aspect-video object-cover"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="p-0 border-0 max-w-4xl bg-transparent shadow-none">
               <DialogHeader className="sr-only">
                <DialogTitle>Latest snapshot from hatching chamber</DialogTitle>
              </DialogHeader>
              <Image
                src={displayUrl}
                alt="Latest snapshot from hatching chamber"
                width={1200}
                height={800}
                unoptimized
                className="w-full h-auto object-contain rounded-lg"
              />
            </DialogContent>
          </Dialog>
        ) : (
           <div className="relative rounded-lg border-2 border-dashed border-border aspect-video flex flex-col items-center justify-center bg-card/50">
              <VideoOff className="w-12 h-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No image available from camera</p>
          </div>
        )}
      </CardContent>
       <CardFooter className="flex items-center justify-center pt-6">
        <div className="flex items-center gap-2">
            <Label htmlFor="camera-toggle" className="text-sm font-medium">Camera</Label>
            <Switch id="camera-toggle" checked={data.control.cameraOn} onCheckedChange={handleToggle} disabled={isLocked} />
        </div>
      </CardFooter>
    </Card>
  );
}
