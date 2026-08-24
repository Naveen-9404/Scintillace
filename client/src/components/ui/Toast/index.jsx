import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../common/cn';

const variantClasses = {
  success: 'border-[#22c55e]/25 bg-[#0f2f21] text-[#86efac]',
  error: 'border-[#ef4444]/25 bg-[#321318] text-[#fda4af]',
  info: 'border-[#38bdf8]/25 bg-[#0e2736] text-[#7dd3fc]',
  warning: 'border-[#f59e0b]/25 bg-[#33250a] text-[#fcd34d]',
};

function Toast({ children, variant = 'info', open = true }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className={cn('max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-[0_20px_56px_rgba(6,8,22,0.35)]', variantClasses[variant] || variantClasses.info)}>
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Toast;
