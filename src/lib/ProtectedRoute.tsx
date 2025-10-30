import React, { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { initializing } = useAuth();

  useEffect(() => {
    // Only redirect after initialization is complete
    if (!initializing && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [initializing, isAuthenticated, navigate]);

  // While we are initializing (checking local storage / token), don't render or redirect
  if (initializing) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
