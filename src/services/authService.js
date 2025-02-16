import { supabase } from "./supabase";
import bcrypt from "bcryptjs"; // ✅ Biblioteca para hash seguro de senha

// Função para criar conta (Signup)
export const signup = async (email, senha, nome, matricula, turno, semestre_entrada) => {
  try {
    console.log("🔍 Dados recebidos no signup:", { email, senha, nome, matricula, turno, semestre_entrada });

    // Criar o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password: String(senha).trim(),
    });

    if (error) {
      console.error("❌ Erro ao criar conta:", error.message);
      return { success: false, message: error.message };
    }

    console.log("✅ Usuário criado no Supabase Auth:", data.user);

    // **Hashear a senha antes de salvar no banco** 🔒
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Após criar a conta, salvar informações extras na tabela 'users'
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        email: String(email).trim(),
        senha: senhaHash, // 🔐 Agora a senha está armazenada de forma segura!
        nome: String(nome).trim(),
        matricula: String(matricula).trim(),
        turno: String(turno).trim(),
        semestre_entrada: Number(semestre_entrada),
      },
    ]);

    if (insertError) {
      console.error("❌ Erro ao salvar usuário no banco:", insertError.message);
      return { success: false, message: "Erro ao salvar dados do usuário." };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Erro inesperado no signup:", error.message);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para fazer login
export const login = async (email, senha) => {
  try {
    console.log("🔍 Tentando login com:", { email, senha });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(senha).trim(),
    });

    if (error) {
      console.error("❌ Erro ao fazer login:", error.message);
      return { success: false, message: error.message };
    }

    console.log("✅ Login bem-sucedido:", data);
    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Erro inesperado no login:", error.message);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para fazer logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao fazer logout:", error.message);
    return { success: false, message: error.message };
  }
};

// Função para verificar se o usuário está autenticado
export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("❌ Erro ao obter usuário:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Erro inesperado ao obter usuário:", error.message);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};
