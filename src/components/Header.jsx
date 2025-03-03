import React from "react";
import { AppBar, Toolbar, Button, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoUEMG from "../assets/images/logo_uemg.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LogoutIcon from "@mui/icons-material/Logout";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: "#3C6178", padding: "0 16px" }}
    >
      <Toolbar>
        <img
          src={LogoUEMG}
          alt="Logo UEMG"
          style={{ maxHeight: 50, marginRight: 16 }}
        />

        <Button
          startIcon={<DashboardIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{
            color: "#FFF",
            marginLeft: "auto",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
          }}
        >
          Dashboard
        </Button>

        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate("/register-activity")}
          sx={{
            marginLeft: 2,
            backgroundColor: "#fff",
            color: "#3C6178",
            "&:hover": { backgroundColor: "#E6C200" },
          }}
        >
          Registrar Atividade
        </Button>

        <IconButton
          onClick={handleLogout}
          color="inherit"
          sx={{ marginLeft: 2 }}
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
