import { useEffect } from "react";

import {
  X,
  Sparkles,
  LogOut,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function MobileMenu({
  open,
  onClose,
  items = [],
  isAuthenticated = false,
  onLogout,
}) {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  useEffect(() => {
    document.body.style.overflow =
      open ? "hidden" : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [open]);

  const handleSectionClick =
    (
      event,
      id,
    ) => {
      event.preventDefault();

      onClose();

      if (
        location.pathname ===
        "/"
      ) {
        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior:
              "smooth",
            block: "start",
          });

        return;
      }

      navigate(`/#${id}`);
    };

  const handleLogout =
    async () => {
      if (onLogout) {
        await onLogout();
      } else {
        onClose();
      }
    };

  return (
    <>
      {/* =====================================================
          BACKDROP
          ===================================================== */}

      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-all duration-300 ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      {/* =====================================================
          DRAWER
          ===================================================== */}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-80 max-w-[85vw] flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-transform duration-500 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="flex items-center justify-between border-b border-white/10 p-6">

          <Link
            to="/"
            onClick={onClose}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/30 transition-transform duration-300 group-hover:rotate-6">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <h2 className="font-bold tracking-wide text-white">
                SCINTILLACE
              </h2>

              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400">
                Technology & Culture
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Menu"
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            <X size={22} />
          </button>

        </div>

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-6">

          {items.map(
            (item) => {

              if (
                item.type ===
                "route"
              ) {
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={item.id}
                    onClick={onClose}
                    className="rounded-xl px-4 py-3 text-base font-medium text-slate-300 transition-all duration-300 hover:bg-cyan-500/10 hover:pl-5 hover:text-cyan-300"
                  >
                    {item.name}
                  </Link>
                );
              }

              return (
                <a
                  key={`${item.type || "section"}-${item.id}`}
                  href={`/#${item.id}`}
                  onClick={(
                    event,
                  ) =>
                    handleSectionClick(
                      event,
                      item.id,
                    )
                  }
                  className="rounded-xl px-4 py-3 text-base font-medium text-slate-300 transition-all duration-300 hover:bg-cyan-500/10 hover:pl-5 hover:text-cyan-300"
                >
                  {item.name}
                </a>
              );
            },
          )}

        </nav>

        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="border-t border-white/10 p-6">

          {!isAuthenticated ? (
            <div className="flex flex-col gap-3">

              {/* Login */}

              <Link
                to="/login"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-center font-medium text-slate-300 transition-all duration-300 hover:border-cyan-400 hover:bg-slate-800 hover:text-cyan-300"
              >
                Login
              </Link>

              {/* Register */}

              <Link
                to="/events"
                onClick={onClose}
                className="rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-400/50"
              >
                Register Now
                <span className="ml-1">
                  →
                </span>
              </Link>

            </div>
          ) : (
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-400/50"
            >
              <LogOut
                size={18}
              />

              Logout
            </button>
          )}

          <p className="mt-5 text-center text-xs text-slate-600">
            Scintillace • JNTUA College of Engineering Pulivendula (Autonomous)
          </p>

        </div>

      </aside>
    </>
  );
}