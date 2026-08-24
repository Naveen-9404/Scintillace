import { forwardRef } from "react";
import { cn } from "../../utils";

const Textarea = forwardRef(function Textarea(
  { className = "", rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "min-h-28 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-slate-50 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;