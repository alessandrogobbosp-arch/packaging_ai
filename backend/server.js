import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GROK_API_KEY = process.env.GROK_API_KEY;

app.post("/ask", async (req, res) => {
  const { problem, manual } = req.body;

  if (!problem) {
    return res.status(400).json({ error: "Problema mancante" });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3",
        messages: [
          {
            role: "system",
            content: `Sei un tecnico di manutenzione esperto. Rispondi solo basandoti su questo manuale:\n\n${manual || "Nessun manuale fornito."}`,
          },
          {
            role: "user",
            content: problem,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Risposta Grok:", JSON.stringify(data, null, 2)); // Log per debug

    if (data.choices && data.choices[0]) {
      res.json({ answer: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Risposta non valida da Grok", details: data });
    }
  } catch (err) {
    console.error("Errore:", err);
    res.status(500).json({ error: "Errore nella richiesta a Grok" });
  }
});

app.listen(3001, () => {
  console.log("Backend in ascolto su http://localhost:3001");
});
