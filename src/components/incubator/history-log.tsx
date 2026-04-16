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
import { History, Image as ImageIcon, Inbox } from 'lucide-react';
import Image from 'next/image';

const incubationHistory: { id: number; type: string; startDate: string; endDate: string; outcome: string; hatched: number; total: number; }[] = [];

const cameraLogs: { id: number; timestamp: string; image: string; event: string; }[] = [];


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
                            {incubationHistory.length > 0 ? (
                                incubationHistory.map((item) => (
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Inbox className="w-8 h-8" />
                                            No incubation history yet.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
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
            {cameraLogs.length > 0 ? (
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
            ) : (
                 <div className="h-[300px] w-full flex flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Inbox className="w-12 h-12" />
                    No camera logs available.
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
