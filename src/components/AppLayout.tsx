import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';

interface AppLayoutProps {
  children: ReactNode;
  topBarActions?: ReactNode;
}

export function AppLayout({ children, topBarActions }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <DashboardSidebar />
        </Sidebar>

        <main className="flex-1 relative">
          {/* Top Bar */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5">
            {topBarActions}
          </div>
          <div className="fixed top-4 left-4 z-50 md:hidden">
            <SidebarTrigger className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary" />
          </div>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
