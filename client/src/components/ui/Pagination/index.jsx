import { cn } from '../common/cn';

function Pagination({ currentPage = 1, totalPages = 5, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      <button type="button" onClick={() => onPageChange?.(Math.max(1, currentPage - 1))} className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text-secondary)]">
        Prev
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange?.(page)}
          className={cn(
            'rounded-full px-3 py-2 text-sm',
            page === currentPage ? 'bg-[color:var(--color-accent)] text-white' : 'border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-secondary)]',
          )}
        >
          {page}
        </button>
      ))}
      <button type="button" onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))} className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text-secondary)]">
        Next
      </button>
    </nav>
  );
}

export default Pagination;
