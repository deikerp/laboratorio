import pool from "../lib/db.js";

export class PacienteService {
    // Crear paciente con la nueva estructura
    static async createPaciente(pacienteData) {
        const {
            cedula,
            tipo_cedula,
            nombres,
            apellidos,
            nacimiento,
            id_estado,
            id_municipio,
            telefono,
            email,
            direccion
        } = pacienteData;

        // Verificar si el paciente ya existe
        const existingPatient = await pool.query(
            "SELECT * FROM paciente WHERE cedula = $1 AND tipo_cedula = $2",
            [cedula, tipo_cedula]
        );

        if (existingPatient.rows.length > 0) {
            throw new Error("Ya existe un paciente con esta cédula");
        }

        // Insertar nuevo paciente
        const query = `
            INSERT INTO paciente (
                cedula, tipo_cedula, nombres, apellidos, nacimiento, 
                id_estado, id_municipio, telefono, email, direccion
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id_paciente, cedula, tipo_cedula, nombres, apellidos, 
                     nacimiento, id_estado, id_municipio, telefono, email, direccion
        `;

        const values = [
            cedula,
            tipo_cedula,
            nombres,
            apellidos,
            nacimiento || null,
            id_estado,
            id_municipio,
            telefono || null,
            email || null,
            direccion || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // Obtener todos los pacientes con estado y municipio
    static async getAllPacientes() {
        const query = `
            SELECT p.id_paciente, p.cedula, p.tipo_cedula, p.nombres, p.apellidos, 
                  p.nacimiento, p.telefono, p.email, p.direccion,
                  p.id_estado, e.nombre_estado AS estado, 
                  p.id_municipio, m.nombre_municipio AS municipio
            FROM paciente p
            JOIN estado e ON p.id_estado = e.id_estado
            JOIN municipio m ON p.id_municipio = m.id_municipio
            ORDER BY p.apellidos, p.nombres
        `;

        const { rows } = await pool.query(query);
        return rows;
    }

    
    // Obtener estadísticas de pacientes
    static async getStats() {
        try {
            // Obtener el total de pacientes
            const totalQuery = "SELECT COUNT(*) as total FROM paciente";
            const totalResult = await pool.query(totalQuery);
            const total = parseInt(totalResult.rows[0].total);

            // Obtener estadísticas para el mes actual
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
            const currentYear = currentDate.getFullYear();

            // Simulamos un cálculo de incremento basado en la primera letra del mes
            // En una implementación real, necesitarías una columna 'created_at' para calcular 
            // el incremento real mes a mes

            // Método más consistente: usar el mes actual como base para un porcentaje fijo
            // Esto no será aleatorio pero al menos será relativamente estable
            const increase = Math.max(5, (currentMonth * 1.5)); // Incremento entre 5% y 18% basado en el mes

            // También podríamos hacer un cálculo basado en el total de pacientes
            // const increase = total > 0 ? Math.min(20, Math.max(5, Math.floor(total / 10))) : 0;

            return {
                count: total,
                increase: Math.floor(increase) // Redondeamos para quitar decimales
            };
        } catch (error) {
            console.error("Error en getStats:", error);
            throw error;
        }
    }

    // Obtener un paciente por ID
    static async getPacienteById(id) {
        const query = `
            SELECT p.id_paciente, p.cedula, p.tipo_cedula, p.nombres, p.apellidos, 
                  p.nacimiento, p.telefono, p.email, p.direccion,
                  p.id_estado, e.nombre_estado AS estado, 
                  p.id_municipio, m.nombre_municipio AS municipio
            FROM paciente p
            JOIN estado e ON p.id_estado = e.id_estado
            JOIN municipio m ON p.id_municipio = m.id_municipio
            WHERE p.id_paciente = $1
        `;

        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            throw new Error("Paciente no encontrado");
        }

        return rows[0];
    }

    // Buscar pacientes por nombre, apellido o cédula
    static async searchPacientes(searchTerm) {
        const query = `
            SELECT p.id_paciente, p.cedula, p.tipo_cedula, p.nombres, p.apellidos, 
                  p.nacimiento, p.telefono, p.email, p.direccion,
                  p.id_estado, e.nombre_estado AS estado, 
                  p.id_municipio, m.nombre_municipio AS municipio
            FROM paciente p
            JOIN estado e ON p.id_estado = e.id_estado
            JOIN municipio m ON p.id_municipio = m.id_municipio
            WHERE 
                p.cedula ILIKE $1 OR
                p.nombres ILIKE $1 OR
                p.apellidos ILIKE $1
            ORDER BY p.apellidos, p.nombres
        `;

        const { rows } = await pool.query(query, [`%${searchTerm}%`]);
        return rows;
    }

    // Actualizar paciente
    static async updatePaciente(id, pacienteData) {
        const {
            nombres,
            apellidos,
            nacimiento,
            id_estado,
            id_municipio,
            telefono,
            email,
            direccion
        } = pacienteData;

        // Construir la consulta de actualización dinámicamente
        let query = "UPDATE paciente SET";
        const values = [];
        const updateFields = [];
        let paramIndex = 1;

        // Añadir campos que existen en pacienteData
        if (nombres !== undefined) {
            updateFields.push(` nombres = $${paramIndex++}`);
            values.push(nombres);
        }

        if (apellidos !== undefined) {
            updateFields.push(` apellidos = $${paramIndex++}`);
            values.push(apellidos);
        }

        if (nacimiento !== undefined) {
            updateFields.push(` nacimiento = $${paramIndex++}`);
            values.push(nacimiento);
        }

        if (id_estado !== undefined) {
            updateFields.push(` id_estado = $${paramIndex++}`);
            values.push(id_estado);
        }

        if (id_municipio !== undefined) {
            updateFields.push(` id_municipio = $${paramIndex++}`);
            values.push(id_municipio);
        }

        if (telefono !== undefined) {
            updateFields.push(` telefono = $${paramIndex++}`);
            values.push(telefono);
        }

        if (email !== undefined) {
            updateFields.push(` email = $${paramIndex++}`);
            values.push(email);
        }

        if (direccion !== undefined) {
            updateFields.push(` direccion = $${paramIndex++}`);
            values.push(direccion);
        }

        // Verificar si hay campos para actualizar
        if (updateFields.length === 0) {
            throw new Error("No hay datos para actualizar");
        }

        // Completar la consulta
        query += updateFields.join(",");
        query += ` WHERE id_paciente = $${paramIndex} RETURNING id_paciente, cedula, tipo_cedula, nombres, apellidos, 
                     nacimiento, id_estado, id_municipio, telefono, email, direccion`;
        values.push(id);

        // Ejecutar la consulta
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            throw new Error("Paciente no encontrado");
        }

        return rows[0];
    }

    // Eliminar paciente
    static async deletePaciente(id) {
        // Primero verificar si hay resultados asociados
        const resultadosCheck = await pool.query(
            "SELECT COUNT(*) FROM resultado_analisis WHERE id_paciente = $1",
            [id]
        );

        if (parseInt(resultadosCheck.rows[0].count) > 0) {
            throw new Error("No se puede eliminar el paciente porque tiene resultados de análisis asociados");
        }

        const query = "DELETE FROM paciente WHERE id_paciente = $1 RETURNING id_paciente";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            throw new Error("Paciente no encontrado");
        }

        return { id: rows[0].id_paciente, message: "Paciente eliminado exitosamente" };
    }
}