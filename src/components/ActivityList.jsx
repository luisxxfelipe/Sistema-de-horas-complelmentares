import React, { useState } from "react";
import { supabase } from "../services/supabase";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { generatePDF } from "../services/generatePDF";

const ActivityList = ({ activities, setActivities }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Função de exclusão corrigida para remover apenas a atividade certa
  const handleDeleteActivity = async (id) => {
    const { error } = await supabase.from("activities").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir atividade:", error);
      return;
    }

    setActivities((prevActivities) =>
      prevActivities.filter((activity) => activity.id !== id)
    );
  };

   // Estilos padrão dos botões
   const buttonStyle = {
    backgroundColor: "#3C6178",
    color: "#fff",
    "&:hover": { backgroundColor: "#2e4f5e" },
    width: "250px",
    height: "50px",
  };

  // Calcula totais separados por categoria
  const totalHorasPorCategoria = activities.reduce((acc, activity) => {
    const category = activity.categoria || "Não especificado"; // Ajuste para refletir o nome correto da categoria
    acc[category] = (acc[category] || 0) + activity.horas;
    return acc;
  }, {});

  // Calcula totais separados por grupo
  const totalHorasPorGrupo = activities.reduce((acc, activity) => {
    const group = activity.grupo || "Não especificado"; // Ajuste para refletir o nome correto do grupo
    acc[group] = (acc[group] || 0) + activity.horas;
    return acc;
  }, {});

  // Separação entre horas internas e externas
  const totalHorasExternas = activities.reduce(
    (acc, activity) => (activity.externa ? acc + activity.horas : acc), // Correção para usar `horas`
    0
  );
  const totalHorasInternas = activities.reduce(
    (acc, activity) => (!activity.externa ? acc + activity.horas : acc), // Correção para usar `horas`
    0
  );

  // Exportação para CSV agora inclui a categoria
  const exportToCSV = () => {
    const rows = [
      ["Categoria", "Grupo", "Tipo", "Descrição", "Horas", "Externa"],
      ...activities.map((act) => [
        act.categoria || "Não especificado", // Corrigido para usar `categoria`
        act.grupo || "Não especificado", // Corrigido para usar `grupo`
        act.descricao,
        act.horas,
        act.externa ? "Sim" : "Não",
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "atividades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setOpenSnackbar(true);
  };

  const handleGeneratePDF = async (tipoAtividade) => {
    if (activities.length > 0) {
      const activity_id = activities[0]?.id;

      if (activity_id) {
        const { data: activityData, error } = await supabase
          .from("activities")
          .select("user_id")
          .eq("id", activity_id)
          .single();

        if (error) {
          console.error("Erro ao buscar user_id da atividade:", error);
          return;
        }

        const user_id = activityData?.user_id;

        if (user_id) {
          // Buscar todas as atividades do usuário com categoria relacionada
          const { data: activitiesData, error: activitiesError } =
            await supabase
              .from("activities")
              .select(
                `
              *,
              activity_types (
                nome,
                categoria_id
              )
            `
              )
              .eq("user_id", user_id);

          if (activitiesError) {
            console.error("Erro ao buscar atividades:", activitiesError);
            return;
          }

          // Filtrar atividades corretamente
          const filteredActivities = activitiesData.filter((activity) => {
            if (tipoAtividade === "extensao") {
              return activity.activity_types?.categoria_id === 4; // Somente categoria 4
            } else {
              return activity.activity_types?.categoria_id !== 4; // Todas as outras categorias
            }
          });

          if (filteredActivities.length === 0) {
            console.error(
              "Nenhuma atividade encontrada para o tipo:",
              tipoAtividade
            );
            return;
          }

          // Buscar os dados do usuário
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user_id)
            .single();

          if (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
            return;
          }

          // Geração do PDF apenas com as atividades filtradas
          generatePDF(userData, filteredActivities, tipoAtividade);
        } else {
          console.error("Erro: user_id não encontrado.");
        }
      } else {
        console.error("Nenhuma atividade encontrada para gerar o PDF.");
      }
    } else {
      console.error("Nenhuma atividade disponível para o PDF.");
    }
  };

  return (
    <div>
      {/* Tabela de Atividades */}
      <TableContainer component={Paper} sx={{ marginBottom: 4, padding: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Categoria</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Grupo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Horas</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Externa</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.categoria}</TableCell>
                  <TableCell>{activity.grupo}</TableCell>
                  <TableCell>{activity.descricao}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR").format(activity.horas)}{" "}
                    horas
                  </TableCell>
                  <TableCell>{activity.externa}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDeleteActivity(activity.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhuma atividade registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cartões de Totais com altura igual */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {[
          { title: "Total por Categoria", data: totalHorasPorCategoria },
          { title: "Total por Grupo", data: totalHorasPorGrupo },
          {
            title: "Total de Horas",
            data: {
              Internas: totalHorasInternas,
              Externas: totalHorasExternas,
            },
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", marginBottom: 1 }}
                >
                  {item.title}
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {Object.entries(item.data).map(([key, value]) => (
                    <li key={key}>
                      {key}: {new Intl.NumberFormat("pt-BR").format(value)}{" "}
                      horas
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Botões de Ação */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          marginBottom: 2,
        }}
      >
        <Button onClick={exportToCSV} variant="contained" sx={buttonStyle}>
          Exportar CSV - Todas as Atividades
        </Button>
        <Button
          onClick={() => handleGeneratePDF("extensao")}
          variant="contained"
          sx={{ ...buttonStyle, backgroundColor: "#007bff" }}
        >
          Gerar PDF - Atividades de Extensão
        </Button>
        <Button
          onClick={() => handleGeneratePDF("complementares")}
          variant="contained"
          sx={{ ...buttonStyle, backgroundColor: "#6f42c1" }}
        >
          Gerar PDF - Atividades Complementares
        </Button>
      </Box>

      {/* Notificação ao Exportar CSV */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Arquivo CSV exportado com sucesso!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ActivityList;
