import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { user, role } = useAuth();

  if (!user || role !== "admin") {
    return <Navigate to="/dashboard" />; // Redireciona usuários comuns para o Dashboard
  }

  return children;
};

export default AdminRoute;
