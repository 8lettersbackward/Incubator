import { IncubatorProvider } from "@/contexts/incubator-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IncubatorProvider>
      {children}
    </IncubatorProvider>
  );
}
