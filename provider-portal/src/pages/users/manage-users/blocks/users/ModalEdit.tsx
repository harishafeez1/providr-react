import React, { forwardRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface IModalDeleteProps {
  open: boolean;
  defaultCheckBoxes?: any;
  onOpenChange: () => void;
  onSaveConfirm: (rolesObject: Record<string, number>) => void;
}

const ModalEdit = forwardRef<HTMLDivElement, IModalDeleteProps>(
  ({ open, onOpenChange, onSaveConfirm, defaultCheckBoxes }, ref) => {
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
      if (defaultCheckBoxes) {
        const initialSelected = value.filter((role) => defaultCheckBoxes[role] === 1);
        setSelected(initialSelected);
      }
    }, [defaultCheckBoxes]);

    const options = ['Admin', 'Editor', 'Reviews', 'Billing', 'Intake'];
    const value = [
      'admin',
      'permission_editor',
      'permission_review',
      'permission_billing',
      'permission_intake'
    ];

    const handleCheckboxChange = (index: number) => {
      const selectedValue = value[index];

      setSelected((prevSelected) => {
        if (selectedValue === 'admin') {
          // If "Admin" is selected, uncheck all others and select only "Admin"
          return ['admin'];
        } else if (prevSelected.includes('admin')) {
          // If "Admin" is already selected and another checkbox is selected, uncheck "Admin"
          return [selectedValue];
        } else {
          if (prevSelected.includes(selectedValue)) {
            return prevSelected.filter((val) => val !== selectedValue);
          } else {
            return [...prevSelected, selectedValue];
          }
        }
      });
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-[500px] max-h-[95%] scrollable-y-auto" ref={ref}>
          <DialogHeader className="justify-between border-0 pt-5">
            <DialogTitle>Select Roles</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DialogBody className="py-0 overflow-y-auto  max-h-[50vh]">
            <div className="flex items-baseline flex-wrap gap-2.5 py-4">
              <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                <div className="grid grid-cols-2 gap-4">
                  {options.map((option, index) => (
                    <label
                      key={index}
                      className="checkbox-group flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        className="checkbox"
                        name="attributes"
                        type="checkbox"
                        value={option}
                        onChange={() => handleCheckboxChange(index)}
                        checked={selected.includes(value[index])}
                      />
                      <span className="checkbox-label">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <div className="flex justify-end gap-2">
                <button className="btn btn-secondary" onClick={onOpenChange}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={(event) => {
                    event.preventDefault();
                    const rolesObject = value.reduce(
                      (acc, val) => {
                        acc[val] = selected.includes(val) ? 1 : 0;
                        return acc;
                      },
                      {} as Record<string, number>
                    );
                    onSaveConfirm(rolesObject);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

export { ModalEdit };
