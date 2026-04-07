// Elementos del DOM
const tombola = document.getElementById('tombola');
const spin1Btn = document.getElementById('spin-1');
const spin20Btn = document.getElementById('spin-20');
const resetBtn = document.getElementById('reset-tombola');
const statAttempts = document.getElementById('stat-attempts');
const statWins = document.getElementById('stat-wins');
const statFailProb = document.getElementById('stat-fail-prob');
const msgBox = document.getElementById('msg-box');

let attempts = 0;
let wins = 0;
let isSpinning = false;

// Inicializar bolas en la tómbola
function initTombola() {
    tombola.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        // Posición aleatoria inicial distribuida por toda la tómbola
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 100 + 30; // Más espacio para distribuir
        ball.style.left = `calc(50% + ${Math.cos(angle) * dist}px - 10px)`;
        ball.style.top = `calc(50% + ${Math.sin(angle) * dist}px - 10px)`;
        ball.style.transition = 'all 0.6s ease-out'; // Transición suave
        tombola.appendChild(ball);
    }
}

// Función para mover las bolas individualmente con máxima suavidad
function shuffleBalls() {
    const balls = document.querySelectorAll('.ball');
    
    balls.forEach((ball, index) => {
        // Delay más espaciado para movimiento más suave
        setTimeout(() => {
            // Movimiento suave en una sola fase fluida
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 95 + 35;
            const finalX = Math.cos(angle) * dist;
            const finalY = Math.sin(angle) * dist;
            
            // Rotación muy sutil
            const rotation = Math.random() * 60 - 30; // Entre -30 y 30 grados
            
            // Añadir clase de movimiento
            ball.classList.add('moving');
            
            // Movimiento ultra suave y lento
            ball.style.transition = 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)';
            ball.style.left = `calc(50% + ${finalX}px - 10px)`;
            ball.style.top = `calc(50% + ${finalY}px - 10px)`;
            ball.style.transform = `scale(1.08) rotate(${rotation}deg)`;
            
            // Asentamiento ultra suave
            setTimeout(() => {
                ball.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                ball.style.transform = 'scale(1) rotate(0deg)';
                
                setTimeout(() => {
                    ball.classList.remove('moving');
                }, 800);
            }, 1200);
            
        }, index * 60); // Delay más largo entre bolas para efecto más fluido
    });
}

// Función para añadir efecto de vibración muy suave a la tómbola
function vibrateContainer() {
    const container = document.querySelector('.tombola-container');
    container.classList.add('shaking');
    setTimeout(() => {
        container.classList.remove('shaking');
    }, 1600);
}

// Función para crear onda ultra suave de impacto
function createShockwave() {
    const container = document.querySelector('.tombola');
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    container.appendChild(wave);
    
    setTimeout(() => {
        wave.remove();
    }, 1500);
}

function updateStats() {
    statAttempts.innerText = attempts;
    statWins.innerText = wins;
    
    // Probabilidad de NO haber ganado después de N intentos: (0.95)^N
    const failProb = (Math.pow(0.95, attempts) * 100).toFixed(1);
    statFailProb.innerText = failProb + '%';
    
    if (attempts >= 20 && wins === 0) {
        msgBox.innerHTML = `Llevas 20 intentos (la media estadística) y aún no has ganado. La probabilidad de que esto pase es del <strong>35.8%</strong>. No es tan raro, ¿verdad?`;
    }
}

async function attempt(isAuto = false) {
    if (isSpinning && !isAuto) return;
    
    if (!isAuto) {
        isSpinning = true;
        spin1Btn.disabled = true;
        msgBox.innerText = "¡Girando la tómbola!";
        
        // Efecto de vibración ultra suave del contenedor
        vibrateContainer();
        
        // Crear onda de impacto ultra sutil
        createShockwave();
        
        // Mover las bolas con máxima suavidad
        shuffleBalls();
        
        // Esperar más tiempo para ver el movimiento completo y suave
        await new Promise(resolve => setTimeout(resolve, 2600));
    }

    attempts++;
    const won = Math.random() < 0.05;
    
    if (won) {
        wins++;
        if (!isAuto) {
            msgBox.innerHTML = "<span class='success'>¡ENCONTRASTE LA BOLA DORADA!</span> La suerte te sonrió esta vez.";
            // Efecto visual ultra suave de bola dorada
            const balls = document.querySelectorAll('.ball');
            const luckyIdx = Math.floor(Math.random() * balls.length);
            
            // Añadir clases con efectos ultra suaves
            balls[luckyIdx].classList.add('gold');
            balls[luckyIdx].classList.add('winner-ball');
            
            // Onda de victoria ultra suave
            setTimeout(() => createShockwave(), 300);
            
            setTimeout(() => {
                balls[luckyIdx].classList.remove('winner-ball');
            }, 2500);
            setTimeout(() => balls[luckyIdx].classList.remove('gold'), 5000);
        }
    } else if (!isAuto) {
        msgBox.innerHTML = "Solo salieron bolas azules. Inténtalo de nuevo.";
    }

    updateStats();
    
    if (!isAuto) {
        isSpinning = false;
        spin1Btn.disabled = false;
    }
    return won;
}

spin1Btn.onclick = () => attempt();

spin20Btn.onclick = async () => {
    spin20Btn.disabled = true;
    spin1Btn.disabled = true;
    msgBox.innerText = "Realizando 20 intentos rápidos...";
    
    for (let i = 0; i < 20; i++) {
        await attempt(true);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    spin20Btn.disabled = false;
    spin1Btn.disabled = false;
    msgBox.innerText = "20 intentos completados. Revisa la probabilidad de 'No haber ganado aún'.";
};

resetBtn.onclick = () => {
    attempts = 0;
    wins = 0;
    initTombola();
    updateStats();
    msgBox.innerText = "Tómbola reiniciada. ¡Prueba tu suerte!";
};

// Inicio
initTombola();
updateStats();