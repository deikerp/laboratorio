import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar variables de entorno
dotenv.config();

// Obtener __dirname equivalente en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo SQL de esquema de base de datos
const sqlPath = path.join(__dirname, 'bd.sql');
const schema = fs.readFileSync(sqlPath, 'utf8');

// Configuración de conexión
const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'olakease07',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres' // Primero nos conectamos a la base postgres para poder crear nuestra BD
};

// Crear un pool de conexión a postgres para administración
const adminPool = new pg.Pool(config);

// Nombre de la base de datos del sistema
const dbName = process.env.DB_NAME || 'laboratorio';

/**
 * Función principal para inicializar la base de datos
 */
async function initDatabase() {
  try {
    console.log('✨ Iniciando el proceso de configuración de la base de datos...');
    
    // 1. Verificar si la base de datos existe
    const dbExists = await checkDatabaseExists();
    
    if (!dbExists) {
      console.log(`🔄 La base de datos '${dbName}' no existe. Creando...`);
      await createDatabase();
      console.log(`✅ Base de datos '${dbName}' creada correctamente.`);
    } else {
      console.log(`✅ La base de datos '${dbName}' ya existe.`);
    }
    
    // 2. Conectarse a la base de datos del sistema
    const systemPool = new pg.Pool({
      ...config,
      database: dbName
    });
    
    // 3. Ejecutar el script SQL para crear tablas si no existen
    console.log('🔄 Verificando y creando tablas...');
    
    try {
      // Mejorado: primero crear las tablas y estructura base
      await executeSchemaCreation(systemPool);
      console.log('✅ Estructura de tablas creada correctamente.');
      
      // Verificar si ya hay datos cargados para evitar duplicados
      console.log('🔄 Verificando datos iniciales...');
      const estadosExist = await checkIfDataExists(systemPool, 'estado');
      const municipiosExist = await checkIfDataExists(systemPool, 'municipio');
      
      if (!estadosExist) {
        console.log('🔄 Insertando datos de estados...');
        await insertEstados(systemPool);
        console.log('✅ Datos de estados insertados correctamente.');
      } else {
        console.log('✅ Los datos de estados ya existen.');
      }
      
      if (!municipiosExist) {
        console.log('🔄 Insertando datos de municipios...');
        await insertMunicipios(systemPool);
        console.log('✅ Datos de municipios insertados correctamente.');
      } else {
        console.log('✅ Los datos de municipios ya existen.');
      }
      
      // Insertar tipos de usuario si no existen
      await ensureTiposUsuarioExist(systemPool);
    } catch (err) {
      console.error('❌ Error al configurar la estructura de la base de datos:', err);
      throw err;
    }
    
    // 4. Verificar si existe algún usuario administrador
    console.log('🔄 Verificando si existe un usuario administrador...');
    const adminExists = await checkAdminExists(systemPool);
    
    if (!adminExists) {
      console.log('⚠️ No se encontró ningún usuario administrador. Creando usuario administrador predeterminado...');
      await createDefaultAdmin(systemPool);
      console.log('✅ Usuario administrador predeterminado creado con éxito.');
      console.log('🔑 Credenciales: usuario=admin, contraseña=admin123');
    } else {
      console.log('✅ Ya existe al menos un usuario administrador en el sistema.');
    }
    
    // 5. Cerrar conexiones
    await adminPool.end();
    await systemPool.end();
    
    console.log('✅ Proceso de inicialización de la base de datos completado con éxito.');
    return true;
  } catch (error) {
    console.error('❌ Error durante la inicialización de la base de datos:', error);
    return false;
  }
}

/**
 * Verifica si la base de datos existe
 */
async function checkDatabaseExists() {
  try {
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error al verificar si la base de datos existe:', error);
    throw error;
  }
}

/**
 * Crea la base de datos
 */
async function createDatabase() {
  try {
    await adminPool.query(`CREATE DATABASE ${dbName}`);
  } catch (error) {
    console.error('Error al crear la base de datos:', error);
    throw error;
  }
}

/**
 * Ejecuta la creación del esquema base de tablas
 */
async function executeSchemaCreation(pool) {
  // Extraer solo las instrucciones CREATE TABLE del esquema
  const createTableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+.*?;/gis;
  const createTablesMatches = schema.match(createTableRegex) || [];
  
  for (const statement of createTablesMatches) {
    try {
      await pool.query(statement);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.warn(`⚠️ Advertencia: ${err.message}`);
      }
    }
  }
}

/**
 * Verifica si ya existen datos en una tabla
 */
async function checkIfDataExists(pool, tableName) {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error(`Error al verificar datos en tabla ${tableName}:`, error);
    return false;
  }
}

/**
 * Inserta los datos de estados
 */
async function insertEstados(pool) {
  // Extraer los INSERT de estados
  const estadosRegex = /INSERT\s+INTO\s+estado.*?;/gis;
  const estadosInserts = schema.match(estadosRegex) || [];
  
  for (const insert of estadosInserts) {
    try {
      await pool.query(insert);
    } catch (err) {
      if (!err.message.includes('duplicate key')) {
        console.warn(`⚠️ Advertencia al insertar estado: ${err.message}`);
      }
    }
  }
}

/**
 * Inserta los datos de municipios
 */
async function insertMunicipios(pool) {
  // Extraer los INSERT de municipios
  const municipiosRegex = /INSERT\s+INTO\s+municipio.*?;/gis;
  const municipiosInserts = schema.match(municipiosRegex) || [];
  
  for (const insert of municipiosInserts) {
    try {
      await pool.query(insert);
    } catch (err) {
      if (!err.message.includes('duplicate key')) {
        console.warn(`⚠️ Advertencia al insertar municipio: ${err.message}`);
      }
    }
  }
}

/**
 * Asegura que existan los tipos de usuario
 */
async function ensureTiposUsuarioExist(pool) {
  const tiposUsuario = [
    { id: 1, tipo: 'Jefe', descripcion: 'Administrador del sistema con acceso total' },
    { id: 2, tipo: 'Bioanalista', descripcion: 'Profesional encargado de realizar análisis de laboratorio' },
    { id: 3, tipo: 'Recepcionista', descripcion: 'Personal encargado de atender pacientes y gestionar citas' }
  ];
  
  for (const tipo of tiposUsuario) {
    try {
      await pool.query(`
        INSERT INTO tipo_user (id_tipo, tipo_user, descripcion)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_tipo) DO NOTHING
      `, [tipo.id, tipo.tipo, tipo.descripcion]);
    } catch (err) {
      console.warn(`⚠️ Advertencia al insertar tipo de usuario: ${err.message}`);
    }
  }
}

/**
 * Verifica si existe algún usuario administrador
 */
async function checkAdminExists(pool) {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FROM usuario u 
      JOIN tipo_user t ON u.id_tipo = t.id_tipo 
      WHERE t.tipo_user = 'Jefe'
    `);
    
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Error al verificar si existe un administrador:', error);
    throw error;
  }
}

/**
 * Crea un usuario administrador predeterminado
 */
async function createDefaultAdmin(pool) {
  try {
    // Password: 'admin123' 
    // Usamos una implementación exactamente igual a la de userService.js
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('🔐 Hash generado para la contraseña:', hashedPassword);
    
    // Verificar primero si existe el tipo de usuario "Jefe"
    let tipoJefeId;
    const tipoResult = await pool.query("SELECT id_tipo FROM tipo_user WHERE tipo_user = 'Jefe'");
    
    if (tipoResult.rows.length === 0) {
      // Si no existe, insertarlo
      const insertTipoResult = await pool.query(
        "INSERT INTO tipo_user (tipo_user, descripcion) VALUES ('Jefe', 'Administrador del sistema con acceso total') RETURNING id_tipo"
      );
      tipoJefeId = insertTipoResult.rows[0].id_tipo;
    } else {
      tipoJefeId = tipoResult.rows[0].id_tipo;
    }
    
    // Insertar el usuario administrador
    const insertResult = await pool.query(`
      INSERT INTO usuario (
        usuario, 
        contraseña, 
        cedula, 
        tipo_cedula,
        nombre, 
        apellido, 
        celular, 
        id_tipo
      ) VALUES (
        'admin', 
        $1, 
        '27679366', 
        'V',
        'Administrador', 
        'Sistema', 
        '041267944666', 
        $2
      ) RETURNING id_user
    `, [hashedPassword, tipoJefeId]);
    
    console.log(`👤 Usuario admin creado con ID: ${insertResult.rows[0].id_user}`);
    
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
    throw error;
  }
}

// Ejecutar la función principal
initDatabase()
  .then(success => {
    if (success) {
      console.log('🚀 Script de inicialización completado correctamente.');
      process.exit(0);
    } else {
      console.error('❌ Script de inicialización falló.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });