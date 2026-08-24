import { motion } from 'framer-motion';
import { cn } from '../common/cn';

const variantClasses = {
  default: 'border border-[color:var(--color-border)] bg-[color:var(--color-surface)]',
  glass: 'border border-white/10 bg-white/5 backdrop-blur-xl',
  elevated: 'border border-[color:var(--color-border)] bg-[color:var(--color-elevated)] shadow-[0_24px_60px_rgba(6,8,22,0.25)]',
  outlined: 'border border-[color:var(--color-border-accent)] bg-transparent',
  interactive: 'border border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:-translate-y-1 hover:border-[color:var(--color-accent)]',
};

function Card({ children, variant = 'default', className, header, footer, interactive = false, ...props }) {
  const Component = interactive ? motion.article : 'article';

  return (
    <Component
      whileHover={interactive ? { y: -2, scale: 1.01 } : undefined}
      className={cn('rounded-[20px] p-6', variantClasses[variant] || variantClasses.default, className)}
      {...props}
    >
      {header ? <div className="mb-4">{header}</div> : null}
      <div>{children}</div>
      {footer ? <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">{footer}</div> : null}
    </Component>
  );
}

export default Card;
