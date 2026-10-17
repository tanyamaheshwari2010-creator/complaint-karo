import { Navigate } from "react-router-dom";
import { getToken } from "../api/client.js";
import { getUser } from "../api/session.js";

// <ProtectedRoute>                      -> any logged-in user
// <ProtectedRoute roles={["..."]}>      -> only those roles, everyone else goes to /dashboard
export default function ProtectedRoute({ children, roles }) {
  if (!getToken()) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(getUser().role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}