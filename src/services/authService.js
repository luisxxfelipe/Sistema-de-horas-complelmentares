// Função para criar conta (Signup)
import { supabase } from "./supabase";

// Função para criar conta (Signup)
export const signup = async (
  email,
  senha,
  nome,
  matricula,
  turno,
  semestre_entrada,
  role = "aluno" // Define "aluno" como padrão
) => {
  try {
    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password: String(senha).trim(),
    });

    if (error) {
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
        id: userId,
        email: String(email).trim(),
        nome: String(nome).trim(),
        matricula: String(matricula).trim(),
        turno: String(turno).trim(),
        semestre_entrada: Number(semestre_entrada),
        role: String(role).trim(), // Define a role do usuário
      },
    ]);

    if (insertError) {
      return { success: false, message: "Erro ao salvar dados do usuário." };
    }

    // Salva o token de autenticação e a role no localStorage
    if (data?.session?.access_token) {
      localStorage.setItem("authToken", data.session.access_token);
      localStorage.setItem("userRole", role); // Salva a role do usuário
    }

    return { success: true, user: data.user };
  } catch (error) {
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
      return { success: false, message: error.message };
    }

    // Buscar a role do usuário no banco de dados
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .single();

    if (userError) {
      return { success: false, message: userError.message };
    }

    // Salva o token de autenticação e a role no localStorage
    if (data?.session?.access_token) {
      localStorage.setItem("authToken", data.session.access_token);
      localStorage.setItem("userRole", userData?.role || "aluno");
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Limpa o localStorage ao deslogar
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Função para obter usuário autenticado
// Função para obter usuário autenticado e garantir que a role está atualizada
export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { success: false, message: error.message };

    if (!data.user)
      return { success: false, message: "Usuário não autenticado." };

    // Buscar a role atualizada no banco
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id) // Buscando pelo ID do usuário
      .single();

    if (roleError) return { success: false, message: roleError.message };

    const userRole = userData?.role || "aluno";

    // Atualiza no localStorage para garantir sincronização
    localStorage.setItem("userRole", userRole);

    return { success: true, user: data.user, role: userRole };
  } catch (error) {
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};
