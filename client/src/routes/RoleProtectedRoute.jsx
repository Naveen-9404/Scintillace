import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/common/LoadingScreen";

export function RoleProtectedRoute({
  roles = [],
}) {
  const {
    user,
    loading,
  } = useAuth();

  const location =
    useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
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

  if (!roles.includes(user.role)) {
    return (
      <Navigate
        replace
        to="/"
      />
    );
  }

  return <Outlet />;
}

export default RoleProtectedRoute;