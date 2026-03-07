import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/database.js';
import cardRoutes from './src/routes/cardRoutes.js';
import dotenv from 'dotenv';
import dns from "node:dns/promises"; // 👈 AGREGAR ESTA IMPORTACIÓN

// 🔹 FORZAR DNS A NIVEL GLOBAL (SOLUCIÓN PARA EL ERROR ECONNREFUSED)
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare y Google DNS
console.log('🌐 DNS configurado manualmente a 1.1.1.1 y 8.8.8.8');

// Verificar los DNS actuales (opcional, pero útil para debug)
try {
  const currentDns = await dns.getServers();
  console.log('🔍 DNS actuales:', currentDns);
} catch (error) {
  console.log('No se pudieron obtener los DNS');
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'dist'))); // Webpack build

// 🔹 IMPORTANTE: Servir archivos estáticos desde public/views también
app.use('/views', express.static(path.join(__dirname, 'public/views')));

// Conectar a MongoDB
connectDB();

// API Routes
app.use('/api', cardRoutes);

// 🔹 Rutas de vistas - CORREGIDAS
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views", "index.html"));
});

// Ruta genérica para todas las páginas
app.get("/:page", (req, res) => {
  // Prevenir que esto intercepte rutas de API o archivos estáticos
  const page = req.params.page;
  
  // Lista blanca de páginas permitidas (evita que intenten acceder a archivos del sistema)
  const allowedPages = ['index', 'network', 'security', 'firewall', 'firewall-builder', 'ad', 'gpo', 'system', 'editor', 'logs']; // 👈 AGREGAR 'logs'
  
  if (allowedPages.includes(page)) {
    const filePath = path.join(__dirname, "public/views", `${page}.html`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error sirviendo ${page}:`, err);
        res.status(404).send("Página no encontrada");
      }
    });
  } else {
    // Si no es una página permitida, probablemente es una ruta API o archivo
    res.status(404).send("Página no encontrada");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📂 Sirviendo vistas desde: ${path.join(__dirname, 'public/views')}`);
});