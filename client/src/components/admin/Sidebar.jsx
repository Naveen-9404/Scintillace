import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  ClipboardList,
  Award,
  BarChart3,
  X,
} from "lucide-react";

const menuItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: Megaphone,
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    id: "registrations",
    label: "Registrations",
    icon: ClipboardList,
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: Award,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  open = false,
  onClose,
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-72
          border-r
          border-white/10
          bg-slate-950
          transition-transform
          duration-300
          lg:static
          lg:z-auto
          lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">

            <div>
              <h1 className="text-xl font-black tracking-[0.15em] text-white">
                SCINTILLACE
              </h1>

              <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-violet-400">
                Admin Panel
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>

          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">

            {menuItems.map(
              ({
                id,
                label,
                icon: Icon,
              }) => {
                const active =
                  activeSection === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSectionChange(id);
                      onClose?.();
                    }}
                    className={`
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      transition
                      ${
                        active
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                    />

                    <span>
                      {label}
                    </span>
                  </button>
                );
              },
            )}

          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-5">

            <p className="text-xs leading-5 text-slate-600">
              Scintillace 2026
              <br />
              JNTUA College of Engineering,
              Pulivendula
            </p>

          </div>

        </div>
      </aside>
    </>
  );
}

