import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Box,
} from "@mui/material";

const ActivityForm = ({ onAddActivity }) => {
  const [formData, setFormData] = useState({
    description: "",
    group: "",
    type: "",
    hours: "",
    external: false,
  });

  // Configuração dos grupos, tipos e limites do PPC
  const groups = {
    Ensino: [
      "Estágio Extracurricular",
      "Monitoria",
      "Concursos Acadêmicos",
      "Defesas de TCC",
      "Cursos Profissionalizantes (Específicos)",
      "Cursos Profissionalizantes (Geral)",
    ],
    Pesquisa: [
      "Iniciação Científica",
      "Publicação de Artigos",
      "Capítulo de Livro",
      "Resumos de Artigos",
      "Registro de Patentes",
      "Premiações de Pesquisa",
      "Congressos de Pesquisa (Ouvinte)",
      "Congressos de Pesquisa (Apresentador)",
    ],
    Extensão: [
      "Projetos de Extensão",
      "Atividades Culturais",
      "Visitas Técnicas",
      "Visitas a Feiras e Exposições",
      "Congressos Extensionistas (Ouvinte)",
      "Congressos Extensionistas (Apresentador)",
      "Cursos de Idiomas",
      "Projeto Empresa Júnior",
    ],
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      formData.description &&
      formData.group &&
      formData.type &&
      formData.hours
    ) {
      const groupTypes = groups[formData.group] || [];
      if (!groupTypes.includes(formData.type)) {
        alert(`O tipo "${formData.type}" não é válido para o grupo "${formData.group}".`);
        return;
      }

      // Adiciona a atividade caso esteja dentro das regras do PPC
      onAddActivity({ ...formData, hours: parseInt(formData.hours, 10) });
      setFormData({
        description: "",
        group: "",
        type: "",
        hours: "",
        external: false,
      });
    } else {
      alert("Preencha todos os campos corretamente.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Campo de Descrição */}
        <Grid item xs={12}>
          <TextField
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva a atividade"
            fullWidth
            required
          />
        </Grid>

        {/* Campo de Grupo */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Grupo</InputLabel>
            <Select
              name="group"
              value={formData.group}
              onChange={handleChange}
              label="Grupo"
            >
              {Object.keys(groups).map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Campo de Tipo */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Tipo"
              disabled={!formData.group}
            >
              {(groups[formData.group] || []).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Campo de Horas */}
        <Grid item xs={12} sm={6}>
          <TextField
            type="number"
            label="Horas"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            placeholder="Digite as horas"
            fullWidth
            required
          />
        </Grid>

        {/* Checkbox Atividade Externa */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="external"
                checked={formData.external}
                onChange={handleChange}
              />
            }
            label="Atividade Externa"
          />
        </Grid>

        {/* Botão de Submissão */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: "#3C6178",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#2e4f5e", // Cor mais escura ao passar o mouse
              },
            }}
          >
            Adicionar Atividade
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityForm;
