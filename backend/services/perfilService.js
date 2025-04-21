import pool from "../lib/db.js";

// Función auxiliar para validar llaves foráneas
const validateForeignKey = async (table, id, errorMessage) => {
  const checkQuery = `SELECT 1 FROM ${table} WHERE ${table === 'usuario' ? 'id_user' : `id_${table}`} = $1`;
  const { rows } = await pool.query(checkQuery, [id]);
  if (rows.length === 0) throw new Error(errorMessage);
};

export const createPerfil = async ({
  id_usuario,
  id_rol,
  nombre,
  apellido,
  id_pais,
  nacimiento,
  id_universidad,
}) => {
  // Validación de campos obligatorios
  if (!id_usuario || !id_rol || !nombre || !apellido || !id_pais || !nacimiento || !id_universidad) {
    throw new Error("Todos los campos obligatorios deben ser proporcionados");
  }

  // Validar existencia de llaves foráneas
  await validateForeignKey('usuario', id_usuario, 'El usuario no existe');
  await validateForeignKey('rol', id_rol, 'El rol no existe');
  await validateForeignKey('pais', id_pais, 'El país no existe');
  await validateForeignKey('universidad', id_universidad, 'La universidad no existe');

  // Insertar en base de datos
  const query = `
    INSERT INTO perfil 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [id_usuario, id_rol, nombre, apellido, id_pais, nacimiento, id_universidad];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const updatePerfil = async ({
  id,
  id_rol,
  nombre,
  apellido,
  id_pais,
  nacimiento,
  id_universidad,
}) => {
  if (!id) throw new Error("ID de usuario obligatorio");

  // Validar existencia de nuevas llaves foráneas
  await validateForeignKey('rol', id_rol, 'El nuevo rol no existe');
  await validateForeignKey('pais', id_pais, 'El nuevo país no existe');
  await validateForeignKey('universidad', id_universidad, 'La nueva universidad no existe');

  // Actualizar en base de datos
  const query = `
    UPDATE perfil 
    SET id_rol = $1, nombre = $2, apellido = $3, id_pais = $4, nacimiento = $5, id_universidad = $6
    WHERE id_usuario = $7
    RETURNING *;
  `;
  const values = [id_rol, nombre, apellido, id_pais, nacimiento, id_universidad, id];

  const { rows } = await pool.query(query, values);
  if (rows.length === 0) throw new Error("Perfil no encontrado");
  return rows[0];
};

// Servicio para obtener todos los perfiles
export const getAllPerfiles = async () => {
  const query = "SELECT * FROM perfil";
  const { rows } = await pool.query(query);
  return rows;
};

// Servicio para eliminar un perfil
export const deletePerfil = async (id) => {
  if (!id) {
    throw new Error("El ID de usuario es obligatorio");
  }

  const query = "DELETE FROM perfil WHERE id_usuario = $1";
  await pool.query(query, [id]);
};
