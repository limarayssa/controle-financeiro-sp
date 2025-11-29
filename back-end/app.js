const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/finance", async (req, res) => {
  const { receitas, gastos, metas } = req.body;

  // aqui você monta o prompt para o Gemini
  const prompt = `
    Analise os seguintes dados financeiros:
    Receitas: ${receitas}
    Gastos: ${JSON.stringify(gastos)}
    Metas: ${JSON.stringify(metas)}

    Quero que você:
    1. Liste os gastos fixos.
    2. Calcule quanto sobra para investir.
    3. Divida a receita no modelo 70/20/10.
    4. Faça um resumo do perfil.
  `;

  try {
    // chamada para a API do Gemini
    const response = await fetch("https://api.gemini.com/v1/analyze", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    res.json(data); // devolve para o Angular
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao consultar Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});