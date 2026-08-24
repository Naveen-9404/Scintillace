import { apiClient } from "./axios";

export const getAdminDashboard =
  async () => {
    const { data } =
      await apiClient.get(
        "/v1/admin/dashboard",
      );

    return (
      data?.data?.analytics || {}
    );
  };

export const getAdminOverview =
  async () => {
    const { data } =
      await apiClient.get(
        "/v1/admin/overview",
      );

    return (
      data?.data?.analytics || {}
    );
  };

const adminApi =
  Object.freeze({
    getAdminDashboard,
    getAdminOverview,
  });

export default adminApi;