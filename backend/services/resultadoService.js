import pool from "../lib/db.js";

export class ResultadoService {
    // Registrar resultado de análisis
    static async createResultado(resultadoData) {
        const { 
            id_paciente, 
            id_analisis, 
            id_parametro, 
            valor_referencial, 
            resultado_parametro, 
            fecha 
        } = resultadoData;

        const query = `
            INSERT INTO resultado_analisis (
                id_paciente, id_analisis, id_parametro, 
                valor_referencial, resultado_parametro, fecha
            ) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id_resultado, id_paciente, id_analisis, id_parametro, 
                      valor_referencial, resultado_parametro, fecha
        `;
        
        const values = [
            id_paciente, 
            id_analisis, 
            id_parametro, 
            valor_referencial, 
            resultado_parametro, 
            fecha || new Date()
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // Obtener todos los resultados con detalles
    static async getAllResultados() {
        const query = `
            SELECT 
                r.id_resultado, r.fecha, r.resultado_parametro, r.valor_referencial,
                p.id_paciente, p.cedula, p.nombres, p.apellidos,
                a.id_analisis, a.nombre as nombre_analisis,
                pa.id_parametro, pa.nombre_parametro
            FROM resultado_analisis r
            JOIN paciente p ON r.id_paciente = p.id_paciente
            JOIN analisis a ON r.id_analisis = a.id_analisis
            JOIN parametros pa ON r.id_parametro = pa.id_parametro
            ORDER BY r.fecha DESC
        `;
        
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener resultados por paciente
    static async getResultadosByPaciente(id_paciente) {
        const query = `
            SELECT 
                r.id_resultado, r.fecha, r.resultado_parametro, r.valor_referencial,
                a.id_analisis, a.nombre as nombre_analisis,
                pa.id_parametro, pa.nombre_parametro
            FROM resultado_analisis r
            JOIN analisis a ON r.id_analisis = a.id_analisis
            JOIN parametros pa ON r.id_parametro = pa.id_parametro
            WHERE r.id_paciente = $1
            ORDER BY r.fecha DESC, a.nombre, pa.nombre_parametro
        `;
        
        const { rows } = await pool.query(query, [id_paciente]);
        return rows;
    }

    // Obtener resultados por análisis
    static async getResultadosByAnalisis(id_analisis) {
        const query = `
            SELECT 
                r.id_resultado, r.fecha, r.resultado_parametro, r.valor_referencial,
                p.id_paciente, p.cedula, p.nombres, p.apellidos,
                pa.id_parametro, pa.nombre_parametro
            FROM resultado_analisis r
            JOIN paciente p ON r.id_paciente = p.id_paciente
            JOIN parametros pa ON r.id_parametro = pa.id_parametro
            WHERE r.id_analisis = $1
            ORDER BY r.fecha DESC, p.apellidos, p.nombres, pa.nombre_parametro
        `;
        
        const { rows } = await pool.query(query, [id_analisis]);
        return rows;
    }

    // Obtener resultado por ID
    static async getResultadoById(id_resultado) {
        const query = `
            SELECT 
                r.id_resultado, r.fecha, r.resultado_parametro, r.valor_referencial,
                p.id_paciente, p.cedula, p.nombres, p.apellidos,
                a.id_analisis, a.nombre as nombre_analisis,
                pa.id_parametro, pa.nombre_parametro
            FROM resultado_analisis r
            JOIN paciente p ON r.id_paciente = p.id_paciente
            JOIN analisis a ON r.id_analisis = a.id_analisis
            JOIN parametros pa ON r.id_parametro = pa.id_parametro
            WHERE r.id_resultado = $1
        `;
        
        const { rows } = await pool.query(query, [id_resultado]);
        
        if (rows.length === 0) {
            throw new Error("Resultado no encontrado");
        }
        
        return rows[0];
    }

    // Actualizar resultado
    static async updateResultado(id_resultado, resultado_parametro) {
        const query = `
            UPDATE resultado_analisis 
            SET resultado_parametro = $1
            WHERE id_resultado = $2
            RETURNING id_resultado, id_paciente, id_analisis, id_parametro, 
                      valor_referencial, resultado_parametro, fecha
        `;
        
        const { rows } = await pool.query(query, [resultado_parametro, id_resultado]);
        
        if (rows.length === 0) {
            throw new Error("Resultado no encontrado");
        }
        
        return rows[0];
    }

    // Eliminar resultado
    static async deleteResultado(id_resultado) {
        const query = "DELETE FROM resultado_analisis WHERE id_resultado = $1 RETURNING id_resultado";
        const { rows } = await pool.query(query, [id_resultado]);
        
        if (rows.length === 0) {
            throw new Error("Resultado no encontrado");
        }
        
        return { id: rows[0].id_resultado, message: "Resultado eliminado exitosamente" };
    }
}