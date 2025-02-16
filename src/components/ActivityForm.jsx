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
import { supabase } from "../services/supabase";

const ActivityForm = ({ onActivityAdded }) => {
  const [formData, setFormData] = useState({
    category: "",
    group: "",
    type: "",
    description: "",
    hours: "",
    external: false,
  });

  // Configuração das categorias e grupos
  const categories = {
    "Atividades Complementares": {
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
    },
    "Atividades de Extensão": {
      Extensão: [
        "Projeto de Extensão",
        "Comissão Organizadora de Eventos",
        "Participação em Projetos de Responsabilidade Social",
        "Instrutor de Cursos e Minicursos Abertos à Sociedade",
        "Palestrante (Eventos Abertos à Comunidade)",
        "Monitoria Acadêmica",
        "Organizador de Atividades Culturais",
        "Organizador de Visitas Técnicas",
        "Organizador de Visitas a Feiras e Exposições",
        "Projeto Empresa Júnior (Extensão)",
      ],
    },
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "category" && { group: "", type: "" }), // Reseta grupo e tipo ao mudar a categoria
      ...(name === "group" && { type: "" }), // Reseta tipo ao mudar o grupo
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { category, group, type, description, hours, external } = formData;

    if (!category || !group || !type || !description || !hours) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    try {
      // Buscar `tipo_id` correspondente no Supabase
      const { data: tipoData, error: tipoError } = await supabase
        .from("activity_types")
        .select("id")
        .eq("nome", type)
        .single();

      if (tipoError || !tipoData) {
        console.error("Erro ao buscar tipo de atividade:", tipoError);
        alert(`O tipo "${type}" não foi encontrado no banco.`);
        return;
      }

      const tipo_id = tipoData.id;

      // Buscar `user_id` do usuário logado
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Erro ao buscar usuário:", userError);
        alert("Erro ao obter o usuário autenticado.");
        return;
      }

      const user_id = userData.user.id;

      // Inserir no Supabase
      const { data, error } = await supabase.from("activities").insert([
        {
          user_id,
          tipo_id,
          descricao: description,
          horas: parseInt(hours, 10),
          externa: external,
        },
      ]);

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        return;
      }

      console.log("Atividade adicionada:", data);
      if (onActivityAdded) onActivityAdded(); // Atualiza a lista de atividades no Dashboard
      setFormData({
        category: "",
        group: "",
        type: "",
        description: "",
        hours: "",
        external: false,
      });
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Seleção de Categoria */}
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Categoria</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {Object.keys(categories).map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Seleção de Grupo */}
        {formData.category && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Grupo</InputLabel>
              <Select
                name="group"
                value={formData.group}
                onChange={handleChange}
              >
                {Object.keys(categories[formData.category]).map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Seleção de Tipo */}
        {formData.group && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select name="type" value={formData.type} onChange={handleChange}>
                {categories[formData.category][formData.group]?.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Campo de Descrição */}
        <Grid item xs={12}>
          <TextField
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>

        {/* Campo de Horas */}
        <Grid item xs={12} sm={6}>
          <TextField
            type="number"
            label="Horas"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
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
            sx={{ mt: 2, backgroundColor: "#3C6178", color: "#FFFFFF" }}
          >
            Adicionar Atividade
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityForm;
