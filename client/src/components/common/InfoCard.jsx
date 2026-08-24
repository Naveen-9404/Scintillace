export default function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
        transition
        hover:border-violet-500
        hover:-translate-y-1
      "
    >
      <div className="text-3xl text-violet-400">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-zinc-400">
        {value}
      </p>
    </div>
  );
}