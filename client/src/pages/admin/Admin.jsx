import {
  useState,
} from "react";

import {
  AlertCircle,
  LayoutDashboard,
  Megaphone,
} from "lucide-react";

import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import DashboardStats from "../../components/admin/DashboardStats";
import Charts from "../../components/admin/Charts";
import Reports from "../../components/admin/Reports";
import AnnouncementPanel from "../../components/admin/AnnouncementPanel";
import EventTable from "../../components/admin/EventTable";
import RegistrationTable from "../../components/admin/RegistrationTable";
import AdminCertificates from "../../components/admin/AdminCertificates";

import useAdmin from "../../hooks/useAdmin";

const SECTIONS = {
  OVERVIEW: "overview",
  ANNOUNCEMENTS: "announcements",
  EVENTS: "events",
  REGISTRATIONS: "registrations",
  CERTIFICATES: "certificates",
  REPORTS: "reports",
};

export default function Admin() {
  const [
    activeSection,
    setActiveSection,
  ] = useState(
    SECTIONS.OVERVIEW,
  );

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const {
    analytics,
    loading,
    error,
    refetch,
  } = useAdmin();

  const dashboard =
    analytics?.dashboard || {};

  const renderContent = () => {
    switch (activeSection) {
      /**
       * ========================================================
       * Announcements
       * ========================================================
       */

      case SECTIONS.ANNOUNCEMENTS:
        return (
          <AnnouncementPanel />
        );

      /**
       * ========================================================
       * Events
       * ========================================================
       */

      case SECTIONS.EVENTS:
        return (
          <EventTable />
        );

      /**
       * ========================================================
       * Registrations
       * ========================================================
       */

      case SECTIONS.REGISTRATIONS:
        return (
          <RegistrationTable />
        );

      /**
       * ========================================================
       * Certificates
       * ========================================================
       */

      case SECTIONS.CERTIFICATES:
        return (
          <AdminCertificates />
        );

      /**
       * ========================================================
       * Reports
       * ========================================================
       */

      case SECTIONS.REPORTS:
        return (
          <Reports
            analytics={
              analytics || {}
            }
          />
        );

      /**
       * ========================================================
       * Overview
       * ========================================================
       */

      case SECTIONS.OVERVIEW:
      default:
        return (
          <Overview
            analytics={
              analytics || {}
            }
            dashboard={
              dashboard
            }
            loading={
              loading
            }
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="flex min-h-screen">

        {/* =====================================================
            Sidebar
            ===================================================== */}

        <Sidebar
          activeSection={
            activeSection
          }
          onSectionChange={
            setActiveSection
          }
          open={
            sidebarOpen
          }
          onClose={() =>
            setSidebarOpen(
              false,
            )
          }
        />

        {/* =====================================================
            Main Content
            ===================================================== */}

        <div className="min-w-0 flex-1">

          {/* ===================================================
              Header
              =================================================== */}

          <Header
            onMenuClick={() =>
              setSidebarOpen(
                true,
              )
            }
            onRefresh={
              refetch
            }
            refreshing={
              loading
            }
          />

          {/* ===================================================
              Page Content
              =================================================== */}

          <main className="mx-auto max-w-[1600px] px-5 py-7 md:px-8 md:py-10">

            {/* =================================================
                Analytics Error
                ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div>

                  <p className="font-semibold">
                    Unable to load admin analytics
                  </p>

                  <p className="mt-1 text-sm text-red-300/70">
                    {error}
                  </p>

                </div>

              </div>
            )}

            {renderContent()}

          </main>

        </div>

      </div>

    </div>
  );
}

/**
 * ============================================================
 * Overview
 * ============================================================
 */

function Overview({
  analytics,
  dashboard,
  loading,
}) {
  return (
    <section className="space-y-8">

      {/* ======================================================
          Page Heading
          ====================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
            Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            Administrative Overview
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor Scintillace activity,
            registrations, payments,
            tickets and accommodation
            from one place.
          </p>

        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs font-semibold text-emerald-400">

          <span className="h-2 w-2 rounded-full bg-emerald-400" />

          Live Analytics

        </div>

      </div>

      {/* ======================================================
          Dashboard Statistics
          ====================================================== */}

      <DashboardStats
        dashboard={
          dashboard
        }
        loading={
          loading
        }
      />

      {/* ======================================================
          Activity Breakdown
          ====================================================== */}

      <div>

        <div className="mb-5 flex items-center gap-3">

          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-400">

            <LayoutDashboard
              size={19}
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-white">
              Activity Breakdown
            </h2>

            <p className="text-sm text-slate-500">
              Distribution of current platform activity
            </p>

          </div>

        </div>

        <Charts
          analytics={
            analytics
          }
        />

      </div>

      {/* ======================================================
          Announcement Information
          ====================================================== */}

      <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 p-6">

        <div className="flex items-start gap-4">

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-400">

            <Megaphone
              size={20}
            />

          </div>

          <div>

            <h3 className="font-bold text-white">
              Announcement Management
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Use the Announcements section
              to publish important updates
              for Scintillace participants.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}