import { cn } from "../../utils";

const variants = {
  default: "border-border bg-surface text-muted-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  accent: "border-accent/30 bg-accent/10 text-accent",
};

export default function Badge({
  children,
  className,
  variant = "default",
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}