import React from 'react';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from './drawer';
import { X } from 'lucide-react';

interface BottomSheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const BottomSheetDialog: React.FC<BottomSheetDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          'h-[90vh] rounded-[32px] px-6 [&>[data-vaul-drawer-handle]]:hidden',
          className
        )}
      >
        {/* Cross button to close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <DrawerHeader className="px-6 pb-4 flex-shrink-0 text-center">
          {title ? (
            <DrawerTitle className="text-xl font-semibold">{title}</DrawerTitle>
          ) : (
            // Hidden title for accessibility when no title is provided
            <DrawerTitle className="sr-only">Modal Dialog</DrawerTitle>
          )}
          {description && (
            <DrawerDescription className="text-gray-600 mt-2">{description}</DrawerDescription>
          )}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export { BottomSheetDialog };
