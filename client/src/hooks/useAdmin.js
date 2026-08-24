import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAdminDashboard,
  getAdminOverview,
} from "../api/admin.api";

export default function useAdmin() {
  const [
    analytics,
    setAnalytics,
  ] = useState({
    dashboard: {},
    users: [],
    festivals: [],
    events: {
      byCategory: [],
      byType: [],
      byStatus: [],
    },
    registrations: {
      byStatus: [],
      byEvent: [],
      byFestival: [],
    },
    payments: {
      byStatus: [],
      byGateway: [],
      byPurpose: [],
      revenue: {
        totalRevenue: 0,
        transactionCount: 0,
      },
    },
    tickets: {
      byStatus: [],
      totalTickets: 0,
      checkedIn: 0,
      notCheckedIn: 0,
      checkInRate: 0,
    },
    accommodation: {
      byBookingStatus: [],
      byPaymentStatus: [],
      byRoomType: [],
    },
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /**
   * ============================================================
   * Fetch Admin Data
   * ============================================================
   */

  const fetchAdminData =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            dashboardData,
            overviewData,
          ] = await Promise.all([
            getAdminDashboard(),
            getAdminOverview(),
          ]);

          setAnalytics({
            ...overviewData,

            dashboard:
              dashboardData || {},
          });
        } catch (err) {
          console.error(
            "Failed to load admin analytics:",
            err,
          );

          setError(
            err?.response?.data
              ?.message ||
              "Unable to load admin dashboard.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  /**
   * ============================================================
   * Initial Load
   * ============================================================
   *
   * Defer the initial request so the effect does not
   * synchronously trigger state updates.
   */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchAdminData();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchAdminData]);

  /**
   * ============================================================
   * Return
   * ============================================================
   */

  return {
    analytics,

    loading,

    error,

    refetch:
      fetchAdminData,
  };
}