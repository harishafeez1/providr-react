import { Link, useLocation } from 'react-router-dom';
import { useGetIdentity, useLogout } from '@refinedev/core';
import {
  LayoutDashboard, Building2, Users, UserCircle, Layers, Package, ClipboardList,
  Star, AlertTriangle, Shield, ChevronsLeft, ChevronsRight, Settings, LogOut, User, ClipboardCheck,
  Lock, Upload, FileCheck, FileText, CreditCard, ShoppingBag, Brain, MessageSquare, KeyRound, Network, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import logoFull from '@/assets/logo.png';
import logoIcon from '@/assets/logo-icon.png';

export const APP_VERSION = '1.0.0';

export const menuSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Providers',
    items: [
      { label: 'Provider Companies', path: '/provider-companies', icon: Building2 },
      { label: 'Provider Users', path: '/users', icon: Users },
      { label: 'Company Imports', path: '/provider-company-imports', icon: Upload },
      { label: 'Claim Requests', path: '/claim-requests', icon: FileCheck },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Services', path: '/services', icon: Layers },
      { label: 'Service Offerings', path: '/service-offerings', icon: Package },
      { label: 'Service Requests', path: '/service-requests', icon: ClipboardList },
    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'Customers', path: '/customers', icon: UserCircle },
      { label: 'Reviews', path: '/reviews', icon: Star },
      { label: 'Customer Documents', path: '/customer-documents', icon: FileText },
    ],
  },
  {
    title: 'Stripe Management',
    items: [
      { label: 'Stripe Configurations', path: '/stripe-configurations', icon: CreditCard },
      { label: 'Stripe Products', path: '/stripe-products', icon: ShoppingBag },
    ],
  },
  {
    title: 'System Management',
    items: [
      { label: 'AI Models', path: '/ai-models', icon: Brain },
      { label: 'BSP Analysis Prompts', path: '/prompt-management', icon: MessageSquare },
      { label: 'NDIS Prompts', path: '/ndis-prompts', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Roles', path: '/roles', icon: KeyRound },
      { label: 'Permissions', path: '/permissions', icon: Lock },
      { label: 'Incident Types', path: '/incident-types', icon: AlertTriangle },
      { label: 'Admin Users', path: '/admins', icon: Shield },
      { label: 'Settings', path: '/settings', icon: Settings },
      { label: 'Project Tracker', path: '/project-tracker', icon: ClipboardCheck },
      { label: 'Pulse', path: '/pulse', icon: Activity },
      { label: 'Infrastructure', path: '/infrastructure', icon: Network },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavItem({ item, collapsed, active }: {
  item: { label: string; path: string; icon: React.ComponentType<{ className?: string }> };
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { data: identity } = useGetIdentity<{ name: string; email: string; roles: string[] }>();
  const { mutate: logout } = useLogout();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-background border-r flex flex-col z-30 transition-all duration-200',
          collapsed ? 'w-[52px]' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'h-14 flex items-center shrink-0 border-b',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}>
          <Link to="/" className="flex items-center gap-2 min-w-0">
            {collapsed ? (
              <img src={logoIcon} alt="Providr" className="h-7 w-7 shrink-0" />
            ) : (
              <img src={logoFull} alt="Providr" className="h-5 shrink-0" />
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={onToggle}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {menuSections.map((section, idx) => (
            <div key={section.title} className={cn(idx > 0 && 'mt-4')}>
              {!collapsed && (
                <div className="px-3 mb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {collapsed && idx > 0 && (
                <Separator className="mx-auto mb-2 w-6" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    collapsed={collapsed}
                    active={isActive(item.path)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse button when collapsed */}
        {collapsed && (
          <div className="px-2 pb-2">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggle}
                  className="w-full flex items-center justify-center rounded-md px-2 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* User section */}
        <div className={cn('border-t', collapsed ? 'p-2' : 'p-3')}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-3 w-full rounded-md transition-colors hover:bg-accent p-2 text-left',
                  collapsed && 'justify-center'
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {identity?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'SA'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{identity?.name || 'Super Admin'}</p>
                    <p className="text-xs text-muted-foreground truncate">{identity?.email || 'admin@providr.com'}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={collapsed ? 'right' : 'top'}
              align="start"
              sideOffset={8}
              className="w-56"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{identity?.name || 'Super Admin'}</p>
                  <p className="text-xs text-muted-foreground">{identity?.email || 'admin@providr.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Version */}
        {!collapsed && (
          <div className="px-4 pb-2 text-[10px] text-muted-foreground/50 text-center">
            v{APP_VERSION}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
