// Variables globales
let parametros = [];
let analisis = [];
let reactivos = [];
let parametroIdAEliminar = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, inicializando parámetros...');
  
  // Verificar elementos críticos
  const tabla = document.getElementById('tablaParametros');
  console.log('Tabla encontrada:', tabla);
  
  const tbody = document.getElementById('tabla-parametros-body');
  console.log('Tbody encontrado:', tbody);
  
  // Configurar eventos
  configurarEventos();
  
  // Cargar datos iniciales
  cargarDatosIniciales();
});

// Configuración de eventos
function configurarEventos() {
  // Eventos de formularios
  const formRegistro = document.getElementById('formRegistroParametro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', function(e) {
      e.preventDefault();
      registrarParametro(this);
    });
  }
  
  const formEditar = document.getElementById('formEditarParametro');
  if (formEditar) {
    formEditar.addEventListener('submit', function(e) {
      e.preventDefault();
      actualizarParametro(this);
    });
  }
  
  // Botón confirmar eliminar
  const btnEliminar = document.getElementById('btn-confirmar-eliminar');
  if (btnEliminar) {
    btnEliminar.addEventListener('click', eliminarParametro);
  }
}

// Cargar datos iniciales
function cargarDatosIniciales() {
  // Cargar análisis
  fetch('/api/analisis')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar los análisis');
      }
      return response.json();
    })
    .then(data => {
      console.log('Análisis cargados:', data);
      analisis = data;
      
      // Llenar selects de análisis
      llenarSelectAnalisis(document.getElementById('id_analisis'));
      llenarSelectAnalisis(document.getElementById('editar_id_analisis'));
      
      // Luego cargar reactivos
      return fetch('/api/reactivos');
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar los reactivos');
      }
      return response.json();
    })
    .then(data => {
      console.log('Reactivos cargados:', data);
      reactivos = data;
      
      // Llenar selects de reactivos
      llenarSelectReactivos(document.getElementById('id_reactivo'));
      llenarSelectReactivos(document.getElementById('editar_id_reactivo'));
      
      // Finalmente cargar parámetros
      // RUTA CORREGIDA - Según el router proporcionado
      return fetch('/api/parametros');
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar los parámetros');
      }
      return response.json();
    })
    .then(data => {
      console.log('Parámetros cargados:', data);
      parametros = data;
      renderizarParametros(parametros);
      
      // Inicializar DataTable si existe
      inicializarDataTable();
    })
    .catch(error => {
      console.error('Error al cargar datos iniciales:', error);
      mostrarMensaje('error', 'Error al cargar datos. Por favor, recargue la página.');
    });
}

// Inicializar DataTable si existe la librería
function inicializarDataTable() {
  const tabla = document.getElementById('tablaParametros');
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

// Llenar selects
function llenarSelectAnalisis(select) {
  if (!select || !analisis.length) return;
  
  select.innerHTML = '<option selected disabled value="">Seleccionar análisis...</option>';
  analisis.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id_analisis;
    option.textContent = item.nombre;
    select.appendChild(option);
  });
}

function llenarSelectReactivos(select) {
  if (!select || !reactivos.length) return;
  
  select.innerHTML = '<option selected disabled value="">Seleccionar reactivo...</option>';
  reactivos.forEach(reactivo => {
    const option = document.createElement('option');
    option.value = reactivo.id_reactivo;
    option.textContent = reactivo.nombre_reactivo;
    select.appendChild(option);
  });
}

// Función para implementar búsqueda mejorada (opcional)
function implementarBusqueda(dataTable) {
  if (!dataTable) return;
  
  const searchInput = document.querySelector('.datatable-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const textoBusqueda = this.value.trim().toLowerCase();
      
      if (textoBusqueda.length === 0) {
        renderizarParametros(parametros);
      } else {
        const resultados = parametros.filter(parametro => 
          (parametro.nombre_parametro || '').toLowerCase().includes(textoBusqueda) ||
          (parametro.id_parametro || '').toString().includes(textoBusqueda) ||
          (obtenerNombreAnalisis(parametro.id_analisis) || '').toLowerCase().includes(textoBusqueda) ||
          (obtenerNombreReactivo(parametro.id_reactivo) || '').toLowerCase().includes(textoBusqueda) ||
          (parametro.valor_referencial || '').toLowerCase().includes(textoBusqueda)
        );
        renderizarParametros(resultados);
      }
    });
  }
}

// Renderizar parametros en la tabla
function renderizarParametros(parametros) {
  console.log('Renderizando parámetros:', parametros);
  
  // Buscar el tbody de manera más robusta
  let tbody = document.getElementById('tabla-parametros-body');
  if (!tbody) {
    console.log('No se pudo encontrar el tbody por ID, intentando otra forma...');
    
    // Intentar encontrar la tabla primero y luego el tbody dentro de ella
    const tabla = document.getElementById('tablaParametros');
    if (tabla) {
      tbody = tabla.querySelector('tbody');
      console.log('Tbody encontrado dentro de la tabla:', tbody);
    }
    
    if (!tbody) {
      console.error('No se encontró el tbody en la tabla de parámetros');
      return;
    }
  }
  
  // Si no hay parámetros, mostrar mensaje
  if (!parametros || parametros.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">No hay parámetros registrados</td>
      </tr>
    `;
    return;
  }
  
  // Generar HTML para cada parámetro
  let html = '';
  parametros.forEach(parametro => {
    html += `
      <tr>
        <td>${parametro.id_parametro}</td>
        <td>${parametro.nombre_parametro || 'N/A'}</td>
        <td>${obtenerNombreAnalisis(parametro.id_analisis)}</td>
        <td>${obtenerNombreReactivo(parametro.id_reactivo)}</td>
        <td>${parametro.valor_referencial || 'N/A'}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="verParametro(${parametro.id_parametro})">
                  <i class="bi bi-eye me-2 text-info"></i>Ver
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="editarParametro(${parametro.id_parametro})">
                  <i class="bi bi-pencil me-2 text-primary"></i>Editar
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="javascript:void(0)" 
                   onclick="prepararEliminarParametro(${parametro.id_parametro}, '${parametro.nombre_parametro}')">
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

// Funciones auxiliares
function obtenerNombreAnalisis(idAnalisis) {
  const item = analisis.find(a => a.id_analisis == idAnalisis);
  return item ? item.nombre : 'N/A';
}

function obtenerNombreReactivo(idReactivo) {
  const reactivo = reactivos.find(r => r.id_reactivo == idReactivo);
  return reactivo ? reactivo.nombre_reactivo : 'N/A';
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
function verParametro(idParametro) {
  const parametro = parametros.find(p => p.id_parametro == idParametro);
  if (!parametro) {
    mostrarMensaje('error', 'No se encontró el parámetro');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalVerParametro'));
  modal.show();
  
  // Llenar datos
  document.getElementById('verIdParametro').textContent = parametro.id_parametro;
  document.getElementById('verNombreParametro').textContent = parametro.nombre_parametro || 'N/A';
  document.getElementById('verAnalisisParametro').textContent = obtenerNombreAnalisis(parametro.id_analisis);
  document.getElementById('verReactivoParametro').textContent = obtenerNombreReactivo(parametro.id_reactivo);
  document.getElementById('verValorReferencialParametro').textContent = parametro.valor_referencial || 'N/A';
}

function editarParametro(idParametro) {
  const parametro = parametros.find(p => p.id_parametro == idParametro);
  if (!parametro) {
    mostrarMensaje('error', 'No se encontró el parámetro');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalEditarParametro'));
  modal.show();
  
  // Llenar formulario
  document.getElementById('editar_id_parametro').value = parametro.id_parametro;
  document.getElementById('editar_nombre_parametro').value = parametro.nombre_parametro || '';
  document.getElementById('editar_valor_referencial').value = parametro.valor_referencial || '';
  
  // Seleccionar análisis y reactivo
  const selectAnalisis = document.getElementById('editar_id_analisis');
  if (selectAnalisis) {
    selectAnalisis.value = parametro.id_analisis || '';
  }
  
  const selectReactivo = document.getElementById('editar_id_reactivo');
  if (selectReactivo) {
    selectReactivo.value = parametro.id_reactivo || '';
  }
}

function prepararEliminarParametro(idParametro, nombreParametro) {
  parametroIdAEliminar = idParametro;
  
  document.getElementById('eliminar_nombre_parametro').textContent = nombreParametro;
  
  const modal = new bootstrap.Modal(document.getElementById('modalEliminarParametro'));
  modal.show();
}

function registrarParametro(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const parametroData = {
    id_analisis: formData.get('id_analisis'),
    nombre_parametro: formData.get('nombre_parametro'),
    valor_referencial: formData.get('valor_referencial'),
    id_reactivo: formData.get('id_reactivo')
  };
  
  // RUTA CORREGIDA - Según el router proporcionado
  fetch('/api/parametros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(parametroData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Parámetro registrado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroParametro'));
    if (modal) modal.hide();
    
    // Limpiar formulario
    form.reset();
    form.classList.remove('was-validated');
    
    // Recargar datos
    cargarDatosIniciales();
  })
  .catch(error => {
    console.error('Error al registrar parámetro:', error);
    mostrarMensaje('error', 'Error al registrar parámetro');
  });
}

function actualizarParametro(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const idParametro = formData.get('editar_id_parametro');
  
  const parametroData = {
    nombre_parametro: formData.get('editar_nombre_parametro'),
    valor_referencial: formData.get('editar_valor_referencial'),
    id_reactivo: formData.get('editar_id_reactivo')
  };
  
  // RUTA CORREGIDA - Según el router proporcionado
  fetch(`/api/parametros/${idParametro}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(parametroData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Parámetro actualizado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarParametro'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarDatosIniciales();
  })
  .catch(error => {
    console.error('Error al actualizar parámetro:', error);
    mostrarMensaje('error', 'Error al actualizar parámetro');
  });
}

function eliminarParametro() {
  if (!parametroIdAEliminar) return;
  
  // RUTA CORREGIDA - Según el router proporcionado
  fetch(`/api/parametros/${parametroIdAEliminar}`, {
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
    mostrarMensaje('exito', 'Parámetro eliminado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarParametro'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarDatosIniciales();
  })
  .catch(error => {
    console.error('Error al eliminar parámetro:', error);
    if (error.message && error.message.includes('tiene resultados asociados')) {
      mostrarMensaje('error', 'No se puede eliminar el parámetro porque tiene resultados asociados');
    } else {
      mostrarMensaje('error', 'Error al eliminar parámetro');
    }
  });
}

// Exponer funciones para uso global
window.verParametro = verParametro;
window.editarParametro = editarParametro;
window.prepararEliminarParametro = prepararEliminarParametro;