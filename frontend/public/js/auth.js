/**
 * Script de autenticación para todas las vistas protegidas
 * Guardar en: frontend/js/auth.js
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    checkAuth();
    
    // Configurar el cierre de sesión
    setupLogout();
    
    /**
     * Verifica si el usuario está autenticado, redirige a login si no lo está
     * Versión mejorada: usa solo cookies en lugar de localStorage/sessionStorage
     */
    function checkAuth() {
        console.log("Verificando autenticación...");
        
        // Verificar si el usuario está autenticado usando la API
        fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include', // Importante: incluye las cookies en la solicitud
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Usuario no autenticado');
            }
            return response.json();
        })
        .then(data => {
            console.log("Verificación de autenticación exitosa:", data.user);
            
            // Opcional: Actualizar información del usuario en la interfaz
            if (data.user && typeof updateUserUI === 'function') {
                updateUserUI(data.user);
            }
        })
        .catch(error => {
            console.error('Error de autenticación:', error);
            
            // Redirigir al login (solo si no estamos ya en la página de login)
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                console.warn("No hay autenticación válida, redirigiendo al login");
                window.location.href = '/';
            }
        });
    }
    
    /**
     * Configura el botón de cerrar sesión
     * Versión mejorada: usa solo cookies en lugar de localStorage/sessionStorage
     */
    function setupLogout() {
        const logoutLinks = document.querySelectorAll('a:has(i.bi-box-arrow-right), a.logout, .logout-btn');
        
        logoutLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                console.log("Cerrando sesión...");
                event.preventDefault();
                
                // Realizar solicitud de logout (no necesita token en header porque usa cookies)
                fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include' // Incluye cookies para que el servidor pueda identificar la sesión
                })
                .then(response => {
                    if (!response.ok) {
                        console.warn("Respuesta no satisfactoria del servidor:", response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Sesión cerrada exitosamente:", data);
                })
                .catch(error => {
                    console.error("Error al cerrar sesión:", error);
                })
                .finally(() => {
                    // Redirigir al login independientemente del resultado
                    console.log("Redirigiendo a la página de login");
                    window.location.href = '/';
                });
            });
        });
    }
    
    /**
     * Función opcional para actualizar la UI con datos del usuario
     * Esta función puede ser implementada en cada vista según sus necesidades
     */
    function updateUserUI(user) {
        // Buscar elementos que muestran información del usuario
        const userNameElements = document.querySelectorAll('.user-name, .username');
        const userRoleElements = document.querySelectorAll('.user-role, .role');
        const userImageElements = document.querySelectorAll('.user-img, .user-image');
        
        // Actualizar nombre de usuario
        userNameElements.forEach(element => {
            element.textContent = `${user.nombre} ${user.apellido}`;
        });
        
        // Actualizar rol/tipo de usuario
        userRoleElements.forEach(element => {
            element.textContent = user.tipo_user;
        });
        
        // Actualizar imagen de perfil si existe
        if (user.imagen) {
            userImageElements.forEach(element => {
                element.src = user.imagen.startsWith('/') 
                    ? user.imagen 
                    : `/uploads/users/${user.imagen}`;
                element.alt = `${user.nombre} ${user.apellido}`;
            });
        }
    }
});