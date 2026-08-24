import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../common/cn';

const variantClasses = {
  success: 'border-[#22c55e]/25 bg-[#0f2f21] text-[#86efac]',
  warning: 'border-[#f59e0b]/25 bg-[#33250a] text-[#fcd34d]',
  error: 'border-[#ef4444]/25 bg-[#321318] text-[#fda4af]',
  info: 'border-[#38bdf8]/25 bg-[#0e2736] text-[#7dd3fc]',
};

function Alert({ children, variant = 'info', dismissible = false, onDismiss, className }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={cn('flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm', variantClasses[variant] || variantClasses.info, className)}
      >
        <div className="flex-1">{children}</div>
        {dismissible ? (
          <button type="button" onClick={onDismiss} className="text-current opacity-70 hover:opacity-100">
            ×
          </button>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

export default Alert;
