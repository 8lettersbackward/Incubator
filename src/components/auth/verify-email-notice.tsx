
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
    
    // If the user is logged in but their email is not verified...
    if (user && !user.emailVerified) {
      //...start checking their verification status periodically.
      const interval = setInterval(async () => {
        // We need to get the current user from auth, not from the hook, 
        // as the hook's user object might be stale inside the interval.
        if (auth.currentUser) {
          await auth.currentUser.reload();
          // If the email has been verified...
          // We use optional chaining here because auth.currentUser might become null after reload()
          // if the user's account has been disabled or deleted.
          if (auth.currentUser?.emailVerified) {
            // ...stop checking...
            clearInterval(interval);
            
            // Sign the user out so they have to log in again with their verified account.
            await signOut(auth);
            
            // ...show a success message...
            toast({
              title: "Verification Successful!",
              description: "Your account is now active. Please log in to continue.",
            });
            
            // ...and redirect them to the login page.
            router.push('/login');
          }
        }
      }, 5000); // Check every 5 seconds.

      // Clean up the interval when the component unmounts.
      return () => clearInterval(interval);
    }
  }, [user, router, toast]);


  const handleResend = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;
    setIsSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification link has been sent to your email address. Remember to check your spam folder.',
      });
    } catch (error: any) {
       let description = 'Failed to send verification email. Please try again later.';
       if (error.code === 'auth/too-many-requests') {
           description = 'You have requested a verification email too many times. Please wait a while before trying again.';
       }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: description,
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
