import {
  CalendarCheck2,
  Award,
  CalendarDays,
  Bell,
} from "lucide-react";

const Statistics = ({
  registrations = [],
  certificates = [],
  upcomingEvents = [],
  announcements = [],
  loading = false,
}) => {
  const stats = [
    {
      title: "Registered Events",
      value: registrations.length,
      icon: CalendarCheck2,
      description: "Events you registered for",
      iconClass:
        "border-cyan-400/20 bg-cyan-400/10 text-cyan-400",
      glowClass: "bg-cyan-500/10",
    },
    {
      title: "Certificates",
      value: certificates.length,
      icon: Award,
      description: "Certificates earned",
      iconClass:
        "border-amber-400/20 bg-amber-400/10 text-amber-400",
      glowClass: "bg-amber-500/10",
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents.length,
      icon: CalendarDays,
      description: "Events coming up",
      iconClass:
        "border-violet-400/20 bg-violet-400/10 text-violet-400",
      glowClass: "bg-violet-500/10",
    },
    {
      title: "Announcements",
      value: announcements.length,
      icon: Bell,
      description: "Published announcements",
      iconClass:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
      glowClass: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card/70
              p-6
              shadow-card
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-primary/30
              hover:bg-card
              hover:shadow-glow
            "
          >
            {/* Background Glow */}

            <div
              className={`
                absolute
                -right-10
                -top-10
                h-28
                w-28
                rounded-full
                blur-3xl
                transition-transform
                duration-500
                group-hover:scale-125
                ${stat.glowClass}
              `}
            />

            <div className="relative">

              {/* Icon */}

              <div
                className={`
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition-transform
                  duration-300
                  group-hover:scale-110
                  ${stat.iconClass}
                `}
              >
                <Icon size={22} />
              </div>

              {/* Title */}

              <p className="mt-5 text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>

              {/* Value */}

              <div className="mt-2 flex items-end gap-2">
                <h3 className="text-4xl font-black text-foreground">
                  {loading ? "—" : stat.value}
                </h3>
              </div>

              {/* Description */}

              <p className="mt-2 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>

            {/* Bottom Accent */}

            <div
              className="
                absolute
                bottom-0
                left-0
                h-[2px]
                w-0
                bg-gradient-to-r
                from-primary
                to-accent
                transition-all
                duration-300
                group-hover:w-full
              "
            />
          </div>
        );
      })}
    </div>
  );
};

export default Statistics;