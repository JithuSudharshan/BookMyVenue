import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';

const ConfirmActionModal = ({ isOpen, onClose, onConfirm, title, message, actionText, isDestructive = true }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const footer = (
    <div className="flex w-full space-x-3">
      <button
        onClick={onClose}
        disabled={loading}
        className="flex-1 py-2 border border-line rounded-md text-sm font-bold text-muted hover:bg-panel transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleConfirm}
        disabled={loading}
        className={`flex-1 py-2 text-white rounded-md text-sm font-bold transition-colors disabled:opacity-70 ${isDestructive ? 'bg-admin-red hover:bg-admin-red-dark' : 'bg-admin-green hover:bg-[#15803d]'}`}
      >
        {loading ? 'Processing...' : actionText}
      </button>
    </div>
  );

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Confirm Action"
      footer={footer}
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center text-center pb-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-admin-red-soft text-admin-red' : 'bg-[#dcfce7] text-admin-green'}`}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
        <p className="text-sm text-muted">{message}</p>
      </div>
    </BaseModal>
  );
};

export default ConfirmActionModal;
