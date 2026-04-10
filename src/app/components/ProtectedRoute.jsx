import { Navigate, Outlet } from "react-router";

/**
 * ProtectedRoute component
 * Redirects to /login if the user is not authenticated.
 * Authentication is determined by the presence of a 'token' in localStorage.
 */
export function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render children or the nested route
  return children ? children : <Outlet />;
}
