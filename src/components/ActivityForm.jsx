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
    description: '',
    group: '',
    type: '',
    hours: '',
    external: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.description && formData.group && formData.type && formData.hours) {
      onAddActivity({ ...formData, hours: parseInt(formData.hours, 10) });
      setFormData({
        description: '',
        group: '',
        type: '',
        hours: '',
        external: false,
      });
    } else {
      alert('Preencha todos os campos');
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
              <MenuItem value="Ensino">Ensino</MenuItem>
              <MenuItem value="Pesquisa">Pesquisa</MenuItem>
              <MenuItem value="Extensão">Extensão</MenuItem>
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
            >
              <MenuItem value="Monitoria">Monitoria</MenuItem>
              <MenuItem value="Aulas Ministradas">Aulas Ministradas</MenuItem>
              <MenuItem value="Publicação de Artigos">Publicação de Artigos</MenuItem>
              <MenuItem value="Projetos de Extensão">Projetos de Extensão</MenuItem>
              <MenuItem value="Atividades Culturais">Atividades Culturais</MenuItem>
              <MenuItem value="Visitas Técnicas">Visitas Técnicas</MenuItem>
              <MenuItem value="Participação em Congressos">Participação em Congressos</MenuItem>
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
      backgroundColor: '#3C6178',
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: '#2e4f5e', // Cor mais escura ao passar o mouse
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
