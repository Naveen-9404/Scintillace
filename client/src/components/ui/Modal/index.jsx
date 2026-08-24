import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { cn } from '../common/cn';

function Modal({ open, onClose, title, children, footer, className }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-overlay)] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={cn('w-full max-w-xl rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_30px_90px_rgba(6,8,22,0.45)]', className)}
            onClick={(event) => event.stopPropagation()}
          >
            {title ? <div className="mb-4 text-lg font-semibold text-[color:var(--color-text-primary)]">{title}</div> : null}
            <div>{children}</div>
            {footer ? <div className="mt-6 flex justify-end gap-3 border-t border-[color:var(--color-border)] pt-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Modal;
