import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./components/AuthLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OfficerDashboard from "./pages/OfficerDashboard.jsx";

export default function App() {
  return (
    <Routes>
      {/* Login and Signup share one layout, so the lamp keeps swinging when you switch */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/officer"
        element={
          <ProtectedRoute roles={["complaint_officer"]}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />


    </Routes>
  );
}
