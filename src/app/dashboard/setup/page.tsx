'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { database } from '@/firebase/config';
import { ref, set, get } from 'firebase/database';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { EGG_INCUBATION_PERIODS, initialData } from '@/contexts/incubator-context';
import Logo from '@/components/logo';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Incubator name must be at least 3 characters.' }),
});

export default function IncubatorSetupPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !database) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to create an incubator.',
      });
      router.push('/login');
      return;
    }

    setIsCreating(true);

    try {
      // Check for duplicate name
      const incubatorsRef = ref(database, 'incubators');
      const snapshot = await get(incubatorsRef);
      if (snapshot.exists()) {
        const incubators = snapshot.val();
        const names = Object.values(incubators).map((inc: any) => inc.name?.toLowerCase());
        if (names.includes(values.name.toLowerCase())) {
          toast({
            variant: 'destructive',
            title: 'Name Already Exists',
            description: `An incubator with the name "${values.name}" already exists. Please choose a different name.`,
          });
          setIsCreating(false);
          return;
        }
      }

      const incubatorRef = ref(database, `incubators/${user.uid}`);
      
      const newIncubatorData = {
          ...initialData,
          name: values.name,
          incubation: {
              ...initialData.incubation,
              totalDays: EGG_INCUBATION_PERIODS[initialData.incubation.eggType],
          }
      };

      await set(incubatorRef, newIncubatorData);

      toast({
        title: 'Incubator Created!',
        description: `Your incubator "${values.name}" is now ready.`,
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error("Incubator creation error:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create incubator. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  }

  if (isUserLoading) {
       return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
       )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
               <Logo className="h-24" />
            </div>
          <CardTitle>Set Up Your Incubator</CardTitle>
          <CardDescription>
            Give your incubator a unique name to get started. Each user can have one incubator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incubator Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My First Hatch" {...field} disabled={isCreating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Create Incubator
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">Upon creation, you will be redirected to your dashboard.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
