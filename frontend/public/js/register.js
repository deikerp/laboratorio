// Variables globales
let tiposUsuario = [];
let todosUsuarios = [];
let usuarioIdAEliminar = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando gestión de usuarios...');
    
    // Configurar eventos
    configurarEventos();
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Configurar toggle de contraseñas
    configurarPasswordToggle();
});

// Configuración de eventos
function configurarEventos() {
    // Formulario de registro
    const formRegistro = document.getElementById('formRegistroUsuario');
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            registrarUsuario(this);
        });
    }
    
    // Formulario de edición
    const formEditar = document.getElementById('formEditarUsuario');
    if (formEditar) {
        formEditar.addEventListener('submit', function(e) {
            e.preventDefault();
            actualizarUsuario(this);
        });
    }
    
    // Botón confirmar eliminar
    const btnEliminar = document.getElementById('btn-confirmar-eliminar');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', eliminarUsuario);
    }
    
    // La tabla ya tiene la clase 'datatable' que probablemente
    // inicializa el datatable automáticamente por el script principal
    // Solo guardamos una referencia para actualizaciones
    const tablaUsuarios = document.getElementById('tablaUsuarios');
    if (tablaUsuarios) {
        // Comprobamos si el datatable ya está inicializado por otro script
        if (typeof simpleDatatables !== 'undefined') {
            try {
                // Solo si necesitamos inicializarlo manualmente
                const dataTable = new simpleDatatables.DataTable(tablaUsuarios, {
                    searchable: true,
                    fixedHeight: true,
                    perPage: 10
                });
                
                // Guardar referencia a datatable para uso posterior
                window.usuariosDataTable = dataTable;
            } catch (error) {
                console.log('La tabla ya está inicializada o simpleDatatables está siendo manejado por otro script');
            }
        }
    }
}

// Cargar datos iniciales (tipos de usuario y lista de usuarios)
function cargarDatosIniciales() {
    // Cargar tipos de usuario
    fetch('/api/usuarios/types', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener tipos de usuario');
        }
        return response.json();
    })
    .then(tipos => {
        console.log('Tipos de usuario cargados:', tipos);
        tiposUsuario = tipos;
        
        // Llenar selects de tipo de usuario
        llenarSelectTiposUsuario(document.getElementById('tipo_usuario'));
        llenarSelectTiposUsuario(document.getElementById('editar_tipo_usuario'));
        
        // Cargar usuarios después de cargar los tipos
        return fetch('/api/usuarios', {
            method: 'GET',
            credentials: 'include'
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener usuarios');
        }
        return response.json();
    })
    .then(usuarios => {
        console.log('Usuarios cargados:', usuarios);
        todosUsuarios = usuarios;
        
        // Renderizar usuarios en la tabla
        renderizarUsuarios(usuarios);
    })
    .catch(error => {
        console.error('Error al cargar datos iniciales:', error);
        mostrarMensaje('error', 'Error al cargar datos. Por favor, recargue la página.');
    });
}

// Llenar select de tipos de usuario
function llenarSelectTiposUsuario(select) {
    if (!select || !tiposUsuario.length) return;
    
    // Mantener la opción default
    const defaultOption = select.querySelector('option[disabled]');
    select.innerHTML = '';
    
    if (defaultOption) {
        select.appendChild(defaultOption);
    }
    
    tiposUsuario.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id_tipo;
        option.textContent = tipo.tipo_user;
        select.appendChild(option);
    });
}

// Renderizar usuarios en la tabla
function renderizarUsuarios(usuarios) {
    console.log('Renderizando usuarios:', usuarios);
    
    // Primero intentamos obtener la tabla
    const tabla = document.getElementById('tablaUsuarios');
    if (!tabla) {
        console.error('No se encontró la tabla de usuarios con ID "tablaUsuarios"');
        return;
    }
    
    // Luego obtenemos el tbody dentro de la tabla
    const tbody = tabla.querySelector('tbody');
    if (!tbody) {
        console.error('No se encontró el elemento tbody dentro de la tabla de usuarios');
        return;
    }
    
    // Si no hay usuarios, mostrar mensaje
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No hay usuarios registrados</td>
            </tr>
        `;
        return;
    }
    
    // Generar HTML para cada usuario
    let html = '';
    usuarios.forEach(usuario => {
        const tipoUsuario = obtenerNombreTipoUsuario(usuario.id_tipo);
        
        html += `
            <tr>
                <td>${usuario.id_user || ''}</td>
                <td>${usuario.tipo_cedula || ''}-${usuario.cedula || ''}</td>
                <td>${usuario.nombre || ''}</td>
                <td>${usuario.apellido || ''}</td>
                <td>${usuario.celular || ''}</td>
                <td>${usuario.usuario || ''}</td>
                <td>${tipoUsuario}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item" href="javascript:void(0)" onclick="verUsuario(${usuario.id_user})">
                                    <i class="bi bi-eye me-2 text-info"></i>Ver
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="javascript:void(0)" onclick="editarUsuario(${usuario.id_user})">
                                    <i class="bi bi-pencil me-2 text-primary"></i>Editar
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item text-danger" href="javascript:void(0)" 
                                   onclick="prepararEliminarUsuario(${usuario.id_user}, '${usuario.nombre} ${usuario.apellido}')">
                                    <i class="bi bi-trash me-2"></i>Eliminar
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    });
    
    // Insertar HTML en el tbody
    tbody.innerHTML = html;
    
    // Actualizar la tabla de datos si existe
    try {
        // Intenta refrescar con el objeto DataTable que guardamos
        if (window.usuariosDataTable) {
            window.usuariosDataTable.refresh();
        } 
        // Como alternativa, buscar si hay una instancia global
        else if (typeof simpleDatatables !== 'undefined' && simpleDatatables.datatable) {
            // Intenta refrescar todas las instancias (podría ser que el framework use otra forma)
            document.querySelectorAll('.datatable').forEach(table => {
                if (table._dataTable) {
                    table._dataTable.refresh();
                }
            });
        }
    } catch (error) {
        console.log('No se pudo actualizar la tabla de datos automáticamente. La página puede requerir recarga.', error);
    }
}

// Funciones auxiliares
function obtenerNombreTipoUsuario(idTipo) {
    const tipo = tiposUsuario.find(t => t.id_tipo == idTipo);
    return tipo ? tipo.tipo_user : 'N/A';
}

function mostrarMensaje(tipo, mensaje) {
    const mensajeExito = document.getElementById('mensaje-exito');
    const mensajeError = document.getElementById('mensaje-error');
    const textoMensajeExito = document.getElementById('texto-mensaje-exito');
    const textoMensajeError = document.getElementById('texto-mensaje-error');
    
    if (tipo === 'exito') {
        textoMensajeExito.textContent = mensaje;
        mensajeExito.style.display = 'block';
        mensajeError.style.display = 'none';
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            mensajeExito.style.display = 'none';
        }, 5000);
    } else {
        textoMensajeError.textContent = mensaje;
        mensajeError.style.display = 'block';
        mensajeExito.style.display = 'none';
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 5000);
    }
}

// Configurar toggle de contraseñas
function configurarPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const toggleEditPassword = document.getElementById('toggleEditPassword');
    
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bx-show');
                icon.classList.add('bx-hide');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('bx-hide');
                icon.classList.add('bx-show');
            }
        });
    }
    
    if (toggleEditPassword) {
        toggleEditPassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('editar_password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bx-show');
                icon.classList.add('bx-hide');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('bx-hide');
                icon.classList.add('bx-show');
            }
        });
    }
}

// Operaciones CRUD
function verUsuario(idUsuario) {
    const usuario = todosUsuarios.find(u => u.id_user === idUsuario);
    
    if (!usuario) {
        console.error('Usuario no encontrado:', idUsuario);
        return;
    }
    
    // Llenar información en el modal
    document.getElementById('verIdUsuario').textContent = usuario.id_user;
    document.getElementById('verCedulaUsuario').textContent = `${usuario.tipo_cedula || ''}-${usuario.cedula || ''}`;
    document.getElementById('verNombreUsuario').textContent = usuario.nombre;
    document.getElementById('verApellidoUsuario').textContent = usuario.apellido;
    document.getElementById('verTelefonoUsuario').textContent = usuario.celular || 'N/A';
    document.getElementById('verTipoUsuario').textContent = obtenerNombreTipoUsuario(usuario.id_tipo);
    document.getElementById('verUsernameUsuario').textContent = usuario.usuario;
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalVerUsuario'));
    modal.show();
}

function editarUsuario(idUsuario) {
    const usuario = todosUsuarios.find(u => u.id_user === idUsuario);
    
    if (!usuario) {
        console.error('Usuario no encontrado:', idUsuario);
        return;
    }
    
    // Llenar formulario
    document.getElementById('editar_id_usuario').value = usuario.id_user;
    document.getElementById('editar_nombre').value = usuario.nombre;
    document.getElementById('editar_apellido').value = usuario.apellido;
    document.getElementById('editar_telefono').value = usuario.celular || '';
    
    // Seleccionar tipo de cédula
    const selectTipoCedula = document.getElementById('editar_tipo_cedula');
    if (selectTipoCedula) {
        selectTipoCedula.value = usuario.tipo_cedula || 'V';
    }
    
    // Llenar cédula
    document.getElementById('editar_cedula').value = usuario.cedula;
    
    // Seleccionar tipo de usuario
    const selectTipoUsuario = document.getElementById('editar_tipo_usuario');
    if (selectTipoUsuario) {
        selectTipoUsuario.value = usuario.id_tipo;
    }
    
    // Llenar usuario
    document.getElementById('editar_username').value = usuario.usuario;
    
    // Limpiar campo de contraseña (es opcional al editar)
    document.getElementById('editar_password').value = '';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    modal.show();
}

function prepararEliminarUsuario(idUsuario, nombreCompleto) {
    usuarioIdAEliminar = idUsuario;
    
    document.getElementById('eliminar_nombre_usuario').textContent = nombreCompleto;
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEliminarUsuario'));
    modal.show();
}

function registrarUsuario(form) {
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(form);
    
    // Construir objeto con datos para enviar
    const userData = {
        nombre: formData.get('nombre'),
        apellido: formData.get('apellido'),
        cedula: formData.get('cedula'),
        tipo_cedula: formData.get('tipo_cedula'),
        celular: formData.get('telefono'),
        usuario: formData.get('username'),
        contraseña: formData.get('password'),
        confirmarContraseña: formData.get('password'),
        id_tipo: formData.get('tipo_usuario')
    };
    
    console.log('Enviando datos de usuario:', { ...userData, contraseña: '******' });
    
    // Mostrar indicador de carga
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando usuario...';
    
    // Realizar solicitud de creación de usuario
    fetch('/api/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
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
        console.log('Usuario creado exitosamente:', data);
        
        // Mostrar mensaje de éxito
        mostrarMensaje('exito', 'Usuario creado con éxito');
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroUsuario'));
        if (modal) modal.hide();
        
        // Limpiar formulario
        form.reset();
        form.classList.remove('was-validated');
        
        // Recargar lista de usuarios
        cargarDatosIniciales();
    })
    .catch(error => {
        console.error('Error al crear usuario:', error);
        mostrarMensaje('error', error.message || 'Error al crear usuario');
    });
}

function actualizarUsuario(form) {
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(form);
    const idUsuario = formData.get('editar_id_usuario');
    const nuevoTipoUsuario = formData.get('editar_tipo_usuario');
    
    // Construir objeto con datos para enviar
    const userData = {
        nombre: formData.get('editar_nombre'),
        apellido: formData.get('editar_apellido'),
        celular: formData.get('editar_telefono'),
        usuario: formData.get('editar_username'),
        id_tipo: nuevoTipoUsuario
    };
    
    // Añadir contraseña solo si se ha introducido una nueva
    const password = formData.get('editar_password');
    if (password) {
        userData.contraseña = password;
        userData.confirmarContraseña = password;
    }
    
    // Obtener el usuario que estamos modificando
    const usuarioAModificar = todosUsuarios.find(u => u.id_user == idUsuario);
    if (!usuarioAModificar) {
        mostrarMensaje('error', 'No se encontró el usuario a modificar');
        return;
    }
    
    // Verificar si es un usuario Jefe que está cambiando su tipo
    // Para esto necesitamos saber el ID del usuario actualmente logueado
    // Esto lo consultaremos mediante el endpoint de verificación de autenticación
    
    fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al verificar usuario actual');
        return response.json();
    })
    .then(authData => {
        // Si somos el mismo usuario que estamos editando
        if (authData.user.id_user == idUsuario) {
            // Y estamos intentando cambiar nuestro propio tipo
            if (usuarioAModificar.id_tipo != nuevoTipoUsuario) {
                throw new Error('No puedes cambiar tu propio tipo de usuario mientras estás usando esta cuenta');
            }
        }
        
        // Si estamos intentando cambiar un usuario Jefe a otro tipo
        if (usuarioAModificar.id_tipo == 1 && nuevoTipoUsuario != 1) {
            // Contar cuántos usuarios Jefe hay actualmente
            const cantidadJefes = todosUsuarios.filter(u => u.id_tipo == 1).length;
            
            // Si solo hay un jefe, no permitir el cambio
            if (cantidadJefes <= 1) {
                throw new Error('No puedes cambiar el tipo del último usuario Jefe. Crea otro usuario Jefe primero.');
            }
        }
        
        console.log('Actualizando usuario:', idUsuario, { ...userData, contraseña: password ? '******' : undefined });
        
        // Mostrar indicador de carga
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Actualizando usuario...';
        
        // Realizar solicitud de actualización
        return fetch(`/api/usuarios/${idUsuario}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        })
        .then(response => {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error al actualizar usuario');
                });
            }
            return response.json();
        });
    })
    .then(data => {
        console.log('Usuario actualizado exitosamente:', data);
        
        // Mostrar mensaje de éxito
        mostrarMensaje('exito', 'Usuario actualizado con éxito');
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
        if (modal) modal.hide();
        
        // Limpiar formulario
        form.reset();
        form.classList.remove('was-validated');
        
        // Recargar lista de usuarios
        cargarDatosIniciales();
    })
    .catch(error => {
        console.error('Error al actualizar usuario:', error);
        mostrarMensaje('error', error.message || 'Error al actualizar usuario');
    });
}

function eliminarUsuario() {
    if (!usuarioIdAEliminar) return;
    
    // Buscar el usuario que estamos eliminando
    const usuarioAEliminar = todosUsuarios.find(u => u.id_user == usuarioIdAEliminar);
    
    if (!usuarioAEliminar) {
        mostrarMensaje('error', 'No se encontró el usuario a eliminar');
        return;
    }
    
    // Verificar si estamos intentando eliminar un Jefe
    if (usuarioAEliminar.id_tipo == 1) {
        // Contar cuántos jefes hay
        const cantidadJefes = todosUsuarios.filter(u => u.id_tipo == 1).length;
        
        if (cantidadJefes <= 1) {
            mostrarMensaje('error', 'No puedes eliminar al último usuario Jefe. Crea otro usuario Jefe primero.');
            return;
        }
    }
    
    // Verificar que no esté eliminando su propia cuenta
    fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al verificar usuario actual');
        return response.json();
    })
    .then(authData => {
        // Si somos el mismo usuario que estamos eliminando
        if (authData.user.id_user == usuarioIdAEliminar) {
            throw new Error('No puedes eliminar tu propia cuenta mientras la estás usando. Inicia sesión con otra cuenta de administrador.');
        }
        
        // Mostrar indicador de carga
        const btnEliminar = document.getElementById('btn-confirmar-eliminar');
        const originalBtnText = btnEliminar.innerHTML;
        btnEliminar.disabled = true;
        btnEliminar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Eliminando...';
        
        // Realizar solicitud de eliminación
        return fetch(`/api/usuarios/${usuarioIdAEliminar}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            // Restaurar botón
            btnEliminar.disabled = false;
            btnEliminar.innerHTML = originalBtnText;
            
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error al eliminar usuario');
                });
            }
            return response.json();
        });
    })
    .then(data => {
        console.log('Usuario eliminado exitosamente:', data);
        
        // Mostrar mensaje de éxito
        mostrarMensaje('exito', 'Usuario eliminado con éxito');
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarUsuario'));
        if (modal) modal.hide();
        
        // Recargar lista de usuarios
        cargarDatosIniciales();
    })
    .catch(error => {
        console.error('Error al eliminar usuario:', error);
        mostrarMensaje('error', error.message || 'Error al eliminar usuario');
    });
}


// Exponer funciones para uso global
window.verUsuario = verUsuario;
window.editarUsuario = editarUsuario;
window.prepararEliminarUsuario = prepararEliminarUsuario;