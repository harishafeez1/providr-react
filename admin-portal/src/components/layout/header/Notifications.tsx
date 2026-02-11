import { BellIcon, ClockIcon, Check, Loader2 } from 'lucide-react';
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
import { useNotifications } from '@/hooks/useNotifications';
import type { AdminNotification } from '@/services/notification-service';

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
};

const TYPE_INITIALS: Record<string, string> = {
  provider_registered: 'PR',
  review_submitted: 'RV',
  claim_request: 'CR',
  incident_reported: 'IR',
  service_request: 'SR',
  service_down: 'SD',
};

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function Notifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllRead } =
    useNotifications();

  const handleClick = (item: AdminNotification) => {
    markAsRead(item.id);
    if (item.link) {
      window.location.href = item.link;
    }
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BellIcon className="mb-2 h-8 w-8 opacity-30" />
              <span className="text-sm">No notifications yet</span>
            </div>
          ) : (
            notifications.map((item) => {
              const initials = TYPE_INITIALS[item.type] ?? 'NT';

              return (
                <DropdownMenuItem
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-none border-b px-4 py-3 focus:bg-accent"
                  onClick={() => handleClick(item)}
                >
                  <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={`text-[10px] font-semibold ${TYPE_COLORS[item.severity] ?? TYPE_COLORS.info}`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <span className="truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                      <ClockIcon className="h-3 w-3" />
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                  {!item.is_read && (
                    <span className="mt-2 block h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
