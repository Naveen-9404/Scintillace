import { useId } from 'react';
import { cn } from '../common/cn';

function Textarea({
  label,
  error,
  helperText,
  maxLength,
  value,
  onChange,
  disabled = false,
  className,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const length = value?.length ?? 0;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-[color:var(--color-text-primary)]">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        disabled={disabled}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className={cn(
          'min-h-[120px] w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-text-primary)] shadow-[0_8px_24px_rgba(6,8,22,0.25)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/25',
          error && 'border-[#ef4444] focus:ring-[#ef4444]/25',
          disabled && 'cursor-not-allowed opacity-70',
          className,
        )}
        {...props}
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        {error ? <p className="text-[#ef4444]">{error}</p> : helperText ? <p className="text-[color:var(--color-text-secondary)]">{helperText}</p> : <span />}
        {maxLength ? <span className="text-[color:var(--color-text-tertiary)]">{length}/{maxLength}</span> : null}
      </div>
    </div>
  );
}

export default Textarea;
