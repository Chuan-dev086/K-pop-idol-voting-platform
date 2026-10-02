import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  // 未登录 → 去登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 需要 admin 但不是 admin → 回首页
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 通过 → 渲染子组件
  return children;
};

export default ProtectedRoute;
