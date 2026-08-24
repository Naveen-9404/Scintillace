import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getPublishedAnnouncements,
  searchAnnouncements,
} from "../api/announcements.api";

export default function useAnnouncements(
  options = {},
) {
  const {
    page = 1,
    limit = 10,
    search = "",
  } = options;

  const [
    announcements,
    setAnnouncements,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /**
   * ============================================================
   * Fetch Announcements
   * ============================================================
   */

  const fetchAnnouncements =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const result =
            search.trim()
              ? await searchAnnouncements(
                  search.trim(),
                  {
                    page,
                    limit,
                  },
                )
              : await getPublishedAnnouncements(
                  {
                    page,
                    limit,
                  },
                );

          setAnnouncements(
            result?.announcements ||
              [],
          );

          setPagination(
            result?.pagination || {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          );
        } catch (err) {
          console.error(
            "Failed to load announcements:",
            err,
          );

          setError(
            err?.response?.data
              ?.message ||
              "Unable to load announcements.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        limit,
        search,
      ],
    );

  /**
   * ============================================================
   * Initial / Dependency-Based Load
   * ============================================================
   *
   * Defer the request so the effect itself does not
   * synchronously trigger React state updates.
   */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchAnnouncements();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchAnnouncements]);

  /**
   * ============================================================
   * Return
   * ============================================================
   */

  return {
    announcements,

    pagination,

    loading,

    error,

    refetch:
      fetchAnnouncements,
  };
}