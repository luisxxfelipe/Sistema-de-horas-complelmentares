const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/atividades", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Erro de conexão:"));
db.once("open", () => {
  console.log("Conectado ao MongoDB com sucesso!");
  mongoose.disconnect(); // Fecha a conexão após o teste
});
