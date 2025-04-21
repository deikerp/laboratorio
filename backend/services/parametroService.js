import pool from "../lib/db.js";

export class ParametroService {
    // Obtener todos los parámetros
    static async getAllParametros() {
        const query = `
            SELECT p.id_parametro, p.nombre_parametro, p.valor_referencial, 
                  p.id_analisis, a.nombre as nombre_analisis,
                  p.id_reactivo, r.nombre_reactivo
            FROM parametros p
            LEFT JOIN analisis a ON p.id_analisis = a.id_analisis
            LEFT JOIN reactivo r ON p.id_reactivo = r.id_reactivo
            ORDER BY a.nombre, p.nombre_parametro
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener parámetros por análisis
    static async getParametrosByAnalisisId(id_analisis) {
        const query = `
            SELECT p.id_parametro, p.nombre_parametro, p.valor_referencial, 
                  p.id_reactivo, r.nombre_reactivo
            FROM parametros p
            LEFT JOIN reactivo r ON p.id_reactivo = r.id_reactivo
            WHERE p.id_analisis = $1
            ORDER BY p.nombre_parametro
        `;
        const { rows } = await pool.query(query, [id_analisis]);
        return rows;
    }

    // Obtener parámetro por ID
    static async getParametroById(id_parametro) {
        const query = `
            SELECT p.id_parametro, p.nombre_parametro, p.valor_referencial, 
                  p.id_analisis, a.nombre as nombre_analisis,
                  p.id_reactivo, r.nombre_reactivo
            FROM parametros p
            LEFT JOIN analisis a ON p.id_analisis = a.id_analisis
            LEFT JOIN reactivo r ON p.id_reactivo = r.id_reactivo
            WHERE p.id_parametro = $1
        `;
        const { rows } = await pool.query(query, [id_parametro]);
        
        if (rows.length === 0) {
            throw new Error("Parámetro no encontrado");
        }
        
        return rows[0];
    }

    // Crear nuevo parámetro
    static async createParametro(id_analisis, nombre_parametro, valor_referencial, id_reactivo) {
        const query = `
            INSERT INTO parametros (id_analisis, nombre_parametro, valor_referencial, id_reactivo) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id_parametro, id_analisis, nombre_parametro, valor_referencial, id_reactivo
        `;
        const { rows } = await pool.query(query, [id_analisis, nombre_parametro, valor_referencial, id_reactivo]);
        return rows[0];
    }

    // Actualizar parámetro
    static async updateParametro(id_parametro, nombre_parametro, valor_referencial, id_reactivo) {
        const query = `
            UPDATE parametros 
            SET nombre_parametro = $1, valor_referencial = $2, id_reactivo = $3
            WHERE id_parametro = $4
            RETURNING id_parametro, id_analisis, nombre_parametro, valor_referencial, id_reactivo
        `;
        const { rows } = await pool.query(query, [nombre_parametro, valor_referencial, id_reactivo, id_parametro]);
        
        if (rows.length === 0) {
            throw new Error("Parámetro no encontrado");
        }
        
        return rows[0];
    }

    // Eliminar parámetro
    static async deleteParametro(id_parametro) {
        // Primero verificar si hay resultados asociados
        const resultadosCheck = await pool.query(
            "SELECT COUNT(*) FROM resultado_analisis WHERE id_parametro = $1",
            [id_parametro]
        );
        
        if (parseInt(resultadosCheck.rows[0].count) > 0) {
            throw new Error("No se puede eliminar el parámetro porque tiene resultados asociados");
        }
        
        const query = "DELETE FROM parametros WHERE id_parametro = $1 RETURNING id_parametro";
        const { rows } = await pool.query(query, [id_parametro]);
        
        if (rows.length === 0) {
            throw new Error("Parámetro no encontrado");
        }
        
        return { id: rows[0].id_parametro, message: "Parámetro eliminado exitosamente" };
    }
}