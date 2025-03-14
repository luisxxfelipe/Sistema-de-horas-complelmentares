import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  InputAdornment,
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
import CircularProgress from "@mui/material/CircularProgress";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import TimerIcon from "@mui/icons-material/Timer";

const ActivityForm = ({ onActivityAdded }) => {
  const [formData, setFormData] = useState({
    category: "",
    group: "",
    description: "",
    hours: "",
    external: false,
  });

  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);
  const categoriaLabel = "Categoria";
  const grupoLabel = "Grupo";

  // Carregar as categorias ao carregar o componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, nome");

        if (categoriesError) {
        } else {
          setCategories(categoriesData);
        }
      } catch (error) {}
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
            return;
          }

          const categoryId = categoryData.id; // Pegamos o id da categoria

          // Buscar os grupos (tipos) de atividades com base no `category_id`
          const { data: groupsData, error: groupsError } = await supabase
            .from("activity_types")
            .select("id, nome")
            .eq("categoria_id", categoryId); // Usando o category_id para filtrar

          if (groupsError) {
          } else {
            setGroupOptions(groupsData);
            setFormData((prevData) => ({
              ...prevData,
              group: groupsData[0]?.id || "", // Definir grupo padrão
            }));
          }
        } catch (error) {}
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Por favor, selecione um arquivo PDF válido.");
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); 

    const { category, group, description, hours, external } = formData;

    if (!category || !group || !description || !hours || !file) {
      alert(
        "Preencha todos os campos corretamente e anexe o certificado em PDF."
      );
      setLoading(false);
      return;
    }

    try {
      // Buscar categoria_id com base no nome da categoria
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("nome", category)
        .single();

      if (categoryError || !categoryData) {
        alert(`Categoria "${category}" não encontrada no banco.`);
        setLoading(false); 
        return;
      }

      const categoryId = categoryData.id;

      // Buscar tipo_id e limite de horas para o grupo selecionado
      const { data: tipoData, error: tipoError } = await supabase
        .from("activity_types")
        .select("id, hours")
        .eq("categoria_id", categoryId)
        .eq("id", group)
        .single();

      if (tipoError || !tipoData) {
        alert(`O grupo de atividades não foi encontrado.`);
        setLoading(false); 
        return;
      }

      const tipo_id = tipoData.id;
      const maxHorasGrupo = tipoData.hours;

      // Buscar `user_id` do usuário logado
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        alert("Erro ao obter o usuário autenticado.");
        setLoading(false); 
        return;
      }

      const user_id = userData.user.id;

      // Buscar a soma total das horas já cadastradas pelo usuário para esse grupo
      const { data: totalHorasData, error: totalHorasError } = await supabase
        .from("activities")
        .select("horas")
        .eq("user_id", user_id)
        .eq("tipo_id", tipo_id);

      if (totalHorasError) {
        setLoading(false); 
        return;
      }

      // Somar todas as horas cadastradas para aquele grupo
      const horasCadastradas = totalHorasData.reduce(
        (sum, activity) => sum + activity.horas,
        0
      );
      const novasHoras = parseInt(hours, 10);
      const totalHoras = horasCadastradas + novasHoras;

      // Verifica se a soma total ultrapassa o limite permitido
      if (totalHoras > maxHorasGrupo) {
        alert(
          `O limite de horas para este grupo é ${maxHorasGrupo} horas. Você já cadastrou ${horasCadastradas} horas e tentou adicionar mais ${novasHoras}.`
        );
        setLoading(false); 
        return;
      }

      // 📌 Fazer upload do certificado para o Supabase Storage
      const filePath = `certificates/${user_id}-${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        alert("Erro ao fazer upload do certificado.");
        setLoading(false); 
        return;
      }

      // 📌 Obter URL pública do arquivo no Supabase Storage
      const { data: publicUrlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(filePath);

      const certificate_url = publicUrlData.publicUrl;

      // 📌 Inserir atividade no banco de dados com a URL do certificado
      const { error } = await supabase.from("activities").insert([
        {
          user_id,
          tipo_id,
          descricao: description,
          horas: novasHoras,
          externa: external,
          certificado_url: certificate_url, // Salva a URL do certificado
        },
      ]);

      if (error) {
        alert("Erro ao salvar atividade.");
        setLoading(false); 
        return;
      }

      alert("Atividade adicionada com sucesso!");
      if (onActivityAdded) onActivityAdded();

      // Resetar formulário
      setFormData({
        category: "",
        group: "",
        description: "",
        hours: "",
        external: false,
      });
      setFile(null);
    } catch (error) {
      alert("Erro ao processar requisição.");
      setLoading(false); 
    }

    setLoading(false); 
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Seleção de Categoria */}
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="categoria-label">{categoriaLabel}</InputLabel>
            <Select
              labelId="categoria-label"
              name="category"
              value={formData.category}
              onChange={handleChange}
              label={categoriaLabel}
              startAdornment={
                <InputAdornment position="start">
                  <CategoryIcon />
                </InputAdornment>
              }
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
              <InputLabel id="grupo-label">{grupoLabel}</InputLabel>
              <Select
                labelId="grupo-label"
                name="group"
                value={formData.group}
                onChange={handleChange}
                label={grupoLabel}
                startAdornment={
                  <InputAdornment position="start">
                    <GroupIcon />
                  </InputAdornment>
                }
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon />
                </InputAdornment>
              ),
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TimerIcon />
                </InputAdornment>
              ),
            }}
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

        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined" // Define um botão sem preenchimento (outline)
            component="label"
            sx={{
              color: "#3C6178",
              borderColor: "#3C6178", // Define a borda na cor do tema
              "&:hover": { backgroundColor: "#E3F2FD", borderColor: "#3C6178" }, // Efeito hover
              textTransform: "none", // Mantém o texto normal, sem tudo maiúsculo
              display: "flex",
              alignItems: "center",
              gap: 1, // Espaçamento entre ícone e texto
              px: 2, // Padding horizontal menor
            }}
            startIcon={<AttachFileIcon />}
          >
            Anexar Certificado
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {file.name}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 2, backgroundColor: "#3C6178", color: "#FFFFFF" }}
            disabled={loading} // Desativa o botão enquanto está carregando
            startIcon={
              loading ? <CircularProgress size={24} color="inherit" /> : null
            } // Ícone de carregamento
          >
            {loading ? "Enviando..." : "Adicionar Atividade"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityForm;
