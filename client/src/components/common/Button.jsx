import { forwardRef } from "react";
import { clsx } from "clsx";

const variants = {
  primary:
    "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/60 hover:-translate-y-1",

  secondary:
    "border border-white/10 bg-slate-900/60 text-white backdrop-blur-xl hover:border-cyan-400 hover:bg-slate-800",

  outline:
    "border border-cyan-500/30 bg-transparent text-cyan-300 hover:bg-cyan-500/10",

  ghost:
    "text-slate-300 hover:text-cyan-400 hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-xl",
          "font-semibold transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/40",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;