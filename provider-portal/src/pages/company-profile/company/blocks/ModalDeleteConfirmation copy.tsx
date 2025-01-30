import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { KeenIcon } from '@/components';

interface IModalDeleteConfirmationProps {
  open: boolean;
  onOpenChange: () => void;
  onDeleteConfirm: () => void;
}

const ModalDeleteConfirmation = ({
  open,
  onOpenChange,
  onDeleteConfirm
}: IModalDeleteConfirmationProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[500px] max-h-[95%] scrollable-y-auto">
        <DialogHeader className="justify-end border-0 pt-5">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center pt-0 pb-10">
          <div className="mb-9">
            <KeenIcon icon="question-2" className="text-[10vh] text-danger menu-item-show:hidden" />
          </div>

          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
            Delete Confirmation
          </h3>

          <div className="text-2sm text-center text-gray-700 mb-7">
            Are you sure you want to delete this item? <br />
          </div>

          <button className="btn btn-danger flex justify-center" onClick={onDeleteConfirm}>
            Delete
          </button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalDeleteConfirmation };
