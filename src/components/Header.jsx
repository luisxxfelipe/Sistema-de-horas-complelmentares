import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoUEMG from "../assets/images/logo_uemg.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const Header = () => {
  const navigate = useNavigate();

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

        {/* Botão de Dashboard */}
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

        {/* Botão de Registro de Atividade */}
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
      </Toolbar>
    </AppBar>
  );
};

export default Header;
