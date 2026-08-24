import { cn } from "../../utils";

const Table = ({
  columns = [],
  children,
  className = "",
  tableClassName = "",
}) => {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-zinc-800",
        className
      )}
    >
      <table className={cn("w-full text-left text-sm", tableClassName)}>
        {columns.length > 0 && (
          <thead className="bg-zinc-900 text-slate-400">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 font-medium whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody className="divide-y divide-zinc-800">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;