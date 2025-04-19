// Variables globales mínimas
let estadosData = [];
let municipiosData = [];
let pacienteIdAEliminar = null;
let todosPacientes = []; // Variable para almacenar todos los pacientes

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, inicializando...');
  
  // Configurar eventos básicos
  configurarEventos();
  
  // Cargar datos iniciales
  cargarDatosIniciales();
});

// Configuración mínima de eventos
function configurarEventos() {
  // Eventos de selects de estado/municipio
  const selectEstado = document.getElementById('estado');
  if (selectEstado) {
    selectEstado.addEventListener('change', function() {
      llenarSelectMunicipios(document.getElementById('municipio'), this.value);
    });
  }
  
  const selectEditarEstado = document.getElementById('editar_estado');
  if (selectEditarEstado) {
    selectEditarEstado.addEventListener('change', function() {
      llenarSelectMunicipios(document.getElementById('editar_municipio'), this.value);
    });
  }
  
  // Eventos de formularios
  const formRegistro = document.getElementById('formRegistroPaciente');
  if (formRegistro) {
    formRegistro.addEventListener('submit', function(e) {
      e.preventDefault();
      registrarPaciente(this);
    });
  }
  
  const formEditar = document.getElementById('formEditarPaciente');
  if (formEditar) {
    formEditar.addEventListener('submit', function(e) {
      e.preventDefault();
      actualizarPaciente(this);
    });
  }
  
  // Botón confirmar eliminar
  const btnEliminar = document.getElementById('btn-confirmar-eliminar');
  if (btnEliminar) {
    btnEliminar.addEventListener('click', eliminarPaciente);
  }
}

// Carga de estados, municipios y pacientes
function cargarDatosIniciales() {
  // Cargar estados
  fetch('/api/estados')
    .then(r => r.json())
    .then(data => {
      estadosData = data;
      llenarSelectEstados(document.getElementById('estado'));
      llenarSelectEstados(document.getElementById('editar_estado'));
      
      // Cargar municipios
      return fetch('/api/municipios');
    })
    .then(r => r.json())
    .then(data => {
      municipiosData = data;
      
      // Una vez cargados estados y municipios, cargar pacientes
      return fetch('/api/pacientes');
    })
    .then(r => r.json())
    .then(pacientes => {
      // Guardar todos los pacientes para búsqueda local
      todosPacientes = pacientes;
      
      // Renderizar pacientes
      renderizarPacientes(pacientes);

      // Implementar búsqueda mejorada
      implementarBusquedaMejorada();
    })
    .catch(error => {
      console.error('Error al cargar datos iniciales:', error);
    });
}

// Implementar búsqueda local mejorada
function implementarBusquedaMejorada() {
  // Buscar el input de búsqueda existente
  const searchInput = document.querySelector('.datatable-input');
  
  if (!searchInput) {
    console.error('No se encontró el campo de búsqueda');
    return;
  }
  
  // Función para ejecutar la búsqueda con debounce
  let timeoutId;
  
  searchInput.addEventListener('input', function() {
    const textoBusqueda = this.value.trim().toLowerCase();
    
    // Limpiar timeout anterior
    clearTimeout(timeoutId);
    
    // Debounce para mejorar rendimiento
    timeoutId = setTimeout(() => {
      if (textoBusqueda.length === 0) {
        // Si está vacío, mostrar todos los pacientes
        renderizarPacientes(todosPacientes);
      } else {
        // Filtrar pacientes localmente
        const resultados = todosPacientes.filter(paciente => {
          // Obtener nombres de estado y municipio para búsqueda
          const estadoNombre = obtenerNombreEstado(paciente.id_estado).toLowerCase();
          const municipioNombre = obtenerNombreMunicipio(paciente.id_municipio).toLowerCase();
          
          // Campos a buscar
          return (
            (paciente.cedula || '').toLowerCase().includes(textoBusqueda) ||
            (paciente.nombres || '').toLowerCase().includes(textoBusqueda) ||
            (paciente.apellidos || '').toLowerCase().includes(textoBusqueda) ||
            (paciente.telefono || '').toLowerCase().includes(textoBusqueda) ||
            (paciente.email || '').toLowerCase().includes(textoBusqueda) ||
            estadoNombre.includes(textoBusqueda) ||
            municipioNombre.includes(textoBusqueda) ||
            (paciente.direccion || '').toLowerCase().includes(textoBusqueda)
          );
        });
        
        // Renderizar resultados
        renderizarPacientes(resultados);
      }
    }, 200);
  });
  
  console.log('Búsqueda mejorada implementada');
}

// Renderizar pacientes en la tabla
function renderizarPacientes(pacientes) {
  console.log('Renderizando pacientes:', pacientes);
  
  // Buscar el tbody directamente dentro de la tabla
  const tabla = document.getElementById('tablaPacientes');
  if (!tabla) {
    console.error('No se encontró la tabla de pacientes');
    return;
  }
  
  const tbody = tabla.querySelector('tbody');
  if (!tbody) {
    console.error('No se encontró el tbody en la tabla de pacientes');
    return;
  }
  
  // Limpiar cualquier fila con mensaje "No entries found"
  const filasVacias = tbody.querySelectorAll('tr td.datatable-empty');
  filasVacias.forEach(td => {
    const tr = td.parentNode;
    if (tr) tr.remove();
  });
  
  // Si no hay pacientes, mostrar mensaje
  if (!pacientes || pacientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">No hay pacientes registrados</td>
      </tr>
    `;
    return;
  }
  
  // Generar HTML para cada paciente
  let html = '';
  pacientes.forEach(paciente => {
    const edad = calcularEdad(paciente.nacimiento);
    const estadoNombre = obtenerNombreEstado(paciente.id_estado);
    const municipioNombre = obtenerNombreMunicipio(paciente.id_municipio);
    
    html += `
      <tr>
        <td>${paciente.tipo_cedula || ''}-${paciente.cedula || 'N/A'}</td>
        <td>${paciente.nombres || 'N/A'}</td>
        <td>${paciente.apellidos || 'N/A'}</td>
        <td>${edad}</td>
        <td>${paciente.telefono || 'N/A'}</td>
        <td>${paciente.email || 'N/A'}</td>
        <td>${estadoNombre}</td>
        <td>${municipioNombre}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="verPaciente(${paciente.id_paciente})">
                  <i class="bi bi-eye me-2 text-info"></i>Ver
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="editarPaciente(${paciente.id_paciente})">
                  <i class="bi bi-pencil me-2 text-primary"></i>Editar
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="javascript:void(0)" 
                   onclick="prepararEliminarPaciente(${paciente.id_paciente}, '${paciente.nombres} ${paciente.apellidos}', '${paciente.tipo_cedula || ''}-${paciente.cedula || ''}')">
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
}

// Llenar selects
function llenarSelectEstados(select) {
  if (!select || !estadosData.length) return;
  
  select.innerHTML = '<option selected disabled value="">Seleccionar...</option>';
  estadosData.forEach(estado => {
    const option = document.createElement('option');
    option.value = estado.id_estado;
    option.textContent = estado.nombre_estado;
    select.appendChild(option);
  });
}

function llenarSelectMunicipios(select, idEstado) {
  if (!select || !idEstado || !municipiosData.length) return;
  
  select.innerHTML = '<option selected disabled value="">Seleccionar municipio...</option>';
  const filtrados = municipiosData.filter(m => m.id_estado == idEstado);
  
  filtrados.forEach(municipio => {
    const option = document.createElement('option');
    option.value = municipio.id_municipio;
    option.textContent = municipio.nombre_municipio;
    select.appendChild(option);
  });
}

// Cálculo de edad
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'N/A';
  
  try {
    const fechaNac = new Date(fechaNacimiento);
    if (isNaN(fechaNac)) return 'Fecha inválida';
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    
    if (hoy.getMonth() < fechaNac.getMonth() || 
        (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad >= 0 ? edad + ' años' : 'Error en fecha';
  } catch (e) {
    return 'Error';
  }
}

// Funciones auxiliares
function obtenerNombreEstado(idEstado) {
  const estado = estadosData.find(e => e.id_estado == idEstado);
  return estado ? estado.nombre_estado : 'N/A';
}

function obtenerNombreMunicipio(idMunicipio) {
  const municipio = municipiosData.find(m => m.id_municipio == idMunicipio);
  return municipio ? municipio.nombre_municipio : 'N/A';
}

function mostrarMensaje(tipo, texto) {
  alert(tipo === 'exito' ? '✅ ' + texto : '❌ ' + texto);
}

// Operaciones CRUD
function verPaciente(idPaciente) {
  fetch(`/api/pacientes/${idPaciente}`)
    .then(r => r.json())
    .then(paciente => {
      const modal = new bootstrap.Modal(document.getElementById('modalVerPaciente'));
      modal.show();
      
      // Llenar datos básicos
      document.getElementById('verCedula').textContent = `${paciente.tipo_cedula || ''}-${paciente.cedula || ''}`;
      document.getElementById('verNombreCompleto').textContent = `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim();
      document.getElementById('verTelefono').textContent = paciente.telefono || 'N/A';
      document.getElementById('verCorreo').textContent = paciente.email || 'N/A';
      document.getElementById('verEstado').textContent = obtenerNombreEstado(paciente.id_estado);
      document.getElementById('verMunicipio').textContent = obtenerNombreMunicipio(paciente.id_municipio);
      document.getElementById('verDireccion').textContent = paciente.direccion || 'N/A';
    })
    .catch(error => {
      console.error('Error al obtener paciente:', error);
      alert('Error al cargar datos del paciente');
    });
}

function editarPaciente(idPaciente) {
  fetch(`/api/pacientes/${idPaciente}`)
    .then(r => r.json())
    .then(paciente => {
      const modal = new bootstrap.Modal(document.getElementById('modalEditarPaciente'));
      modal.show();
      
      // Llenar formulario
      document.getElementById('editar_id_paciente').value = paciente.id_paciente;
      document.getElementById('editar_tipo_cedula').value = paciente.tipo_cedula || 'V';
      document.getElementById('editar_cedula').value = paciente.cedula || '';
      document.getElementById('editar_nombre').value = paciente.nombres || '';
      document.getElementById('editar_apellido').value = paciente.apellidos || '';
      document.getElementById('editar_telefono').value = paciente.telefono || '';
      document.getElementById('editar_correo').value = paciente.email || '';
      document.getElementById('editar_direccion').value = paciente.direccion || '';
      
      // Seleccionar estado y municipio
      const selectEstado = document.getElementById('editar_estado');
      selectEstado.value = paciente.id_estado;
      
      // Llenar y seleccionar municipio
      llenarSelectMunicipios(document.getElementById('editar_municipio'), paciente.id_estado);
      setTimeout(() => {
        document.getElementById('editar_municipio').value = paciente.id_municipio;
      }, 100);
    })
    .catch(error => {
      console.error('Error al obtener paciente para editar:', error);
      alert('Error al cargar datos del paciente');
    });
}

function prepararEliminarPaciente(idPaciente, nombreCompleto, cedula) {
  pacienteIdAEliminar = idPaciente;
  
  document.getElementById('eliminar_nombre_paciente').textContent = nombreCompleto;
  document.getElementById('eliminar_cedula_paciente').textContent = cedula;
  
  const modal = new bootstrap.Modal(document.getElementById('modalEliminarPaciente'));
  modal.show();
}

function registrarPaciente(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const pacienteData = {
    cedula: formData.get('cedula'),
    tipo_cedula: formData.get('tipo_cedula'),
    nombres: formData.get('nombre'),
    apellidos: formData.get('apellido'),
    nacimiento: formData.get('fecha_nacimiento'),
    id_estado: formData.get('estado'),
    id_municipio: formData.get('municipio'),
    telefono: formData.get('telefono'),
    email: formData.get('correo'),
    direccion: formData.get('direccion')
  };
  
  fetch('/api/pacientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(pacienteData)
  })
  .then(r => r.json())
  .then(() => {
    mostrarMensaje('exito', 'Paciente registrado con éxito');
    // Recargar página
    setTimeout(() => window.location.reload(), 1000);
  })
  .catch(error => {
    console.error('Error al registrar paciente:', error);
    mostrarMensaje('error', 'Error al registrar paciente');
  });
}

function actualizarPaciente(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const idPaciente = formData.get('editar_id_paciente');
  
  const pacienteData = {
    nombres: formData.get('editar_nombre'),
    apellidos: formData.get('editar_apellido'),
    id_estado: formData.get('editar_estado'),
    id_municipio: formData.get('editar_municipio'),
    telefono: formData.get('editar_telefono'),
    email: formData.get('editar_correo'),
    direccion: formData.get('editar_direccion')
  };
  
  fetch(`/api/pacientes/${idPaciente}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(pacienteData)
  })
  .then(r => r.json())
  .then(() => {
    mostrarMensaje('exito', 'Paciente actualizado con éxito');
    // Recargar página
    setTimeout(() => window.location.reload(), 1000);
  })
  .catch(error => {
    console.error('Error al actualizar paciente:', error);
    mostrarMensaje('error', 'Error al actualizar paciente');
  });
}

function eliminarPaciente() {
  if (!pacienteIdAEliminar) return;
  
  fetch(`/api/pacientes/${pacienteIdAEliminar}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  .then(r => r.json())
  .then(() => {
    mostrarMensaje('exito', 'Paciente eliminado con éxito');
    // Recargar página
    setTimeout(() => window.location.reload(), 1000);
  })
  .catch(error => {
    console.error('Error al eliminar paciente:', error);
    mostrarMensaje('error', 'Error al eliminar paciente');
  });
}

// Exponer funciones para uso global
window.verPaciente = verPaciente;
window.editarPaciente = editarPaciente;
window.prepararEliminarPaciente = prepararEliminarPaciente;