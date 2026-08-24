import { forwardRef } from "react";
import { cn } from "../../utils";

const Checkbox = forwardRef(function Checkbox(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "size-4 rounded border-zinc-600 bg-zinc-900 text-violet-600 accent-violet-600",
        className
      )}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;