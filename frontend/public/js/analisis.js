// Variables globales
let analisis = [];
let categorias = [];
let analisisIdAEliminar = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, inicializando análisis...');
  
  // Verificar elementos críticos
  const tabla = document.getElementById('tablaAnalisis');
  console.log('Tabla encontrada:', tabla);
  
  const tbody = document.getElementById('tabla-analisis-body');
  console.log('Tbody encontrado:', tbody);
  
  // Configurar eventos
  configurarEventos();
  
  // Cargar datos iniciales
  cargarDatosIniciales();
});

// Configuración de eventos
function configurarEventos() {
  // Eventos de formularios
  const formRegistro = document.getElementById('formRegistroAnalisis');
  if (formRegistro) {
    formRegistro.addEventListener('submit', function(e) {
      e.preventDefault();
      registrarAnalisis(this);
    });
  }
  
  const formEditar = document.getElementById('formEditarAnalisis');
  if (formEditar) {
    formEditar.addEventListener('submit', function(e) {
      e.preventDefault();
      actualizarAnalisis(this);
    });
  }
  
  // Botón confirmar eliminar
  const btnEliminar = document.getElementById('btn-confirmar-eliminar');
  if (btnEliminar) {
    btnEliminar.addEventListener('click', eliminarAnalisis);
  }
}

// Cargar datos iniciales
function cargarDatosIniciales() {
  // Primero cargar categorías - usando la ruta correcta
  fetch('/api/categorias')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar las categorías');
      }
      return response.json();
    })
    .then(data => {
      console.log('Categorías cargadas:', data);
      categorias = data;
      
      // Llenar selects de categorías
      llenarSelectCategorias(document.getElementById('id_categoria'));
      llenarSelectCategorias(document.getElementById('editar_id_categoria'));
      
      // Luego cargar análisis
      return fetch('/api/analisis');
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar los análisis');
      }
      return response.json();
    })
    .then(data => {
      console.log('Análisis cargados:', data);
      analisis = data;
      renderizarAnalisis(analisis);
      
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
  const tabla = document.getElementById('tablaAnalisis');
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

// Llenar selects de categorías
function llenarSelectCategorias(select) {
  if (!select || !categorias.length) return;
  
  select.innerHTML = '<option selected disabled value="">Seleccionar categoría...</option>';
  categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria.id_categoria;
    option.textContent = categoria.categoria;
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
        renderizarAnalisis(analisis);
      } else {
        const resultados = analisis.filter(item => 
          (item.nombre || '').toLowerCase().includes(textoBusqueda) ||
          (item.id_analisis || '').toString().includes(textoBusqueda) ||
          (item.categoria || '').toLowerCase().includes(textoBusqueda)
        );
        renderizarAnalisis(resultados);
      }
    });
  }
}

// Renderizar análisis en la tabla de forma más robusta
function renderizarAnalisis(analisis) {
  console.log('Renderizando análisis:', analisis);
  
  // Buscar el tbody de manera más robusta
  let tbody = document.getElementById('tabla-analisis-body');
  if (!tbody) {
    console.log('No se pudo encontrar el tbody por ID, intentando otra forma...');
    
    // Intentar encontrar la tabla primero y luego el tbody dentro de ella
    const tabla = document.getElementById('tablaAnalisis');
    if (tabla) {
      tbody = tabla.querySelector('tbody');
      console.log('Tbody encontrado dentro de la tabla:', tbody);
    }
    
    if (!tbody) {
      console.error('No se encontró el tbody en la tabla de análisis');
      return;
    }
  }
  
  // Si no hay análisis, mostrar mensaje
  if (!analisis || analisis.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">No hay análisis registrados</td>
      </tr>
    `;
    return;
  }
  
  // Generar HTML para cada análisis
  let html = '';
  analisis.forEach(item => {
    html += `
      <tr>
        <td>${item.id_analisis}</td>
        <td>${item.nombre || 'N/A'}</td>
        <td>${item.categoria || 'Sin categoría'}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="verAnalisis(${item.id_analisis})">
                  <i class="bi bi-eye me-2 text-info"></i>Ver
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="editarAnalisis(${item.id_analisis})">
                  <i class="bi bi-pencil me-2 text-primary"></i>Editar
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="javascript:void(0)" 
                   onclick="prepararEliminarAnalisis(${item.id_analisis}, '${item.nombre}')">
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

// Función auxiliar para obtener nombre de categoría
function obtenerNombreCategoria(idCategoria) {
  const categoria = categorias.find(c => c.id_categoria == idCategoria);
  return categoria ? categoria.categoria : 'N/A';
}

// Operaciones CRUD
function verAnalisis(idAnalisis) {
  const item = analisis.find(a => a.id_analisis == idAnalisis);
  if (!item) {
    mostrarMensaje('error', 'No se encontró el análisis');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalVerAnalisis'));
  modal.show();
  
  // Llenar datos
  document.getElementById('verIdAnalisis').textContent = item.id_analisis;
  document.getElementById('verNombreAnalisis').textContent = item.nombre || 'N/A';
  document.getElementById('verCategoriaAnalisis').textContent = item.categoria || 'Sin categoría';
}

function editarAnalisis(idAnalisis) {
  const item = analisis.find(a => a.id_analisis == idAnalisis);
  if (!item) {
    mostrarMensaje('error', 'No se encontró el análisis');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalEditarAnalisis'));
  modal.show();
  
  // Llenar formulario
  document.getElementById('editar_id_analisis').value = item.id_analisis;
  document.getElementById('editar_nombre').value = item.nombre || '';
  
  // Seleccionar categoría
  const selectCategoria = document.getElementById('editar_id_categoria');
  if (selectCategoria) {
    selectCategoria.value = item.id_categoria || '';
  }
}

function prepararEliminarAnalisis(idAnalisis, nombreAnalisis) {
  analisisIdAEliminar = idAnalisis;
  
  document.getElementById('eliminar_nombre_analisis').textContent = nombreAnalisis;
  
  const modal = new bootstrap.Modal(document.getElementById('modalEliminarAnalisis'));
  modal.show();
}

function registrarAnalisis(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const analisisData = {
    nombre: formData.get('nombre'),
    id_categoria: formData.get('id_categoria')
  };
  
  fetch('/api/analisis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(analisisData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Análisis registrado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroAnalisis'));
    if (modal) modal.hide();
    
    // Limpiar formulario
    form.reset();
    form.classList.remove('was-validated');
    
    // Recargar datos
    cargarDatosIniciales();
  })
  .catch(error => {
    console.error('Error al registrar análisis:', error);
    mostrarMensaje('error', 'Error al registrar análisis');
  });
}

function actualizarAnalisis(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const idAnalisis = formData.get('editar_id_analisis');
  
  const analisisData = {
    nombre: formData.get('editar_nombre'),
    id_categoria: formData.get('editar_id_categoria')
  };
  
  fetch(`/api/analisis/${idAnalisis}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(analisisData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Análisis actualizado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarAnalisis'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarDatosIniciales();
  })
  .catch(error => {
    console.error('Error al actualizar análisis:', error);
    mostrarMensaje('error', 'Error al actualizar análisis');
  });
}

function eliminarAnalisis() {
  if (!analisisIdAEliminar) return;
  
  fetch(`/api/analisis/${analisisIdAEliminar}`, {
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
    mostrarMensaje('exito', 'Análisis eliminado con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarAnalisis'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarDatosIniciales();
  })
  .catch(error => {
    console.error('Error al eliminar análisis:', error);
    if (error.message && (error.message.includes('tiene parámetros asociados') || 
                          error.message.includes('tiene resultados asociados'))) {
      mostrarMensaje('error', 'No se puede eliminar el análisis porque tiene elementos asociados');
    } else {
      mostrarMensaje('error', 'Error al eliminar análisis');
    }
  });
}

// Exponer funciones para uso global
window.verAnalisis = verAnalisis;
window.editarAnalisis = editarAnalisis;
window.prepararEliminarAnalisis = prepararEliminarAnalisis;