import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ gridTemplateColumns: '200px 1fr' }} className="grid gap-10">
      <div className="flex flex-col">
        <Link href="/dashboard/clients">Clients</Link>
        <Link href="/dashboard/projects">Project</Link>
      </div>
      {children}
    </div>
  );
}
