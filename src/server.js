const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../dist")));
app.use("/data", express.static(path.join(__dirname, "../data")));

const dataPath = path.join(__dirname, "../data/cards.json");

// 🔹 Obtener todas las cards
app.get("/api/cards", (req, res) => {
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error al leer los datos" });
    res.json(JSON.parse(data));
  });
});

// 🔹 Agregar nueva card
app.post("/api/cards", (req, res) => {
  const { category, title, desc, command } = req.body;
  if (!category || !title || !desc || !command)
    return res.status(400).json({ message: "Faltan campos" });

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error al leer el archivo" });
    const json = JSON.parse(data);
    if (!json[category]) json[category] = [];
    json[category].push({ title, desc, command, args: [] });

    fs.writeFile(dataPath, JSON.stringify(json, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error al guardar" });
      res.json({ message: `Card agregada en ${category}` });
    });
  });
});

// 🔹 Editar card existente
app.put("/api/cards/:category/:index", (req, res) => {
  const { category, index } = req.params;
  const { title, desc, command } = req.body;

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error al leer archivo" });
    const json = JSON.parse(data);

    if (!json[category] || !json[category][index])
      return res.status(404).json({ message: "Card no encontrada" });

    json[category][index] = { title, desc, command, args: [] };

    fs.writeFile(dataPath, JSON.stringify(json, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error al guardar cambios" });
      res.json({ message: "Card actualizada correctamente" });
    });
  });
});

// 🔹 Eliminar card
app.delete("/api/cards/:category/:index", (req, res) => {
  const { category, index } = req.params;

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error al leer archivo" });
    const json = JSON.parse(data);

    if (!json[category] || !json[category][index])
      return res.status(404).json({ message: "Card no encontrada" });

    json[category].splice(index, 1);

    fs.writeFile(dataPath, JSON.stringify(json, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error al guardar cambios" });
      res.json({ message: "Card eliminada correctamente" });
    });
  });
});

// Rutas de vistas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/index.html"));
});
app.get("/:page", (req, res) => {
  const filePath = path.join(__dirname, `../public/views/${req.params.page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("Página no encontrada");
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});
