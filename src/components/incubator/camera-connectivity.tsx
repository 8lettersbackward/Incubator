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
import { useState } from 'react';

export default function CameraConnectivity() {
  const { data, toggleCamera, isLocked } = useIncubator();
  
  // Use the URL from the database, but have a fallback to the known Supabase URL.
  const liveImageUrl = data.incubation?.liveFeedUrl || 'https://opmkolckeetjuhliytnm.supabase.co/storage/v1/object/public/Eggcelent/latest.jpg';
  
  // This state holds a timestamp to force the image to refresh.
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const handleToggle = (checked: boolean) => {
    // When turning the camera on, create a new timestamp to bust the browser cache.
    if (checked) {
      setRefreshKey(Date.now());
    }
    // This just updates the 'cameraOn' boolean in Firebase.
    toggleCamera(checked);
  };
  
  // The final URL includes the cache-busting query parameter.
  const displayUrl = `${liveImageUrl}?t=${refreshKey}`;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              Hatching Chamber
          </CardTitle>
          <CardDescription>{data.control.cameraOn ? "Latest snapshot from the hatching chamber. Click image to zoom." : "Camera is currently turned off"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {data.control.cameraOn ? (
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
              <p className="mt-2 text-sm text-muted-foreground">Camera is offline</p>
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
