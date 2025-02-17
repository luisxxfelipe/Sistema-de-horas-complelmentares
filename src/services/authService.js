// Função para criar conta (Signup)
import { supabase } from "./supabase";

// Função para criar conta (Signup)
export const signup = async (
  email,
  senha,
  nome,
  matricula,
  turno,
  semestre_entrada
) => {
  try {
    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password: String(senha).trim(),
    });

    if (error) {
      console.error("Erro ao criar conta:", error.message);
      return { success: false, message: error.message };
    }

    // Verificar se o usuário foi criado corretamente
    if (!data?.user?.id) {
      return { success: false, message: "Erro ao obter ID do usuário." };
    }

    const userId = data.user.id;

    // Inserir os dados adicionais do usuário na tabela "users"
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId, // Usa o ID gerado pelo Supabase Auth
        email: String(email).trim(),
        nome: String(nome).trim(),
        matricula: String(matricula).trim(),
        turno: String(turno).trim(),
        semestre_entrada: Number(semestre_entrada),
      },
    ]);

    if (insertError) {
      console.error("Erro ao salvar usuário no banco:", insertError.message);
      return { success: false, message: "Erro ao salvar dados do usuário." };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Erro inesperado no signup:", error.message);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para login usando Supabase Auth
export const login = async (email, senha) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(senha).trim(),
    });

    if (error) {
      console.error("Erro ao fazer login:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Erro inesperado no login:", error.message);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer logout:", error.message);
    return { success: false, message: error.message };
  }
};

// Função para obter usuário autenticado
export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Erro ao obter usuário:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Erro inesperado ao obter usuário:", error.message);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};
