import { AlertTriangle } from 'lucide-react';
import { memo } from 'react';
import Button from './Button';
import Modal from './Modal';

const ConfirmDeleteModal = memo(function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Confirm Deletion',
  itemName = 'this record',
  description,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-slate-900">
            Are you sure you want to delete {itemName}?
          </p>
          <p className="text-xs text-slate-500">
            {description ||
              'This action permanently removes the record from the database and cannot be undone.'}
          </p>
        </div>
      </div>
    </Modal>
  );
});

export default ConfirmDeleteModal;
