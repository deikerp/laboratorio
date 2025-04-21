/**
 * auth.js - Sistema de autenticación sin flash de pantalla
 * IMPORTANTE: Este script debe colocarse en el <head> con el atributo defer
 */

// BLOQUEO VISUAL INMEDIATO - Se ejecuta antes que cualquier otra cosa
(function() {
    // Determinar tipo de página
    const esLoginPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    const esRegistroPage = window.location.pathname === '/registro' || window.location.pathname === '/auth/registro';
    const esPaginaProtegida = 
        window.location.pathname.includes('/dashboard') || 
        window.location.pathname.includes('/perfil') ||
        window.location.pathname.includes('/pacientes') ||
        window.location.pathname.includes('/examenes') ||
        window.location.pathname.includes('/categorias') ||
        window.location.pathname.includes('/analisis') ||
        window.location.pathname.includes('/reactivos') ||
        window.location.pathname.includes('/parametros');
    
    // Crear overlay para bloquear cualquier flash
    if (!esLoginPage || esPaginaProtegida || esRegistroPage) {
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:#f6f9ff;z-index:9999;';
        document.head.insertAdjacentHTML('beforeend', 
            '<style>#auth-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:#f6f9ff;z-index:9999;}</style>'
        );
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(overlay);
        });
    }
})();

// LÓGICA PRINCIPAL - Se ejecuta cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de autenticación (sin flash)');
    
    // Detectar tipo de página
    const esLoginPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    const esRegistroPage = window.location.pathname === '/registro' || window.location.pathname === '/auth/registro';
    const esPaginaProtegida = 
        window.location.pathname.includes('/dashboard') || 
        window.location.pathname.includes('/perfil') ||
        window.location.pathname.includes('/pacientes') ||
        window.location.pathname.includes('/examenes') ||
        window.location.pathname.includes('/categorias') ||
        window.location.pathname.includes('/analisis') ||
        window.location.pathname.includes('/reactivos') ||
        window.location.pathname.includes('/parametros');
    
    // Verificar autenticación del usuario de forma silenciosa
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
        // Usuario está autenticado
        console.log('Usuario autenticado:', data.user);
        
        // Guardar datos del usuario globalmente
        window.currentUser = data.user;
        
        // Si está en login, redirigir al dashboard inmediatamente (sin animaciones)
        if (esLoginPage) {
            window.location.replace('/dashboard');
            return;
        }
        
        // Verificar acceso a página de registro (solo para Jefes)
        if (esRegistroPage) {
            if (data.user.tipo_user !== 'Jefe' && data.user.id_tipo !== 1) {
                console.log('Acceso denegado a registro: no es Jefe');
                window.location.replace('/dashboard');
                return;
            }
        }
        
        // Cargar datos completos del usuario para tener información de imagen
        return fetch(`/api/usuarios/${data.user.id || data.user.id_user}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) return data; // Usar datos básicos si falla
            return response.json();
        })
        .then(userData => {
            // Actualizar con datos completos
            window.currentUser = userData;
            
            // Cargar componentes UI y quitar overlay
            cargarComponentesUI(userData);
            quitarOverlay();
        });
    })
    .catch(error => {
        console.log('Error de autenticación:', error.message);
        
        // Usuario no autenticado
        if (esPaginaProtegida || esRegistroPage) {
            // Redirigir al login inmediatamente (sin animaciones)
            window.location.replace('/');
            return;
        }
        
        // Si está en página de login, mostrar el formulario
        if (esLoginPage) {
            mostrarFormularioLogin();
        }
        
        // No es página protegida, quitar overlay
        quitarOverlay();
    });
    
    // Manejar logout de forma global
    document.addEventListener('click', function(event) {
        const logoutBtn = event.target.closest('a[href="#"][class*="logout"], a:has(i.bi-box-arrow-right)');
        if (logoutBtn) {
            event.preventDefault();
            
            // Mostrar overlay antes de cerrar sesión
            mostrarOverlay();
            
            // Cerrar sesión
            fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .finally(() => {
                window.location.replace('/');
            });
        }
    });
    
    /**
     * Muestra el formulario de login
     */
    function mostrarFormularioLogin() {
        const loginForm = document.querySelector('.login-form, form, .card');
        if (loginForm) {
            loginForm.style.display = 'block';
        }
    }
    
    /**
     * Quita el overlay de carga
     */
    function quitarOverlay() {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    /**
     * Muestra el overlay (útil para logout)
     */
    function mostrarOverlay() {
        // Si ya existe, no hacer nada
        if (document.getElementById('auth-overlay')) {
            return;
        }
        
        // Crear y mostrar overlay
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        document.body.appendChild(overlay);
    }
    
    /**
     * Carga los componentes de UI (sidebar y header)
     */
    function cargarComponentesUI(user) {
        // Generar header dinámico
        generarHeader(user);
        
        // Generar sidebar dinámico
        generarSidebar();
        
        // Notificar a otros scripts que el usuario está autenticado
        document.dispatchEvent(new CustomEvent('userAuthenticated', { 
            detail: { user: user } 
        }));
    }
    
    /**
     * Genera el header de la aplicación
     */
    function generarHeader(user) {
        // Verificar si ya existe un header
        let headerElement = document.getElementById('header');
        
        if (!headerElement) {
            // Crear el header dinámicamente
            headerElement = document.createElement('header');
            headerElement.id = 'header';
            headerElement.className = 'header fixed-top d-flex align-items-center';
            document.body.insertBefore(headerElement, document.body.firstChild);
        }
        
        // Obtener nombre completo e imagen
        const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.usuario || 'Usuario';
        const imgUrl = user.imagen ? `/api/images/profile-image/${user.imagen}` : '../../img/profile-img.jpg';
        
        // Generar contenido del header
        headerElement.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <a href="/dashboard" class="logo d-flex align-items-center">
                    <img src="../../img/favicon.png" alt="">
                    <span class="d-none d-lg-block">Laboratorio</span>
                </a>
                <i class="bi bi-list toggle-sidebar-btn"></i>
            </div>

            <div class="search-bar">
                <form class="search-form d-flex align-items-center" method="POST" action="#">
                    <input type="text" name="query" placeholder="Buscar" title="Ingresa palabra clave">
                    <button type="submit" title="Buscar"><i class="bi bi-search"></i></button>
                </form>
            </div>

            <nav class="header-nav ms-auto">
                <ul class="d-flex align-items-center">
                    <li class="nav-item d-block d-lg-none">
                        <a class="nav-link nav-icon search-bar-toggle" href="#">
                            <i class="bi bi-search"></i>
                        </a>
                    </li>

                    <li class="nav-item dropdown">
                        <a class="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                            <i class="bi bi-bell"></i>
                            <span class="badge bg-primary badge-number">4</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
                            <li class="dropdown-header">
                                Tienes 4 notificaciones nuevas
                                <a href="#"><span class="badge rounded-pill bg-primary p-2 ms-2">Ver todas</span></a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li class="notification-item">
                                <i class="bi bi-exclamation-circle text-warning"></i>
                                <div>
                                    <h4>Alerta del sistema</h4>
                                    <p>Actualización de base de datos completada</p>
                                    <p>30 min. atrás</p>
                                </div>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li class="dropdown-footer">
                                <a href="#">Ver todas las notificaciones</a>
                            </li>
                        </ul>
                    </li>

                    <li class="nav-item dropdown pe-3">
                        <a class="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                            <img src="${imgUrl}" alt="Profile" class="rounded-circle nav-profile-img" 
                                 onerror="this.onerror=null; this.src='../../img/profile-img.jpg';">
                            <span class="d-none d-md-block dropdown-toggle ps-2">${nombreCompleto}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                            <li class="dropdown-header">
                                <h6>${nombreCompleto}</h6>
                                <span>${user.tipo_user || 'Sistema de Laboratorio'}</span>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center" href="/perfil">
                                    <i class="bi bi-person"></i>
                                    <span>Mi Perfil</span>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center" href="#">
                                    <i class="bi bi-box-arrow-right"></i>
                                    <span>Cerrar Sesión</span>
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        `;
        
        // Configurar eventos del header
        const searchBarToggle = headerElement.querySelector('.search-bar-toggle');
        if (searchBarToggle) {
            searchBarToggle.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('.search-bar').classList.toggle('search-bar-show');
            });
        }
        
        // Configurar evento toggle sidebar
        const toggleSidebarBtn = headerElement.querySelector('.toggle-sidebar-btn');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', function() {
                document.body.classList.toggle('toggle-sidebar');
            });
        }
    }
    
    /**
     * Genera el sidebar de la aplicación
     */
    function generarSidebar() {
        // Definir las opciones del sidebar
        const sidebarOptions = [
            {
                href: '/dashboard',
                icon: 'bi-grid',
                label: 'Dashboard',
                active: window.location.pathname.includes('/dashboard')
            },
            {
                href: '/pacientes',
                icon: 'bi-person-vcard',
                label: 'Pacientes',
                active: window.location.pathname.includes('/pacientes')
            },
            {
                href: '/examenes',
                icon: 'bi-clipboard2-check',
                label: 'Exámenes',
                active: window.location.pathname.includes('/examenes')
            },
            {
                href: '/categorias',
                icon: 'bi-list-ul',
                label: 'Categorías',
                active: window.location.pathname.includes('/categorias')
            },
            {
                href: '/analisis',
                icon: 'bi-activity',
                label: 'Análisis',
                active: window.location.pathname.includes('/analisis')
            }, 
            {
                href: '/reactivos',
                icon: 'bi bi-capsule', 
                label: 'Reactivos',
                active: window.location.pathname.includes('/reactivos')
            },
            {
                href: '/parametros',
                icon: 'bi-rulers',
                label: 'Parámetros',
                active: window.location.pathname.includes('/parametros')
            }
        ];

        // Opciones de páginas - Perfil siempre visible, Registro solo para Jefes
        const paginasOptions = [
            {
                href: '/perfil',
                icon: 'bi-person',
                label: 'Perfil',
                active: window.location.pathname.includes('/perfil')
            }
        ];
        
        // Agregar opción de Registro solo si el usuario es Jefe
        if (window.currentUser && (window.currentUser.tipo_user === 'Jefe' || window.currentUser.id_tipo === 1)) {
            paginasOptions.push({
                href: '/registro',
                icon: 'bi-person-plus',
                label: 'Registro',
                active: window.location.pathname.includes('/registro')
            });
        }

        // Verificar si el sidebar ya existe
        let sidebarElement = document.getElementById('sidebar');
        
        if (!sidebarElement) {
            sidebarElement = document.createElement('aside');
            sidebarElement.id = 'sidebar';
            sidebarElement.className = 'sidebar';
            
            // Insertar después del header y antes del main
            const headerElement = document.getElementById('header');
            const mainElement = document.querySelector('main');
            
            if (headerElement && mainElement) {
                document.body.insertBefore(sidebarElement, mainElement);
            } else {
                // Fallback: insertar al final del body
                document.body.appendChild(sidebarElement);
            }
        }

        // Generar el HTML del sidebar
        sidebarElement.innerHTML = `
            <ul class="sidebar-nav" id="sidebar-nav">
                ${sidebarOptions.map(option => `
                    <li class="nav-item">
                        <a class="nav-link ${option.active ? '' : 'collapsed'}" href="${option.href}">
                            <i class="bi ${option.icon}"></i>
                            <span>${option.label}</span>
                        </a>
                    </li>
                `).join('')}
                
                <li class="nav-heading">Páginas</li>
                
                ${paginasOptions.map(option => `
                    <li class="nav-item">
                        <a class="nav-link ${option.active ? '' : 'collapsed'}" href="${option.href}">
                            <i class="bi ${option.icon}"></i>
                            <span>${option.label}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
    }
});