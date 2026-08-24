import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  ArrowRight,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

import useAuth from "../../hooks/useAuth";

export default function ProfileSummary() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur-xl md:p-8">
        <div className="flex animate-pulse items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-muted" />

          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-7 w-48 rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  const name =
    user?.fullName || "Student";

  const email =
    user?.email ||
    "Email not available";

  const phone =
    user?.phone || "";

  const role =
    user?.role || "STUDENT";

  const avatarUrl =
    user?.avatarUrl || "";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase(),
    )
    .join("");

  const formattedRole = role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/70
        p-6
        shadow-card
        backdrop-blur-xl
        md:p-8
      "
    >
      {/* Decorative glow */}

      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

        {/* =================================================
            User Information
        ================================================== */}

        <div className="flex items-center gap-5">

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name} profile`}
              className="
                h-16
                w-16
                shrink-0
                rounded-2xl
                object-cover
                ring-2
                ring-primary/20
                shadow-card
              "
            />
          ) : (
            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-primary
                via-sky-500
                to-accent
                text-xl
                font-black
                text-primary-foreground
                shadow-glow
              "
            >
              {initials || (
                <UserRound size={28} />
              )}
            </div>
          )}

          <div className="min-w-0">

            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Welcome back
            </p>

            <h1 className="mt-1 truncate text-2xl font-black text-foreground md:text-3xl">
              {name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">

              <span className="flex min-w-0 items-center gap-2">
                <Mail
                  size={16}
                  className="shrink-0 text-primary"
                />

                <span className="break-all">
                  {email}
                </span>
              </span>

              {phone && (
                <span className="flex items-center gap-2">
                  <Phone
                    size={16}
                    className="shrink-0 text-primary"
                  />

                  {phone}
                </span>
              )}

            </div>

            <div className="mt-3 flex items-center gap-2">

              <ShieldCheck
                size={15}
                className={
                  user?.isEmailVerified
                    ? "text-emerald-400"
                    : "text-amber-400"
                }
              />

              <span
                className={`
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  ${
                    user?.isEmailVerified
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                `}
              >
                {formattedRole}
              </span>

              <span className="text-muted-foreground">
                •
              </span>

              <span
                className={`
                  text-xs
                  font-semibold
                  ${
                    user?.isActive
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                `}
              >
                {user?.isActive
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>
          </div>
        </div>

        {/* =================================================
            Profile Button
        ================================================== */}

        <Link
          to="/profile"
          className="
            group
            inline-flex
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-border
            bg-background/60
            px-5
            py-3
            text-sm
            font-semibold
            text-foreground
            backdrop-blur-xl
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:border-primary/40
            hover:bg-primary/10
            hover:text-primary
          "
        >
          View Profile

          <ArrowRight
            size={17}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>

      </div>
    </motion.section>
  );
}