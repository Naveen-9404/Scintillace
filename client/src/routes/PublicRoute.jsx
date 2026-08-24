import { Navigate } from "react-router-dom";

import LoadingScreen from "../components/common/LoadingScreen";

import { useAuth } from "../hooks/useAuth";

function PublicRoute({
  children,
}) {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default PublicRoute;