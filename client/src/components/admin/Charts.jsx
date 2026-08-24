function Distribution({
  title,
  items = [],
  labelKey,
}) {
  const max =
    Math.max(
      ...items.map(
        (item) =>
          Number(item.count) || 0,
      ),
      1,
    );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>

      <div className="mt-6 space-y-4">

        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            No data available.
          </p>
        ) : (
          items.slice(0, 8).map(
            (item, index) => {
              const value =
                Number(
                  item.count,
                ) || 0;

              const percentage =
                Math.round(
                  (value / max) *
                    100,
                );

              return (
                <div
                  key={`${item[labelKey] || "item"}-${index}`}
                >
                  <div className="mb-2 flex items-center justify-between text-xs">

                    <span className="font-medium text-slate-300">
                      {item[labelKey] ||
                        "Unknown"}
                    </span>

                    <span className="font-bold text-white">
                      {value.toLocaleString(
                        "en-IN",
                      )}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            },
          )
        )}

      </div>
    </section>
  );
}

export default function Charts({
  analytics = {},
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">

      <Distribution
        title="Users by Role"
        items={analytics.users || []}
        labelKey="role"
      />

      <Distribution
        title="Events by Status"
        items={
          analytics.events
            ?.byStatus || []
        }
        labelKey="status"
      />

      <Distribution
        title="Registrations by Status"
        items={
          analytics.registrations
            ?.byStatus || []
        }
        labelKey="status"
      />

      <Distribution
        title="Tickets by Status"
        items={
          analytics.tickets
            ?.byStatus || []
        }
        labelKey="status"
      />

      <Distribution
        title="Payments by Status"
        items={
          analytics.payments
            ?.byStatus || []
        }
        labelKey="status"
      />

      <Distribution
        title="Accommodation by Room Type"
        items={
          analytics.accommodation
            ?.byRoomType || []
        }
        labelKey="roomType"
      />

    </div>
  );
}