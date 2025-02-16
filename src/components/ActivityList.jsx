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
} from "@mui/material";

// import { generatePDF } from "../services/generatePDF";

const ActivityList = ({ activities, setActivities }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  //  Função de exclusão corrigida para remover apenas a atividade certa
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

  //  Calcula totais separados por categoria e grupo
  const totalHorasPorCategoria = activities.reduce((acc, activity) => {
    const category = activity.categoria || "Não especificado";
    acc[category] = (acc[category] || 0) + activity.horas;
    return acc;
  }, {});

  const totalHorasPorGrupo = activities.reduce((acc, activity) => {
    const group = activity.grupo || "Não especificado";
    acc[group] = (acc[group] || 0) + activity.horas;
    return acc;
  }, {});

  //  Separação entre horas internas e externas
  const totalHorasExternas = activities.reduce(
    (acc, activity) => (activity.external ? acc + activity.hours : acc),
    0
  );
  const totalHorasInternas = activities.reduce(
    (acc, activity) => (!activity.external ? acc + activity.hours : acc),
    0
  );

  //  Exportação para CSV agora inclui a categoria
  const exportToCSV = () => {
    const rows = [
      ["Categoria", "Grupo", "Tipo", "Descrição", "Horas", "Externa"],
      ...activities.map((act) => [
        act.category || "Não especificado",
        act.group || "Não especificado",
        act.type || "Não especificado",
        act.description,
        act.hours,
        act.external ? "Sim" : "Não",
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

      {/*  Cartões com totais de horas por categoria e grupo */}
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

      {/*  Botão para exportar CSV */}
      {/* <Button
        onClick={exportToCSV}
        variant="contained"
        color="primary"
        sx={{
          marginTop: 3,
          backgroundColor: "#3C6178",
          "&:hover": { backgroundColor: "#2e4f5e" },
        }}
      >
        Exportar CSV
      </Button>

      <Button
        onClick={() => generatePDF(activities)}
        variant="contained"
        color="secondary"
        sx={{
          marginTop: 2,
          backgroundColor: "#FFD700",
          "&:hover": { backgroundColor: "#E6C200" },
        }}
      >
        Gerar PDF
      </Button> */}

      {/*  Notificação ao exportar CSV */}
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
