'use client';

import { useState } from 'react';
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

  const handleResend = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification link has been sent to your email address.',
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
            We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox and follow the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or click below to resend.
          </p>
          <Button onClick={handleResend} disabled={isSending} className="w-full">
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
