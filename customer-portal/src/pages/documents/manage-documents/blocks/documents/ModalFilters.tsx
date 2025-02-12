import React, { forwardRef, useEffect, useState } from 'react';
import { useViewport } from '@/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
interface IModalSearchProps {
  open: boolean;
  onOpenChange: () => void;
}

const ModalFilters = forwardRef<HTMLDivElement, IModalSearchProps>(
  ({ open, onOpenChange }, ref) => {
    const [scrollableHeight, setScrollableHeight] = useState<number>(0);
    const [viewportHeight] = useViewport();
    const offset = 300;

    useEffect(() => {
      setScrollableHeight(viewportHeight - offset);
    }, [viewportHeight]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[300px] top-[5%] lg:top-[15%] translate-y-0 [&>button]:top-8 [&>button]:end-7"
          ref={ref}
        >
          <DialogHeader className="py-4">
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DialogBody className="p-5 lg:p-7.5" style={{ maxHeight: `${scrollableHeight}px` }}>
            <div className="grid gap-5 lg:gap-7.5 xl:w-[68.75rem] mx-auto">
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Status</label>
                <Select defaultValue="active">
                  <SelectTrigger className="w-28" size="sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="w-32">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Time</label>
                <Select defaultValue="latest">
                  <SelectTrigger className="w-28" size="sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="w-32">
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="older">Older</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-28" size="sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="w-32">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Successfull">Successfull</SelectItem>
                    <SelectItem value="Unsuccessfull">Unsuccessfull</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }
);

export { ModalFilters };
