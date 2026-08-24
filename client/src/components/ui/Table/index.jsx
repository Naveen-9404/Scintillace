import { cn } from '../common/cn';

function Table({ columns = [], rows = [], loading = false, empty = false, className }) {
  if (loading) {
    return <div className="rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-sm text-[color:var(--color-text-secondary)]">Loading table…</div>;
  }

  if (empty) {
    return <div className="rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-sm text-[color:var(--color-text-secondary)]">No rows available.</div>;
  }

  return (
    <div className={cn('overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]', className)}>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[color:var(--color-panel)] text-[color:var(--color-text-secondary)]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-t border-[color:var(--color-border)]">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-[color:var(--color-text-primary)]">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
