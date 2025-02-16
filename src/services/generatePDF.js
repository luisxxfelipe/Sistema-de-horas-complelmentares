import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generatePDF = (userData, activities) => {
  const docDefinition = {
    content: [
      { text: "UNIVERSIDADE DO ESTADO DE MINAS GERAIS – UEMG", style: "header" },
      { text: "CURSO DE ENGENHARIA DE COMPUTAÇÃO", style: "subheader" },
      { text: "FICHA DE AVALIAÇÃO DE ATIVIDADES COMPLEMENTARES", style: "title" },
      { text: "\nEstudante: " + userData.nome, style: "text" },
      { text: "Matrícula: " + userData.matricula, style: "text" },
      { text: "Turno: " + userData.turno, style: "text" },
      { text: "Ano/Semestre de Entrada: " + userData.semestre, style: "text" },
      { text: "\n____________________________________________________", style: "line" },
      { text: "Local e Data", style: "text", alignment: "left" },
      { text: "Assinatura", style: "text", alignment: "right" },
      { text: "\n\n", style: "text" },
      
      // Atividades de Extensão
      { text: "Atividades de Extensão (A)", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: ["50%", "25%", "25%"],
          body: [
            [{ text: "Atividade", style: "tableHeader" }, 
             { text: "Quantidade", style: "tableHeader" }, 
             { text: "*Total", style: "tableHeader" }],
            ...activities
              .filter((act) => act.category === "Atividades de Extensão")
              .map((act) => [act.type, act.hours, act.hours])
          ],
        },
      },
      { text: "Subtotal (máximo 90h)", style: "subtotal" },

      // Atividades de Ensino
      { text: "\nAtividades de Ensino (B)", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: ["50%", "25%", "25%"],
          body: [
            [{ text: "Atividade", style: "tableHeader" }, 
             { text: "Quantidade", style: "tableHeader" }, 
             { text: "*Total", style: "tableHeader" }],
            ...activities
              .filter((act) => act.category === "Atividades Complementares")
              .map((act) => [act.type, act.hours, act.hours])
          ],
        },
      },
      { text: "Subtotal (máximo 90h)", style: "subtotal" },
    ],
    styles: {
      header: { fontSize: 14, bold: true, alignment: "center" },
      subheader: { fontSize: 12, bold: true, alignment: "center" },
      title: { fontSize: 12, bold: true, margin: [0, 10], alignment: "center" },
      text: { fontSize: 10 },
      line: { fontSize: 10, margin: [0, 10], alignment: "center" },
      sectionHeader: { fontSize: 11, bold: true, margin: [0, 10] },
      tableHeader: { bold: true, fontSize: 10, fillColor: "#CCCCCC" },
      subtotal: { bold: true, fontSize: 10, margin: [0, 10], alignment: "right" },
    },
  };

  pdfMake.createPdf(docDefinition).download("relatorio.pdf");
};
