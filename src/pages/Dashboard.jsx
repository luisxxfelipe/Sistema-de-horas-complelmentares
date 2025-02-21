import React, { useState, useEffect } from "react";
import ActivityList from "../components/ActivityList";
import { Container, Typography, Box } from "@mui/material";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erro ao buscar usuário:", error);
        return;
      }
      if (data?.user) {
        setUserId(data.user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return; // Aguarda o `user_id` estar definido antes de buscar atividades

      const { data, error } = await supabase
        .from("activities")
        .select(
          `
          id,
          descricao,
          horas,
          externa,
          activity_types (
            nome,
            categories:categoria_id ( nome )
          )
        `
        )
        .eq("user_id", userId); // 🔥 FILTRA SOMENTE AS ATIVIDADES DO USUÁRIO LOGADO 🔥

      if (error) {
        console.error("Erro ao buscar atividades:", error);
      } else {
        setActivities(
          data.map((item) => ({
            id: item.id,
            descricao: item.descricao,
            horas: item.horas ?? 0,
            externa: item.externa ? "Sim" : "Não",
            categoria: item.activity_types?.categories?.nome || "Não especificado",
            grupo: item.activity_types?.nome || "Não especificado",
          }))
        );
      }
    };

    fetchActivities();
  }, [userId, navigate]); // Agora depende do `userId`, garantindo que ele seja carregado antes

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ marginTop: 10, marginBottom: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
          Dashboard de Atividades
        </Typography>
        <ActivityList activities={activities} setActivities={setActivities} />
      </Container>
    </Box>
  );
};

export default Dashboard;
