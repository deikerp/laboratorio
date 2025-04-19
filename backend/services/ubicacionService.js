import pool from "../lib/db.js";

export class UbicacionService {
    // Obtener todos los estados
    static async getAllEstados() {
        const query = "SELECT id_estado, nombre_estado FROM estado ORDER BY nombre_estado";
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener todos los municipios
    static async getAllMunicipios() {
        const query = `
            SELECT m.id_municipio, m.nombre_municipio, m.id_estado, e.nombre_estado
            FROM municipio m
            JOIN estado e ON m.id_estado = e.id_estado
            ORDER BY e.nombre_estado, m.nombre_municipio
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener municipios por estado
    static async getMunicipiosByEstado(id_estado) {
        const query = `
            SELECT id_municipio, nombre_municipio, id_estado
            FROM municipio
            WHERE id_estado = $1
            ORDER BY nombre_municipio
        `;
        const { rows } = await pool.query(query, [id_estado]);
        return rows;
    }
}