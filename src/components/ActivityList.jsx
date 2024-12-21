import React, { useState } from "react";
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

const ActivityList = ({ activities, setActivities }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleDeleteActivity = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/activities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir a atividade.");
      }

      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity._id !== id)
      );

      alert("Atividade excluída com sucesso!");
    } catch (error) {
      alert(`Erro ao excluir atividade: ${error.message}`);
    }
  };

  const totalHorasGrupo = activities.reduce((acc, activity) => {
    const group = activity.group || "Não especificado";
    acc[group] = (acc[group] || 0) + activity.hours;
    return acc;
  }, {});

  const totalHorasExternas = activities.reduce(
    (acc, activity) => (activity.external ? acc + activity.hours : acc),
    0
  );

  const totalHorasInternas = activities.reduce(
    (acc, activity) => (!activity.external ? acc + activity.hours : acc),
    0
  );

  const exportToCSV = () => {
    const rows = [
      ["Descrição", "Grupo", "Tipo", "Horas", "Externa"],
      ...activities.map((act) => [
        act.description,
        act.group || "Não especificado",
        act.type || "Não especificado",
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
      <Typography variant="h4" gutterBottom sx={{ marginTop: 4 }}>
        Atividades Registradas
      </Typography>

      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Externa</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.group || "Não especificado"}</TableCell>
                  <TableCell>{activity.type || "Não especificado"}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR").format(activity.hours)} horas
                  </TableCell>
                  <TableCell>{activity.external ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDeleteActivity(activity._id)}
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

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total por Grupos</Typography>
              {Object.keys(totalHorasGrupo).length > 0 ? (
                <ul>
                  {Object.entries(totalHorasGrupo).map(([group, total]) => (
                    <li key={group}>
                      {group}: {new Intl.NumberFormat("pt-BR").format(total)} horas
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
                <li>Internas: {new Intl.NumberFormat("pt-BR").format(totalHorasInternas)} horas</li>
                <li>Externas: {new Intl.NumberFormat("pt-BR").format(totalHorasExternas)} horas</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Button
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
