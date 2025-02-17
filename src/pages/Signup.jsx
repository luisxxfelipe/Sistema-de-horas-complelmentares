import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authService";
import { TextField, Button, Container, Typography, MenuItem, Select, FormControl, InputLabel, Paper, Box } from "@mui/material";

const Signup = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    matricula: "",
    turno: "",
    semestreEntrada: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const userData = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      senha: formData.senha.trim(),
      matricula: formData.matricula.trim(),
      turno: formData.turno,
      semestreEntrada: parseInt(formData.semestreEntrada, 10),
    };

    const { success, message } = await signup(
      userData.email,
      userData.senha,
      userData.nome,
      userData.matricula,
      userData.turno,
      userData.semestreEntrada
    );

    if (success) {
      alert("Conta criada com sucesso!");
      navigate("/login");
    } else {
      setError(message);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#3C6178", // Fundo azul claro suave
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            textAlign: "center",
            borderRadius: "12px", // Bordas arredondadas
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Cadastro
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
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
            <TextField
              label="Matrícula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <FormControl fullWidth required margin="normal">
              <InputLabel>Turno</InputLabel>
              <Select name="turno" value={formData.turno} onChange={handleChange}>
                <MenuItem value="Matutino">Matutino</MenuItem>
                <MenuItem value="Vespertino">Vespertino</MenuItem>
                <MenuItem value="Noturno">Noturno</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Semestre de Entrada"
              name="semestreEntrada"
              type="number"
              value={formData.semestreEntrada}
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
              Cadastrar
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
