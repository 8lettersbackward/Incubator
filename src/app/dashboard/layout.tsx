'use client';

import { IncubatorProvider } from "@/contexts/incubator-context";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import VerifyEmailNotice from "@/components/auth/verify-email-notice";
import { database } from "@/firebase/config";
import { ref, get } from "firebase/database";

type IncubatorStatus = 'checking' | 'exists' | 'not-found' | 'error';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [incubatorStatus, setIncubatorStatus] = useState<IncubatorStatus>('checking');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.emailVerified && database) {
      setIncubatorStatus('checking');
      const incubatorRef = ref(database, `incubators/${user.uid}`);
      get(incubatorRef).then((snapshot) => {
        if (snapshot.exists()) {
          setIncubatorStatus('exists');
          if (pathname === '/dashboard/setup') {
              router.push('/dashboard');
          }
        } else {
          setIncubatorStatus('not-found');
          if (pathname !== '/dashboard/setup') {
            router.push('/dashboard/setup');
          }
        }
      }).catch((error) => {
        console.error("Error checking for incubator:", error);
        setIncubatorStatus('error');
      });
    } else if (user && !user.emailVerified) {
      // Prevent redirect loop, just show email verification
      setIncubatorStatus('exists'); 
    }

  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading || incubatorStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return <VerifyEmailNotice />;
  }

  if (incubatorStatus === 'error') {
    return (
        <div className="flex flex-col gap-4 items-center justify-center min-h-screen text-destructive">
            <p>Could not verify your incubator status.</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
        </div>
    )
  }

  if (incubatorStatus === 'not-found' && pathname === '/dashboard/setup') {
      return <>{children}</>;
  }

  if (incubatorStatus === 'exists' && user && user.emailVerified) {
    return (
      <IncubatorProvider>
        {children}
      </IncubatorProvider>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-12 h-12 animate-spin text-primary" />
    </div>
  );
}
