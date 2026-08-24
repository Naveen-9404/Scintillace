import { cn } from "../../utils";

export default function Section({
  className,
  children,
  ...props
}) {
  return (
    <section
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}