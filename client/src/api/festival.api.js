import { apiClient } from "./axios";

/**
 * ============================================================
 * Get Festivals
 * ============================================================
 *
 * GET /api/v1/festivals
 *
 * Returns actual Festival documents.
 *
 * This API must be used whenever the frontend needs:
 *
 * - festival ID
 * - festival title
 * - festival dates
 * - festival status
 *
 * Do NOT use admin analytics.festivals for these purposes.
 * ============================================================
 */

export const getFestivals =
  async ({
    page = 1,
    limit = 100,
  } = {}) => {
    const { data } =
      await apiClient.get(
        "/festivals",
        {
          params: {
            page,
            limit,
          },
        },
      );

    return {
      festivals:
        data?.data?.festivals || [],

      pagination:
        data?.data?.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
    };
  };

export default {
  getFestivals,
};
