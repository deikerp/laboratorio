/**
 * Script para el manejo del formulario de inicio de sesión
 * IMPORTANTE: Este script debe colocarse en el <head> con el atributo defer
 */

// BLOQUEO VISUAL INMEDIATO - Se ejecuta antes que cualquier otra cosa 
(function() {
  // Ocultar formulario de login inmediatamente
  document.head.insertAdjacentHTML('beforeend', 
      '<style>.login-form, form, .card { display: none; }</style>'
  );
})();

document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando script de login (sin flash)');
  
  // Referencias a elementos del DOM
  const loginForm = document.querySelector('.needs-validation');
  const loginContainer = document.querySelector('.login-form, .card');
  const usernameInput = document.getElementById('yourUsername');
  const passwordInput = document.getElementById('yourPassword');
  const togglePasswordBtn = document.getElementById('togglePassword');
  
  // Crear el contenedor de mensajes de error si no existe
  let loginErrorDiv = document.getElementById('loginError');
  if (!loginErrorDiv && loginForm) {
      loginErrorDiv = createErrorMessageContainer();
  }

  // Comprobar si existe una sesión previa
  checkExistingSession();

  // Evento para mostrar/ocultar contraseña
  if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener('click', function() {
          const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
          passwordInput.setAttribute('type', type);
          
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
  }

  // Evento de envío del formulario
  if (loginForm) {
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
              const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
              if (submitBtn) {
                  submitBtn.disabled = true;
                  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando sesión...';
              }

              // Bloquear pantalla completa durante autenticación
              mostrarOverlay();

              // Realizar solicitud de inicio de sesión
              const response = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(userData),
                  credentials: 'include' // Para manejar cookies
              });

              // Restaurar botón si hay error
              if (!response.ok && submitBtn) {
                  submitBtn.disabled = false;
                  submitBtn.innerHTML = originalBtnText;
              }

              if (!response.ok) {
                  const errorData = await response.json();
                  
                  // Quitar overlay en caso de error
                  quitarOverlay();
                  
                  throw new Error(errorData.error || 'Error en el inicio de sesión');
              }
              
              // Redirección inmediata sin animaciones
              window.location.replace('/dashboard');
              
          } catch (error) {
              // Mostrar mensaje de error
              showErrorMessage(error.message);
          }
      });
  }

  /**
   * Comprueba si existe una sesión previa y redirige si es necesario
   */
  function checkExistingSession() {
      console.log('Verificando autenticación existente...');
      
      // Verificar si el usuario está autenticado usando la API
      fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
          }
      })
      .then(response => {
          if (!response.ok) throw new Error('No autenticado');
          return response.json();
      })
      .then(data => {
          // Usuario autenticado, redirigir al dashboard inmediatamente
          console.log('Usuario ya autenticado, redirigiendo...');
          window.location.replace('/dashboard');
      })
      .catch(error => {
          // Usuario no autenticado, mostrar formulario
          console.log('Usuario no autenticado, mostrando formulario de login');
          if (loginContainer) {
              loginContainer.style.display = 'block';
          }
      });
  }
  
  /**
   * Muestra un overlay mientras se procesa la autenticación
   */
  function mostrarOverlay() {
      // Si ya existe, no hacer nada
      if (document.getElementById('auth-overlay')) {
          return;
      }
      
      // Crear y mostrar overlay
      const overlay = document.createElement('div');
      overlay.id = 'auth-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:#f6f9ff;z-index:9999;';
      document.body.appendChild(overlay);
  }
  
  /**
   * Quita el overlay de autenticación
   */
  function quitarOverlay() {
      const overlay = document.getElementById('auth-overlay');
      if (overlay) {
          overlay.remove();
      }
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
      if (loginForm && loginForm.parentNode) {
          loginForm.parentNode.insertBefore(errorDiv, loginForm.nextSibling);
      }
      
      return errorDiv;
  }

  /**
   * Muestra un mensaje de error
   */
  function showErrorMessage(message) {
      if (!loginErrorDiv) return;
      
      loginErrorDiv.textContent = message;
      loginErrorDiv.classList.remove('d-none');
  }

  /**
   * Limpia los mensajes de error
   */
  function clearErrorMessages() {
      if (!loginErrorDiv) return;
      
      loginErrorDiv.textContent = '';
      loginErrorDiv.classList.add('d-none');
  }
});