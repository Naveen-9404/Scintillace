import { motion } from 'framer-motion';
import { cn } from '../common/cn';

function Switch({ checked = false, onChange, disabled = false, label, className }) {
  return (
    <label className={cn('flex items-center gap-3', disabled && 'cursor-not-allowed opacity-70', className)}>
      <span className="text-sm text-[color:var(--color-text-primary)]">{label}</span>
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative h-6 w-11 rounded-full border border-[color:var(--color-border)] transition-colors',
          checked ? 'bg-[color:var(--color-accent)]' : 'bg-[color:var(--color-surface)]',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"
          animate={{ x: checked ? 20 : 0 }}
        />
      </motion.button>
    </label>
  );
}

export default Switch;
