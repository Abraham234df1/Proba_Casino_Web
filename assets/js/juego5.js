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

// Función para mover las bolas individualmente con efectos mejorados
function shuffleBalls() {
    const balls = document.querySelectorAll('.ball');
    balls.forEach((ball, index) => {
        // Delay escalonado para cada bola (efecto cascada)
        setTimeout(() => {
            // Primera posición intermedia (rebote)
            const angle1 = Math.random() * Math.PI * 2;
            const dist1 = Math.random() * 120 + 40;
            const midX = Math.cos(angle1) * dist1;
            const midY = Math.sin(angle1) * dist1;
            
            // Posición final
            const angle2 = Math.random() * Math.PI * 2;
            const dist2 = Math.random() * 100 + 30;
            const finalX = Math.cos(angle2) * dist2;
            const finalY = Math.sin(angle2) * dist2;
            
            // Rotación aleatoria
            const rotation = Math.random() * 720 - 360; // Entre -360 y 360 grados
            
            // Añadir clase de movimiento
            ball.classList.add('moving');
            
            // Primer movimiento (rebote intermedio)
            ball.style.left = `calc(50% + ${midX}px - 10px)`;
            ball.style.top = `calc(50% + ${midY}px - 10px)`;
            ball.style.transform = `scale(1.3) rotate(${rotation/2}deg)`;
            
            // Segundo movimiento (posición final) con diferentes duraciones
            const delay = 250 + Math.random() * 150;
            setTimeout(() => {
                ball.style.left = `calc(50% + ${finalX}px - 10px)`;
                ball.style.top = `calc(50% + ${finalY}px - 10px)`;
                ball.style.transform = `scale(1) rotate(${rotation}deg)`;
                
                // Efecto de "asentamiento"
                setTimeout(() => {
                    ball.style.transform = `scale(1) rotate(0deg)`;
                    ball.classList.remove('moving');
                }, 300);
            }, delay);
            
        }, index * 40); // Cada bola empieza 40ms después de la anterior
    });
}

// Función para añadir efecto de vibración a la tómbola
function vibrateContainer() {
    const container = document.querySelector('.tombola-container');
    container.classList.add('shaking');
    setTimeout(() => {
        container.classList.remove('shaking');
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
        
        // Efecto de vibración del contenedor
        vibrateContainer();
        
        // Mover las bolas individualmente a posiciones aleatorias con efectos
        shuffleBalls();
        
        // Esperar a que terminen de moverse todas las bolas
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    attempts++;
    const won = Math.random() < 0.05;
    
    if (won) {
        wins++;
        if (!isAuto) {
            msgBox.innerHTML = "<span class='success'>¡ENCONTRASTE LA BOLA DORADA!</span> La suerte te sonrió esta vez.";
            // Efecto visual de bola dorada con explosión
            const balls = document.querySelectorAll('.ball');
            const luckyIdx = Math.floor(Math.random() * balls.length);
            balls[luckyIdx].classList.add('gold');
            balls[luckyIdx].classList.add('explode');
            setTimeout(() => {
                balls[luckyIdx].classList.remove('explode');
            }, 1000);
            setTimeout(() => balls[luckyIdx].classList.remove('gold'), 3000);
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