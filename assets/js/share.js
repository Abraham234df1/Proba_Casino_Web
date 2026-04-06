/**
 * PROBA CASINO - SISTEMA DE COMPARTIR EN REDES SOCIALES
 * Permite compartir resultados y estadísticas
 */

class ShareManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Crear botón flotante de compartir
        this.createShareButton();
    }
    
    // Compartir con Web Share API (nativo en móviles)
    async shareNative(data) {
        if (!navigator.share) {
            return false;
        }
        
        try {
            await navigator.share({
                title: data.title || 'Proba Casino',
                text: data.text || '¡Descubre cómo funciona la probabilidad!',
                url: data.url || window.location.href
            });
            
            if (window.SoundManager) {
                SoundManager.play('success');
            }
            
            if (window.Toast) {
                Toast.success('¡Compartido exitosamente!');
            }
            
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error al compartir:', err);
            }
            return false;
        }
    }
    
    // Compartir en Twitter
    shareTwitter(text, url) {
        const tweetText = encodeURIComponent(text);
        const tweetUrl = encodeURIComponent(url || window.location.href);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}&hashtags=ProbaCasino,Probabilidad,Matemáticas`;
        
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        
        if (window.SoundManager) {
            SoundManager.play('click');
        }
    }
    
    // Compartir en Facebook
    shareFacebook(url) {
        const shareUrl = encodeURIComponent(url || window.location.href);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        
        if (window.SoundManager) {
            SoundManager.play('click');
        }
    }
    
    // Compartir en WhatsApp
    shareWhatsApp(text, url) {
        const message = encodeURIComponent(`${text}\n${url || window.location.href}`);
        const whatsappUrl = `https://wa.me/?text=${message}`;
        
        window.open(whatsappUrl, '_blank');
        
        if (window.SoundManager) {
            SoundManager.play('click');
        }
    }
    
    // Copiar enlace
    async copyLink(url) {
        const link = url || window.location.href;
        
        try {
            await navigator.clipboard.writeText(link);
            
            if (window.Toast) {
                Toast.success('Enlace copiado al portapapeles');
            }
            
            if (window.SoundManager) {
                SoundManager.play('success');
            }
            
            return true;
        } catch (err) {
            console.error('Error al copiar:', err);
            
            if (window.Toast) {
                Toast.error('No se pudo copiar el enlace');
            }
            
            return false;
        }
    }
    
    // Compartir estadísticas del juego
    shareGameStats(gameName, stats) {
        const text = this.formatStats(gameName, stats);
        
        // Intentar Web Share API primero
        if (navigator.share) {
            this.shareNative({ text, title: `Mis estadísticas en ${gameName}` });
        } else {
            // Mostrar modal con opciones
            this.showShareModal(text);
        }
    }
    
    formatStats(gameName, stats) {
        let text = `🎰 Mis resultados en ${gameName}:\n\n`;
        
        Object.entries(stats).forEach(([key, value]) => {
            text += `${key}: ${value}\n`;
        });
        
        text += `\n¡Juega tú también en Proba Casino!`;
        
        return text;
    }
    
    showShareModal(text) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3>Compartir</h3>
                    <button class="share-modal-close" aria-label="Cerrar">×</button>
                </div>
                <div class="share-modal-body">
                    <div class="share-buttons">
                        <button class="share-btn twitter" data-network="twitter">
                            <span>🐦</span>
                            <span>Twitter</span>
                        </button>
                        <button class="share-btn facebook" data-network="facebook">
                            <span>👥</span>
                            <span>Facebook</span>
                        </button>
                        <button class="share-btn whatsapp" data-network="whatsapp">
                            <span>💬</span>
                            <span>WhatsApp</span>
                        </button>
                        <button class="share-btn copy" data-network="copy">
                            <span>📋</span>
                            <span>Copiar</span>
                        </button>
                    </div>
                    <div class="share-preview">
                        <p>${text.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.share-modal-close').addEventListener('click', () => {
            this.closeShareModal(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeShareModal(modal);
            }
        });
        
        modal.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const network = btn.getAttribute('data-network');
                
                switch(network) {
                    case 'twitter':
                        this.shareTwitter(text);
                        break;
                    case 'facebook':
                        this.shareFacebook();
                        break;
                    case 'whatsapp':
                        this.shareWhatsApp(text);
                        break;
                    case 'copy':
                        this.copyLink();
                        break;
                }
                
                this.closeShareModal(modal);
            });
        });
        
        // Animación de entrada
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }
    
    closeShareModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
        }, 300);
    }
    
    createShareButton() {
        const button = document.createElement('button');
        button.id = 'share-button';
        button.className = 'share-button';
        button.setAttribute('aria-label', 'Compartir');
        button.setAttribute('data-tooltip', 'Compartir');
        button.innerHTML = `
            <span class="share-icon">📤</span>
        `;
        
        button.addEventListener('click', () => {
            this.shareNative({
                title: 'Proba Casino',
                text: '¡Descubre cómo funciona la probabilidad con juegos interactivos!',
                url: window.location.href
            }).then(success => {
                if (!success) {
                    this.showShareModal('¡Descubre cómo funciona la probabilidad con juegos interactivos!\n\n👉 ' + window.location.href);
                }
            });
        });
        
        document.body.appendChild(button);
    }
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ShareManager = new ShareManager();
    });
} else {
    window.ShareManager = new ShareManager();
}
