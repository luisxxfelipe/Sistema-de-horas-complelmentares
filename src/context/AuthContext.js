import { createContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import { supabase } from "../services/supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Controla o carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        setUser(null);
        setRole(null);
        setLoading(false);
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/login");
        }
        return;
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/login");
        }
        return;
      }

      const userId = data.user.id;
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("nome, url_profile, role")
        .eq("id", userId)
        .single();

      if (profileError) {
        setUser(null);
        setRole(null);
        setLoading(false);
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/login");
        }
        return;
      }

      const completeUser = {
        id: userId,
        email: data.user.email,
        nome: userProfile.nome,
        url_profile: userProfile.url_profile,
      };

      setUser(completeUser);
      setRole(userProfile.role);
      setLoading(false);
    };

    fetchUser();
  }, [navigate, location]); 

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  if (loading) return null; // Ou uma tela de loading

  return (
    <AuthContext.Provider value={{ user, role, setUser, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
