import { AuthService } from "../services/authService.js";

// Login de usuario
export const loginUser = async (req, res) => {
    const { usuario, contraseña } = req.body;

    try {
        // Validación básica
        if (!usuario || !contraseña) {
            return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
        }

        // Lógica de autenticación en el servicio
        const { user, token, loginTime } = await AuthService.login(usuario, contraseña);

        // Configurar cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 86400000, // 24 horas en milisegundos
            path: "/"
        });

        console.log(`Usuario autenticado: ${user.id} - ${user.usuario}`);
        res.status(200).json({ 
            message: "Login exitoso", 
            user,
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
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
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

// Verificar usuario autenticado
export const checkAuthStatus = async (req, res) => {
    try {
        // Si llegamos aquí, el middleware ya verificó el token
        res.status(200).json({ 
            authenticated: true, 
            user: req.user 
        });
    } catch (error) {
        console.log("Error en verificación de autenticación:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};