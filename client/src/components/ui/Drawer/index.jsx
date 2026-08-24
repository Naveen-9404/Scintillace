import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../common/cn';

function Drawer({ open, onClose, side = 'right', children, className }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-[color:var(--color-overlay)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: side === 'left' ? -320 : 320 }}
            animate={{ x: 0 }}
            exit={{ x: side === 'left' ? -320 : 320 }}
            transition={{ duration: 0.2 }}
            className={cn('fixed top-0 h-full w-[320px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.35)]', side === 'left' ? 'left-0' : 'right-0', className)}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Drawer;
