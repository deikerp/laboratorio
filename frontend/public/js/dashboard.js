// Guardar en: frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Cargar estadísticas del dashboard
    loadDashboardStats();
    
    /**
     * Carga las estadísticas para el dashboard
     */
    function loadDashboardStats() {
        // Obtener token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Cargar estadísticas de pacientes
        fetch('/api/pacientes/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Actualizar tarjeta de pacientes
            if (data.count) {
                const countElement = document.querySelector('.patients-card h6');
                if (countElement) countElement.textContent = data.count;
            }
            
            if (data.increase) {
                const increaseElement = document.querySelector('.patients-card .text-success');
                if (increaseElement) increaseElement.textContent = `${data.increase}%`;
            }
        })
        .catch(error => {
            console.error('Error al cargar estadísticas de pacientes:', error);
        });
        
        // Cargar estadísticas de exámenes
        fetch('/api/analisis/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Actualizar tarjeta de exámenes
            if (data.count) {
                const countElement = document.querySelector('.examenes-card h6');
                if (countElement) countElement.textContent = data.count;
            }
            
            if (data.increase) {
                const increaseElement = document.querySelector('.examenes-card .text-success');
                if (increaseElement) increaseElement.textContent = `${data.increase}%`;
            }
        })
        .catch(error => {
            console.error('Error al cargar estadísticas de exámenes:', error);
            // Para una versión inicial, podemos usar datos de ejemplo
            mockDashboardData();
        });
        
        // Cargar estadísticas de resultados entregados
        fetch('/api/resultados/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Actualizar tarjeta de resultados
            if (data.count) {
                const countElement = document.querySelector('.entregados-card h6');
                if (countElement) countElement.textContent = data.count;
            }
            
            if (data.effectiveness) {
                const effectivenessElement = document.querySelector('.entregados-card .text-success');
                if (effectivenessElement) effectivenessElement.textContent = `${data.effectiveness}%`;
            }
        })
        .catch(error => {
            console.error('Error al cargar estadísticas de resultados:', error);
        });
    }
    
    /**
     * Función para mostrar datos de ejemplo cuando la API aún no está implementada
     */
    function mockDashboardData() {
        // Estos datos se usarán solo para demostración inicial
        console.log('Usando datos de muestra para el dashboard');
    }
});