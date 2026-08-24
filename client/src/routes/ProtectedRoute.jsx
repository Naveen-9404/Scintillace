import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import LoadingScreen from "../components/common/LoadingScreen";

import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location =
    useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to="/login"
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;