import pool from "../lib/db.js";

export class AnalisisService {

    // Obtener todos los análisis con sus categorías
    static async getAllAnalisis() {
        const query = `
            SELECT a.id_analisis, a.nombre, a.id_categoria, c.categoria
            FROM analisis a
            LEFT JOIN categoria_analisis c ON a.id_categoria = c.id_categoria
            ORDER BY c.categoria, a.nombre
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
    
    // Obtener análisis por ID
    static async getAnalisisById(id) {
        const query = `
            SELECT a.id_analisis, a.nombre, a.id_categoria, c.categoria
            FROM analisis a
            LEFT JOIN categoria_analisis c ON a.id_categoria = c.id_categoria
            WHERE a.id_analisis = $1
        `;
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Análisis no encontrado");
        }
        
        return rows[0];
    }

    // Crear nuevo análisis
    static async createAnalisis(nombre, id_categoria) {
        const query = `
            INSERT INTO analisis (nombre, id_categoria) 
            VALUES ($1, $2) 
            RETURNING id_analisis, nombre, id_categoria
        `;
        const { rows } = await pool.query(query, [nombre, id_categoria]);
        return rows[0];
    }

    // Actualizar análisis
    static async updateAnalisis(id, nombre, id_categoria) {
        const query = `
            UPDATE analisis 
            SET nombre = $1, id_categoria = $2
            WHERE id_analisis = $3
            RETURNING id_analisis, nombre, id_categoria
        `;
        const { rows } = await pool.query(query, [nombre, id_categoria, id]);
        
        if (rows.length === 0) {
            throw new Error("Análisis no encontrado");
        }
        
        return rows[0];
    }

    // Eliminar análisis
    static async deleteAnalisis(id) {
        // Primero verificar si hay parámetros o resultados asociados
        const parametrosCheck = await pool.query(
            "SELECT COUNT(*) FROM parametros WHERE id_analisis = $1",
            [id]
        );
        
        if (parseInt(parametrosCheck.rows[0].count) > 0) {
            throw new Error("No se puede eliminar el análisis porque tiene parámetros asociados");
        }
        
        const resultadosCheck = await pool.query(
            "SELECT COUNT(*) FROM resultado_analisis WHERE id_analisis = $1",
            [id]
        );
        
        if (parseInt(resultadosCheck.rows[0].count) > 0) {
            throw new Error("No se puede eliminar el análisis porque tiene resultados asociados");
        }
        
        const query = "DELETE FROM analisis WHERE id_analisis = $1 RETURNING id_analisis";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Análisis no encontrado");
        }
        
        return { id: rows[0].id_analisis, message: "Análisis eliminado exitosamente" };
    }

    // Obtener todos los reactivos
    static async getAllReactivos() {
        const query = "SELECT id_reactivo, nombre_reactivo FROM reactivo ORDER BY nombre_reactivo";
        const { rows } = await pool.query(query);
        return rows;
    }

    // Crear nuevo reactivo
    static async createReactivo(nombre_reactivo) {
        const query = "INSERT INTO reactivo (nombre_reactivo) VALUES ($1) RETURNING id_reactivo, nombre_reactivo";
        const { rows } = await pool.query(query, [nombre_reactivo]);
        return rows[0];
    }

    // Obtener parámetros de un análisis
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