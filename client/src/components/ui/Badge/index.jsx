import { cn } from '../common/cn';

const variantClasses = {
  success: 'bg-[#0f2f21] text-[#22c55e] border border-[#22c55e]/25',
  warning: 'bg-[#33250a] text-[#f59e0b] border border-[#f59e0b]/25',
  error: 'bg-[#321318] text-[#ef4444] border border-[#ef4444]/25',
  info: 'bg-[#0e2736] text-[#38bdf8] border border-[#38bdf8]/25',
  neutral: 'bg-[color:var(--color-surface)] text-[color:var(--color-text-secondary)] border border-[color:var(--color-border)]',
};

function Badge({ children, variant = 'neutral', className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', variantClasses[variant] || variantClasses.neutral, className)}>
      {children}
    </span>
  );
}

export default Badge;
