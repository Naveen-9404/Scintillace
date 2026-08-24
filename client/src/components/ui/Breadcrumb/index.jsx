import { cn } from '../common/cn';

function Breadcrumb({ items = [], className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex flex-wrap items-center gap-2 text-sm', className)}>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 ? <span className="text-[color:var(--color-text-tertiary)]">/</span> : null}
          <a href={item.href || '#'} className={cn('text-[color:var(--color-text-secondary)]', index === items.length - 1 && 'text-[color:var(--color-text-primary)]')}>
            {item.label}
          </a>
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumb;
