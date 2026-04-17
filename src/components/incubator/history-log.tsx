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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Image as ImageIcon, Inbox, Trash2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useIncubator } from '@/contexts/incubator-context';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const incubationHistory: { id: number; type: string; startDate: string; endDate: string; outcome: string; hatched: number; total: number; }[] = [];

export default function HistoryLog() {
  const { data, deleteCameraLogEntry, clearCameraLog } = useIncubator();
  const rawCameraLogs = data.incubation?.cameraLog || [];
  const cameraLogs = Array.isArray(rawCameraLogs) ? rawCameraLogs : Object.values(rawCameraLogs);

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
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Camera Log
                </h3>
                {cameraLogs.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Log
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="text-destructive"/> Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all {cameraLogs.length} snapshots from the log.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearCameraLog} className="bg-destructive hover:bg-destructive/90">
                                    Delete All
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            {cameraLogs.length > 0 ? (
                <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cameraLogs.map((log) => (
                            <div key={log.id} className="group relative border rounded-lg p-2 bg-card/50">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative rounded-md overflow-hidden aspect-video mb-2 cursor-pointer">
                                            <Image src={log.image} alt={log.event} fill className="object-cover transition-transform hover:scale-105" />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="p-0 border-0 max-w-4xl bg-transparent shadow-none">
                                        <DialogHeader className="sr-only">
                                            <DialogTitle>Snapshot from {log.timestamp}</DialogTitle>
                                        </DialogHeader>
                                        <Image src={log.image} alt={log.event} width={1200} height={800} className="w-full h-auto object-contain rounded-lg" />
                                    </DialogContent>
                                </Dialog>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium">{log.event}</p>
                                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                 <AlertDialogTitle>Delete Snapshot?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this snapshot? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteCameraLogEntry(log.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
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
