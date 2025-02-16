import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
import { supabase } from "../services/supabase";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generatePDF = async (userData, activities, tipoAtividade) => {
  const titulo =
    tipoAtividade === "extensao"
      ? "FICHA DE AVALIAÇÃO DE ATIVIDADES DE EXTENSÃO"
      : "FICHA DE AVALIAÇÃO DE ATIVIDADES COMPLEMENTARES";

  // Garantir que o semestre seja tratado corretamente
  const semestre = userData?.semestre_entrada || "Não informado";

  // Log de dados para depuração
  console.log("Dados do usuário:", userData);
  console.log("Atividades:", activities);

  // Recupera os nomes das atividades a partir do tipo_id
  const activityTypes = await Promise.all(
    activities.map(async (act) => {
      const { data: activityTypeData, error } = await supabase
        .from("activity_types") // Tabela activity_types
        .select("nome")
        .eq("id", act.tipo_id)  // Usando tipo_id para obter o nome correto da atividade
        .single(); // Assume que o tipo_id é único

      if (error) {
        console.error("Erro ao recuperar tipo de atividade:", error);
        return "Nome não definido"; // Retorna um valor padrão caso haja erro
      }

      return activityTypeData?.nome || "Nome não definido"; // Retorna o nome da atividade
    })
  );

  const docDefinition = {
    content: [
      {
        text: "UNIVERSIDADE DO ESTADO DE MINAS GERAIS – UEMG",
        style: "header",
      },
      { text: "CURSO DE ENGENHARIA DE COMPUTAÇÃO", style: "subheader" },
      { text: titulo, style: "title" },
      { text: "\nEstudante: " + userData.nome, style: "text" },
      { text: "Matrícula: " + userData.matricula, style: "text" },
      { text: "Turno: " + userData.turno, style: "text" },

      // Ano/Semestre de Entrada com a linha ajustada
      {
        columns: [
          { text: "Ano/Semestre de Entrada: " + semestre, style: "text" },
          {
            text: "______________________________ de ______________________ de ____________, ______________",
            style: "line",
            alignment: "center",
          },
        ],
      },

      { text: "\n", style: "text" },

      // Layout da linha de Local e Assinatura
      {
        columns: [
          {
            text: "Local e Data",
            style: "text",
            alignment: "left",
          },
          {
            text: "Assinatura",
            style: "text",
            alignment: "right",
          },
        ],
      },

      { text: "\n\n", style: "text" },

      // Atividades de Extensão ou Complementares
      {
        text:
          tipoAtividade === "extensao"
            ? "Atividades de Extensão (A)"
            : "Atividades de Ensino (B)",
        style: "sectionHeader",
      },
      {
        table: {
          headerRows: 1,
          widths: ["50%", "25%", "25%"],
          body: [
            [
              { text: "Atividade", style: "tableHeader" },
              { text: "Quantidade", style: "tableHeader" },
              { text: "*Total", style: "tableHeader" },
            ],
            ...activities.map((act, index) => [
              activityTypes[index] || "Atividade não definida",  // Atividade
              act.horas || 0,                                      // Quantidade
              act.horas || 0,                                      // Total
            ]),
          ],
        },
      },

      { text: "Subtotal (máximo 90h)", style: "subtotal" },

      // Assinatura (Ajustando para ocupar toda a largura e os nomes corretos abaixo)
      {
        columns: [
          {
            text: "Local e Data", // Ajuste do nome
            style: "text",
            alignment: "left",
          },
          {
            text: "Assinatura", // Ajuste do nome
            style: "text",
            alignment: "right",
          },
        ],
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true, alignment: "center" },
      subheader: { fontSize: 12, bold: true, alignment: "center" },
      title: { fontSize: 12, bold: true, margin: [0, 10], alignment: "center" },
      text: { fontSize: 10 },
      line: { fontSize: 10, margin: [0, 10], alignment: "center" },
      sectionHeader: { fontSize: 11, bold: true, margin: [0, 10] },
      tableHeader: { bold: true, fontSize: 10, fillColor: "#fff" },
      subtotal: {
        bold: true,
        fontSize: 10,
        margin: [0, 10],
        alignment: "right",
      },
    },
  };

  pdfMake.createPdf(docDefinition).download("relatorio.pdf");
};
