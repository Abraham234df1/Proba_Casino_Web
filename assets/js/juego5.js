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

// Función para mover las bolas individualmente
function shuffleBalls() {
    const balls = document.querySelectorAll('.ball');
    balls.forEach((ball, index) => {
        // Delay escalonado para cada bola (efecto cascada)
        setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 100 + 30;
            ball.style.left = `calc(50% + ${Math.cos(angle) * dist}px - 10px)`;
            ball.style.top = `calc(50% + ${Math.sin(angle) * dist}px - 10px)`;
            
            // Añadir un pequeño efecto de escala durante el movimiento
            ball.style.transform = 'scale(1.2)';
            setTimeout(() => {
                ball.style.transform = 'scale(1)';
            }, 200);
        }, index * 50); // Cada bola empieza a moverse 50ms después de la anterior
    });
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
        
        // Mover las bolas individualmente a posiciones aleatorias
        shuffleBalls();
        
        // Esperar a que terminen de moverse todas las bolas
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    attempts++;
    const won = Math.random() < 0.05;
    
    if (won) {
        wins++;
        if (!isAuto) {
            msgBox.innerHTML = "<span class='success'>¡ENCONTRASTE LA BOLA DORADA!</span> La suerte te sonrió esta vez.";
            // Efecto visual de bola dorada
            const balls = document.querySelectorAll('.ball');
            const luckyIdx = Math.floor(Math.random() * balls.length);
            balls[luckyIdx].classList.add('gold');
            setTimeout(() => balls[luckyIdx].classList.remove('gold'), 2000);
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