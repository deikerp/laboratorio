import pool from "../lib/db.js";

export class CategoriaService {
    // Obtener todas las categorías de análisis
    static async getAllCategorias() {
        const query = "SELECT id_categoria, categoria FROM categoria_analisis ORDER BY categoria";
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener categoría por ID
    static async getCategoriaById(id) {
        const query = "SELECT id_categoria, categoria FROM categoria_analisis WHERE id_categoria = $1";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Categoría no encontrada");
        }
        
        return rows[0];
    }

    // Crear nueva categoría de análisis
    static async createCategoria(categoria) {
        const query = "INSERT INTO categoria_analisis (categoria) VALUES ($1) RETURNING id_categoria, categoria";
        const { rows } = await pool.query(query, [categoria]);
        return rows[0];
    }

    // Actualizar categoría
    static async updateCategoria(id, categoria) {
        const query = "UPDATE categoria_analisis SET categoria = $1 WHERE id_categoria = $2 RETURNING id_categoria, categoria";
        const { rows } = await pool.query(query, [categoria, id]);
        
        if (rows.length === 0) {
            throw new Error("Categoría no encontrada");
        }
        
        return rows[0];
    }

    // Eliminar categoría
    static async deleteCategoria(id) {
        // Primero verificar si hay análisis asociados
        const analisisCheck = await pool.query(
            "SELECT COUNT(*) FROM analisis WHERE id_categoria = $1",
            [id]
        );
        
        if (parseInt(analisisCheck.rows[0].count) > 0) {
            throw new Error("No se puede eliminar la categoría porque tiene análisis asociados");
        }
        
        const query = "DELETE FROM categoria_analisis WHERE id_categoria = $1 RETURNING id_categoria";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Categoría no encontrada");
        }
        
        return { id: rows[0].id_categoria, message: "Categoría eliminada exitosamente" };
    }
}