import { ReactNode } from 'react';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { CooperativeSidebar } from '@/components/cooperative/CooperativeSidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showConnectionHeader?: boolean;
}

export const DashboardLayout = ({ children, title, subtitle, showConnectionHeader = true }: DashboardLayoutProps) => {
  const { user } = useAuth();

  if (user?.role === 'cooperative') {
    return (
      <SidebarProvider>
        <CooperativeSidebar />
        <SidebarInset>
          <Header title={title} subtitle={subtitle} showConnectionHeader={showConnectionHeader} />
          <main className="p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (user?.role === 'admin') {
    return (
      <SidebarProvider className="admin-sidebar-theme">
        <AdminSidebar />
        <SidebarInset>
          <Header title={title} subtitle={subtitle} showConnectionHeader={showConnectionHeader} />
          <main className="p-3 sm:p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={title} subtitle={subtitle} showConnectionHeader={showConnectionHeader} />
      <main className="p-3 sm:p-4 md:p-6">{children}</main>
    </div>
  );
};
