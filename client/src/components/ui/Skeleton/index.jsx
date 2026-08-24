function SkeletonCard() {
  return (
    <div className="rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
      <div className="mb-4 h-4 w-24 animate-pulse rounded-full bg-[color:var(--color-panel)]" />
      <div className="mb-2 h-4 w-full animate-pulse rounded-full bg-[color:var(--color-panel)]" />
      <div className="mb-2 h-4 w-5/6 animate-pulse rounded-full bg-[color:var(--color-panel)]" />
      <div className="h-4 w-2/3 animate-pulse rounded-full bg-[color:var(--color-panel)]" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <div className="mb-4 h-4 w-24 animate-pulse rounded-full bg-[color:var(--color-panel)]" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="mb-3 h-4 animate-pulse rounded-full bg-[color:var(--color-panel)]" />
      ))}
    </div>
  );
}

function SkeletonAvatar() {
  return <div className="h-12 w-12 animate-pulse rounded-full bg-[color:var(--color-panel)]" />;
}

function Skeleton({ variant = 'card', className }) {
  if (variant === 'table') return <SkeletonTable className={className} />;
  if (variant === 'avatar') return <SkeletonAvatar className={className} />;
  return <SkeletonCard className={className} />;
}

export { SkeletonAvatar, SkeletonCard, SkeletonTable };
export default Skeleton;
