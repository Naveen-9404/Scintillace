import { forwardRef } from "react";
import { cn } from "../../utils";

const Input = forwardRef(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-slate-50 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;