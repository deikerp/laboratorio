document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('yourPassword');
    
    togglePassword.addEventListener('click', function() {
      // Cambiar el tipo de input
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.innerHTML = "<i class='bx bx-hide'></i>";
      } else {
        passwordInput.type = 'password';
        togglePassword.innerHTML = "<i class='bx bx-show'></i>";
      }
    });
  });


            
