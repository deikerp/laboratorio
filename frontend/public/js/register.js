// Guardar en: frontend/js/register.js
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tipos de usuario desde el servidor
    loadUserTypes();
    
    // Configurar formulario de registro
    setupRegistrationForm();
    
    // Configurar botones de mostrar/ocultar contraseña
    setupPasswordToggles();
    
    /**
     * Carga los tipos de usuario desde el servidor
     */
    function loadUserTypes() {
        // Obtener token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Obtener select de tipos de usuario
        const userTypeSelect = document.getElementById('userType');
        if (!userTypeSelect) return;
        
        // Cargar tipos de usuario desde el servidor
        fetch('/api/usuarios/types', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener tipos de usuario');
            }
            return response.json();
        })
        .then(types => {
            // Limpiar opciones existentes (excepto la primera)
            while (userTypeSelect.options.length > 1) {
                userTypeSelect.remove(1);
            }
            
            // Agregar opciones desde el servidor
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id_tipo;
                option.textContent = type.tipo_user;
                userTypeSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    /**
     * Configura el formulario de registro
     */
    function setupRegistrationForm() {
        const form = document.querySelector('.needs-validation');
        if (!form) return;
        
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Validar formulario
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            
            // Obtener datos del formulario
            const formData = new FormData(form);
            
            // Construir objeto con datos para enviar
            const userData = {
                nombre: formData.get('name'),
                apellido: formData.get('lastname'),
                cedula: formData.get('idType') + '-' + formData.get('idNumber'),
                celular: formData.get('phone'),
                usuario: formData.get('username'),
                contraseña: formData.get('password'),
                confirmarContraseña: formData.get('password'),
                id_tipo: formData.get('userType')
            };
            
            // Obtener token
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // Mostrar indicador de carga
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando usuario...';
            
            // Realizar solicitud de creación de usuario
            fetch('/api/usuarios', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Error al crear usuario');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Mostrar mensaje de éxito
                showAlert('success', 'Usuario creado con éxito', 'El nuevo usuario ha sido registrado correctamente.');
                
                // Limpiar formulario
                form.reset();
                form.classList.remove('was-validated');
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('danger', 'Error al crear usuario', error.message);
            });
        });
    }
    
    /**
     * Configura los botones para mostrar/ocultar contraseña
     */
    function setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = button.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                // Cambiar icono
                const icon = button.querySelector('i');
                if (type === 'text') {
                    icon.classList.remove('bx-show');
                    icon.classList.add('bx-hide');
                } else {
                    icon.classList.remove('bx-hide');
                    icon.classList.add('bx-show');
                }
            });
        });
    }
    
    /**
     * Muestra una alerta en la página
     */
    function showAlert(type, title, message) {
        // Crear alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        
        alertDiv.innerHTML = `
            <h4 class="alert-heading">${title}</h4>
            <p>${message}</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insertar alerta antes del formulario
        const form = document.querySelector('.needs-validation');
        form.parentNode.insertBefore(alertDiv, form);
        
        // Desplazarse hasta la alerta
        alertDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Eliminar alerta después de 5 segundos
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }
});