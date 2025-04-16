/**
 * Script para gestionar el perfil de usuario
 * Guardar en: frontend/js/profile.js
 */
document.addEventListener('DOMContentLoaded', function () {
    // Cargar datos del perfil
    loadProfileData();

    // Configurar formulario de edición de perfil
    setupProfileEditForm();

    // Configurar formulario de cambio de contraseña
    setupPasswordChangeForm();

    // Configurar botones de mostrar/ocultar contraseña
    setupPasswordToggles();

    /**
     * Carga los datos del perfil directamente desde el servidor 
     * usando el endpoint de verificación de autenticación
     */
    function loadProfileData() {
        console.log("Cargando datos de perfil...");

        // Obtener datos del usuario directamente del servidor
        fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include', // Importante: incluye cookies en la solicitud
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo verificar la autenticación');
            }
            return response.json();
        })
        .then(data => {
            if (!data.user) {
                throw new Error('No se encontraron datos de usuario');
            }
            
            console.log("Datos de usuario obtenidos:", data.user);
            
            // Actualizar la interfaz con los datos del usuario
            updateProfileUI(data.user);
            
            // Opcional: cargar datos más detallados si son necesarios
            if (data.user.id || data.user.id_user) {
                fetchUserDetailsFromServer(data.user.id || data.user.id_user);
            }
        })
        .catch(error => {
            console.error("Error al cargar datos de perfil:", error);
            showToast("No se pudo cargar los datos del perfil", "error");
            
            // Redirigir al login solo si hay un error de autenticación
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        });
    }

    /**
     * Obtiene datos más detallados del usuario desde el servidor si es necesario
     */
    function fetchUserDetailsFromServer(userId) {
        fetch(`/api/usuarios/${userId}`, {
            method: 'GET',
            credentials: 'include', // Usar cookies para autenticación
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener datos detallados del perfil');
            }
            return response.json();
        })
        .then(userData => {
            console.log("Datos detallados de usuario obtenidos:", userData);
            
            // Actualizar UI con los datos detallados del perfil
            updateProfileUI(userData);
        })
        .catch(error => {
            console.error('Error al obtener datos detallados:', error);
            // No redirigir al login por este error, ya que los datos básicos ya se cargaron
        });
    }

    /**
     * Actualiza la interfaz con los datos del perfil
     */
    function updateProfileUI(user) {
        console.log("Actualizando UI con datos:", user);

        // Actualizar nombre y tipo en la tarjeta de perfil
        const profileName = document.querySelector('.profile-card h2');
        if (profileName) {
            profileName.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.usuario || 'Usuario';
            console.log("Nombre actualizado:", profileName.textContent);
        }

        const profileType = document.querySelector('.profile-card h3');
        if (profileType) {
            profileType.textContent = user.tipo_user || '';
            console.log("Tipo actualizado:", profileType.textContent);
        }

        // Actualizar datos en el resumen
        updateProfileOverview(user);

        // Actualizar campos del formulario de edición
        updateProfileEditForm(user);

        // Actualizar imagen de perfil si existe
        if (user.imagen) {
            const profileImages = document.querySelectorAll('.profile-img, .profile-edit img, .nav-profile img');
            profileImages.forEach(img => {
                const imgPath = user.imagen.startsWith('/') ? user.imagen : `../../uploads/${user.imagen}`;
                img.src = imgPath;
            });
        }

        // Actualizar nombre en el header
        const headerName = document.querySelector('.nav-profile .dropdown-toggle');
        if (headerName) {
            headerName.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.usuario || 'Usuario';
        }

        // Actualizar datos en dropdown
        const dropdownName = document.querySelector('.dropdown-header h6');
        if (dropdownName) {
            dropdownName.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.usuario || 'Usuario';
        }

        const dropdownType = document.querySelector('.dropdown-header span');
        if (dropdownType) {
            dropdownType.textContent = user.tipo_user || '';
        }
    }

    /**
     * Actualiza la sección de resumen del perfil
     */
    function updateProfileOverview(user) {
        // Actualizar datos en el resumen
        const rows = document.querySelectorAll('#profile-overview .row');

        // Mapeo de los campos y sus índices en las filas
        const fieldsMapping = [
            { index: 0, property: 'nombreCompleto', getValue: (u) => `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.usuario || 'Usuario' },
            { index: 1, property: 'tipo_user', getValue: (u) => u.tipo_user || '' },
            { index: 2, property: 'cedula', getValue: (u) => u.cedula || '' },
            { index: 3, property: 'celular', getValue: (u) => u.celular || 'No especificado' }
        ];

        fieldsMapping.forEach(field => {
            if (rows.length > field.index) {
                const valueCell = rows[field.index].querySelector('.col-lg-9, .col-md-8');
                if (valueCell) {
                    valueCell.textContent = field.getValue(user);
                    console.log(`Campo ${field.property} actualizado:`, valueCell.textContent);
                }
            }
        });
    }

    /**
     * Actualiza los campos del formulario de edición
     */
    function updateProfileEditForm(user) {
        // Nombre
        const nameInput = document.getElementById('Name');
        if (nameInput) nameInput.value = user.nombre || '';

        // Apellido
        const lastNameInput = document.getElementById('LastName');
        if (lastNameInput) lastNameInput.value = user.apellido || '';

        // Usuario (si existe en el formulario)
        const userInput = document.getElementById('Username');
        if (userInput) userInput.value = user.usuario || '';

        // Cédula - manejar formato V-12345678
        if (user.cedula) {
            const cedulaParts = user.cedula.split('-');

            // Tipo de cédula (V, E, J)
            const idTypeSelect = document.getElementById('idType');
            if (idTypeSelect && cedulaParts.length > 0) {
                idTypeSelect.value = cedulaParts[0] || 'V';
            }

            // Número de cédula - puede estar en cualquiera de estos campos
            const idNumberInput = document.getElementById('yourID');
            if (idNumberInput && cedulaParts.length > 1) {
                idNumberInput.value = cedulaParts[1] || '';
            }

            const idNumber2Input = document.getElementById('idNumber');
            if (idNumber2Input && cedulaParts.length > 1) {
                idNumber2Input.value = cedulaParts[1] || '';
            }
        }

        // Teléfono
        const phoneInput = document.getElementById('Phone');
        if (phoneInput) phoneInput.value = user.celular || '';

        // IMPORTANTE: Configurar el tipo de usuario como SOLO LECTURA (readonly)
        const userTypeSelect = document.getElementById('userType');
        if (userTypeSelect && user.tipo_user) {
            // Mapear tipo_user a valor del select
            const typeMap = {
                'Jefe': 'jefe',
                'Bioanalista': 'bioanalista',
                'Recepcionista': 'recepcionista'
            };

            userTypeSelect.value = typeMap[user.tipo_user] || '';

            // Asegurarse de que esté READONLY
            userTypeSelect.disabled = true;
            
            // Agregar atributo readonly para más claridad
            userTypeSelect.setAttribute('readonly', 'readonly');
            
            // Añadir clase visual que indique que es de solo lectura
            userTypeSelect.classList.add('form-control-plaintext');
        }
    }

    /**
     * Configura el formulario de edición de perfil
     */
    function setupProfileEditForm() {
        const profileForm = document.querySelector('#profile-edit form');
        if (!profileForm) return;

        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Obtener datos del formulario
            const formData = new FormData(this);
            
            // Primero necesitamos obtener el ID del usuario actual
            fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al verificar autenticación');
                }
                return response.json();
            })
            .then(authData => {
                if (!authData.user || (!authData.user.id && !authData.user.id_user)) {
                    throw new Error('No se pudo obtener el ID de usuario');
                }
                
                const userId = authData.user.id || authData.user.id_user;
                
                // Construir objeto con datos para enviar (TODOS excepto tipo de usuario)
                const userData = {
                    nombre: formData.get('name'),
                    apellido: formData.get('lastname'),
                    celular: formData.get('phone'),
                    // No incluimos id_tipo aquí, ya que es readonly
                };

                // Procesar nombre de usuario si existe en el formulario
                const username = formData.get('username');
                if (username) {
                    userData.usuario = username;
                }

                // Procesamiento especial para la cédula (dos campos posibles)
                let idType = formData.get('idType');
                let idNumber = formData.get('idNumber');

                // Si idNumber está vacío, intentar obtenerlo del campo yourID
                if (!idNumber && formData.get('yourID')) {
                    idNumber = formData.get('yourID');
                }

                if (idType && idNumber) {
                    userData.cedula = `${idType}-${idNumber}`;
                }

                // Mostrar indicador de carga
                const submitBtn = profileForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';

                console.log("Enviando datos para actualizar:", userData);

                // Realizar solicitud de actualización
                return fetch(`/api/usuarios/${userId}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
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
                            throw new Error(data.error || 'Error al actualizar perfil');
                        });
                    }
                    return response.json();
                });
            })
            .then(data => {
                console.log("Respuesta de actualización:", data);
                // Mostrar mensaje de éxito
                showToast('Perfil actualizado con éxito', 'success');

                // Recargar datos del perfil
                loadProfileData();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast(error.message || 'Error al actualizar perfil', 'error');
            });
        });
    }

    /**
     * Configura el formulario de cambio de contraseña
     */
    function setupPasswordChangeForm() {
        const passwordForm = document.querySelector('#profile-change-password form');
        if (!passwordForm) return;

        passwordForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Obtener contraseñas
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('renewPassword').value;

            // Validaciones básicas
            if (!currentPassword || !newPassword || !confirmPassword) {
                showToast('Todos los campos son obligatorios', 'error');
                return;
            }

            // Validar que las nuevas contraseñas coincidan
            if (newPassword !== confirmPassword) {
                showToast('Las contraseñas no coinciden', 'error');
                return;
            }

            // Validar complejidad de la contraseña
            if (newPassword.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            // Primero obtener el ID del usuario actual
            fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al verificar autenticación');
                }
                return response.json();
            })
            .then(authData => {
                if (!authData.user || (!authData.user.id && !authData.user.id_user)) {
                    throw new Error('No se pudo obtener el ID de usuario');
                }
                
                const userId = authData.user.id || authData.user.id_user;

                // Datos para enviar
                const passwordData = {
                    contraseñaActual: currentPassword,
                    contraseña: newPassword,
                    confirmarContraseña: confirmPassword
                };

                // Mostrar indicador de carga
                const submitBtn = passwordForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cambiando...';

                console.log("Enviando solicitud de cambio de contraseña");

                // Realizar solicitud de cambio de contraseña
                return fetch(`/api/usuarios/${userId}/change-password`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(passwordData)
                })
                .then(response => {
                    // Restaurar botón
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;

                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.error || 'Error al cambiar contraseña');
                        });
                    }
                    return response.json();
                });
            })
            .then(data => {
                // Mostrar mensaje de éxito
                showToast('Contraseña actualizada con éxito', 'success');

                // Limpiar formulario
                passwordForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast(error.message || 'Error al cambiar contraseña', 'error');
            });
        });
    }

    /**
     * Configura los botones para mostrar/ocultar contraseña
     */
    function setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.toggle-password');

        toggleButtons.forEach(button => {
            button.addEventListener('click', function () {
                const input = this.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);

                // Cambiar icono
                const icon = this.querySelector('i');
                if (icon) {
                    if (type === 'text') {
                        icon.classList.remove('bx-show');
                        icon.classList.add('bx-hide');
                    } else {
                        icon.classList.remove('bx-hide');
                        icon.classList.add('bx-show');
                    }
                }
            });
        });
    }

    /**
     * Muestra un mensaje toast
     */
    function showToast(message, type = 'info') {
        // Verificar si ya existe un contenedor de toasts
        let toastContainer = document.querySelector('.toast-container');

        if (!toastContainer) {
            // Crear contenedor de toasts
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        // Crear toast
        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        // Agregar toast al contenedor
        toastContainer.appendChild(toast);

        // Inicializar y mostrar toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Eliminar toast después de cerrarse
        toast.addEventListener('hidden.bs.toast', function () {
            this.remove();
        });
    }
});