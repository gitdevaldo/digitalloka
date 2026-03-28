import { requireAuth } from '@/lib/auth';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="h-screen flex flex-col bg-dots">
      <Topbar user={user} />
      <div className="flex flex-1 pt-16 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
