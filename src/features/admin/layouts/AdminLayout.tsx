import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import type { AdminStaffRole } from '@/src/features/admin/repositories/adminRepository';
import { getAdminNavigation, type AdminNavigationGroup } from '@/src/features/admin/lib/adminNavigation';
import { AdminMobileNavigation, AdminSidebar } from './AdminSidebar';

export interface AdminLayoutContext {
  role: AdminStaffRole;
  navigation: AdminNavigationGroup[];
}

export function useAdminLayoutContext(): AdminLayoutContext {
  return useOutletContext<AdminLayoutContext>();
}

export function AdminLayout() {
  const { staffRole } = useAuth();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  if (!staffRole) {
    return <main className="min-h-dvh bg-[#F5EFE6] p-5"><div aria-busy="true" className="mx-auto h-16 max-w-7xl animate-pulse rounded-2xl bg-[#F0E8DC]" /></main>;
  }

  const role = staffRole as AdminStaffRole;
  const navigation = getAdminNavigation(role);
  return (
    <div className="min-h-dvh bg-[#F5EFE6] text-[#172033] lg:flex">
      <AdminSidebar navigation={navigation} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between border-b border-[#E4D8C9] bg-[#FFFCF7]/95 px-4 backdrop-blur-sm lg:hidden"><strong>Gino2 Admin</strong><AdminMobileNavigation navigation={navigation} open={mobileNavigationOpen} onOpen={() => setMobileNavigationOpen(true)} onClose={() => setMobileNavigationOpen(false)} /></header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Outlet context={{ role, navigation }} /></main>
      </div>
    </div>
  );
}
