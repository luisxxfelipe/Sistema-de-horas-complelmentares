import React from "react";
import { Container, Typography, Box, Toolbar } from "@mui/material";
import ActivityForm from "../components/ActivityForm";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const RegisterActivity = () => {
  const navigate = useNavigate();

  const handleActivityAdded = () => {
    navigate("/dashboard");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#3C6178" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0, // Remove o padding
          backgroundColor: "#3C6178",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            width: "100%",
            minHeight: "100vh",
            borderTopLeftRadius: "60px",
            borderBottomLeftRadius: "60px",
            padding: 4,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Toolbar />
          <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
              Cadastro de Atividade
            </Typography>
            <ActivityForm onActivityAdded={handleActivityAdded} />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterActivity;
