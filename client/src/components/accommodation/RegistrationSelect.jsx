import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { getMyRegistrations } from "../../api/registrations.api";

const RegistrationSelect = ({
  value,
  onChange,
}) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadRegistrations = async () => {
      try {
        setLoading(true);

        const response =
          await getMyRegistrations();

        /**
         * The registrations API is expected to return:
         *
         * [
         *   {
         *     _id,
         *     event: {
         *       title,
         *       category,
         *       startDateTime,
         *     },
         *     status,
         *     paymentStatus,
         *   }
         * ]
         *
         * We also support the raw API response shape:
         *
         * {
         *   data: {
         *     registrations: [...]
         *   }
         * }
         */

        const list =
          Array.isArray(response)
            ? response
            : Array.isArray(
                response?.registrations,
              )
              ? response.registrations
              : Array.isArray(
                  response?.data?.registrations,
                )
                ? response.data.registrations
                : Array.isArray(
                    response?.data,
                  )
                  ? response.data
                  : [];

        if (mounted) {
          setRegistrations(list);
        }
      } catch (error) {
        console.error(
          "Unable to load event registrations:",
          error,
        );

        if (mounted) {
          setRegistrations([]);

          toast.error(
            error?.response?.data?.message ||
              "Unable to load your event registrations.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRegistrations();

    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <CalendarDays
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
        />

        <select
          value={value || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={loading}
          className="
            w-full
            appearance-none
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            px-12
            py-4
            pr-10
            text-white
            outline-none
            transition
            focus:border-cyan-400/60
            focus:ring-2
            focus:ring-cyan-400/20
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <option
            value=""
            className="bg-slate-900 text-slate-400"
          >
            {loading
              ? "Loading registrations..."
              : registrations.length > 0
                ? "Choose Registration"
                : "No eligible registrations"}
          </option>

          {registrations.map(
            (registration) => {
              const event =
                registration?.event || {};

              const registrationId =
                registration?._id ||
                registration?.id;

              if (!registrationId) {
                return null;
              }

              const title =
                event.title ||
                "Unnamed Event";

              const category =
                event.category || "";

              const date =
                formatDate(
                  event.startDateTime,
                );

              return (
                <option
                  key={registrationId}
                  value={registrationId}
                  className="bg-slate-900 text-white"
                >
                  {title}
                  {category
                    ? ` • ${category}`
                    : ""}
                  {date
                    ? ` • ${date}`
                    : ""}
                </option>
              );
            },
          )}
        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {!loading &&
        registrations.length === 0 && (
          <p className="mt-3 text-sm text-amber-400">
            You need an eligible event registration
            before requesting accommodation.
          </p>
        )}

      {!loading &&
        registrations.length > 0 && (
          <p className="mt-3 text-sm text-slate-500">
            Select the event registration for which
            you want hostel accommodation.
          </p>
        )}
    </div>
  );
};

export default RegistrationSelect;