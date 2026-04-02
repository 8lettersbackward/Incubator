import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-[5/3]", className)}>
      <Image 
        src="/logo.png" 
        alt="Eggcelent Logo" 
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  );
}
