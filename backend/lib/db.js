import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

// Configuración del pool de conexiones usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'olakease07',
  database: process.env.DB_NAME || 'laboratorio',
  encoding: 'UTF8',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: false,
});

// Verificación de conexión al iniciar
pool.query('SELECT NOW()')
  .then((res) => {
    console.log('✅ PostgreSQL conectado exitosamente. Hora actual:', res.rows[0].now);
  })
  .catch((err) => {
    console.error('❌ Error crítico de conexión a PostgreSQL:', err);
    process.exit(1);
  });

// Exportar el pool para usarlo en los servicios
export default pool;