import React, { useState } from "react";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import { AppBar, Toolbar, Container, Typography, Box } from "@mui/material";
import LogoUEMG from "./img/logo_uemg.png";

// Regras do PPC
const rules = {
  Ensino: {
    limite: 90,
    tipos: {
      "Estágio Extracurricular": { aproveitamento: 0.7, maxHoras: 40 },
      Monitoria: { aproveitamento: 0.7, maxHoras: 40 },
      "Concursos Acadêmicos": { aproveitamento: 0.7, maxHoras: 50 },
      "Defesas de TCC": { aproveitamento: 0.5, maxHoras: 3 },
      "Cursos Profissionalizantes (Específicos)": {
        aproveitamento: 0.8,
        maxHoras: 40,
      },
      "Cursos Profissionalizantes (Geral)": {
        aproveitamento: 0.2,
        maxHoras: 10,
      },
    },
  },
  Pesquisa: {
    limite: 90,
    tipos: {
      "Iniciação Científica": { aproveitamento: 0.8, maxHoras: 40 },
      "Publicação de Artigos": { aproveitamento: 1, maxHoras: 10 },
      "Capítulo de Livro": { aproveitamento: 1, maxHoras: 7 },
      "Resumos de Artigos": { aproveitamento: 1, maxHoras: 5 },
      "Registro de Patentes": { aproveitamento: 1, maxHoras: 40 },
      "Premiações de Pesquisa": { aproveitamento: 1, maxHoras: 10 },
    },
  },
  Extensão: {
    limite: 90,
    tipos: {
      "Projetos de Extensão": { aproveitamento: 0.1, maxHoras: 40 },
      "Atividades Culturais": { aproveitamento: 0.8, maxHoras: 5 },
      "Visitas Técnicas": { aproveitamento: 1, maxHoras: 40 },
      "Congressos Extensionistas (Ouvinte)": {
        aproveitamento: 0.8,
        maxHoras: 10,
      },
      "Congressos Extensionistas (Apresentador)": {
        aproveitamento: 1,
        maxHoras: 15,
      },
    },
  },
};

const App = () => {
  const [activities, setActivities] = useState([]);

  const handleAddActivity = (activity) => {
    const { group, type, hours } = activity;

    const groupRules = rules[group];
    if (!groupRules) {
      alert(`O grupo "${group}" não é válido.`);
      return;
    }

    const tipoRegras = groupRules.tipos[type];
    if (!tipoRegras) {
      alert(`O tipo "${type}" não é válido para o grupo "${group}".`);
      return;
    }

    const groupTotal = activities
      .filter((act) => act.group === group)
      .reduce((acc, act) => acc + act.hours, 0);

    if (groupTotal >= groupRules.limite) {
      alert(
        `O grupo "${group}" já atingiu o limite de ${groupRules.limite} horas.`
      );
      return;
    }

    const typeTotal = activities
      .filter((act) => act.group === group && act.type === type)
      .reduce((acc, act) => acc + act.hours * tipoRegras.aproveitamento, 0);

    const horasAproveitadas = hours * tipoRegras.aproveitamento;
    if (typeTotal + horasAproveitadas > tipoRegras.maxHoras) {
      const horasRestantes = Math.floor(
        (tipoRegras.maxHoras - typeTotal) / tipoRegras.aproveitamento
      );
      if (horasRestantes > 0) {
        alert(
          `O tipo "${type}" no grupo "${group}" pode aceitar apenas ${horasRestantes} horas restantes.`
        );
        return;
      }
      alert(`O tipo "${type}" no grupo "${group}" já atingiu o limite.`);
      return;
    }

    const horasPermitidas = Math.min(
      hours,
      groupRules.limite - groupTotal,
      (tipoRegras.maxHoras - typeTotal) / tipoRegras.aproveitamento
    );

    if (hours > horasPermitidas) {
      alert(
        `Você tentou adicionar ${hours} horas, mas apenas ${horasPermitidas} horas são permitidas. Ajuste o valor.`
      );
      return;
    }

    setActivities((prevActivities) => [...prevActivities, activity]);
  };

  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: "#3C6178" }}>
        <Toolbar>
          <img
            src={LogoUEMG}
            alt="Logo UEMG"
            style={{ maxHeight: 50, marginRight: 16 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sistema de lançamento de horas complementares
        </Typography>
        <ActivityForm onAddActivity={handleAddActivity} />
        <ActivityList activities={activities} setActivities={setActivities} />
      </Container>

      <Box
        sx={{
          backgroundColor: "#3C6178",
          padding: 4,
          color: "#FFFFFF",
          textAlign: "center",
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={LogoUEMG} alt="Logo UEMG" style={{ maxWidth: 200 }} />
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Sistema teste desenvolvido por Luís Felipe
        </Typography>
      </Box>
    </div>
  );
};

export default App;
