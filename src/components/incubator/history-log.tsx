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
import { History, Inbox, Trash2 } from 'lucide-react';
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

export default function HistoryLog() {
  const { data, deleteHistoryEntry } = useIncubator();

  const rawHistory = data.incubation?.incubationHistory || [];
  const incubationHistory = (Array.isArray(rawHistory) ? rawHistory : Object.values(rawHistory)).sort((a, b) => b.id - a.id);

  const getFormattedHistoryDate = (timestamp: string): string => {
      if (!timestamp) return 'N/A';
      const date = parseISO(timestamp);
      return isValid(date) ? format(date, 'MMM d, yyyy') : timestamp;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Incubation History
        </CardTitle>
        <CardDescription>
          Review past incubation cycles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
            <ScrollArea className="h-[400px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Egg Type</TableHead>
                            <TableHead>Outcome</TableHead>
                            <TableHead className="text-center">Hatched</TableHead>
                            <TableHead className="text-right sr-only">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {incubationHistory.length > 0 ? (
                            incubationHistory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{getFormattedHistoryDate(item.startDate)}</TableCell>
                                <TableCell>{item.eggType}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        item.outcome === 'Hatched' ? 'default' : 
                                        item.outcome === 'In Progress' ? 'secondary' : 'destructive'
                                    }>
                                        {item.outcome}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center font-medium">
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
      </CardContent>
    </Card>
  );
}
