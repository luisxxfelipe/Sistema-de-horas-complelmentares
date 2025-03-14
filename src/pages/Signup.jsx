import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import {
  TextField,
  Button,
  Container,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Box,
  Grid,
} from "@mui/material";

const Signup = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    matricula: "",
    turno: "",
    semestreEntrada: "",
    course_id: "",
    unit_id: "",
  });

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [filteredUnits, setFilteredUnits] = useState([]);
  const cursoLabel = "Curso";
  const turnoLabel = "Turno";

  // Buscar cursos disponíveis
  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("id, nome");
      if (!error) {
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "matricula") {
      // Remove tudo que não for número
      let numericValue = value.replace(/\D/g, "");

      // Adiciona o hífen automaticamente no formato XX-XXXXX
      if (numericValue.length > 2) {
        numericValue = `${numericValue.slice(0, 2)}-${numericValue.slice(
          2,
          7
        )}`;
      }

      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [units, setUnits] = useState([]); // Estado para armazenar as unidades

  useEffect(() => {
    const fetchData = async () => {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, nome");

      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id, nome");

      if (!coursesError) setCourses(coursesData);
      if (!unitsError) setUnits(unitsData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.course_id) {
      const fetchCourseUnits = async () => {
        const { data, error } = await supabase
          .from("course_units")
          .select("unit_id")
          .eq("course_id", formData.course_id);

        if (!error) {
          const unitIds = data.map((item) => item.unit_id);
          const filtered = units.filter((unit) => unitIds.includes(unit.id));
          setFilteredUnits(filtered);
        }
      };

      fetchCourseUnits();
    } else {
      setFilteredUnits([]); // Reseta se nenhum curso for selecionado
    }
  }, [formData.course_id, units]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Regex para validar e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@discente\.uemg\.br$/;
    if (!emailRegex.test(formData.email)) {
      setError("O e-mail deve ser institucional (@discente.uemg.br).");
      return;
    }

    // Regex para validar matrícula (formato XX-XXXXX)
    const matriculaRegex = /^\d{2}-\d{5}$/;
    if (!matriculaRegex.test(formData.matricula)) {
      setError("A matrícula deve estar no formato correto (XX-XXXXX).");
      return;
    }

    const userData = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      senha: formData.senha.trim(),
      matricula: formData.matricula.trim(),
      turno: formData.turno,
      semestreEntrada: parseInt(formData.semestreEntrada, 10) || 1,
      course_id: formData.course_id || null,
      unit_id: formData.unit_id || null,
      role: "aluno",
    };

    try {
      // Criar usuário no Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.senha,
      });

      if (authError || !data?.user) {
        throw new Error("Erro ao criar usuário no Supabase Auth.");
      }

      const userId = data.user.id;

      // Inserir usuário na tabela `users`
      const { error: userInsertError } = await supabase.from("users").insert([
        {
          id: userId,
          email: userData.email,
          nome: userData.nome,
          matricula: userData.matricula,
          turno: userData.turno,
          semestre_entrada: userData.semestreEntrada,
          unit_id: userData.unit_id,
          role: "aluno",
        },
      ]);

      if (userInsertError) {
        throw new Error("Erro ao salvar dados do usuário.");
      }

      // Inserir relação na tabela `user_courses`
      if (userData.course_id) {
        const { error: courseError } = await supabase
          .from("user_courses")
          .insert([
            {
              user_id: userId,
              course_id: userData.course_id,
              matricula: userData.matricula,
              turno: userData.turno,
              semestre_entrada: userData.semestreEntrada,
              unit_id: userData.unit_id,
            },
          ]);

        if (courseError) {
          throw new Error("Erro ao associar usuário ao curso.");
        }
      }

      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#3C6178",
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
            borderRadius: "12px",
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Cadastro de Aluno
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
              label="Matrícula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <Grid container spacing={2}>
              {/* Campo Curso */}
              <Grid item xs={6}>
                <FormControl fullWidth required margin="normal">
                  <InputLabel id="curso-label">{cursoLabel}</InputLabel>
                  <Select
                    labelId="curso-label"
                    id="curso-select"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    label={cursoLabel}
                  >
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.nome}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Carregando cursos...</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Campo Unidade */}
              <Grid item xs={6}>
                <FormControl fullWidth required margin="normal">
                  <InputLabel id="unidade-label">Unidade</InputLabel>
                  <Select
                    labelId="unidade-label"
                    name="unit_id"
                    value={formData.unit_id}
                    onChange={handleChange}
                    label="Unidade"
                    disabled={!formData.course_id} // Desabilita caso nenhum curso seja selecionado
                  >
                    {filteredUnits.length > 0 ? (
                      filteredUnits.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.nome}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Nenhuma unidade disponível</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth required margin="normal">
                  <InputLabel id="turno-label">{turnoLabel}</InputLabel>
                  <Select
                    labelId="turno-label"
                    name="turno"
                    value={formData.turno}
                    onChange={handleChange}
                    label={turnoLabel} // Passamos a constante no label
                  >
                    <MenuItem value="Matutino">Matutino</MenuItem>
                    <MenuItem value="Vespertino">Vespertino</MenuItem>
                    <MenuItem value="Noturno">Noturno</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
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
              </Grid>
            </Grid>

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
              Cadastrar
            </Button>
          </form>

          <Typography sx={{ mt: 2 }}>
            Já tem uma conta?{" "}
            <Link
              to="/login"
              style={{
                color: "#3C6178",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Faça login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
