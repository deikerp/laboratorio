import pool from "../lib/db.js";

export const getAllPaises = async () => {
  try {
    console.log("🔍 Ejecutando consulta: SELECT * FROM pais");
    const { rows } = await pool.query("SELECT * FROM pais");
    return rows;
  } catch (error) {
    console.error("❌ Error en getAllPaises:", error.message);
    throw new Error("Error al obtener países");
  }
};

export const getUniversidadesByPais = async (idPais) => {
  try {
    console.log(`🔍 Ejecutando consulta: SELECT * FROM universidad WHERE id_pais = ${idPais}`);
    const { rows } = await pool.query(
      "SELECT * FROM universidad WHERE id_pais = $1",
      [idPais]
    );
    return rows;
  } catch (error) {
    console.error("❌ Error en getUniversidadesByPais:", error.message);
    throw new Error("Error al obtener universidades");
  }
};