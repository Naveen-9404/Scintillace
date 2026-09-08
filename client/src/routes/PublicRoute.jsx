import { Navigate } from "react-router-dom";

import LoadingScreen from "../components/common/LoadingScreen";

import { useAuth } from "../hooks/useAuth";

function PublicRoute({
  children,
}) {
  const {
    user,
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    const isAdmin =
      user?.role === "SUPER_ADMIN" ||
      user?.role === "FACULTY";

    return (
      <Navigate
        to={isAdmin ? "/admin" : "/"}
        replace
      />
    );
  }

  return children;
}

export default PublicRoute;