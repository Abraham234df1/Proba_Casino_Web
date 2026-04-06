/**
 * Sistema de Carga Profesional - Proba Casino
 * Gestiona el preloader y las transiciones entre secciones.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inyectar el HTML del cargador si no existe
    if (!document.getElementById('loading-overlay')) {
        const loaderHTML = `
            <div id="loading-overlay">
                <div class="card-loader">
                    <div class="card-anim"></div>
                    <div class="card-anim"></div>
                    <div class="card-anim"></div>
                    <div class="card-anim"></div>
                    <div class="card-anim"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    const loader = document.getElementById('loading-overlay');

    // 2. Función para ocultar el cargador
    const hideLoader = () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 600); // Tiempo de visualización mínimo para elegancia
    };

    // Ocultar al cargar la página
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    // 3. Interceptar clics en enlaces para transiciones suaves
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            const target = link.getAttribute('target');

            // Solo actuar en enlaces internos que no sean anclas ni abran en nueva pestaña
            if (href && 
                !href.startsWith('#') && 
                !href.startsWith('javascript:') && 
                target !== '_blank' && 
                !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                
                e.preventDefault();
                loader.classList.remove('hidden');
                
                // Pequeño delay para que se vea la animación antes de navegar
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        }
    });
});
