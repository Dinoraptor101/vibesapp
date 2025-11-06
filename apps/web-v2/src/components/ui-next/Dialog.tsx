import React, { useEffect } from 'react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, children, title }) => {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className="relative z-10 max-w-lg w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4">
          {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
