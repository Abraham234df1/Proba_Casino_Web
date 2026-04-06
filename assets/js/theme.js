/**
 * PROBA CASINO - SISTEMA DE TEMAS (CLARO/OSCURO)
 * Permite cambiar entre modo oscuro y claro
 */

class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }
    
    init() {
        // Aplicar tema guardado o detectar preferencia del sistema
        if (!this.currentTheme) {
            this.currentTheme = this.getSystemPreference();
        }
        this.applyTheme(this.currentTheme);
        this.createToggleButton();
    }
    
    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    loadTheme() {
        return localStorage.getItem('probaCasino_theme');
    }
    
    saveTheme(theme) {
        localStorage.setItem('probaCasino_theme', theme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateToggleButton();
        
        // Actualizar meta theme-color para móviles
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0a1128' : '#f5f5f5');
        }
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Vibración y sonido opcional
        if (window.SoundManager) {
            SoundManager.play('click');
        }
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Notificación
        if (window.Toast) {
            Toast.info(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 2000);
        }
    }
    
    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'theme-toggle';
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Cambiar tema');
        button.setAttribute('data-tooltip', 'Cambiar tema');
        button.innerHTML = `
            <span class="theme-icon sun">☀️</span>
            <span class="theme-icon moon">🌙</span>
        `;
        
        button.addEventListener('click', () => this.toggle());
        
        document.body.appendChild(button);
        this.toggleButton = button;
    }
    
    updateToggleButton() {
        if (this.toggleButton) {
            this.toggleButton.setAttribute('aria-label', 
                `Cambiar a tema ${this.currentTheme === 'dark' ? 'claro' : 'oscuro'}`);
        }
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}
