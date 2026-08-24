import {
  Menu,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

export default function Header({
  onMenuClick,
  onRefresh,
  refreshing = false,
}) {
  const { user } =
    useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">

      <div className="flex h-20 items-center justify-between px-5 md:px-8">

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:border-violet-500 hover:text-white lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Administration
            </p>

            <h2 className="mt-1 text-lg font-bold text-white md:text-xl">
              Scintillace Control Center
            </h2>
          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh analytics"
            className="rounded-xl border border-white/10 p-2.5 text-slate-400 transition hover:border-violet-500 hover:text-white disabled:opacity-40"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">
              {user?.name ||
                user?.fullName ||
                "Administrator"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.role ||
                "ADMIN"}
            </p>
          </div>

          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white">
            {(
              user?.name ||
              user?.fullName ||
              "A"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

        </div>

      </div>

    </header>
  );
}