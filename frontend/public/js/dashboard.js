// Guardar en: frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', function () {
    // Cargar todas las estadísticas del dashboard al cargar la página
    loadDashboardStats();

    /**
     * Función principal para cargar todas las estadísticas
     */
    function loadDashboardStats() {
        loadPacientesStats();
        loadAnalisisStats();
        loadResultadosStats();
    }

    /**
     * Carga las estadísticas de pacientes usando ambos endpoints
     */
    function loadPacientesStats() {
        // Usamos Promise.all para hacer ambas solicitudes en paralelo
        Promise.all([
            // 1. Obtener lista de pacientes para contar la cantidad total
            fetch('/api/pacientes/', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (!response.ok) throw new Error('Error obteniendo pacientes: ' + response.status);
                return response.json();
            }),

            // 2. Obtener estadísticas para el porcentaje de incremento
            fetch('/api/pacientes/stats', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (!response.ok) throw new Error('Error obteniendo estadísticas: ' + response.status);
                return response.json();
            })
        ])
            .then(([pacientes, stats]) => {
                console.log("Pacientes totales:", pacientes.length);
                console.log("Estadísticas:", stats);

                // Combinar los datos: cantidad de getAllPacientes y porcentaje de getPacienteStats
                const combinedStats = {
                    count: pacientes.length,
                    increase: stats.increase
                };

                updatePacientesCard(combinedStats);
            })
            .catch(error => {
                console.error('Error al cargar estadísticas de pacientes:', error);
                console.error('Detalles del error:', error.message);

                // En caso de error, mostrar valores por defecto
                updatePacientesCard({ count: 0, increase: 0 });
            });
    }

    /**
     * Carga las estadísticas de análisis desde la API
     */
    function loadAnalisisStats() {
        fetch('/api/analisis/stats', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                updateAnalisisCard(data);
            })
            .catch(error => {
                console.error('Error al cargar estadísticas de análisis:', error);
                // Si hay error, mostrar datos de ejemplo
                updateAnalisisCard({ count: 582, increase: 7 });
            });
    }

    /**
     * Carga las estadísticas de resultados desde la API
     */
    function loadResultadosStats() {
        fetch('/api/resultados/stats', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                updateResultadosCard(data);
            })
            .catch(error => {
                console.error('Error al cargar estadísticas de resultados:', error);
                // Si hay error, mostrar datos de ejemplo
                updateResultadosCard({ count: 547, effectiveness: 94 });
            });
    }

    /**
     * Actualiza la tarjeta de pacientes en el UI
     */
    function updatePacientesCard(data) {
        console.log("Actualizando tarjeta con datos:", data); // Debug

        // Actualizar contador - usando un selector más específico
        const countElement = document.querySelector('.patients-card .card-body .ps-3 h6');
        if (countElement && data.count !== undefined) {
            countElement.textContent = data.count;
            console.log("Contador actualizado:", data.count, "Elemento:", countElement); // Debug extendido
        } else {
            console.warn("Elemento contador no encontrado o datos incorrectos:", countElement, data); // Debug

            // Intentar encontrar el elemento con un selector alternativo
            const allH6Elements = document.querySelectorAll('.patients-card h6');
            console.log("Todos los elementos h6 encontrados:", allH6Elements.length);
            Array.from(allH6Elements).forEach((el, index) => {
                console.log(`h6 #${index}:`, el.textContent, el);
            });
        }

        // Actualizar porcentaje de incremento
        const increaseElement = document.querySelector('.patients-card .text-success');
        if (increaseElement && data.increase !== undefined) {
            increaseElement.textContent = `${data.increase}%`;
            console.log("Incremento actualizado:", data.increase); // Debug
        } else {
            console.warn("Elemento incremento no encontrado o datos incorrectos:", increaseElement, data); // Debug
        }
    }

    /**
     * Actualiza la tarjeta de análisis en el UI
     */
    function updateAnalisisCard(data) {
        // Actualizar contador
        const countElement = document.querySelector('.examenes-card h6');
        if (countElement && data.count !== undefined) {
            countElement.textContent = data.count;
        }

        // Actualizar porcentaje de incremento
        const increaseElement = document.querySelector('.examenes-card .text-success');
        if (increaseElement && data.increase !== undefined) {
            increaseElement.textContent = `${data.increase}%`;
        }
    }

    /**
     * Actualiza la tarjeta de resultados en el UI
     */
    function updateResultadosCard(data) {
        // Actualizar contador
        const countElement = document.querySelector('.entregados-card h6');
        if (countElement && data.count !== undefined) {
            countElement.textContent = data.count;
        }

        // Actualizar porcentaje de efectividad
        const effectivenessElement = document.querySelector('.entregados-card .text-success');
        if (effectivenessElement && data.effectiveness !== undefined) {
            effectivenessElement.textContent = `${data.effectiveness}%`;
        }
    }

    // Inicializar filtros en las tarjetas
    initializeFilters();

    /**
     * Inicializa los eventos de los filtros en las tarjetas
     */
    function initializeFilters() {
        // Obtener todos los filtros de las tarjetas
        const filterLinks = document.querySelectorAll('.filter .dropdown-item');

        // Agregar evento click a cada enlace
        filterLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const filterType = this.textContent.trim();
                const cardElement = this.closest('.card');

                if (cardElement) {
                    const titleElement = cardElement.querySelector('.card-title');
                    if (titleElement) {
                        // Actualizar el título con el filtro seleccionado
                        const baseTitleText = titleElement.textContent.split('|')[0].trim();
                        titleElement.textContent = `${baseTitleText} | ${filterType}`;

                        // Aquí se podrían cargar datos según el filtro
                        // Por ahora solo actualiza el texto
                    }
                }
            });
        });
    }
});