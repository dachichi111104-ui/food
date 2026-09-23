import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Dùng: <RoleRoute allowedRoles={["seller"]} />
const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;