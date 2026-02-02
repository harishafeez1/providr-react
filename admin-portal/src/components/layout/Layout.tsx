import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'providr_admin_sidebar_collapsed';

export function Layout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className={cn('flex flex-col min-h-screen transition-all duration-200', collapsed ? 'ml-[52px]' : 'ml-64')}>
        <Header onToggleSidebar={toggle} collapsed={collapsed} />
        <main className="flex-1 p-4 pt-0">
          <div className="flex flex-1 flex-col gap-4 pt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
