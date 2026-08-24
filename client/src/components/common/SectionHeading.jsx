import { clsx } from "clsx";

export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  className = "",
}) {
  return (
    <div
      className={clsx(
        "mb-16",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className
      )}
    >
      {badge && (
        <div className="mb-5 inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 backdrop-blur-xl">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            {badge}
          </span>
        </div>
      )}

      <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
        {title}
      </h2>

      {subtitle && (
        <p
          className={clsx(
            "mt-6 max-w-3xl text-lg leading-8 text-slate-400",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}