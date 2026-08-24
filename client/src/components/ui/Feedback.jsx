import { LoaderCircle, SearchX } from "lucide-react";
import { cn } from "../../utils";

export function Spinner({ className = "size-5" }) {
  return (
    <LoaderCircle
      className={cn(
        "animate-spin text-violet-400",
        className
      )}
      aria-label="Loading"
    />
  );
}

export function Loader() {
  return (
    <div className="grid min-h-48 place-items-center">
      <Spinner className="size-8" />
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-800",
        className
      )}
    />
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description = "Content will appear here when it becomes available.",
  action,
}) {
  return (
    <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-zinc-700 p-8 text-center">
      <SearchX className="mb-3 size-8 text-slate-500" />

      <div>
        <h3 className="font-medium text-slate-100">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>

        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}