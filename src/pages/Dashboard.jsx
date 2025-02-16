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
        tipo_id (
          nome,
          categoria_id
        ),
        categories:tipo_id(categoria_id, nome)
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
          tipo: item.tipo_id?.nome || "Não especificado", // Nome do tipo de atividade
          categoria: item.tipo_id?.categoria_id || "Não especificado", // ID da categoria
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
