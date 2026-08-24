import { useId } from 'react';
import { cn } from '../common/cn';

function Select({ label, error, helperText, options = [], placeholder, disabled = false, className, id, ...props }) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-[color:var(--color-text-primary)]">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        disabled={disabled}
        className={cn(
          'w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-text-primary)] shadow-[0_8px_24px_rgba(6,8,22,0.25)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/25',
          error && 'border-[#ef4444] focus:ring-[#ef4444]/25',
          disabled && 'cursor-not-allowed opacity-70',
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm text-[#ef4444]">{error}</p> : helperText ? <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">{helperText}</p> : null}
    </div>
  );
}

export default Select;
