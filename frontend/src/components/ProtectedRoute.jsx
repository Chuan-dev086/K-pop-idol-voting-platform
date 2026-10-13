import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  // if don't login redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if need admin but the user role is not admin will redirect to home page
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // if everything is OK then render the children component which is admin dashboard
  return children;
};

export default ProtectedRoute;
