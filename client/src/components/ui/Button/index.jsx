import { motion } from 'framer-motion';
import { cn } from '../common/cn';


const variantClasses = {
  primary: 'bg-[color:var(--color-accent)] text-[color:var(--color-text-primary)] shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:bg-[#4f46e5]',
  secondary: 'bg-[color:var(--color-surface)] text-[color:var(--color-text-primary)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-panel)]',
  outline: 'border border-[color:var(--color-border-accent)] text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-accent)]/10',
  ghost: 'text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-surface)]',
  danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
  success: 'bg-[#22c55e] text-white hover:bg-[#16a34a]',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { y: -1, scale: 1.01 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/60 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" /> : leftIcon}
      <span>{children}</span>
      {rightIcon}
    </motion.button>
  );
}

export default Button;

