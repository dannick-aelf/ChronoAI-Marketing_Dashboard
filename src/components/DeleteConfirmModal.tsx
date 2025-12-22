interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-primary text-text-primary mb-2">
            Delete Canvas
          </h3>
          <p className="text-text-secondary font-secondary mb-6">
            Are you sure you want to delete this canvas? This action cannot be undone.
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary font-medium hover:bg-grey-bg-4 transition-all duration-200 active:opacity-80"
              style={{
                minHeight: '44px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-orange-primary text-white font-secondary font-medium hover:bg-orange-secondary transition-all duration-200 active:opacity-80"
              style={{
                minHeight: '44px',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;

