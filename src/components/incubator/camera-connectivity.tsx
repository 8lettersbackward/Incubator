"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Video } from 'lucide-react';

export default function CameraConnectivity() {
  const cameraImage = PlaceHolderImages.find(img => img.id === 'camera-feed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Camera Feed
        </CardTitle>
        <CardDescription>Live feed from inside the incubator</CardDescription>
      </CardHeader>
      <CardContent>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
