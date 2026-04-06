/**
 * PROBA CASINO - SERVICE WORKER
 * Permite funcionamiento offline (PWA)
 */

const CACHE_NAME = 'proba-casino-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/catalogo.html',
    '/juego1.html',
    '/juego2.html',
    '/juego3.html',
    '/juego4.html',
    '/juego5.html',
    '/juego6.html',
    '/juego7.html',
    '/juego8.html',
    '/assets/css/style.css',
    '/assets/css/juego1.css',
    '/assets/css/juego2.css',
    '/assets/css/juego3.css',
    '/assets/css/juego4.css',
    '/assets/css/juego5.css',
    '/assets/css/juego6.css',
    '/assets/css/juego7.css',
    '/assets/css/juego8.css',
    '/assets/js/utils.js',
    '/assets/js/theme.js',
    '/assets/js/sounds.js',
    '/assets/js/share.js',
    '/assets/js/loader.js',
    '/assets/js/juego1.js',
    '/assets/js/juego2.js',
    '/assets/js/juego3.js',
    '/assets/js/juego4.js',
    '/assets/js/juego5.js',
    '/assets/js/juego6.js',
    '/assets/js/juego7.js',
    '/assets/js/juego8.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando archivos');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Instalación completada');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Error durante instalación:', err);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Activación completada');
            return self.clients.claim();
        })
    );
});

// Interceptar peticiones (estrategia Cache First)
self.addEventListener('fetch', event => {
    // Solo cachear peticiones GET del mismo origen
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Si está en cache, devolverlo
                if (cachedResponse) {
                    console.log('[SW] Sirviendo desde cache:', event.request.url);
                    
                    // Actualizar cache en segundo plano (stale-while-revalidate)
                    fetch(event.request).then(response => {
                        if (response && response.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, response);
                            });
                        }
                    }).catch(() => {
                        // Error de red ignorado, ya tenemos cache
                    });
                    
                    return cachedResponse;
                }
                
                // Si no está en cache, hacer petición de red
                return fetch(event.request).then(response => {
                    // Verificar respuesta válida
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }
                    
                    // Clonar la respuesta
                    const responseToCache = response.clone();
                    
                    // Guardar en cache
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    console.log('[SW] Sirviendo desde red y cacheando:', event.request.url);
                    return response;
                }).catch(err => {
                    console.error('[SW] Error de red:', err);
                    
                    // Página offline personalizada
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    
                    return new Response('Sin conexión', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
            })
    );
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', event => {
    console.log('[SW] Evento de sincronización:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Aquí podrías sincronizar datos del usuario
            Promise.resolve()
        );
    }
});

// Notificaciones Push (opcional)
self.addEventListener('push', event => {
    console.log('[SW] Push recibido');
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Proba Casino';
    const options = {
        body: data.body || 'Nueva notificación',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: data.url || '/',
        actions: [
            {
                action: 'open',
                title: 'Abrir'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Click en notificación
self.addEventListener('notificationclick', event => {
    console.log('[SW] Click en notificación');
    
    event.notification.close();
    
    if (event.action === 'open') {
        const urlToOpen = event.notification.data || '/';
        
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(windowClients => {
                    // Verificar si ya hay una ventana abierta
                    for (let i = 0; i < windowClients.length; i++) {
                        const client = windowClients[i];
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Si no hay ventana abierta, abrir una nueva
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Mensaje del cliente
self.addEventListener('message', event => {
    console.log('[SW] Mensaje recibido:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

console.log('[SW] Service Worker cargado');
