import type React from 'react';

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  isDanger?: boolean;
};

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Xác nhận xóa dự án',
  message = 'Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.',
  confirmText = 'Xác nhận',
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors border-0 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors border-0 cursor-pointer shadow-sm ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1D4ED8] hover:bg-[#153bb5]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
