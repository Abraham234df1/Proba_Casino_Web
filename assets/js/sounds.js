/**
 * PROBA CASINO - SISTEMA DE SONIDOS
 * Efectos de sonido opcionales para mejorar UX
 */

class SoundManager {
    constructor() {
        this.enabled = this.loadPreference();
        this.volume = 0.3;
        this.sounds = {};
        this.init();
    }
    
    init() {
        // Crear contexto de audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generar sonidos programáticamente
        this.createSounds();
        
        // Crear botón de control
        this.createToggleButton();
    }
    
    loadPreference() {
        const saved = localStorage.getItem('probaCasino_sounds');
        return saved === null ? true : saved === 'true';
    }
    
    savePreference() {
        localStorage.setItem('probaCasino_sounds', this.enabled);
    }
    
    createSounds() {
        // Sonidos generados con Web Audio API
        this.sounds = {
            click: () => this.beep(800, 50, 0.1),
            win: () => this.winSound(),
            lose: () => this.loseSound(),
            coinFlip: () => this.coinFlipSound(),
            cardDraw: () => this.cardDrawSound(),
            rouletteSpin: () => this.rouletteSpinSound(),
            notification: () => this.beep(600, 100, 0.15),
            success: () => this.successSound(),
            error: () => this.errorSound()
        };
    }
    
    // Generador de tonos básico
    beep(frequency, duration, volume = 0.3) {
        if (!this.enabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    // Sonido de victoria (acordes ascendentes)
    winSound() {
        if (!this.enabled) return;
        
        const notes = [523.25, 659.25, 783.99]; // C, E, G
        notes.forEach((freq, i) => {
            setTimeout(() => this.beep(freq, 150, 0.2), i * 100);
        });
    }
    
    // Sonido de derrota (tono descendente)
    loseSound() {
        if (!this.enabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Sonido de lanzar moneda
    coinFlipSound() {
        if (!this.enabled) return;
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.beep(1000 + Math.random() * 200, 30, 0.1);
            }, i * 50);
        }
    }
    
    // Sonido de robar carta
    cardDrawSound() {
        if (!this.enabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.15 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Sonido de ruleta girando
    rouletteSpinSound() {
        if (!this.enabled) return;
        
        let freq = 100;
        const interval = setInterval(() => {
            this.beep(freq, 30, 0.08);
            freq += 20;
            if (freq > 500) {
                clearInterval(interval);
                setTimeout(() => this.beep(300, 200, 0.15), 100);
            }
        }, 100);
    }
    
    // Sonido de éxito
    successSound() {
        if (!this.enabled) return;
        
        this.beep(800, 100, 0.15);
        setTimeout(() => this.beep(1000, 150, 0.15), 100);
    }
    
    // Sonido de error
    errorSound() {
        if (!this.enabled) return;
        
        this.beep(300, 150, 0.2);
        setTimeout(() => this.beep(250, 150, 0.2), 100);
    }
    
    play(soundName) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound();
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        this.savePreference();
        this.updateToggleButton();
        
        if (this.enabled) {
            this.play('notification');
            if (window.Toast) {
                Toast.success('Sonidos activados', 2000);
            }
        } else {
            if (window.Toast) {
                Toast.info('Sonidos desactivados', 2000);
            }
        }
    }
    
    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'sound-toggle';
        button.className = 'sound-toggle';
        button.setAttribute('aria-label', 'Alternar sonidos');
        button.setAttribute('data-tooltip', 'Sonidos: Activados');
        button.innerHTML = `
            <span class="sound-icon on">🔊</span>
            <span class="sound-icon off">🔇</span>
        `;
        
        button.addEventListener('click', () => this.toggle());
        
        document.body.appendChild(button);
        this.toggleButton = button;
        this.updateToggleButton();
    }
    
    updateToggleButton() {
        if (this.toggleButton) {
            this.toggleButton.classList.toggle('muted', !this.enabled);
            this.toggleButton.setAttribute('data-tooltip', 
                `Sonidos: ${this.enabled ? 'Activados' : 'Desactivados'}`);
        }
    }
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SoundManager = new SoundManager();
    });
} else {
    window.SoundManager = new SoundManager();
}
