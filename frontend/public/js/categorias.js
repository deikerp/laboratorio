// Variables globales
let categorias = [];
let categoriaIdAEliminar = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, inicializando categorías...');
  
  // Verificar elementos críticos
  const tabla = document.getElementById('tablaCategorias');
  console.log('Tabla encontrada:', tabla);
  
  const tbody = document.getElementById('tabla-categorias-body');
  console.log('Tbody encontrado:', tbody);
  
  // Configurar eventos
  configurarEventos();
  
  // Cargar datos iniciales
  cargarCategorias();
});

// Configuración de eventos
function configurarEventos() {
  // Eventos de formularios
  const formRegistro = document.getElementById('formRegistroCategoria');
  if (formRegistro) {
    formRegistro.addEventListener('submit', function(e) {
      e.preventDefault();
      registrarCategoria(this);
    });
  }
  
  const formEditar = document.getElementById('formEditarCategoria');
  if (formEditar) {
    formEditar.addEventListener('submit', function(e) {
      e.preventDefault();
      actualizarCategoria(this);
    });
  }
  
  // Botón confirmar eliminar
  const btnEliminar = document.getElementById('btn-confirmar-eliminar');
  if (btnEliminar) {
    btnEliminar.addEventListener('click', eliminarCategoria);
  }
}

// Cargar categorías
function cargarCategorias() {
  // Esta es la ruta correcta según configuración en server.js: /api/categorias
  fetch('/api/categorias')
    .then(response => response.json())
    .then(data => {
      console.log('Categorías cargadas:', data);
      categorias = data;
      renderizarCategorias(categorias);
      
      // Inicializar DataTable si existe
      inicializarDataTable();
    })
    .catch(error => {
      console.error('Error al cargar categorías:', error);
      mostrarMensaje('error', 'Error al cargar datos de categorías. Por favor, recargue la página.');
    });
}

// Inicializar DataTable si existe la librería
function inicializarDataTable() {
  const tabla = document.getElementById('tablaCategorias');
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
        renderizarCategorias(categorias);
      } else {
        const resultados = categorias.filter(categoria => 
          (categoria.categoria || '').toLowerCase().includes(textoBusqueda) ||
          (categoria.id_categoria || '').toString().includes(textoBusqueda)
        );
        renderizarCategorias(resultados);
      }
    });
  }
}

// Renderizar categorías en la tabla de forma más robusta
function renderizarCategorias(categorias) {
  console.log('Renderizando categorías:', categorias);
  
  // Buscar el tbody de manera más robusta
  let tbody = document.getElementById('tabla-categorias-body');
  if (!tbody) {
    console.log('No se pudo encontrar el tbody por ID, intentando otra forma...');
    
    // Intentar encontrar la tabla primero y luego el tbody dentro de ella
    const tabla = document.getElementById('tablaCategorias');
    if (tabla) {
      tbody = tabla.querySelector('tbody');
      console.log('Tbody encontrado dentro de la tabla:', tbody);
    }
    
    if (!tbody) {
      console.error('No se encontró el tbody en la tabla de categorías');
      return;
    }
  }
  
  // Si no hay categorías, mostrar mensaje
  if (!categorias || categorias.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center">No hay categorías registradas</td>
      </tr>
    `;
    return;
  }
  
  // Generar HTML para cada categoría
  let html = '';
  categorias.forEach(categoria => {
    html += `
      <tr>
        <td>${categoria.id_categoria}</td>
        <td>${categoria.categoria || 'N/A'}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="verCategoria(${categoria.id_categoria})">
                  <i class="bi bi-eye me-2 text-info"></i>Ver
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="javascript:void(0)" onclick="editarCategoria(${categoria.id_categoria})">
                  <i class="bi bi-pencil me-2 text-primary"></i>Editar
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="javascript:void(0)" 
                   onclick="prepararEliminarCategoria(${categoria.id_categoria}, '${categoria.categoria}')">
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
function verCategoria(idCategoria) {
  const categoria = categorias.find(c => c.id_categoria == idCategoria);
  if (!categoria) {
    mostrarMensaje('error', 'No se encontró la categoría');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalVerCategoria'));
  modal.show();
  
  // Llenar datos
  document.getElementById('verIdCategoria').textContent = categoria.id_categoria;
  document.getElementById('verNombreCategoria').textContent = categoria.categoria || 'N/A';
}

function editarCategoria(idCategoria) {
  const categoria = categorias.find(c => c.id_categoria == idCategoria);
  if (!categoria) {
    mostrarMensaje('error', 'No se encontró la categoría');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalEditarCategoria'));
  modal.show();
  
  // Llenar formulario
  document.getElementById('editar_id_categoria').value = categoria.id_categoria;
  document.getElementById('editar_categoria').value = categoria.categoria || '';
}

function prepararEliminarCategoria(idCategoria, nombreCategoria) {
  categoriaIdAEliminar = idCategoria;
  
  document.getElementById('eliminar_nombre_categoria').textContent = nombreCategoria;
  
  const modal = new bootstrap.Modal(document.getElementById('modalEliminarCategoria'));
  modal.show();
}

function registrarCategoria(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const categoriaData = {
    categoria: formData.get('categoria')
  };
  
  // Usar la ruta correcta
  fetch('/api/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(categoriaData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Categoría registrada con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroCategoria'));
    if (modal) modal.hide();
    
    // Limpiar formulario
    form.reset();
    form.classList.remove('was-validated');
    
    // Recargar datos
    cargarCategorias();
  })
  .catch(error => {
    console.error('Error al registrar categoría:', error);
    mostrarMensaje('error', 'Error al registrar categoría');
  });
}

function actualizarCategoria(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const formData = new FormData(form);
  const idCategoria = formData.get('editar_id_categoria');
  
  const categoriaData = {
    categoria: formData.get('editar_categoria')
  };
  
  // Usar la ruta correcta
  fetch(`/api/categorias/${idCategoria}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(categoriaData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return response.json();
  })
  .then(data => {
    mostrarMensaje('exito', 'Categoría actualizada con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarCategoria'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarCategorias();
  })
  .catch(error => {
    console.error('Error al actualizar categoría:', error);
    mostrarMensaje('error', 'Error al actualizar categoría');
  });
}

function eliminarCategoria() {
  if (!categoriaIdAEliminar) return;
  
  // Usar la ruta correcta
  fetch(`/api/categorias/${categoriaIdAEliminar}`, {
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
    mostrarMensaje('exito', 'Categoría eliminada con éxito');
    
    // Cerrar modal si existe
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarCategoria'));
    if (modal) modal.hide();
    
    // Recargar datos
    cargarCategorias();
  })
  .catch(error => {
    console.error('Error al eliminar categoría:', error);
    if (error.message && error.message.includes('tiene análisis asociados')) {
      mostrarMensaje('error', 'No se puede eliminar la categoría porque tiene análisis asociados');
    } else {
      mostrarMensaje('error', 'Error al eliminar categoría');
    }
  });
}

// Exponer funciones para uso global
window.verCategoria = verCategoria;
window.editarCategoria = editarCategoria;
window.prepararEliminarCategoria = prepararEliminarCategoria;