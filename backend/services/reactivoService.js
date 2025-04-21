import pool from "../lib/db.js";

export class ReactivoService {
    // Obtener todos los reactivos
    static async getAllReactivos() {
        const query = "SELECT id_reactivo, nombre_reactivo FROM reactivo ORDER BY nombre_reactivo";
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener reactivo por ID
    static async getReactivoById(id) {
        const query = "SELECT id_reactivo, nombre_reactivo FROM reactivo WHERE id_reactivo = $1";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Reactivo no encontrado");
        }
        
        return rows[0];
    }

    // Crear nuevo reactivo
    static async createReactivo(nombre_reactivo) {
        const query = "INSERT INTO reactivo (nombre_reactivo) VALUES ($1) RETURNING id_reactivo, nombre_reactivo";
        const { rows } = await pool.query(query, [nombre_reactivo]);
        return rows[0];
    }

    // Actualizar reactivo
    static async updateReactivo(id, nombre_reactivo) {
        const query = "UPDATE reactivo SET nombre_reactivo = $1 WHERE id_reactivo = $2 RETURNING id_reactivo, nombre_reactivo";
        const { rows } = await pool.query(query, [nombre_reactivo, id]);
        
        if (rows.length === 0) {
            throw new Error("Reactivo no encontrado");
        }
        
        return rows[0];
    }

    // Eliminar reactivo
    static async deleteReactivo(id) {
        // Primero verificar si hay parámetros asociados
        const parametrosCheck = await pool.query(
            "SELECT COUNT(*) FROM parametros WHERE id_reactivo = $1",
            [id]
        );
        
        if (parseInt(parametrosCheck.rows[0].count) > 0) {
            throw new Error("No se puede eliminar el reactivo porque tiene parámetros asociados");
        }
        
        const query = "DELETE FROM reactivo WHERE id_reactivo = $1 RETURNING id_reactivo";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Reactivo no encontrado");
        }
        
        return { id: rows[0].id_reactivo, message: "Reactivo eliminado exitosamente" };
    }
}