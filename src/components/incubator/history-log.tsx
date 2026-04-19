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
import { History, Inbox, Trash2, Camera } from 'lucide-react';
import { useIncubator } from '@/contexts/incubator-context';
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
import { format, parseISO, isValid } from 'date-fns';
import { Separator } from '../ui/separator';
import Image from 'next/image';

export default function HistoryLog() {
  const { data, deleteHistoryEntry, deleteCameraLogEntry } = useIncubator();

  const rawHistory = data.incubation?.incubationHistory || [];
  const incubationHistory = (Array.isArray(rawHistory) ? rawHistory : Object.values(rawHistory)).sort((a, b) => b.id - a.id);

  const rawCameraLog = data.incubation?.cameraLog || [];
  const cameraLog = (Array.isArray(rawCameraLog) ? rawCameraLog : Object.values(rawCameraLog)).sort((a, b) => b.id - a.id);

  const getFormattedHistoryDate = (timestamp: string): string => {
      if (!timestamp) return 'N/A';
      const date = parseISO(timestamp);
      return isValid(date) ? format(date, 'MMM d, yyyy') : timestamp;
  };
  
  const getFormattedLogDate = (timestamp: string): string => {
      if (!timestamp) return 'N/A';
      try {
        const date = parseISO(timestamp);
        return isValid(date) ? format(date, 'MMM d, yyyy, h:mm a') : timestamp;
      } catch (e) {
          return timestamp;
      }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            History & Logs
        </CardTitle>
        <CardDescription>
          Review past incubation cycles and camera snapshots.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
            <h3 className="text-lg font-medium mb-2">Incubation History</h3>
            <div className="border rounded-lg">
                <ScrollArea className="h-[250px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">Start Date</TableHead>
                                <TableHead className="whitespace-nowrap">Egg Type</TableHead>
                                <TableHead className="whitespace-nowrap">Outcome</TableHead>
                                <TableHead className="text-center whitespace-nowrap">Hatched</TableHead>
                                <TableHead className="text-right sr-only">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incubationHistory.length > 0 ? (
                                incubationHistory.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="whitespace-nowrap">{getFormattedHistoryDate(item.startDate)}</TableCell>
                                    <TableCell>{item.eggType}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            item.outcome === 'Hatched' ? 'default' : 
                                            item.outcome === 'In Progress' ? 'secondary' : 'destructive'
                                        }>
                                            {item.outcome}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-medium whitespace-nowrap">
                                    {item.outcome === 'In Progress' || item.outcome === 'Cancelled' ? '-' : `${item.hatchedCount}/${item.totalEggs}`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete History Entry?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this record? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteHistoryEntry(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
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

        <Separator />

        <div>
           <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><Camera className="w-5 h-5 text-primary"/> Camera Log</h3>
           <div className="border rounded-lg">
                <ScrollArea className="h-[400px] p-4">
                    {cameraLog.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cameraLog.map((log) => (
                                <Card key={log.id} className="overflow-hidden group">
                                    <CardContent className="p-0">
                                        <div className="relative aspect-video">
                                            <Image src={log.image} alt={log.event} fill style={{objectFit: 'cover'}} unoptimized />
                                        </div>
                                        <div className="p-3 text-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{log.event}</p>
                                                    <p className="text-xs text-muted-foreground">{getFormattedLogDate(log.timestamp)}</p>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Log Entry?</AlertDialogTitle>
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
                                    </CardContent>
                                </Card>
                            ))}
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                            <Camera className="w-8 h-8" />
                            <p>No camera snapshots logged yet.</p>
                        </div>
                    )}
                </ScrollArea>
           </div>
        </div>

      </CardContent>
    </Card>
  );
}
