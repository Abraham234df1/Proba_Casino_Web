/**
 * PROBA CASINO - REGISTRO DE SERVICE WORKER
 * Inicializa la PWA
 */

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);
                
                // Verificar si hay actualizaciones
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Nueva versión encontrada');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nueva versión disponible
                            showUpdateNotification(newWorker);
                        }
                    });
                });
                
                // Verificar actualizaciones cada hora
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            })
            .catch(err => {
                console.error('❌ Error al registrar Service Worker:', err);
            });
    });
    
    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', event => {
        console.log('📨 Mensaje del SW:', event.data);
    });
    
    // Función para mostrar notificación de actualización
    function showUpdateNotification(worker) {
        if (window.Toast) {
            const toast = Toast.info(
                'Nueva versión disponible. <button onclick="window.location.reload()" style="background:var(--gold);color:#000;border:none;padding:5px 10px;border-radius:5px;margin-left:10px;cursor:pointer;">Actualizar</button>',
                0 // No auto-cerrar
            );
        } else {
            if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
                worker.postMessage({ action: 'skipWaiting' });
                window.location.reload();
            }
        }
    }
}

// Detectar si la app está instalada
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir el prompt automático
    e.preventDefault();
    
    // Guardar el evento para usarlo después
    window.deferredPrompt = e;
    
    // Mostrar botón de instalación personalizado
    showInstallButton();
});

// Función para mostrar botón de instalación
function showInstallButton() {
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.className = 'install-button';
    installButton.setAttribute('aria-label', 'Instalar aplicación');
    installButton.setAttribute('data-tooltip', 'Instalar app');
    installButton.innerHTML = `
        <span class="install-icon">📥</span>
    `;
    
    installButton.addEventListener('click', async () => {
        if (!window.deferredPrompt) {
            return;
        }
        
        // Mostrar el prompt
        window.deferredPrompt.prompt();
        
        // Esperar respuesta del usuario
        const { outcome } = await window.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ PWA instalada');
            if (window.Toast) {
                Toast.success('¡App instalada correctamente!');
            }
            if (window.SoundManager) {
                SoundManager.play('success');
            }
        } else {
            console.log('❌ Usuario rechazó la instalación');
        }
        
        // Limpiar el prompt
        window.deferredPrompt = null;
        installButton.remove();
    });
    
    document.body.appendChild(installButton);
}

// Detectar cuando la app se instala
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');
    
    if (window.Toast) {
        Toast.success('¡Proba Casino instalado! Ya puedes usarlo sin conexión.');
    }
    
    // Limpiar el prompt
    window.deferredPrompt = null;
    
    // Remover botón de instalación si existe
    const installBtn = document.getElementById('install-button');
    if (installBtn) {
        installBtn.remove();
    }
});

// Detectar si se está ejecutando como PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
}

if (isPWA()) {
    console.log('🎉 Ejecutando como PWA');
    document.documentElement.classList.add('pwa-mode');
}

// Detectar estado de la conexión
window.addEventListener('online', () => {
    console.log('🌐 Conexión restablecida');
    if (window.Toast) {
        Toast.success('Conexión restablecida', 2000);
    }
});

window.addEventListener('offline', () => {
    console.log('📴 Sin conexión');
    if (window.Toast) {
        Toast.warning('Sin conexión. La app seguirá funcionando offline.', 4000);
    }
});
