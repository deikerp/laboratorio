// test-connection.js
import pool from './db.js';

async function testDatabase() {
  try {
    // Verifica parámetros de la BD
    const res = await pool.query(`
      SELECT 
        datname AS database,
        pg_encoding_to_char(encoding) AS encoding,
        datcollate AS collation
      FROM pg_database 
      WHERE datname = 'acadelia_db'
    `);
    
    console.log('🔍 Configuración de la base de datos:');
    console.table(res.rows[0]);

    // Verifica tablas existentes
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Tablas disponibles:');
    console.table(tables.rows);
    
  } catch (error) {
    console.error('🚨 Error de conexión:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();