// ================================================
// SGC - Servidor Node/Express
// - Serve os ficheiros estáticos da pasta Public
// - Usa novidades.html como página inicial
// ================================================

const express = require("express");
const path = require("path");

const app = express();
const publicDir = path.join(__dirname, "Public");

// Servir todos os assets estáticos (HTML, CSS, JS, JSON)
app.use(express.static(publicDir));

// Página inicial -> novidades
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "novidades.html"));
});

// (Opcional) rota de saúde para testes
app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "SGC", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor SGC rodando na porta ${PORT}`);
  console.log(`Aceda em: http://localhost:${PORT}`);
});

