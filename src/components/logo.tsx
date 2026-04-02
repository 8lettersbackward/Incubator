import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative font-bold text-2xl", className)}>
        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Sun */}
            <circle cx="100" cy="55" r="30" fill="#FFDE42" />

            {/* Grass */}
            <path d="M20,110 C40,100 60,115 80,105 S120,100 140,108 S180,100 190,110 L190,115 L20,115 Z" fill="#313E17" />

            {/* Rooster (Center) */}
            <path 
                d="M100,60 
                   C90,60 85,65 85,75 
                   C85,95 80,110 80,110 
                   L120,110 
                   C120,110 115,95 115,75 
                   C115,65 110,60 100,60 Z
                   M100,50 
                   C105,45 110,45 112,50 
                   C115,55 110,60 100,60 
                   C90,60 85,55 88,50 
                   C90,45 95,45 100,50 Z
                   M98,45 
                   C95,40 95,35 100,35 
                   C105,35 108,40 105,45 Z
                   M102,35 
                   C108,30 115,30 118,38 
                   C115,35 110,35 102,40 Z
                   M98,35 
                   C92,30 85,30 82,38 
                   C85,35 90,35 98,40 Z
                   M115,80
                   C125,75 135,85 130,95
                   C128,105 120,110 118,110"
                fill="#313E17"
            />

            {/* Hen (Left) */}
            <path 
                d="M60,80 
                   C55,80 50,85 50,90 
                   C50,105 45,110 45,110 
                   L75,110 
                   C75,110 70,105 70,90 
                   C70,85 65,80 60,80 Z
                   M60,75
                   C62,72 65,72 66,75
                   C65,78 62,78 60,75Z"
                fill="#313E17"
            />

            {/* Hen (Right) */}
            <path 
                d="M140,80 
                   C135,80 130,85 130,90 
                   C130,105 125,110 125,110 
                   L155,110 
                   C155,110 150,105 150,90 
                   C150,85 145,80 140,80 Z
                   M140,75
                   C142,72 145,72 146,75
                   C145,78 142,78 140,75Z
                   M150,90
                   C155,88 160,92 158,98
                   C155,105 150,110 150,110"
                fill="#313E17"
            />
            
            {/* Text */}
            <text 
                x="100" y="90" 
                fontFamily="Impact, sans-serif" 
                fontSize="24" 
                fill="#FFDE42" 
                stroke="#1B0C0C" 
                strokeWidth="2" 
                textAnchor="middle"
                paintOrder="stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
                transform="rotate(-5 100 90)"
            >
                EGGCELLENT
            </text>
        </svg>
    </div>
  );
}
