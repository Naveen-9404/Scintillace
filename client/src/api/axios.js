import axios from "axios";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../services/tokenStorage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ============================================================
 * Refresh State
 * ============================================================
 */

let isRefreshing = false;
let refreshSubscribers = [];

/**
 * ============================================================
 * Refresh Queue
 * ============================================================
 */

const subscribeToRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const resolveRefreshSubscribers = (token) => {
  refreshSubscribers.forEach((callback) => {
    callback(null, token);
  });

  refreshSubscribers = [];
};

const rejectRefreshSubscribers = (error) => {
  refreshSubscribers.forEach((callback) => {
    callback(error, null);
  });

  refreshSubscribers = [];
};

/**
 * ============================================================
 * Request Interceptor
 * ============================================================
 *
 * Attach the access token when one exists.
 */

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error),
);

/**
 * ============================================================
 * Response Interceptor
 * ============================================================
 *
 * Access token expired:
 *
 *       API request
 *           ↓
 *          401
 *           ↓
 *      refresh cookie
 *           ↓
 *     new access token
 *           ↓
 *      retry request
 *
 * The refresh token is NEVER read from localStorage.
 */

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl =
      originalRequest.url || "";

    /**
     * Never refresh authentication
     * endpoints themselves.
     */

    const isAuthRequest =
      requestUrl.includes(
        "/v1/auth/login",
      ) ||
      requestUrl.includes(
        "/v1/auth/register",
      ) ||
      requestUrl.includes(
        "/v1/auth/google",
      ) ||
      requestUrl.includes(
        "/v1/auth/refresh",
      );

    /**
     * Only handle 401 responses.
     */

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    /**
     * ========================================================
     * Another request is refreshing
     * ========================================================
     */

    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          subscribeToRefresh(
            (
              refreshError,
              token,
            ) => {
              if (refreshError) {
                reject(refreshError);
                return;
              }

              originalRequest._retry =
                true;

              originalRequest.headers =
                originalRequest.headers ||
                {};

              originalRequest.headers.Authorization =
                `Bearer ${token}`;

              resolve(
                apiClient(
                  originalRequest,
                ),
              );
            },
          );
        },
      );
    }

    /**
     * ========================================================
     * Start Refresh
     * ========================================================
     */

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      /**
       * IMPORTANT:
       *
       * The backend stores refreshToken
       * inside an HTTP-only cookie.
       *
       * Therefore:
       *
       * - Do NOT use localStorage.
       * - Do NOT send refreshToken in JSON.
       */

      const response =
        await axios.post(
          `${baseURL}/v1/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type":
                "application/json",
            },
          },
        );

      const newAccessToken =
        response.data?.data
          ?.accessToken;

      if (!newAccessToken) {
        throw new Error(
          "Refresh response did not contain an access token.",
        );
      }

      setAccessToken(
        newAccessToken,
      );

      resolveRefreshSubscribers(
        newAccessToken,
      );

      originalRequest.headers =
        originalRequest.headers ||
        {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(
        originalRequest,
      );
    } catch (refreshError) {
      clearAccessToken();

      rejectRefreshSubscribers(
        refreshError,
      );

      return Promise.reject(
        refreshError,
      );
    } finally {
      isRefreshing = false;
    }
  },
);

export { apiClient };

export default apiClient;