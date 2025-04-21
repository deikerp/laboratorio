// Variables globales
let reactivos = [];
let reactivoIdAEliminar = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, inicializando reactivos...');
  
  // Verificar elementos críticos
  const tabla = document.getElementById('tablaReactivos');
  console.log('Tabla encontrada:', tabla);
  
  const tbody = document.getElementById('tabla-reactivos-body');
  console.log('Tbody encontrado:', tbody);
  
  // Configurar eventos
  configurarEventos();
  
  // Cargar datos iniciales
  cargarReactivos();
});

// Configuración de eventos
function configurarEventos() {
  // Eventos de formularios
  const formRegistro = document.getElementById('formRegistroReactivo');
  if (formRegistro) {
    formRegistro.addEventListener('submit', function(e) {
      e.preventDefault();
      registrarReactivo(this);
    });
  }
  
  const formEditar = document.getElementById('formEditarReactivo');
  if (formEditar) {
    formEditar.addEventListener('submit', function(e) {
      e.preventDefault();
      actualizarReactivo(this);
    });
  }
  
  // Botón confirmar eliminar
  const btnEliminar = document.getElementById('btn-confirmar-eliminar');
  if (btnEliminar) {
    btnEliminar.addEventListener('click', eliminarReactivo);
  }
}

// Cargar reactivos
function cargarReactivos() {
  fetch('/api/reactivos')
    .then(response => response.json())
    .then(data => {
      reactivos = data;
      renderizarReactivos(reactivos);
      
      // Inicializar DataTable si existe
      inicializarDataTable();
    })
    .catch(error => {
      console.error('Error al cargar reactivos:', error);
      mostrarMensaje('error', 'Error al cargar datos de reactivos. Por favor, recargue la página.');
    });
}

// Inicializar DataTable si existe la librería
function inicializarDataTable() {
  const tabla = document.getElementById('tablaReactivos');
  // Verificar si la tabla existe y si DataTable está definido como función
  if (tabla && typeof DataTable === 'function') {
    try {
      const dataTable = new DataTable(tabla);
      implementarBusqueda(dataTable);
    } catch (error) {
      console.error('Error al inicializar DataTable:', error);
    }
  } else {
    console.log('DataTable no está disponible o la tabla no existe');
  }
}

// Función para implementar búsqueda mejorada (opcional)
function implementarBusqueda(dataTable) {
  if (!dataTable) return;
  
  const searchInput = document.querySelector('.datatable-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const textoBusqueda = this.value.trim().toLowerCase();
      
      if (textoBusqueda.length === 0) {
        renderizarReactivos(reactivos);
      } else {
        const resultados = reactivos.filter(reactivo => 
          (reactivo.nombre_reactivo || '').toLowerCase().includes(textoBusqueda) ||
          (reactivo.id_reactivo || '').toString().includes(textoBusqueda)
        );
        renderizarReactivos(resultados);
      }
    });
  }
}

// Renderizar reactivos en la tabla de forma más robusta
function renderizarReactivos(reactivos) {
  console.log('Renderizando reactivos:', reactivos);
  
  // Buscar el tbody de manera más robusta
  let tbody = document.getElementById('tabla-reactivos-body');
  if (!tbody) {
    console.log('No se pudo encontrar el tbody por ID, intentando otra forma...');
    
    // Intentar encontrar la tabla primero y luego el tbody dentro de ella
    const tabla = document.getElementById('tablaReactivos');
    if (tabla) {
      tbody = tabla.querySelector('tbody');
    }
    
    if (!tbody) {
      console.error('No se encontró el tbody en la tabla de reactivos');
      return;
    }
  }
  
  // Si no hay reactivos, mostrar mensaje
  if (!reactivos || reactivos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center">No hay reactivos registrados</td>
      </tr>
    `;
    return;
  }
  
  // Generar HTML para cada reactivo
  let html = '';
  reactivos.forEach(reactivo => {
    html += `
      <tr>
        <td>${reactivo.id_reactivo}</td>
        <td>${reactivo.nombre_reactivo || 'N/A'}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="verReactivo(${reactivo.id_reactivo})">
                  <i class="bi bi-eye me-2 text-info"></i>Ver
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="editarReactivo(${reactivo.id_reactivo})">
                  <i class="bi bi-pencil me-2 text-primary"></i>Editar
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="javascript:void(0)" 
                   onclick="prepararEliminarReactivo(${reactivo.id_reactivo}, '${reactivo.nombre_reactivo}')">
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

// Mostrar mensaje de éxito o error
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
    }, 4000);
  }
}

// Operaciones CRUD
function verReactivo(idReactivo) {
  const reactivo = reactivos.find(r => r.id_reactivo == idReactivo);
  if (!reactivo) {
    mostrarMensaje('error', 'No se encontró el reactivo');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalVerReactivo'));
  modal.show();
  
  // Llenar datos
  document.getElementById('verIdReactivo').textContent = reactivo.id_reactivo;
  document.getElementById('verNombreReactivo').textContent = reactivo.nombre_reactivo || 'N/A';
}

function editarReactivo(idReactivo) {
  const reactivo = reactivos.find(r => r.id_reactivo == idReactivo);
  if (!reactivo) {
    mostrarMensaje('error', 'No se encontró el reactivo');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalEditarReactivo'));
  modal.show();
  
  // Llenar formulario
  document.getElementById('editar_id_reactivo').value = reactivo.id_reactivo;
  document.getElementById('editar_nombre_reactivo').value = reactivo.nombre_reactivo || '';
}

function prepararEliminarReactivo(idReactivo, nombreReactivo) {
  reactivoIdAEliminar = idReactivo;
  
  document.getElementById('eliminar_nombre_reactivo').textContent = nombreReactivo;
  
  const modal = new bootstrap.Modal(document.getElementById('modalEliminarReactivo'));
  modal.show();
}

function registrarReactivo(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const reactivoData = {
    nombre_reactivo: formData.get('nombre_reactivo')
  };
  
  fetch('/api/reactivos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(reactivoData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Reactivo registrado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroReactivo'));
    if (modal) modal.hide();
    
    // Limpiar formulario
    form.reset();
    form.classList.remove('was-validated');
    
    // Recargar datos
    cargarReactivos();
  })
  .catch(error => {
    console.error('Error al registrar reactivo:', error);
    mostrarMensaje('error', 'Error al registrar reactivo');
  });
}

function actualizarReactivo(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const idReactivo = formData.get('editar_id_reactivo');
  
  const reactivoData = {
    nombre_reactivo: formData.get('editar_nombre_reactivo')
  };
  
  fetch(`/api/reactivos/${idReactivo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(reactivoData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Reactivo actualizado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarReactivo'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarReactivos();
  })
  .catch(error => {
    console.error('Error al actualizar reactivo:', error);
    mostrarMensaje('error', 'Error al actualizar reactivo');
  });
}

function eliminarReactivo() {
  if (!reactivoIdAEliminar) return;
  
  fetch(`/api/reactivos/${reactivoIdAEliminar}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Reactivo eliminado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarReactivo'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarReactivos();
  })
  .catch(error => {
    console.error('Error al eliminar reactivo:', error);
    if (error.message && error.message.includes('tiene parámetros asociados')) {
      mostrarMensaje('error', 'No se puede eliminar el reactivo porque tiene parámetros asociados');
    } else {
      mostrarMensaje('error', 'Error al eliminar reactivo');
    }
  });
}

// Exponer funciones para uso global
window.verReactivo = verReactivo;
window.editarReactivo = editarReactivo;
window.prepararEliminarReactivo = prepararEliminarReactivo;