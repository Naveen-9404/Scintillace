import { cn } from "../../utils";

export default function Card({
  className,
  children,
  ...props
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}