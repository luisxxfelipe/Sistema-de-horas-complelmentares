import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Container } from "@mui/material";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  // 🔹 Buscar usuários do Supabase Auth (requer chave de admin)
  const fetchAuthUsers = async () => {
    const { data, error } = await supabase.auth.admin.listUsers(); // 🔴 REQUER CHAVE DE ADMIN

    if (error) {
      console.error("Erro ao buscar usuários do Auth:", error.message);
    } else {
      setUsers(data.users); // Retorna os usuários do Supabase Auth
    }
  };

  useEffect(() => {
    fetchAuthUsers();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Usuários Cadastrados no Supabase Auth
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Criado Em</b></TableCell>
              <TableCell><b>Ações</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDeleteAuthUser(user.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhum usuário cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminPanel;
