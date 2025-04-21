// backend/controllers/authController.js
import { AuthService } from "../services/authService.js";

// Login de usuario
export const loginUser = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        // Validación básica
        if (!correo || !contraseña) {
            return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
        }

        // Lógica de autenticación en el servicio
        const { user, token, loginTime } = await AuthService.login(correo, contraseña);

        // Configurar cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "Strict",
            maxAge: 86400000, // 24 horas en milisegundos
            path: "/"
        });

        console.log(`Usuario autenticado: ${user.id} - ${user.correo}`);
        res.status(200).json({ 
            message: "Login exitoso", 
            token, 
            loginTime 
        });

    } catch (error) {
        console.log("Error en login:", error.message);

        // Manejo de errores específicos
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message === "Credenciales inválidas") {
            return res.status(401).json({ error: error.message });
        }

        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Logout de usuario
export const logoutUser = (req, res) => {
    try {
        if (!req.cookies.token) {
            return res.status(400).json({ error: "No hay sesión activa" });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "Strict",
            path: "/"
        });

        console.log("Sesión cerrada correctamente");
        res.status(200).json({ message: "Sesión cerrada con éxito" });

    } catch (error) {
        console.log("Error en logout:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};