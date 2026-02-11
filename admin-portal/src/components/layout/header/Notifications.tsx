import { useState } from 'react';
import { BellIcon, ClockIcon, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
  initials: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'New provider registered',
    description: 'Outback Mobility Solutions submitted a registration.',
    time: '2 hours ago',
    read: false,
    type: 'info',
    initials: 'OM',
  },
  {
    id: 2,
    title: 'New review submitted',
    description: 'A 5-star review was left for CareConnect Services.',
    time: '4 hours ago',
    read: false,
    type: 'success',
    initials: 'CC',
  },
  {
    id: 3,
    title: 'Claim request pending',
    description: 'Provider claim request #47 awaiting approval.',
    time: '6 hours ago',
    read: false,
    type: 'warning',
    initials: 'CR',
  },
  {
    id: 4,
    title: 'Service request completed',
    description: 'Service request #312 marked as completed.',
    time: '1 day ago',
    read: true,
    type: 'success',
    initials: 'SR',
  },
  {
    id: 5,
    title: 'New incident reported',
    description: 'Incident type: Minor - reported by provider #23.',
    time: '1 day ago',
    read: true,
    type: 'warning',
    initials: 'IR',
  },
  {
    id: 6,
    title: 'Deployment complete',
    description: 'Laravel 11 + Pulse deployed to production successfully.',
    time: '2 days ago',
    read: true,
    type: 'info',
    initials: 'DC',
  },
];

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
};

export function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative h-8 w-8">
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllRead}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        <ScrollArea className="h-[350px]">
          {notifications.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex cursor-pointer items-start gap-3 rounded-none border-b px-4 py-3 focus:bg-accent"
            >
              <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                <AvatarFallback className={`text-[10px] font-semibold ${TYPE_COLORS[item.type]}`}>
                  {item.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <span className="truncate text-sm font-medium">{item.title}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                  <ClockIcon className="h-3 w-3" />
                  {item.time}
                </span>
              </div>
              {!item.read && (
                <span className="mt-2 block h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
