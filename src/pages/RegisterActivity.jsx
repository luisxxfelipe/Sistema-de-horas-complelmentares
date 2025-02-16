import React from "react";
import { Container, Typography } from "@mui/material";
import ActivityForm from "../components/ActivityForm";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const RegisterActivity = () => {
  const navigate = useNavigate();

  const handleActivityAdded = () => {
    navigate("/dashboard"); // Redireciona para o Dashboard após cadastrar
  };

  return (
    <div>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Cadastro de Atividade
        </Typography>
        <ActivityForm onActivityAdded={handleActivityAdded} />
      </Container>
      /
    </div>
  );
};

export default RegisterActivity;
