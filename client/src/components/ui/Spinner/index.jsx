import { cn } from '../common/cn';

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

function Spinner({ size = 'md', className }) {
  return <div className={cn('animate-spin rounded-full border-[color:var(--color-accent)]/30 border-t-[color:var(--color-accent)]', sizeClasses[size] || sizeClasses.md, className)} />;
}

export default Spinner;
