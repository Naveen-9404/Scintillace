import {
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  UserRound,
  Pencil,
} from "lucide-react";

import { motion } from "framer-motion";

import useAuth from "../../hooks/useAuth";

const formatRole = (role) => {
  if (!role) {
    return "Student";
  }

  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
};

export default function ProfileCard({
  onEdit,
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <section className="animate-pulse rounded-3xl border border-border bg-card/70 p-8 shadow-card backdrop-blur-xl">
        <div className="flex flex-col items-center">
          <div className="h-32 w-32 rounded-full bg-muted" />

          <div className="mt-6 h-7 w-48 rounded-lg bg-muted" />

          <div className="mt-3 h-4 w-24 rounded bg-muted" />

          <div className="mt-4 h-4 w-56 rounded bg-muted" />

          <div className="mt-6 flex gap-2">
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-32 rounded-full bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  const name =
    user?.fullName ||
    "Student";

  const email =
    user?.email ||
    "Not available";

  const phone =
    user?.phone ||
    "Not available";

  const role =
    formatRole(
      user?.role,
    );

  const avatarUrl =
    user?.avatarUrl ||
    "";

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase(),
      )
      .join("");

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
        p-8
        shadow-card
        backdrop-blur-xl
      "
    >
      {/* Background decoration */}

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />

      <div className="relative flex flex-col items-center text-center">

        {/* Avatar */}

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${name} profile`}
            className="
              h-32
              w-32
              rounded-full
              object-cover
              ring-4
              ring-primary/20
              shadow-glow
            "
          />
        ) : (
          <div
            className="
              flex
              h-32
              w-32
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-primary
              via-sky-500
              to-accent
              text-5xl
              font-black
              text-primary-foreground
              shadow-glow
            "
          >
            {initials || (
              <UserRound size={48} />
            )}
          </div>
        )}

        {/* Name */}

        <h2 className="mt-6 text-2xl font-bold text-foreground">
          {name}
        </h2>

        {/* Role */}

        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {role}
        </p>

        {/* Email */}

        <p className="mt-3 max-w-full break-all text-sm text-muted-foreground">
          {email}
        </p>

        {/* Status */}

        <div className="mt-6 flex flex-wrap justify-center gap-2">

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-3
              py-1.5
              text-xs
              font-semibold
              text-emerald-400
            "
          >
            <CheckCircle2 size={14} />

            {user?.isActive
              ? "Active"
              : "Inactive"}
          </span>

          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              px-3
              py-1.5
              text-xs
              font-semibold
              ${
                user?.isEmailVerified
                  ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }
            `}
          >
            <ShieldCheck size={14} />

            {user?.isEmailVerified
              ? "Email Verified"
              : "Verification Pending"}
          </span>

        </div>

        {/* Divider */}

        <div className="mt-8 h-px w-full bg-border" />

        {/* Contact information */}

        <div className="mt-6 w-full space-y-4 text-left">

          <div className="flex items-center gap-3">
            <Mail
              size={17}
              className="shrink-0 text-primary"
            />

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Email
              </p>

              <p className="break-all text-sm font-semibold text-foreground">
                {email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone
              size={17}
              className="shrink-0 text-primary"
            />

            <div>
              <p className="text-xs text-muted-foreground">
                Phone
              </p>

              <p className="text-sm font-semibold text-foreground">
                {phone}
              </p>
            </div>
          </div>

        </div>

        {/* Edit button */}

        <button
          type="button"
          onClick={onEdit}
          className="
            mt-8
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-5
            py-3
            font-semibold
            text-primary-foreground
            shadow-glow
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:brightness-110
            active:scale-[0.98]
          "
        >
          <Pencil size={17} />

          Edit Profile
        </button>

      </div>
    </motion.section>
  );
}