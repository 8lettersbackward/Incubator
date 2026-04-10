'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { getAuth, sendEmailVerification, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader, MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailNotice() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    
    if (user && !user.emailVerified) {
      const interval = setInterval(async () => {
        // We need to get the current user from auth, not from the hook, 
        // as the hook's user object might be stale inside the interval.
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            clearInterval(interval);
            toast({
              title: "Verification Successful!",
              description: "Your account is active. Redirecting to the dashboard...",
            });
            router.replace('/dashboard');
          }
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user, router, toast]);


  const handleResend = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification link has been sent to your email address. Remember to check your spam folder.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send verification email. Please try again later.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <MailCheck className="h-8 w-8" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox (and spam folder!) and follow the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Waiting for verification... This page will refresh automatically.</span>
          </div>

          <Button onClick={handleResend} disabled={isSending} className="w-full" variant="secondary">
            {isSending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Resend Verification Email
          </Button>
          
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
