import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import authApi from "../api/auth";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../services/tokenStorage";

import AuthContext from "./AuthContextDefinition";

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const isAuthenticated =
    Boolean(user);

  /**
   * ============================================================
   * Restore Session
   * ============================================================
   *
   * Authentication flow:
   *
   * 1. Check for an existing access token.
   *
   * 2. If no access token exists:
   *      try /auth/refresh using the HTTP-only
   *      refresh-token cookie.
   *
   * 3. If an access token exists:
   *      try /auth/me.
   *
   * 4. If /auth/me returns 401:
   *      explicitly refresh the access token once,
   *      save the new token,
   *      retry /auth/me once.
   *
   * 5. If refresh also fails:
   *      clear authentication state.
   *
   * This keeps session restoration independent of
   * the Axios interceptor.
   */

  const restoreSession =
    useCallback(
      async () => {
        setLoading(true);

        try {
          let token =
            getAccessToken();

          /**
           * ------------------------------------------------------
           * Step 1: No access token
           * ------------------------------------------------------
           */

          if (!token) {
            const refreshData =
              await authApi.refreshAccessToken();

            token =
              refreshData?.accessToken;

            if (!token) {
              throw new Error(
                "Unable to restore session: refresh token did not return an access token.",
              );
            }

            setAccessToken(
              token,
            );
          }

          /**
           * ------------------------------------------------------
           * Step 2: Try current user
           * ------------------------------------------------------
           */

          try {
            const currentUser =
              await authApi.getCurrentUser();

            if (!currentUser) {
              throw new Error(
                "Unable to restore current user.",
              );
            }

            setUser(
              currentUser,
            );

            return;
          } catch (error) {
            /**
             * Only attempt an explicit refresh for
             * authentication failures.
             *
             * Other errors should not silently trigger
             * a refresh.
             */

            const status =
              error?.response?.status;

            if (
              status !== 401
            ) {
              throw error;
            }
          }

          /**
           * ------------------------------------------------------
           * Step 3: Access token is invalid/expired
           * ------------------------------------------------------
           *
           * Explicitly refresh once.
           */

          const refreshData =
            await authApi.refreshAccessToken();

          const refreshedToken =
            refreshData?.accessToken;

          if (!refreshedToken) {
            throw new Error(
              "Session refresh did not return an access token.",
            );
          }

          setAccessToken(
            refreshedToken,
          );

          /**
           * ------------------------------------------------------
           * Step 4: Retry current user
           * ------------------------------------------------------
           */

          const currentUser =
            await authApi.getCurrentUser();

          if (!currentUser) {
            throw new Error(
              "Unable to restore current user after token refresh.",
            );
          }

          setUser(
            currentUser,
          );
        } catch (error) {
          console.warn(
            "Unable to restore authentication session.",
            error,
          );

          clearAccessToken();

          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  /**
   * ============================================================
   * Initial Session Restore
   * ============================================================
   */

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * ============================================================
   * Login
   * ============================================================
   */

  const login =
    useCallback(
      async (credentials) => {
        const data =
          await authApi.login(
            credentials,
          );

        const {
          user:
            authenticatedUser,
          accessToken,
        } = data;

        if (!accessToken) {
          throw new Error(
            "Login failed: access token missing.",
          );
        }

        setAccessToken(
          accessToken,
        );

        setUser(
          authenticatedUser,
        );

        return authenticatedUser;
      },
      [],
    );

  /**
   * ============================================================
   * Register
   * ============================================================
   */

  const register =
    useCallback(
      async (payload) => {
        const data =
          await authApi.register(
            payload,
          );

        const {
          user:
            registeredUser,
          accessToken,
        } = data;

        if (!accessToken) {
          throw new Error(
            "Registration failed: access token missing.",
          );
        }

        setAccessToken(
          accessToken,
        );

        setUser(
          registeredUser,
        );

        return registeredUser;
      },
      [],
    );

  /**
   * ============================================================
   * Logout
   * ============================================================
   */

  const logout =
    useCallback(
      async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.warn(
            "Logout request failed.",
            error,
          );
        } finally {
          clearAccessToken();
          setUser(null);
        }
      },
      [],
    );

  /**
   * ============================================================
   * Context Value
   * ============================================================
   */

  const value =
    useMemo(
      () => ({
        user,
        loading,
        isAuthenticated,

        login,
        register,
        logout,

        refreshSession:
          restoreSession,
      }),
      [
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        restoreSession,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;