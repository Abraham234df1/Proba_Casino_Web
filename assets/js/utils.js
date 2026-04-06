/**
 * PROBA CASINO - UTILIDADES
 * Sistema de notificaciones toast, tooltips y helpers
 */

// ============================================
// SISTEMA DE NOTIFICACIONES TOAST
// ============================================

const Toast = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            `;
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        this.init();
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" aria-label="Cerrar">×</button>
        `;
        
        // Cerrar al hacer click en la X
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));
        
        // Auto-cerrar
        const autoClose = setTimeout(() => this.remove(toast), duration);
        
        // Pausar auto-cerrar al hover
        toast.addEventListener('mouseenter', () => clearTimeout(autoClose));
        toast.addEventListener('mouseleave', () => {
            setTimeout(() => this.remove(toast), 1000);
        });
        
        this.container.appendChild(toast);
        
        // Animar entrada
        requestAnimationFrame(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out';
        });
        
        return toast;
    },
    
    remove(toast) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    },
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// ============================================
// SPINNER DE CARGA UNIVERSAL
// ============================================

const Spinner = {
    show(parent = document.body, size = 'normal') {
        const spinner = document.createElement('div');
        spinner.className = size === 'small' ? 'spinner spinner-small' : 'spinner';
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-label', 'Cargando');
        
        if (parent === document.body) {
            const overlay = document.createElement('div');
            overlay.className = 'spinner-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 17, 40, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            overlay.appendChild(spinner);
            document.body.appendChild(overlay);
            return overlay;
        } else {
            parent.appendChild(spinner);
            return spinner;
        }
    },
    
    hide(spinner) {
        if (spinner && spinner.parentElement) {
            spinner.parentElement.removeChild(spinner);
        }
    }
};

// ============================================
// BOTÓN CON ESTADO DE CARGA
// ============================================

function setButtonLoading(button, isLoading = true) {
    if (isLoading) {
        button.classList.add('btn-loading');
        button.disabled = true;
        button.setAttribute('data-original-text', button.textContent);
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.textContent = originalText;
        }
    }
}

// ============================================
// FORMATEO DE NÚMEROS
// ============================================

function formatNumber(num) {
    return num.toLocaleString('es-ES');
}

function formatPercentage(num, decimals = 1) {
    return num.toFixed(decimals) + '%';
}

function formatCurrency(num) {
    return '$' + num.toLocaleString('es-ES');
}

// ============================================
// VIBRACIÓN (Solo móviles)
// ============================================

function vibrate(pattern = [100]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// ============================================
// COPIAR AL PORTAPAPELES
// ============================================

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        Toast.success('Copiado al portapapeles');
        return true;
    } catch (err) {
        Toast.error('No se pudo copiar');
        return false;
    }
}

// ============================================
// DETECCIÓN DE DISPOSITIVO
// ============================================

const Device = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isTablet() {
        return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
    },
    
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    },
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    supportsVibrate() {
        return 'vibrate' in navigator;
    },
    
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

// ============================================
// ALMACENAMIENTO LOCAL
// ============================================

const Storage = {
    save(key, value) {
        try {
            localStorage.setItem(`probaCasino_${key}`, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`probaCasino_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(`probaCasino_${key}`);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('probaCasino_')) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// ============================================
// ANIMACIONES SUAVES
// ============================================

function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let opacity = 0;
    const interval = 10;
    const gap = interval / duration;
    
    const fading = setInterval(() => {
        opacity += gap;
        element.style.opacity = opacity.toString();
        
        if (opacity >= 1) {
            clearInterval(fading);
        }
    }, interval);
}

function fadeOut(element, duration = 300) {
    let opacity = 1;
    const interval = 10;
    const gap = interval / duration;
    
    const fading = setInterval(() => {
        opacity -= gap;
        element.style.opacity = opacity.toString();
        
        if (opacity <= 0) {
            clearInterval(fading);
            element.style.display = 'none';
        }
    }, interval);
}

// ============================================
// DEBOUNCE Y THROTTLE
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// ESTADÍSTICAS Y PROBABILIDAD
// ============================================

const Stats = {
    // Media
    mean(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },
    
    // Mediana
    median(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },
    
    // Desviación estándar
    stdDev(arr) {
        const avg = this.mean(arr);
        const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    },
    
    // Rango
    range(arr) {
        return Math.max(...arr) - Math.min(...arr);
    }
};

// ============================================
// EXPORT (si se usa como módulo)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Toast,
        Spinner,
        setButtonLoading,
        formatNumber,
        formatPercentage,
        formatCurrency,
        vibrate,
        copyToClipboard,
        Device,
        Storage,
        smoothScrollTo,
        fadeIn,
        fadeOut,
        debounce,
        throttle,
        Stats
    };
}
