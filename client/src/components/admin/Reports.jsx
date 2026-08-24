import {
  useState,
} from "react";

import {
  IndianRupee,
  Ticket,
  CheckCircle2,
  Hotel,
  Download,
  Users,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Award,
  Database,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

import toast from "react-hot-toast";

import exportApi from "../../api/export.api";

export default function Reports({
  analytics = {},
}) {
  const [
    exporting,
    setExporting,
  ] = useState(null);

  const revenue =
    analytics.payments
      ?.revenue || {};

  const tickets =
    analytics.tickets || {};

  const accommodation =
    analytics.accommodation || {};

  const handleExport =
    async (
      key,
      exportFunction,
      label,
    ) => {
      try {
        setExporting(key);

        await exportFunction();

        toast.success(
          `${label} exported successfully.`,
        );
      } catch (error) {
        console.error(
          `Failed to export ${label}:`,
          error,
        );

        toast.error(
          error?.response?.data
            ?.message ||
            `Unable to export ${label}.`,
        );
      } finally {
        setExporting(null);
      }
    };

  return (
    <section className="space-y-8">

      {/* =====================================================
          Header
          ===================================================== */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
          Analytics & Reports
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
          Reports & Insights
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitor Scintillace activity and
          download administrative data for
          further analysis.
        </p>
      </div>

      {/* =====================================================
          Analytics Cards
          ===================================================== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <ReportCard
          icon={IndianRupee}
          label="Successful Revenue"
          value={`₹${Number(
            revenue.totalRevenue ||
              0,
          ).toLocaleString("en-IN")}`}
        />

        <ReportCard
          icon={Ticket}
          label="Tickets Issued"
          value={Number(
            tickets.totalTickets ||
              0,
          ).toLocaleString("en-IN")}
        />

        <ReportCard
          icon={CheckCircle2}
          label="Ticket Check-in Rate"
          value={`${Number(
            tickets.checkInRate ||
              0,
          ).toFixed(2)}%`}
        />

        <ReportCard
          icon={Hotel}
          label="Accommodation Bookings"
          value={Number(
            analytics.dashboard
              ?.totalAccommodationBookings ||
              0,
          ).toLocaleString("en-IN")}
        />

      </div>

      {/* =====================================================
          Payment Summary
          ===================================================== */}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

        <h3 className="text-lg font-bold text-white">
          Payment Summary
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">

          <SummaryItem
            label="Transactions"
            value={
              revenue.transactionCount ||
              0
            }
          />

          <SummaryItem
            label="Payment Records"
            value={
              analytics.dashboard
                ?.totalPayments ||
              0
            }
          />

          <SummaryItem
            label="Checked In"
            value={
              tickets.checkedIn ||
              0
            }
          />

        </div>

      </div>

      {/* =====================================================
          Accommodation Status
          ===================================================== */}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

        <h3 className="text-lg font-bold text-white">
          Accommodation Status
        </h3>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {(
            accommodation
              .byBookingStatus ||
            []
          ).map(
            (item) => (
              <div
                key={
                  item.status
                }
                className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {item.status}
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {Number(
                    item.count ||
                      0,
                  ).toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>
            ),
          )}

        </div>

      </div>

      {/* =====================================================
          Excel Exports
          ===================================================== */}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">

        {/* Header */}

        <div className="border-b border-white/10 p-6 md:p-7">

          <div className="flex items-start gap-4">

            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileSpreadsheet
                size={21}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Excel Exports
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Download administrative data
                as Excel spreadsheets for
                reporting and analysis.
              </p>
            </div>

          </div>

        </div>

        {/* Export cards */}

        <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">

          <ExportCard
            icon={Users}
            title="Users"
            description="Export registered user information."
            loading={
              exporting === "users"
            }
            onClick={() =>
              handleExport(
                "users",
                exportApi.exportUsers,
                "Users",
              )
            }
          />

          <ExportCard
            icon={CalendarDays}
            title="Festivals"
            description="Export festival information."
            loading={
              exporting === "festivals"
            }
            onClick={() =>
              handleExport(
                "festivals",
                exportApi.exportFestivals,
                "Festivals",
              )
            }
          />

          <ExportCard
            icon={CalendarDays}
            title="Events"
            description="Export event information."
            loading={
              exporting === "events"
            }
            onClick={() =>
              handleExport(
                "events",
                exportApi.exportEvents,
                "Events",
              )
            }
          />

          <ExportCard
            icon={ClipboardList}
            title="Registrations"
            description="Export participant registrations."
            loading={
              exporting ===
              "registrations"
            }
            onClick={() =>
              handleExport(
                "registrations",
                exportApi.exportRegistrations,
                "Registrations",
              )
            }
          />

          <ExportCard
            icon={CreditCard}
            title="Payments"
            description="Export payment records."
            loading={
              exporting === "payments"
            }
            onClick={() =>
              handleExport(
                "payments",
                exportApi.exportPayments,
                "Payments",
              )
            }
          />

          <ExportCard
            icon={Hotel}
            title="Accommodation"
            description="Export accommodation bookings."
            loading={
              exporting ===
              "accommodation"
            }
            onClick={() =>
              handleExport(
                "accommodation",
                exportApi.exportAccommodation,
                "Accommodation",
              )
            }
          />

          <ExportCard
            icon={Ticket}
            title="Tickets"
            description="Export issued ticket information."
            loading={
              exporting === "tickets"
            }
            onClick={() =>
              handleExport(
                "tickets",
                exportApi.exportTickets,
                "Tickets",
              )
            }
          />

          <ExportCard
            icon={Award}
            title="Certificates"
            description="Export certificate records."
            loading={
              exporting ===
              "certificates"
            }
            onClick={() =>
              handleExport(
                "certificates",
                exportApi.exportCertificates,
                "Certificates",
              )
            }
          />

        </div>

        {/* Complete report */}

        <div className="border-t border-white/10 p-6">

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Database
                    size={21}
                  />
                </div>

                <div>
                  <h4 className="font-bold text-white">
                    Complete Report
                  </h4>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Download a single Excel
                    workbook containing
                    users, festivals, events,
                    registrations, payments,
                    accommodation, tickets
                    and certificates.
                  </p>
                </div>

              </div>

              <button
                type="button"
                disabled={
                  exporting ===
                  "complete"
                }
                onClick={() =>
                  handleExport(
                    "complete",
                    exportApi.exportCompleteReport,
                    "Complete report",
                  )
                }
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-violet-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-violet-600/20
                  transition
                  hover:bg-violet-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {exporting ===
                "complete" ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Generating...
                  </>
                ) : (
                  <>
                    <Download
                      size={17}
                    />

                    Download Complete Report
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </section>

    </section>
  );
}

/**
 * ============================================================
 * Analytics Card
 * ============================================================
 */

function ReportCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-violet-500/20 hover:bg-white/[0.06]">

      <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
        <Icon size={19} />
      </div>

      <p className="mt-4 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>

    </div>
  );
}

/**
 * ============================================================
 * Summary Item
 * ============================================================
 */

function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-4">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-white">
        {Number(
          value || 0,
        ).toLocaleString(
          "en-IN",
        )}
      </p>

    </div>
  );
}

/**
 * ============================================================
 * Export Card
 * ============================================================
 */

function ExportCard({
  icon: Icon,
  title,
  description,
  loading,
  onClick,
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/20 hover:bg-white/[0.05]">

      <div className="flex items-start justify-between gap-4">

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Icon size={19} />
        </div>

        <Download
          size={17}
          className="text-slate-700 transition group-hover:text-emerald-400"
        />

      </div>

      <h4 className="mt-4 font-semibold text-white">
        {title}
      </h4>

      <p className="mt-1 min-h-[40px] text-xs leading-5 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        disabled={loading}
        onClick={onClick}
        className="
          mt-4
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          px-4
          py-2.5
          text-sm
          font-semibold
          text-slate-300
          transition
          hover:border-emerald-500/30
          hover:bg-emerald-500/5
          hover:text-emerald-400
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Preparing...
          </>
        ) : (
          <>
            <Download
              size={16}
            />

            Download Excel
          </>
        )}
      </button>

    </div>
  );
}