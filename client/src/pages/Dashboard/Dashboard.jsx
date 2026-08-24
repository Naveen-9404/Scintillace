import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  getMyRegistrations,
  getMyCertificates,
  getUpcomingEvents,
} from "../../api/dashboard.api";

import {
  getPublishedAnnouncements,
} from "../../api/announcements.api";

import AccommodationDashboard from "../../components/dashboard/AccommodationDashboard";

import {
  Statistics,
  ProfileSummary,
  RecentRegistrations,
  UpcomingEvents,
  Certificates,
  Notifications,
  QuickActions,
} from "../../components/dashboard";

export default function Dashboard() {
  const [
    registrations,
    setRegistrations,
  ] = useState([]);

  const [
    certificates,
    setCertificates,
  ] = useState([]);

  const [
    upcomingEvents,
    setUpcomingEvents,
  ] = useState([]);

  const [
    announcements,
    setAnnouncements,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /**
   * ============================================================
   * Load Dashboard Data
   * ============================================================
   */

  const loadDashboard =
    async () => {
      try {
        setLoading(true);

        const [
          registrationsData,
          certificatesData,
          upcomingEventsData,
          announcementsData,
        ] = await Promise.all([
          getMyRegistrations(),

          getMyCertificates(),

          getUpcomingEvents(),

          getPublishedAnnouncements({
            page: 1,
            limit: 5,
          }),
        ]);

        setRegistrations(
          registrationsData || [],
        );

        setCertificates(
          certificatesData || [],
        );

        setUpcomingEvents(
          upcomingEventsData || [],
        );

        setAnnouncements(
          announcementsData?.announcements ||
            [],
        );
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error,
        );

        toast.error(
          error?.response?.data?.message ||
            "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

  /**
   * ============================================================
   * Initial Load
   * ============================================================
   */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadDashboard();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  /**
   * ============================================================
   * Dashboard
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-background text-foreground">

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =====================================================
            Profile Summary
        ====================================================== */}

        <ProfileSummary />

        {/* =====================================================
            Statistics
        ====================================================== */}

        <div className="mt-8">

          <Statistics
            registrations={
              registrations
            }
            certificates={
              certificates
            }
            upcomingEvents={
              upcomingEvents
            }
            announcements={
              announcements
            }
            loading={
              loading
            }
          />

        </div>

        {/* =====================================================
            Accommodation
        ====================================================== */}

        <div className="mt-10">

          <AccommodationDashboard />

        </div>

        {/* =====================================================
            Main Dashboard Content
        ====================================================== */}

        <div className="mt-10 grid gap-8 lg:grid-cols-3">

          {/* ===================================================
              LEFT COLUMN
          ==================================================== */}

          <div className="space-y-8 lg:col-span-2">

            {/* Recent Registrations */}

            <RecentRegistrations
              registrations={
                registrations
              }
              loading={
                loading
              }
            />

            {/* Upcoming Events */}

            <UpcomingEvents
              events={
                upcomingEvents
              }
              loading={
                loading
              }
            />

            {/* Certificates */}

            <Certificates
              certificates={
                certificates
              }
              loading={
                loading
              }
            />

          </div>

          {/* ===================================================
              RIGHT COLUMN
          ==================================================== */}

          <div className="space-y-8">

            {/* Quick Actions */}

            <QuickActions />

            {/* Announcements */}

            <Notifications
              notifications={
                announcements
              }
              loading={
                loading
              }
            />

          </div>

        </div>

      </div>

    </main>
  );
}