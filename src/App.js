import React, { useState } from "react";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import { AppBar, Toolbar, Container, Typography, Box } from "@mui/material";

// Importando a imagem local
import LogoUEMG from "./img/logo_uemg.png";

const App = () => {
  const [activities, setActivities] = useState([]);

  const handleAddActivity = (activity) => {
    const groupTotal = activities
      .filter((act) => act.group === activity.group)
      .reduce((acc, act) => acc + act.hours, 0);

    if (groupTotal + activity.hours > 90) {
      alert(`O grupo ${activity.group} já atingiu o limite de 90 horas.`);
      return;
    }

    const totalHours =
      activities.reduce((acc, act) => acc + act.hours, 0) + activity.hours;
    const externalHours =
      activities
        .filter((act) => act.external)
        .reduce((acc, act) => acc + act.hours, 0) +
      (activity.external ? activity.hours : 0);

    if (externalHours < totalHours * 0.2) {
      alert("Pelo menos 20% das horas devem ser externas.");
      return;
    }

    setActivities((prevActivities) => [...prevActivities, activity]);
  };

  return (
    <div>
      {/* Barra Superior */}
      <AppBar position="static" sx={{ backgroundColor: "#FFFFFF" }}>
        <Toolbar>
          <img
            src={LogoUEMG}
            alt="Logo UEMG"
            style={{ maxHeight: 50, marginRight: 16 }}
          />
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal */}
      <Container maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sistema de lançamento de horas complementares
        </Typography>
        <ActivityForm onAddActivity={handleAddActivity} />
        <ActivityList activities={activities} />
      </Container>

      {/* Rodapé */}
      <Box
        sx={{
          backgroundColor: "#3C6178",
          padding: 4,
          color: "#FFFFFF",
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        <img
          src={LogoUEMG}
          alt="Logo UEMG"
          style={{ maxWidth: 200 }}
        />
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Universidade do Estado de Minas Gerais - Unidade Divinópolis
        </Typography>
      </Box>
    </div>
  );
};

export default App;
