import { forwardRef } from "react";
import clsx from "clsx";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-card hover:shadow-glow hover:brightness-110",

  secondary:
    "bg-secondary text-secondary-foreground hover:brightness-110",

  outline:
    "border border-border bg-transparent hover:bg-white/5",

  ghost:
    "bg-transparent hover:bg-white/5",

  link:
    "h-auto bg-transparent p-0 underline-offset-4 hover:underline",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6",
  lg: "h-12 px-8 text-base",
  xl: "h-14 px-10 text-lg",
  icon: "h-11 w-11",
};

const Button = forwardRef(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading}
        className={clsx(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-sans font-medium transition-colors transition-transform duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}

        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;