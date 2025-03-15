"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Collapse,
  useMediaQuery,
  AppBar,
  Tooltip,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import LogoUEMG from "../assets/images/logo_uemg.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { supabase } from "../services/supabase"

const drawerWidth = 260;

// Drawer estilizado para desktop
const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflowX: "hidden",
      backgroundColor: "#3C6178",
      color: "#FFF",
      borderRight: "none",
    },
  }),
  ...(!open && {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    overflowX: "hidden",
    "& .MuiDrawer-paper": {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: theme.spacing(7),
      backgroundColor: "#3C6178",
      color: "#FFF",
      borderRight: "none",
    },
  }),
}));

// Estilização para o item de menu ativo
const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: "4px 8px",
  borderRadius: "8px",
  backgroundColor: active ? "rgba(255, 255, 255, 0.15)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  transition: "all 0.2s ease",
}));

// Estilização para o ícone do menu
const StyledListItemIcon = styled(ListItemIcon)({
  color: "#FFF",
  minWidth: "40px",
});

const Sidebar = () => {
  const theme = useTheme();
  const [userAvatar, setUserAvatar] = useState("/placeholder.svg")
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("Usuário");
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: user, error: authError } = await supabase.auth.getUser();
        if (authError || !user?.user) throw authError;

        const userId = user.user.id;

        // Buscar informações do usuário na tabela "users"
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("nome, url_profile")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        setUserName(profileData.nome || "Usuário");

        setUserAvatar(profileData.url_profile || "/placeholder.svg"); // Se não houver foto, exibe um placeholder
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // Verifica se o item está ativo
  const isActive = (path) => location.pathname === path;

  const studentMenuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      text: "Registrar Atividade",
      icon: <AddCircleIcon />,
      path: "/register-activity",
      onClick: () => navigate("/register-activity"),
    },
    {
      text: "Minhas Atividades",
      icon: <EventNoteIcon />,
      path: "/activities",
      onClick: () => navigate("/activities"),
    },
    {
      text: "Relatórios",
      icon: <BarChartIcon />,
      path: "/reports",
      onClick: () => navigate("/reports"),
    },
  ];

  const adminMenuItems = [
    {
      text: "Painel Administrativo",
      icon: <AdminPanelSettingsIcon />,
      path: "/admin-dashboard",
      onClick: () => navigate("/admin-dashboard"),
    },
    {
      text: "Gerenciar Atividades",
      icon: <EventNoteIcon />,
      path: "/admin-activities",
      onClick: () => navigate("/admin-activities"),
    },
    {
      text: "Relatórios",
      icon: <BarChartIcon />,
      path: "/admin-reports",
      onClick: () => navigate("/admin-reports"),
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : studentMenuItems;

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          px: [1, 2],
          minHeight: "64px !important",
        }}
      >
        {open && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={LogoUEMG || "/placeholder.svg"}
              alt="Logo UEMG"
              style={{ maxHeight: 40, marginRight: 12 }}
            />
            <Typography variant="h6" fontWeight="bold" noWrap>
              HorasComp
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerToggle} sx={{ color: "#FFF" }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Perfil do usuário */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: open ? "flex-start" : "center",
          p: 2,
        }}
      >
        <Avatar
          src={userAvatar}
          alt={userName}
          sx={{
            width: 40,
            height: 40,
            mb: open ? 1 : 0,
            bgcolor: "rgba(255, 255, 255, 0.2)",
          }}
        />

        {open && (
          <Box>
            <Typography variant="subtitle1" noWrap>
              {userName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }} noWrap>
              {userRole === "admin" ? "Administrador" : "Estudante"}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Menu principal */}
      <List sx={{ px: 1, py: 1 }}>
        {menuItems.map((item) => (
          <Tooltip
            key={item.text}
            title={!open ? item.text : ""}
            placement="right"
            disableHoverListener={open}
          >
            <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
              <StyledListItemButton
                active={isActive(item.path) ? 1 : 0}
                onClick={item.onClick}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <StyledListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </StyledListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    "& .MuiTypography-root": {
                      fontWeight: isActive(item.path) ? "bold" : "normal",
                    },
                  }}
                />
              </StyledListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Configurações */}
      <List sx={{ px: 1, py: 1 }}>
        <Tooltip
          title={!open ? "Configurações" : ""}
          placement="right"
          disableHoverListener={open}
        >
          <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
            <StyledListItemButton
              onClick={handleSettingsToggle}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <StyledListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                <SettingsIcon />
              </StyledListItemIcon>
              <ListItemText
                primary="Configurações"
                sx={{ opacity: open ? 1 : 0 }}
              />
              {open && (settingsOpen ? <ExpandLess /> : <ExpandMore />)}
            </StyledListItemButton>
          </ListItem>
        </Tooltip>

        <Collapse in={settingsOpen && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding sx={{ display: "block" }}>
              <StyledListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  pl: open ? 4 : 2.5,
                }}
                onClick={() => navigate("/profile")}
                active={isActive("/profile") ? 1 : 0}
              >
                <StyledListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon />
                </StyledListItemIcon>
                <ListItemText primary="Perfil" sx={{ opacity: open ? 1 : 0 }} />
              </StyledListItemButton>
            </ListItem>
          </List>
        </Collapse>
      </List>

      {/* Botão de logout */}
      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mb: 1 }} />
        <StyledListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <StyledListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <LogoutIcon />
          </StyledListItemIcon>
          <ListItemText primary="Sair" sx={{ opacity: open ? 1 : 0 }} />
        </StyledListItemButton>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar para dispositivos móveis */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            display: { xs: "block", sm: "none" },
            backgroundColor: "#3C6178",
            boxShadow: "none",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={LogoUEMG || "/placeholder.svg"}
                alt="Logo UEMG"
                style={{ maxHeight: 40, marginRight: 12 }}
              />
              <Typography variant="h6" fontWeight="bold" noWrap>
                HorasComp
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer para dispositivos móveis */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Melhor desempenho em dispositivos móveis
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundColor: "#3C6178",
              color: "#FFF",
              borderRight: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        // Drawer para desktop
        <StyledDrawer variant="permanent" open={open}>
          {drawer}
        </StyledDrawer>
      )}
    </Box>
  );
};

export default Sidebar;
