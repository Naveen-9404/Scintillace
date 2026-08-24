import { useId } from 'react';
import { cn } from '../common/cn';

function Input({
  label,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  className,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-[color:var(--color-text-primary)]">
          {label}
        </label>
      ) : null}
      <div className={cn(
        'flex items-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 shadow-[0_8px_24px_rgba(6,8,22,0.25)] transition focus-within:border-[color:var(--color-accent)] focus-within:ring-2 focus-within:ring-[color:var(--color-accent)]/25',
        error && 'border-[#ef4444] focus-within:ring-[#ef4444]/25',
        disabled && 'cursor-not-allowed opacity-70',
        className,
      )}>
        {leftIcon ? <span className="text-[color:var(--color-text-secondary)]">{leftIcon}</span> : null}
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          className="w-full border-0 bg-transparent text-sm text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-tertiary)]"
          {...props}
        />
        {rightIcon ? <span className="text-[color:var(--color-text-secondary)]">{rightIcon}</span> : null}
      </div>
      {error ? <p className="mt-2 text-sm text-[#ef4444]">{error}</p> : null}
      {helperText && !error ? <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">{helperText}</p> : null}
    </div>
  );
}

export default Input;
