import { cn } from '../common/cn';

function RadioGroup({ label, options = [], value, onChange, name, className, ...props }) {
  return (
    <fieldset className={cn('w-full', className)} {...props}>
      {label ? <legend className="mb-3 text-sm font-medium text-[color:var(--color-text-primary)]">{label}</legend> : null}
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-text-primary)]">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="h-4 w-4 accent-[color:var(--color-accent)]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default RadioGroup;
