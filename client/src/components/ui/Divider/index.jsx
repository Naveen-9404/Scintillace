import { cn } from '../common/cn';

function Divider({ vertical = false, className }) {
  return <div className={cn(vertical ? 'h-full w-px bg-[color:var(--color-border)]' : 'h-px w-full bg-[color:var(--color-border)]', className)} />;
}

export default Divider;
