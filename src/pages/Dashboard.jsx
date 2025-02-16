import React, { useState, useEffect } from "react";
import ActivityList from "../components/ActivityList";
import { Container, Typography } from "@mui/material";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    const { data, error } = await supabase.from("activities").select(`
        id,
        descricao,
        horas,
        externa,
        activity_types:tipo_id (
          nome,
          categories:categoria_id (
            nome
          )
        )
      `);

    if (error) {
      console.error("Erro ao buscar atividades:", error);
    } else {
      console.log("Atividades carregadas:", data); // Debug no console

      setActivities(
        data.map((item) => ({
          id: item.id,
          descricao: item.descricao,
          horas: item.horas ?? 0, // Evita NaN
          externa: item.externa ? "Sim" : "Não",
          tipo: item.activity_types?.nome || "Não especificado",
          categoria:
            item.activity_types?.categories?.nome || "Não especificado",
          grupo: item.activity_types?.categories?.nome || "Não especificado", // Pega o grupo corretamente
        }))
      );
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [navigate]);

  return (
    <div>
      <Header />

      <Container maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Dashboard de Atividades
        </Typography>
        <ActivityList activities={activities} setActivities={setActivities} />
      </Container>
    </div>
  );
};

export default Dashboard;
