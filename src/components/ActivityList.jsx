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
        act.tipo || "Não especificado", // Corrigido para usar `tipo`
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
      // Pega o id da primeira atividade
      const activity_id = activities[0]?.id;

      if (activity_id) {
        // Buscar o user_id associado à atividade
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
          // Buscar todas as atividades do usuário
          const { data: activitiesData, error: activitiesError } =
            await supabase
              .from("activities")
              .select("*")
              .eq("user_id", user_id);

          if (activitiesError) {
            console.error("Erro ao buscar atividades:", activitiesError);
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

          // Gerar o PDF com dados de usuário e atividades
          generatePDF(userData, activitiesData, tipoAtividade);
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
      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Externa</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.categoria}</TableCell> {/* Categoria */}
                  <TableCell>{activity.grupo}</TableCell> {/* Grupo correto */}
                  <TableCell>{activity.tipo}</TableCell> {/* Tipo */}
                  <TableCell>{activity.descricao}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR").format(activity.horas)}{" "}
                    horas
                  </TableCell>
                  <TableCell>{activity.externa}</TableCell>
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
                <TableCell colSpan={7} align="center">
                  Nenhuma atividade registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cartões com totais de horas por categoria e grupo */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total por Categoria</Typography>
              {Object.keys(totalHorasPorCategoria).length > 0 ? (
                <ul>
                  {Object.entries(totalHorasPorCategoria).map(
                    ([category, total]) => (
                      <li key={category}>
                        {category}:{" "}
                        {new Intl.NumberFormat("pt-BR").format(total)} horas
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <Typography>Nenhuma categoria registrada.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total por Grupo</Typography>
              {Object.keys(totalHorasPorGrupo).length > 0 ? (
                <ul>
                  {Object.entries(totalHorasPorGrupo).map(([group, total]) => (
                    <li key={group}>
                      {group}: {new Intl.NumberFormat("pt-BR").format(total)}{" "}
                      horas
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>Nenhum grupo registrado.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total de Horas</Typography>
              <ul>
                <li>
                  Internas:{" "}
                  {new Intl.NumberFormat("pt-BR").format(totalHorasInternas)}{" "}
                  horas
                </li>
                <li>
                  Externas:{" "}
                  {new Intl.NumberFormat("pt-BR").format(totalHorasExternas)}{" "}
                  horas
                </li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 2 }}>
        {/* Botão para exportar CSV */}
        <Button
          onClick={exportToCSV}
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: "#3C6178",
            "&:hover": { backgroundColor: "#2e4f5e" },
            width: "250px", // Garantindo a largura dos botões
            height: "50px", // Garantindo a altura dos botões
          }}
        >
          Exportar CSV - Todas as atividades registradas
        </Button>

        <Button
          onClick={() => handleGeneratePDF("extensao")}
          variant="contained"
          color="primary"
          sx={{
            width: "250px", // Garantindo a largura dos botões
            height: "50px", // Garantindo a altura dos botões
          }}
        >
          Gerar PDF - Atividades de Extensão
        </Button>

        <Button
          onClick={() => handleGeneratePDF("complementares")}
          variant="contained"
          color="secondary"
          sx={{
            width: "250px", // Garantindo a largura dos botões
            height: "50px", // Garantindo a altura dos botões
          }}
        >
          Gerar PDF - Atividades Complementares
        </Button>
      </Box>

      {/* Notificação ao exportar CSV */}
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
