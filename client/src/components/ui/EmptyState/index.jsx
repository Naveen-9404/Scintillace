import Button from '../Button';

function EmptyState({ title = 'Nothing here yet', description = 'This area is ready for future content.', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-8 py-12 text-center">
      <div className="mb-4 h-14 w-14 rounded-full bg-[color:var(--color-panel)]" />
      <h3 className="mb-2 text-lg font-semibold text-[color:var(--color-text-primary)]">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-[color:var(--color-text-secondary)]">{description}</p>
      {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}

export default EmptyState;
