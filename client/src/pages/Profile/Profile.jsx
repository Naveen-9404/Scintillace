import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

import {
  getMyRegistrations,
} from "../../api/dashboard.api";

import {
  ProfileCard,
  EditProfileForm,
} from "../../components/profile";


/**
 * ============================================================
 * Format Date
 * ============================================================
 */

const formatDate = (
  value,
) => {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not available";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};


/**
 * ============================================================
 * Format Date + Time
 * ============================================================
 */

const formatDateTime = (
  value,
) => {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not available";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};


/**
 * ============================================================
 * Format Role
 * ============================================================
 */

const formatRole = (
  role,
) => {
  if (!role) {
    return "Student";
  }

  return role
    .toLowerCase()
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    );
};


/**
 * ============================================================
 * Registration / Payment Status Classes
 * ============================================================
 */

const getStatusClasses = (
  status,
) => {
  const normalized =
    String(status || "")
      .toUpperCase();

  if (
    normalized === "CONFIRMED" ||
    normalized === "APPROVED" ||
    normalized === "COMPLETED" ||
    normalized === "SUCCESS"
  ) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "REJECTED" ||
    normalized === "FAILED"
  ) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  if (
    normalized === "PAID"
  ) {
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
};


/**
 * ============================================================
 * Profile Page
 * ============================================================
 */

export default function Profile() {
  const {
    user,
    loading: authLoading,
    refreshSession,
  } = useAuth();


  /**
   * ==========================================================
   * Edit State
   * ==========================================================
   */

  const [
    editing,
    setEditing,
  ] = useState(false);


  /**
   * ==========================================================
   * Registration State
   * ==========================================================
   */

  const [
    registrations,
    setRegistrations,
  ] = useState([]);

  const [
    registrationsLoading,
    setRegistrationsLoading,
  ] = useState(true);

  const [
    registrationsError,
    setRegistrationsError,
  ] = useState("");


  /**
   * ==========================================================
   * Load Registrations
   * ==========================================================
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadRegistrations =
      async () => {
        try {
          setRegistrationsLoading(
            true,
          );

          setRegistrationsError(
            "",
          );

          const data =
            await getMyRegistrations();

          setRegistrations(
            Array.isArray(data)
              ? data
              : [],
          );
        } catch (error) {
          console.error(
            "Profile registrations loading error:",
            error,
          );

          const message =
            error?.response
              ?.data?.message ||
            "Unable to load registered events.";

          setRegistrationsError(
            message,
          );

          toast.error(
            "Unable to load registered events.",
          );
        } finally {
          setRegistrationsLoading(
            false,
          );
        }
      };

    loadRegistrations();
  }, [authLoading]);


  /**
   * ==========================================================
   * Profile Update Completed
   * ==========================================================
   *
   * EditProfileForm performs the PATCH request.
   *
   * Once the backend confirms the update,
   * refreshSession() fetches GET /auth/me and
   * updates AuthContext.
   *
   * This causes ProfileCard and the information
   * sections on this page to immediately receive
   * the latest user data.
   *
   * ==========================================================
   */

  const handleProfileUpdated =
    async () => {
      try {
        await refreshSession();

        setEditing(false);
      } catch (error) {
        console.error(
          "Unable to refresh profile:",
          error,
        );

        toast.error(
          "Profile was updated, but the latest information could not be loaded.",
        );
      }
    };


  /**
   * ==========================================================
   * Loading State
   * ==========================================================
   */

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">

        <div className="mx-auto max-w-container px-6 py-10">

          <div className="animate-pulse">

            <div className="h-8 w-48 rounded-lg bg-muted" />

            <div className="mt-3 h-4 w-80 rounded bg-muted" />

            <div className="mt-10 grid gap-8 lg:grid-cols-3">

              <div className="h-[500px] rounded-3xl bg-card" />

              <div className="space-y-8 lg:col-span-2">

                <div className="h-72 rounded-3xl bg-card" />

                <div className="h-56 rounded-3xl bg-card" />

              </div>

            </div>

          </div>

        </div>

      </main>
    );
  }


  /**
   * ==========================================================
   * User Information
   * ==========================================================
   */

  const name =
    user?.fullName ||
    "Student";

  const email =
    user?.email ||
    "Not available";

  const phone =
    user?.phone ||
    "Not available";

  const collegeId =
    user?.collegeId ||
    "Not available";

  const role =
    user?.role ||
    "STUDENT";

  const formattedRole =
    formatRole(role);


  /**
   * ==========================================================
   * Main Render
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ====================================================
          Background Atmosphere
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[140px]" />

        <div className="absolute right-[-10rem] top-[25rem] h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-[140px]" />

        <div className="absolute bottom-[-12rem] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-primary/5 blur-[130px]" />

      </div>


      <div className="mx-auto max-w-container px-6 py-10 md:py-14">

        {/* ==================================================
            Header
        =================================================== */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Scintillace
            </p>

            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
              My Profile
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              View your account information,
              verification status and festival
              activity.
            </p>

          </div>


          <Link
            to="/dashboard"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-border
              bg-card/60
              px-5
              py-3
              font-semibold
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-primary/40
              hover:bg-card
            "
          >
            <ArrowLeft size={18} />

            Dashboard
          </Link>

        </header>


        {/* ==================================================
            Main Profile Grid
        =================================================== */}

        <div className="mt-10 grid gap-8 lg:grid-cols-3">

          {/* =================================================
              Profile Card / Edit Form
          ================================================= */}

          <div>

            {editing ? (
              <EditProfileForm
                user={user}
                onClose={() =>
                  setEditing(false)
                }
                onUpdated={
                  handleProfileUpdated
                }
              />
            ) : (
              <ProfileCard
                user={user}
                onEdit={() =>
                  setEditing(true)
                }
              />
            )}

          </div>


          {/* =================================================
              Right Column
          ================================================= */}

          <div className="space-y-8 lg:col-span-2">

            {/* =================================================
                Personal Information
            ================================================== */}

            <section className="rounded-3xl border border-border bg-card/70 p-7 shadow-card backdrop-blur-xl">

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-primary/10 p-3 text-primary">

                  <UserRound
                    size={22}
                  />

                </div>


                <div>

                  <h2 className="text-2xl font-semibold">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Information associated with
                    your Scintillace account.
                  </p>

                </div>

              </div>


              <div className="mt-7 grid gap-6 md:grid-cols-2">

                <InfoItem
                  label="Full Name"
                  value={name}
                />

                <InfoItem
                  label="Email"
                  value={email}
                />

                <InfoItem
                  label="Phone"
                  value={phone}
                />

                <InfoItem
                  label="College ID"
                  value={collegeId}
                />

                <InfoItem
                  label="Account Role"
                  value={formattedRole}
                />

                <InfoItem
                  label="Account Status"
                  value={
                    user?.isActive
                      ? "Active"
                      : "Inactive"
                  }
                  valueClassName={
                    user?.isActive
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                />

              </div>

            </section>


            {/* =================================================
                Account Information
            ================================================== */}

            <section className="rounded-3xl border border-border bg-card/70 p-7 shadow-card backdrop-blur-xl">

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-accent/10 p-3 text-accent">

                  <Clock3
                    size={22}
                  />

                </div>


                <div>

                  <h2 className="text-2xl font-semibold">
                    Account Information
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Important information about
                    your account.
                  </p>

                </div>

              </div>


              <div className="mt-7 grid gap-6 md:grid-cols-3">

                <InfoItem
                  label="Member Since"
                  value={formatDate(
                    user?.createdAt,
                  )}
                />

                <InfoItem
                  label="Last Updated"
                  value={formatDate(
                    user?.updatedAt,
                  )}
                />

                <InfoItem
                  label="Last Login"
                  value={formatDateTime(
                    user?.lastLoginAt,
                  )}
                />

              </div>


              <div className="mt-6 flex flex-wrap gap-3">

                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm">

                  <CheckCircle2
                    size={16}
                    className={
                      user?.isActive
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  />

                  Account{" "}
                  {user?.isActive
                    ? "Active"
                    : "Inactive"}

                </span>


                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm">

                  <ShieldCheck
                    size={16}
                    className="text-primary"
                  />

                  {user?.isEmailVerified
                    ? "Email Verified"
                    : "Verification Pending"}

                </span>

              </div>

            </section>

          </div>

        </div>


        {/* ====================================================
            Registered Events
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card/70 shadow-card backdrop-blur-xl">

          <div className="border-b border-border p-7">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">

                <CalendarDays
                  size={22}
                />

              </div>


              <div>

                <h2 className="text-2xl font-semibold">
                  Registered Events
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Events associated with your
                  festival registration.
                </p>

              </div>

            </div>

          </div>


          <div className="p-7">

            {/* Loading */}

            {registrationsLoading && (
              <div className="space-y-4">

                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-20 animate-pulse rounded-2xl bg-muted/50"
                    />
                  ),
                )}

              </div>
            )}


            {/* Error */}

            {!registrationsLoading &&
              registrationsError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">

                  <p className="font-semibold text-red-400">
                    Unable to load registrations
                  </p>

                  <p className="mt-2 text-sm text-red-400/80">
                    {registrationsError}
                  </p>

                </div>
              )}


            {/* Empty */}

            {!registrationsLoading &&
              !registrationsError &&
              registrations.length ===
                0 && (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 p-10 text-center">

                  <CalendarDays
                    size={40}
                    className="mx-auto text-muted-foreground"
                  />

                  <h3 className="mt-4 text-lg font-semibold">
                    No registered events
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    You haven't registered for
                    any events yet.
                  </p>

                  <Link
                    to="/events"
                    className="
                      mt-6
                      inline-flex
                      items-center
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
                    "
                  >
                    Browse Events
                  </Link>

                </div>
              )}


            {/* Registrations */}

            {!registrationsLoading &&
              !registrationsError &&
              registrations.length > 0 && (
                <div className="space-y-4">

                  {registrations.map(
                    (
                      registration,
                    ) => {

                      const event =
                        registration?.event;

                      const eventTitle =
                        event?.title ||
                        "Event";

                      const status =
                        registration?.status ||
                        "PENDING";

                      const paymentStatus =
                        registration?.paymentStatus ||
                        "NOT_REQUIRED";


                      return (
                        <article
                          key={
                            registration?._id ||
                            registration?.id
                          }
                          className="
                            rounded-2xl
                            border
                            border-border
                            bg-background/40
                            p-5
                            transition-all
                            duration-300
                            hover:-translate-y-0.5
                            hover:border-primary/30
                            hover:bg-card
                          "
                        >

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            <div className="min-w-0">

                              <h3 className="truncate text-lg font-semibold">
                                {eventTitle}
                              </h3>

                              {event?.category && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {event.category}
                                </p>
                              )}

                            </div>


                            <div className="flex flex-wrap gap-2">

                              <span
                                className={`
                                  rounded-full
                                  border
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  ${getStatusClasses(
                                    status,
                                  )}
                                `}
                              >
                                Registration:{" "}
                                {status}
                              </span>


                              <span
                                className={`
                                  rounded-full
                                  border
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  ${getStatusClasses(
                                    paymentStatus,
                                  )}
                                `}
                              >
                                Payment:{" "}
                                {paymentStatus}
                              </span>

                            </div>

                          </div>

                        </article>
                      );
                    },
                  )}

                </div>
              )}

          </div>

        </section>


        {/* ====================================================
            Bottom Actions
        ===================================================== */}

        <div className="mt-8 flex flex-wrap gap-4">

          <Link
            to="/certificates"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-border
              bg-card/60
              px-6
              py-3
              font-semibold
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-primary/40
              hover:text-primary
            "
          >

            <Award
              size={18}
            />

            My Certificates

          </Link>

        </div>

      </div>

    </main>
  );
}


/**
 * ============================================================
 * Reusable Information Item
 * ============================================================
 */

function InfoItem({
  label,
  value,
  valueClassName = "",
}) {
  return (
    <div className="min-w-0">

      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p
        className={`
          mt-1
          break-words
          font-semibold
          ${valueClassName || "text-foreground"}
        `}
      >
        {value}
      </p>

    </div>
  );
}