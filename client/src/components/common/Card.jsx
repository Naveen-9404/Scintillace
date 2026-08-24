import { forwardRef } from "react";
import { clsx } from "clsx";

const Card = forwardRef(
  (
    {
      children,
      className,
      hover = true,
      glow = true,
      padding = "md",
      ...props
    },
    ref
  ) => {
    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "relative overflow-hidden rounded-3xl",
          "border border-white/10",
          "bg-slate-900/60",
          "backdrop-blur-xl",
          "shadow-xl shadow-black/30",
          "transition-all duration-300",

          hover &&
            "hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-cyan-500/20",

          paddings[padding],

          className
        )}
        {...props}
      >
        {glow && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          >
            <div
              className="
                absolute
                -top-20
                -right-20
                h-48
                w-48
                rounded-full
                bg-cyan-500/10
                blur-3xl
              "
            />
          </div>
        )}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;