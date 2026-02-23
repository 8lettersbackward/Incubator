"use client";

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
import { useIncubator } from "@/contexts/incubator-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function EmergencyStopDialog({ children }: { children: React.ReactNode }) {
  const { emergencyStop, isLocked } = useIncubator();
  const { toast } = useToast();

  const handleEmergencyStop = () => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Please unlock the system to perform an emergency stop.",
      });
      return;
    }
    emergencyStop();
    toast({
      variant: "destructive",
      title: "Emergency Stop Activated",
      description: "All incubator systems have been shut down.",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will immediately shut down all heating, ventilation, and turning systems. This is an irreversible action for the current cycle and should only be used in a critical emergency.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleEmergencyStop}
          >
            Confirm Emergency Stop
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
