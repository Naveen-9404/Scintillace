export default function PageContainer({
  children,
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </div>
    </div>
  );
}