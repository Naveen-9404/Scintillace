import { cn } from '../common/cn';

function Avatar({ name = 'User', size = 'md', src, className }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={cn('flex items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] text-[color:var(--color-text-primary)]', sizeClasses[size] || sizeClasses.md, className)}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span className="font-medium">{initials}</span>}
    </div>
  );
}

export default Avatar;
