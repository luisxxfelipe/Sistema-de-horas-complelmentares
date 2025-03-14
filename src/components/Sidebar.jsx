import React, { useEffect, useState } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoUEMG from "../assets/images/logo_uemg.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole"); // 'admin' ou 'aluno'
    setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const studentMenuItems = [
    { text: "Registrar Atividade", icon: <AddCircleIcon />, onClick: () => navigate("/register-activity") },
    { text: "Dashboard", icon: <DashboardIcon />, onClick: () => navigate("/dashboard") },
    { text: "Sair", icon: <LogoutIcon />, onClick: handleLogout },
  ];

  const adminMenuItems = [
    { text: "Área Administrativa", icon: <AdminPanelSettingsIcon />, onClick: () => navigate("/admin-dashboard") },
    { text: "Sair", icon: <LogoutIcon />, onClick: handleLogout },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : studentMenuItems;

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#3C6178",
            color: "#FFF",
            borderRadius: "0",
            borderRight: "none",
          },
        }}
      >
        <Toolbar>
          <img
            src={LogoUEMG}
            alt="Logo UEMG"
            style={{ maxHeight: 50, marginRight: 16 }}
          />
        </Toolbar>

        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={item.onClick}>
                <ListItemIcon sx={{ color: "#FFF" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
