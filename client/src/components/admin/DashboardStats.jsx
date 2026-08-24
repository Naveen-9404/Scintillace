import {
  Users,
  Landmark,
  CalendarDays,
  ClipboardList,
  Ticket,
  CreditCard,
  Hotel,
} from "lucide-react";

const cards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
  },
  {
    key: "totalFestivals",
    label: "Festivals",
    icon: Landmark,
  },
  {
    key: "totalEvents",
    label: "Events",
    icon: CalendarDays,
  },
  {
    key: "totalRegistrations",
    label: "Registrations",
    icon: ClipboardList,
  },
  {
    key: "totalTickets",
    label: "Tickets",
    icon: Ticket,
  },
  {
    key: "totalPayments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    key: "totalAccommodationBookings",
    label: "Accommodation",
    icon: Hotel,
  },
];

export default function DashboardStats({
  dashboard = {},
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {cards.map(
        ({
          key,
          label,
          icon: Icon,
        }) => (
          <div
            key={key}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-violet-500/40"
          >
            <div className="flex items-center justify-between">

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
                <Icon size={21} />
              </div>

              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Live
              </span>

            </div>

            <p className="mt-5 text-3xl font-black text-white">
              {Number(
                dashboard[key] || 0,
              ).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {label}
            </p>
          </div>
        ),
      )}

    </div>
  );
}