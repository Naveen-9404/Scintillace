import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../common/cn';

function Checkbox({ label, checked = false, onChange, disabled = false, className, id, ...props }) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <label htmlFor={checkboxId} className={cn('flex items-center gap-3', disabled && 'cursor-not-allowed opacity-70', className)}>
      <motion.input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        className="h-4 w-4 rounded border-[color:var(--color-border)] accent-[color:var(--color-accent)]"
        {...props}
      />
      {label ? <span className="text-sm text-[color:var(--color-text-primary)]">{label}</span> : null}
    </label>
  );
}

export default Checkbox;
