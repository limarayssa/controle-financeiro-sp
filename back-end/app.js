const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/finance", async (req, res) => {
  const { receita, gasto, metas } = req.body;

  console.log(receita);
  console.log(gasto);
  console.log(metas);

  debugger

  const prompt = `
    Analise os seguintes dados financeiros:
    Receitas: ${JSON.stringify(receita)}
    Gastos: ${JSON.stringify(gasto)}

    E gere um resumo texto de 10 linhas no máximo sobre o perfil do usuário e recomendação de investimento.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // gera o conteúdo
    const result = await model.generateContent(prompt);

    const resposta = result.response.text();

    console.log(resposta);

    res.json({ resposta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao consultar Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});