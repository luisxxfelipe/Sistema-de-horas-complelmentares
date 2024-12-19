import React from "react";
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
} from "@mui/material";

const ActivityList = ({ activities }) => {
  // Total de horas por grupo
  const totalHorasGrupo = activities.reduce((acc, activity) => {
    const group = activity.group || "Sem Informação"; // Define valor padrão
    acc[group] = (acc[group] || 0) + activity.hours;
    return acc;
  }, {});

  // Calculando total de horas externas e internas
  const totalHorasExternas = activities.reduce(
    (acc, activity) => (activity.external ? acc + activity.hours : acc),
    0
  );
  const totalHorasInternas = activities.reduce(
    (acc, activity) => (!activity.external ? acc + activity.hours : acc),
    0
  );

  // Função para exportar os dados para CSV
  const exportToCSV = () => {
    const rows = [
      ["Descrição", "Grupo", "Tipo", "Horas", "Externa"],
      ...activities.map((act) => [
        act.description,
        act.group || "Sem Informação",
        act.type || "Sem Informação",
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
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ marginTop: 4 }}>
        Atividades Registradas
      </Typography>

      {/* Tabela de atividades */}
      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Externa</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.group || "Sem Informação"}</TableCell>
                  <TableCell>{activity.type || "Sem Informação"}</TableCell>
                  <TableCell>{activity.hours}</TableCell>
                  <TableCell>{activity.external ? "Sim" : "Não"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhuma atividade registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totais em Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total por Grupos</Typography>
              {Object.keys(totalHorasGrupo).length > 0 ? (
                <ul>
                  {Object.entries(totalHorasGrupo).map(([group, total]) => (
                    <li key={group}>
                      {group}: {total} horas
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
                <li>Internas: {totalHorasInternas} horas</li>
                <li>Externas: {totalHorasExternas} horas</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botão para exportar os dados */}
      <Button
        onClick={exportToCSV}
        variant="contained"
        color="primary"
        sx={{ marginTop: 3 }}
      >
        Exportar CSV
      </Button>
    </div>
  );
};

export default ActivityList;
