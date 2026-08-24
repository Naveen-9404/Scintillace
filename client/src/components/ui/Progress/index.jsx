import { cn } from '../common/cn';

function Progress({ value = 40, className }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-panel)]', className)}>
      <div className="h-full rounded-full bg-[color:var(--color-accent)] transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function CircularProgress({ value = 60, size = 72 }) {
  return (
    <div className="relative inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ width: size, height: size }}>
      <div className="text-sm font-semibold text-[color:var(--color-text-primary)]">{value}%</div>
    </div>
  );
}

export { CircularProgress };
export default Progress;
