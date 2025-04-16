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