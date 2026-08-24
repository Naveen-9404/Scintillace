import { motion } from 'framer-motion';
import { cn } from '../common/cn';

function Chip({ children, onDismiss, interactive = false, className }) {
  return (
    <motion.span
      whileHover={interactive ? { y: -1, scale: 1.01 } : undefined}
      className={cn('inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm text-[color:var(--color-text-primary)]', interactive && 'cursor-pointer', className)}
    >
      <span>{children}</span>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]">
          ×
        </button>
      ) : null}
    </motion.span>
  );
}

export default Chip;
