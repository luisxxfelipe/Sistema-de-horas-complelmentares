import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import RegisterActivity from "./pages/RegisterActivity";
import AdminPanel from "./pages/AdminPanel";
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./routes/AdminRoute";
import { useAuth } from "./hooks/useAuth";
import "./assets/styles/index.css";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Root = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Rotas para alunos */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/register-activity"
          element={
            <PrivateRoute>
              <RegisterActivity />
            </PrivateRoute>
          }
        />

        {/* Rotas para administradores */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Redirecionamento baseado na role */}
        <Route path="*" element={<RedirectByRole />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

// Componente separado para garantir que o redirecionamento ocorra corretamente
const RedirectByRole = () => {
  const { role } = useAuth();
  return role === "admin" ? <Navigate to="/admin-dashboard" /> : <Navigate to="/dashboard" />;
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
