/**
 * Script para el manejo del formulario de inicio de sesión
 */
document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si existe una sesión previa
    checkExistingSession();

    // Referencias a elementos del DOM
    const loginForm = document.querySelector('.needs-validation');
    const usernameInput = document.getElementById('yourUsername');
    const passwordInput = document.getElementById('yourPassword');
    const rememberCheckbox = document.getElementById('rememberMe');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginErrorDiv = createErrorMessageContainer();

    // Evento para mostrar/ocultar contraseña
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambiar icono
        const icon = this.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('bx-show');
            icon.classList.add('bx-hide');
        } else {
            icon.classList.remove('bx-hide');
            icon.classList.add('bx-show');
        }
    });

    // Evento de envío del formulario
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Limpiar mensajes de error previos
        clearErrorMessages();

        // Validar el formulario usando Bootstrap
        if (!loginForm.checkValidity()) {
            loginForm.classList.add('was-validated');
            return;
        }

        // Obtener datos del formulario
        const userData = {
            usuario: usernameInput.value.trim(),
            contraseña: passwordInput.value
        };

        try {
            // Mostrar indicador de carga
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando sesión...';

            // Realizar solicitud de inicio de sesión
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include' // Para manejar cookies
            });

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el inicio de sesión');
            }
            
            // Redirigir al dashboard (no es necesario guardar datos en localStorage)
            window.location.href = '/dashboard';
            
        } catch (error) {
            // Mostrar mensaje de error
            showErrorMessage(error.message);
        }
    });

    /**
     * Comprueba si existe una sesión previa y redirige si es necesario
     * FUNCIÓN MEJORADA: Ahora verifica la autenticación usando solo cookies
     */
    function checkExistingSession() {
        // Verificar si el usuario está autenticado usando la API
        fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include', // Importante: incluye las cookies en la solicitud
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Si el usuario está autenticado, redirigir al dashboard
                return response.json().then(data => {
                    console.log('Usuario autenticado:', data.user);
                    window.location.href = '/dashboard';
                });
            } else if (response.status === 401) {
                // El usuario no está autenticado, mostrar el formulario de login
                console.log('Usuario no autenticado, mostrando login');
                // Opcional: aquí puedes agregar código para mostrar el formulario si estaba oculto
            } else {
                // Error en la verificación
                console.error('Error al verificar autenticación:', response.status);
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
        });
    }

    /**
     * Crea un contenedor para mensajes de error
     */
    function createErrorMessageContainer() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3 d-none';
        errorDiv.id = 'loginError';
        errorDiv.role = 'alert';
        
        // Insertar después del formulario
        loginForm.parentNode.insertBefore(errorDiv, loginForm.nextSibling);
        
        return errorDiv;
    }

    /**
     * Muestra un mensaje de error
     */
    function showErrorMessage(message) {
        loginErrorDiv.textContent = message;
        loginErrorDiv.classList.remove('d-none');
    }

    /**
     * Limpia los mensajes de error
     */
    function clearErrorMessages() {
        loginErrorDiv.textContent = '';
        loginErrorDiv.classList.add('d-none');
    }
});