import React, { useState, useEffect } from "react";
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
    description: "",
    hours: "",
    external: false,
  });

  const [categories, setCategories] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);

  // Carregar as categorias ao carregar o componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, nome");

        if (categoriesError) {
          console.error("Erro ao buscar categorias:", categoriesError);
        } else {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, []);

  // Carregar os grupos de atividades com base na categoria selecionada
  useEffect(() => {
    const fetchGroups = async () => {
      if (formData.category) {
        try {
          // Buscar categoria_id usando o nome da categoria
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("id")
            .eq("nome", formData.category) // Buscando pela categoria selecionada
            .single();

          if (categoryError || !categoryData) {
            console.error("Erro ao buscar categoria:", categoryError);
            return;
          }

          const categoryId = categoryData.id; // Pegamos o id da categoria

          // Buscar os grupos (tipos) de atividades com base no `category_id`
          const { data: groupsData, error: groupsError } = await supabase
            .from("activity_types")
            .select("id, nome")
            .eq("categoria_id", categoryId); // Usando o category_id para filtrar

          if (groupsError) {
            console.error("Erro ao buscar grupos:", groupsError);
          } else {
            setGroupOptions(groupsData);
            setFormData((prevData) => ({
              ...prevData,
              group: groupsData[0]?.id || "", // Definir grupo padrão
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar grupos:", error);
        }
      }
    };

    fetchGroups();
  }, [formData.category]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "category" && { group: "" }), // Reseta grupo ao mudar a categoria
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { category, group, description, hours, external } = formData;

    if (!category || !group || !description || !hours) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    try {
      // Buscar categoria_id com base no nome da categoria
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("nome", category);  // Buscando as categorias com o nome fornecido

      if (categoryError || !categoryData || categoryData.length === 0) {
        console.error("Erro ao buscar categoria:", categoryError);
        alert(`Categoria "${category}" não encontrada no banco.`);
        return;
      }

      const categoryId = categoryData[0]?.id; // Pegamos o primeiro item da lista se houver mais de um

      // Buscar tipo_id com base no grupo selecionado
      const { data: tipoData, error: tipoError } = await supabase
        .from("activity_types")
        .select("id, hours")
        .eq("categoria_id", categoryId) // Agora filtramos pelo `category_id`
        .eq("id", group) // Associando o tipo de atividade com o grupo correto
        .single();  // Garantimos que apenas um item seja retornado

      if (tipoError || !tipoData) {
        console.error("Erro ao buscar tipo de atividade:", tipoError);
        alert(`O grupo de atividades não foi encontrado.`);
        return;
      }

      const tipo_id = tipoData.id;
      const tipo_horas = tipoData.hours; // Horas do tipo de atividade

      if (hours > tipo_horas) {
        alert(
          `O limite de horas para o grupo de atividades é ${tipo_horas} horas.`
        );
        return;
      }

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
      const {error } = await supabase.from("activities").insert([
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

      if (onActivityAdded) onActivityAdded(); // Atualiza a lista de atividades no Dashboard
      setFormData({
        category: "",
        group: "",
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
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.nome}>
                  {cat.nome}
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
                {groupOptions.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.nome}
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
