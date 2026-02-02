import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l shadow-lg flex flex-col animate-in slide-in-from-right duration-200">
        {children}
      </div>
    </>
  );
}

export function SheetHeader({ className, children, onClose }: { className?: string; children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className={cn('flex items-center justify-between p-4 border-b', className)}>
      <div>{children}</div>
      {onClose && (
        <button onClick={onClose} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SheetContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex-1 overflow-y-auto p-4', className)}>{children}</div>;
}
