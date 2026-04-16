'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const incubationHistory = [
    { id: 1, type: 'Chicken', startDate: '2024-05-01', endDate: '2024-05-22', outcome: 'Successful Hatch', hatched: 50, total: 56 },
    { id: 2, type: 'Duck', startDate: '2024-04-10', endDate: '2024-05-08', outcome: 'Ended Early', hatched: 0, total: 40 },
    { id: 3, type: 'Quail', startDate: '2024-03-20', endDate: '2024-04-07', outcome: 'Successful Hatch', hatched: 98, total: 112 },
];

const cameraLogs = [
    { id: 1, timestamp: '2024-05-21 14:30:15', image: 'https://picsum.photos/seed/hatch1/200/150', event: 'First Pip' },
    { id: 2, timestamp: '2024-05-21 18:45:00', image: 'https://picsum.photos/seed/hatch2/200/150', event: 'Hatching in Progress' },
    { id: 3, timestamp: '2024-05-22 08:00:00', image: 'https://picsum.photos/seed/hatch3/200/150', event: 'All Hatched' },
    { id: 4, timestamp: '2024-04-15 12:00:00', image: 'https://picsum.photos/seed/hatch4/200/150', event: 'Mid-incubation Check' },
];


export default function HistoryLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            History & Logs
        </CardTitle>
        <CardDescription>
          Review past incubation cycles and captured camera moments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
            <h3 className="text-lg font-semibold mb-4">Incubation History</h3>
            <div className="border rounded-lg">
                <ScrollArea className="h-[200px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Egg Type</TableHead>
                                <TableHead>Outcome</TableHead>
                                <TableHead className="text-right">Hatched</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incubationHistory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.startDate}</TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>
                                    <Badge variant={item.outcome === 'Successful Hatch' ? 'default' : 'destructive'}>
                                        {item.outcome}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{`${item.hatched}/${item.total}`}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Camera Log
            </h3>
            <ScrollArea className="h-[300px] w-full pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cameraLogs.map((log) => (
                        <div key={log.id} className="border rounded-lg p-2 bg-card/50">
                             <div className="relative rounded-md overflow-hidden aspect-video mb-2">
                                <Image src={log.image} alt={log.event} fill className="object-cover" />
                            </div>
                            <p className="text-sm font-medium">{log.event}</p>
                            <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
