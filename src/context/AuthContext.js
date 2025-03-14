import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService"; // Usando AuthService

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getUser();

      if (response.success) {
        setUser(response.user);
        setRole(response.role);
      } else {
        setUser(null);
        setRole(null);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role, setUser, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
  