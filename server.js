import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Importación correcta del módulo fs

// Importación de rutas
import authRoutes from './backend/routes/authRoutes.js';
import userRoutes from './backend/routes/userRoutes.js'; // Corregido
import pacienteRoutes from './backend/routes/pacienteRoutes.js';
import analisisRoutes from './backend/routes/analisisRoutes.js';
import resultadoRoutes from './backend/routes/resultadoRoutes.js';
import uploadRoutes from './backend/routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Configuración de rutas API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/analisis', analisisRoutes);
app.use('/api/resultados', resultadoRoutes);
app.use('/api/upload', uploadRoutes);

// Definición de rutas de vistas centralizada
const viewRoutes = {
  // Vista principal (login)
  '/': 'vistas/index.html',
  
  // Vistas de autenticación
  '/auth/registro': 'vistas/auth/registro.html',
  '/registro': 'vistas/auth/registro.html', // alias para compatibilidad
  
  // Vistas del dashboard
  '/dashboard': 'vistas/dashboard/dashboard.html',
  '/dashboard/perfil': 'vistas/dashboard/perfil.html',
  '/perfil': 'vistas/dashboard/perfil.html', // alias para compatibilidad
  
  // Estas rutas deben coincidir con los archivos que existen o debes crearlos
  '/dashboard/pacientes': 'vistas/dashboard/pacientes.html',
  '/pacientes': 'vistas/dashboard/pacientes.html', // alias
  
  '/dashboard/examenes': 'vistas/dashboard/examenes-realizados.html',
  '/examenes': 'vistas/dashboard/examenes-realizados.html', // alias
};

// Manejador centralizado de rutas para las vistas
Object.entries(viewRoutes).forEach(([route, view]) => {
  app.get(route, (req, res) => {
    const fullPath = path.join(__dirname, 'frontend', view);
    res.sendFile(fullPath);
  });
});

// Manejo de 404 para rutas no encontradas
app.use((req, res) => {
  // Verificar si existe el archivo 404.html, si no, envía un mensaje simple
  const notFoundPath = path.join(__dirname, 'frontend/vistas/404.html');
  
  // Verifica si el archivo existe antes de enviarlo usando fs importado
  if (fs.existsSync(notFoundPath)) {
    res.status(404).sendFile(notFoundPath);
  } else {
    res.status(404).send('Página no encontrada');
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  Object.keys(viewRoutes).forEach(route => {
    console.log(`  http://localhost:${PORT}${route}`);
  });
});