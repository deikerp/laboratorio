/**
 * Script para gestionar el perfil de usuario (versión simplificada)
 * Guardar en: frontend/js/profile.js
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log("Inicializando script de perfil (versión simplificada)");
    
    // Cargar datos del perfil
    loadProfileData();

    // Configurar formulario de edición de perfil
    setupProfileEditForm();

    // Configurar formulario de cambio de contraseña
    setupPasswordChangeForm();

    // Variables globales
    let currentUserId = null;

    /**
     * Carga los datos del perfil del usuario
     */
    function loadProfileData() {
        console.log("Cargando datos de perfil...");

        fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include',
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
            
            console.log("Datos de usuario básicos obtenidos:", data.user);
            
            // Guardar ID del usuario para uso posterior
            currentUserId = data.user.id || data.user.id_user;
            
            // Actualizar la interfaz con los datos básicos
            updateProfileUI(data.user);
            
            // Cargar datos más detallados
            if (currentUserId) {
                return fetch(`/api/usuarios/${currentUserId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        })
        .then(response => {
            if (!response || !response.ok) return null;
            return response.json();
        })
        .then(userData => {
            if (userData) {
                console.log("Datos detallados de usuario obtenidos:", userData);
                updateProfileUI(userData);
            }
        })
        .catch(error => {
            console.error("Error al cargar datos de perfil:", error);
            showToast("No se pudo cargar los datos del perfil", "error");
        });
    }

/**
 * Actualiza la interfaz con los datos del perfil
 */
function updateProfileUI(user) {
    console.log("Actualizando UI con datos completos:", user);

    // Actualizar nombre y tipo en la tarjeta de perfil
    const profileName = document.querySelector('.profile-card h2');
    if (profileName) {
        profileName.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.usuario || 'Usuario';
    }

    const profileType = document.querySelector('.profile-card h3');
    if (profileType) {
        profileType.textContent = user.tipo_user || '';
    }

    // Actualizar datos en el resumen
    const rows = document.querySelectorAll('#profile-overview .row');

    // Mapeo de los campos y sus índices en las filas
    const fieldsMapping = [
        { index: 0, property: 'nombreCompleto', getValue: (u) => `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.usuario || 'Usuario' },
        { index: 1, property: 'tipo_user', getValue: (u) => u.tipo_user || '' },
        { index: 2, property: 'cedula', getValue: (u) => {
            if (u.tipo_cedula && u.cedula) {
                return `${u.tipo_cedula}-${u.cedula}`;
            }
            return u.cedula || '';
        }},
        { index: 3, property: 'celular', getValue: (u) => u.celular || 'No especificado' }
    ];

    fieldsMapping.forEach(field => {
        if (rows.length > field.index) {
            const valueCell = rows[field.index].querySelector('.col-lg-9, .col-md-8');
            if (valueCell) {
                valueCell.textContent = field.getValue(user);
            }
        }
    });

    // Actualizar campos del formulario
    const nameInput = document.getElementById('Name');
    if (nameInput) nameInput.value = user.nombre || '';

    const lastNameInput = document.getElementById('LastName');
    if (lastNameInput) lastNameInput.value = user.apellido || '';

    // Manejar cédula con tipo_cedula como campo separado
    const idTypeSelect = document.getElementById('idType');
    if (idTypeSelect) {
        idTypeSelect.value = user.tipo_cedula || 'V';
    }

    const idNumberInput = document.getElementById('yourID');
    if (idNumberInput) {
        idNumberInput.value = user.cedula || '';
    }

    // Teléfono
    const phoneInput = document.getElementById('Phone');
    if (phoneInput) phoneInput.value = user.celular || '';

    // Tipo de usuario
    const userTypeSelect = document.getElementById('userType');
    if (userTypeSelect && user.tipo_user) {
        const typeMap = {
            'Jefe': 'jefe',
            'Bioanalista': 'bioanalista',
            'Recepcionista': 'recepcionista'
        };
        userTypeSelect.value = typeMap[user.tipo_user] || '';
        userTypeSelect.disabled = true;
    }

// Actualizar imagen de perfil si existe
if (user.imagen) {
    const profileImages = document.querySelectorAll('.profile-img, .profile-edit img, .nav-profile img');
    console.log("Actualizando imágenes con:", user.imagen);
    
    // Usar la nueva ruta para imágenes desencriptadas
    const imgPath = `/api/images/profile-image/${user.imagen}`;
    console.log("Ruta de imagen actualizada:", imgPath);
    
    profileImages.forEach(img => {
        img.src = imgPath;
        // Agregar manejador de error para mostrar imagen por defecto si falla
        img.onerror = function() {
            console.log("Error al cargar imagen, mostrando imagen por defecto");
            this.src = '../../img/profile-img.jpg';
        };
    });
} else {
    console.log("No hay imagen de perfil para mostrar");
    // Establecer imagen por defecto
    const profileImages = document.querySelectorAll('.profile-img, .profile-edit img, .nav-profile img');
    profileImages.forEach(img => {
        img.src = '../../img/profile-img.jpg';
    });
}

    // Actualizar datos en el header
    const headerName = document.querySelector('.nav-profile .dropdown-toggle');
    if (headerName) {
        headerName.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.usuario || 'Usuario';
    }

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
     * Configura el formulario de edición de perfil
     */
    function setupProfileEditForm() {
        const profileForm = document.querySelector('#profile-edit form');
        if (!profileForm) {
            console.error("No se encontró el formulario de edición de perfil");
            return;
        }

        // Asegurarse de que el formulario tenga el enctype correcto
        profileForm.setAttribute('enctype', 'multipart/form-data');
        console.log("Formulario configurado con enctype:", profileForm.getAttribute('enctype'));

        // Configurar input de imagen
        const profileImageInput = document.getElementById('profileImageUpload');
        const profileImg = document.querySelector('#profile-edit .img-fluid');
        const removeImageBtn = document.getElementById('removeImage');
        
        console.log("Estado de elementos para imagen:", {
            inputExiste: !!profileImageInput,
            imgExiste: !!profileImg,
            btnRemoveExiste: !!removeImageBtn
        });

        // Variables para control de imagen
        let imageFile = null;
        let imageRemoved = false;

        // Configurar evento change para el input de imagen
        if (profileImageInput) {
            profileImageInput.addEventListener('change', function(event) {
                console.log("Se seleccionó una imagen");
                if (event.target.files.length > 0) {
                    imageFile = event.target.files[0];
                    console.log("Imagen seleccionada:", imageFile.name, imageFile.type, imageFile.size);
                    
                    // Mostrar vista previa
                    if (profileImg) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            profileImg.src = e.target.result;
                        };
                        reader.readAsDataURL(imageFile);
                    }
                    
                    imageRemoved = false;
                }
            });
        }

        // Configurar evento click para botón eliminar imagen
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', function() {
                console.log("Se solicitó eliminar la imagen");
                if (profileImg) {
                    profileImg.src = '../../img/profile-img.jpg';
                }
                if (profileImageInput) {
                    profileImageInput.value = '';
                }
                imageFile = null;
                imageRemoved = true;
            });
        }

        // Manejar envío del formulario
        profileForm.addEventListener('submit', handleProfileFormSubmit);

        // Como respaldo, agregar manejador al botón submit directamente
        const submitButton = profileForm.querySelector('button[type="submit"]');
        if (submitButton) {
            console.log("Botón submit encontrado, agregando event listener de respaldo");
            submitButton.addEventListener('click', function(event) {
                console.log("Botón submit clickeado");
                // Si el evento submit del formulario no se dispara, intentar manualmente
                if (!event.defaultPrevented) {
                    event.preventDefault();
                    handleProfileFormSubmit(event);
                }
            });
        }

        function handleProfileFormSubmit(event) {
            event.preventDefault();
            console.log("Manejando envío del formulario de perfil");
        
            if (!currentUserId) {
                console.error("No se tiene el ID del usuario");
                showToast("Error: No se pudo identificar al usuario", "error");
                return;
            }
        
            // Crear FormData para envío
            const formData = new FormData();
            
            // Agregar datos básicos
            formData.append('nombre', document.getElementById('Name').value);
            formData.append('apellido', document.getElementById('LastName').value);
            formData.append('celular', document.getElementById('Phone').value);
            
            // Procesar cédula - campos separados
            const idType = document.getElementById('idType').value;
            const idNumber = document.getElementById('yourID').value;
            if (idType) {
                formData.append('tipo_cedula', idType);
            }
            if (idNumber) {
                formData.append('cedula', idNumber);
            }
            
            // Procesar imagen
            if (imageRemoved) {
                formData.append('removeImage', 'true');
            } else if (imageFile) {
                formData.append('imagen', imageFile);
            }
            
            // Mostrar datos que se enviarán
            console.log("Datos a enviar:");
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File (${value.name}, ${value.type}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            
            // Mostrar indicador de carga
            const submitBtn = submitButton || profileForm.querySelector('button[type="submit"]');
            let originalBtnText = 'Guardar Cambios';
            if (submitBtn) {
                originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
            }
            
            // Enviar solicitud
            fetch(`/api/usuarios/${currentUserId}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            })
            .then(response => {
                console.log("Respuesta recibida:", response.status);
                
                // Restaurar botón
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
                
                if (!response.ok) {
                    return response.text().then(text => {
                        try {
                            const errorData = JSON.parse(text);
                            throw new Error(errorData.error || 'Error al actualizar perfil');
                        } catch (e) {
                            console.error("Texto de error:", text);
                            throw new Error('Error al actualizar perfil');
                        }
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log("Perfil actualizado con éxito:", data);
                showToast('Perfil actualizado con éxito', 'success');
                
                // Resetear variables de control de imagen
                imageFile = null;
                imageRemoved = false;
                
                // Recargar datos actualizados
                setTimeout(() => {
                    loadProfileData();
                }, 500); // Pequeño retraso para permitir que el servidor procese los cambios
            })
            .catch(error => {
                console.error('Error al actualizar perfil:', error);
                showToast(error.message || 'Error al actualizar perfil', 'error');
            });
        }
    }

    /**
     * Configura el formulario de cambio de contraseña
     */
    function setupPasswordChangeForm() {
        const passwordForm = document.querySelector('#profile-change-password form');
        if (!passwordForm) return;

        passwordForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!currentUserId) {
                showToast("Error: No se pudo identificar al usuario", "error");
                return;
            }

            // Obtener contraseñas
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('renewPassword').value;

            // Validaciones básicas
            if (!currentPassword || !newPassword || !confirmPassword) {
                showToast('Todos los campos son obligatorios', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showToast('Las contraseñas no coinciden', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

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

            // Realizar solicitud
            fetch(`/api/usuarios/${currentUserId}/change-password`, {
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
            })
            .then(data => {
                showToast('Contraseña actualizada con éxito', 'success');
                passwordForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast(error.message || 'Error al cambiar contraseña', 'error');
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