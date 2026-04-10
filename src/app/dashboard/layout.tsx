'use client';

import { IncubatorProvider } from "@/contexts/incubator-context";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import VerifyEmailNotice from "@/components/auth/verify-email-notice";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return <VerifyEmailNotice />;
  }

  return (
    <IncubatorProvider>
      {children}
    </IncubatorProvider>
  );
}
