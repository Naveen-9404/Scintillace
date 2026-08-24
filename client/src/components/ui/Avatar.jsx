import { cn } from "../../utils";

export default function Avatar({
  name = "User",
  src,
  className,
}) {
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn("size-9 rounded-full object-cover", className)}
    />
  ) : (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white",
        className
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}