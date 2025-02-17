import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { TextField, Button, Container, Typography, Paper, Box } from "@mui/material";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const { success, message } = await login(formData.email, formData.senha);

    if (success) {
      navigate("/");
    } else {
      console.error("Erro ao fazer login:", message);
      setError(message);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#3C6178", // Azul claro suave
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            textAlign: "center",
            borderRadius: "12px", // Adiciona bordas arredondadas
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Login
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#3C6178",
                color: "#FFF",
                "&:hover": { backgroundColor: "#2e4f5e" },
              }}
            >
              Entrar
            </Button>
          </form>

          <Typography sx={{ mt: 2 }}>
            Ainda não tem uma conta?{" "}
            <Link to="/signup" style={{ color: "#3C6178", fontWeight: "bold", textDecoration: "none" }}>
              Cadastre-se
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
