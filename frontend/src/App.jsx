import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import HrDashboard from "./pages/HrDashBoard";
import ManagerDashboardPage from "./pages/ManagerDashBoard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SuperAdminDashboard from "./pages/components/superAdmin/SuperAdmin.jsx";
import ProtectedRoute from "./protectedRoute";
import ResetPassword from "./pages/ResetPassword.jsx";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Super Admin Protected Route */}
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["SuperAdmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* HR Protected Route */}
      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Hr"]}>
            <HrDashboard />
          </ProtectedRoute>
        }
      />

      {/* Manager Protected Route */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Employee Protected Route */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
