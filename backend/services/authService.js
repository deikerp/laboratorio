import pool from "../lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

export class AuthService {
    // Autenticar usuario
    static async login(usuario, contraseña) {
        // 1. Buscar usuario por nombre de usuario
        const query = `
            SELECT u.id_user, u.usuario, u.contraseña, u.nombre, u.apellido, u.cedula, 
                   u.celular, u.imagen, u.id_tipo, t.tipo_user
            FROM usuario u
            JOIN tipo_user t ON u.id_tipo = t.id_tipo
            WHERE u.usuario = $1
        `;
        const { rows } = await pool.query(query, [usuario.trim()]);

        if (rows.length === 0) {
            throw new Error("Usuario no encontrado");
        }

        const user = rows[0];

        // 2. Validar contraseña
        const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
        if (!isPasswordValid) {
            throw new Error("Credenciales inválidas");
        }

        // 3. Generar JWT
        const loginTime = Math.floor(Date.now() / 1000);
        
        const payload = { 
            id_user: user.id_user,
            usuario: user.usuario,
            nombre: user.nombre,
            apellido: user.apellido,
            cedula: user.cedula,
            id_tipo: user.id_tipo,
            tipo_user: user.tipo_user,
            iat: loginTime 
        };

        const token = jwt.sign(payload, JWT_SECRET, { 
            expiresIn: "24h", 
            algorithm: "HS256" 
        });

        return {
            user: { 
                id: user.id_user, 
                usuario: user.usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                cedula: user.cedula,
                celular: user.celular,
                imagen: user.imagen,
                id_tipo: user.id_tipo,
                tipo_user: user.tipo_user
            },
            token,
            loginTime
        };
    }

    // Verificar si un token es válido
    static async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error("Token inválido o expirado");
        }
    }
}