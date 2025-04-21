document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario de cambio de contraseña
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const renewPasswordInput = document.getElementById('renewPassword');

    const toggleCurrentPassword = document.getElementById('toggleCurrentPassword');
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const toggleRenewPassword = document.getElementById('toggleRenewPassword');

    // Función para alternar la visibilidad de la contraseña
    const togglePasswordVisibility = (input, button) => {
        if (!input || !button) return; // Validación para evitar errores si los elementos no existen

        button.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            button.innerHTML = input.type === 'password' ? "<i class='bx bx-show'></i>" : "<i class='bx bx-hide'></i>";
        });
    };

    // Aplicar la función a cada campo de contraseña
    togglePasswordVisibility(currentPasswordInput, toggleCurrentPassword);
    togglePasswordVisibility(newPasswordInput, toggleNewPassword);
    togglePasswordVisibility(renewPasswordInput, toggleRenewPassword);
});

  /**
   * Función global para alternar la visibilidad de contraseñas
   * @param {HTMLElement} toggleBtn - El botón que alterna la visibilidad de la contraseña
   * @param {HTMLElement} passwordInput - El campo de entrada de contraseña
   */
  function setupPasswordToggle(toggleBtn, passwordInput) {
    if (!toggleBtn || !passwordInput) return;
    
    toggleBtn.addEventListener('click', function() {
      // Alternar tipo de entrada entre 'password' y 'text'
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Cambiar el icono
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

  // Cuando el documento esté cargado
  document.addEventListener('DOMContentLoaded', function() {
    // Configurar toggle para el formulario de registro
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    setupPasswordToggle(togglePassword, password);
    
    // Configurar toggle para el formulario de edición
    const toggleEditPassword = document.getElementById('toggleEditPassword');
    const editPassword = document.getElementById('editar_password');
    setupPasswordToggle(toggleEditPassword, editPassword);
  });