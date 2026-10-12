import { Navigate } from "react-router-dom";
import { getToken } from "../api/client.js";

// Wrap any page that needs a logged-in user.
export default function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
