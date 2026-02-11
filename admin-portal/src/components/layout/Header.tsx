import { useLocation } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { menuSections } from './Sidebar';
import { Notifications } from './header/Notifications';
import { UserMenu } from './header/UserMenu';

interface HeaderProps {
  onToggleSidebar: () => void;
  collapsed?: boolean;
}

function usePageTitle(): { section: string | null; page: string } {
  const { pathname } = useLocation();

  if (pathname === '/') return { section: null, page: 'Dashboard' };

  for (const section of menuSections) {
    for (const item of section.items) {
      if (pathname.startsWith(item.path) && item.path !== '/') {
        const sub = pathname.replace(item.path, '').replace(/^\//, '');
        if (sub.startsWith('show')) return { section: item.label, page: 'View' };
        if (sub.startsWith('edit')) return { section: item.label, page: 'Edit' };
        if (sub === 'create') return { section: item.label, page: 'Create' };
        return { section: section.title, page: item.label };
      }
    }
  }

  return { section: null, page: 'Page' };
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { section, page } = usePageTitle();

  return (
    <header className="h-14 border-b bg-background flex items-center px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="-ml-1 h-8 w-8">
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {section ? (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{section}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{page}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{page}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Notifications />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <UserMenu />
      </div>
    </header>
  );
}
