import type React from 'react';
import { useEffect } from 'react';

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
      <button
        type="button"
        className="fixed inset-0 bg-black/40 border-none cursor-default"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <dialog
        open
        aria-modal="true"
        className="relative z-10 max-w-lg w-full mx-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4"
      >
        {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
        <div>{children}</div>
      </dialog>
    </div>
  );
};

export default Dialog;
