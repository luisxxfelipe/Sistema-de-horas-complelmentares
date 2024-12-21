const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Inicialização do app
const app = express();

// Configuração do middleware
app.use(cors());
app.use(bodyParser.json());

// String de conexão do MongoDB Atlas
const mongoURI = "mongodb+srv://luisbancodados:24012003@sistemauemg.tyce8.mongodb.net/SistemaUEMG?retryWrites=true&w=majority";

// Conexão com o MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Conectado ao MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao MongoDB Atlas:", error.message);
  });

// Definição do Schema e Modelo
const activitySchema = new mongoose.Schema({
  description: { type: String, required: true },
  group: { type: String, required: true },
  type: { type: String, required: true },
  hours: { type: Number, required: true },
  external: { type: Boolean, required: true },
});

const Activity = mongoose.model("Activity", activitySchema);

// Endpoints

// Endpoint para buscar todas as atividades
app.get("/api/activities", async (req, res) => {
  try {
    const activities = await Activity.find();
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar atividades", details: error });
  }
});

// Endpoint para adicionar uma nova atividade
app.post("/api/activities", async (req, res) => {
  const { description, group, type, hours, external } = req.body;

  if (!description || !group || !type || typeof hours !== "number" || external === undefined) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const newActivity = new Activity({ description, group, type, hours, external });
    await newActivity.save();
    res.status(201).json({ message: "Atividade adicionada com sucesso", activity: newActivity });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar atividade", details: error });
  }
});

// Endpoint para excluir uma atividade pelo ID
app.delete("/api/activities/:id", async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: "Atividade não encontrada" });
    }
    res.status(200).json({ message: "Atividade removida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover atividade", details: error });
  }
});

// Endpoint para atualizar uma atividade pelo ID
app.put("/api/activities/:id", async (req, res) => {
  const { description, group, type, hours, external } = req.body;

  try {
    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      { description, group, type, hours, external },
      { new: true, runValidators: true }
    );
    if (!updatedActivity) {
      return res.status(404).json({ error: "Atividade não encontrada" });
    }
    res.status(200).json({ message: "Atividade atualizada com sucesso", activity: updatedActivity });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar atividade", details: error });
  }
});

// Rota principal
app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

// Iniciando o servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
