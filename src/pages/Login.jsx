import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

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
  
    console.log("Tentando login com:", formData); // Debug para verificar os dados enviados
  
    const { success, message } = await login(formData.email, formData.senha); // ✅ Enviar os argumentos separados
  
    if (success) {
      console.log("Login bem-sucedido!");
      navigate("/");
    } else {
      console.error("Erro ao fazer login:", message);
      setError(message);
    }
  };
  

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 3, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

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

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, backgroundColor: "#3C6178", color: "#FFF" }}>
            Entrar
          </Button>
        </form>

        <Typography align="center" sx={{ mt: 2 }}>
          Ainda não tem uma conta? <Link to="/signup">Cadastre-se</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
