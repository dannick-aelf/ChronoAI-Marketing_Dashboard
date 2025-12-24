import Modal from 'react-modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  count?: number;
}

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, count = 1 }: DeleteConfirmModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      contentLabel={`Delete ${count > 1 ? `${count} Canvases` : 'Canvas'}`}
      className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-md w-full p-6 mx-4 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center"
      ariaHideApp={false}
    >
      <h3 className="text-xl font-primary font-bold text-text-primary mb-4">
        Delete {count > 1 ? `${count} Canvases` : 'Canvas'}
      </h3>
      
      {/* Divider */}
      <div className="border-b border-border mb-4 -mx-6" style={{ width: 'calc(100% + 3rem)' }}></div>
      
      <p className="text-text-secondary font-secondary mb-6">
        Are you sure you want to delete {count > 1 ? `these ${count} canvases` : 'this canvas'}? This action cannot be undone.
      </p>
      
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary hover:bg-grey-bg-4 transition-all duration-200 active:opacity-80"
          style={{
            minHeight: '44px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-white text-black font-secondary hover:bg-white-90 transition-all duration-200 active:opacity-80"
          style={{
            minHeight: '44px',
          }}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;

