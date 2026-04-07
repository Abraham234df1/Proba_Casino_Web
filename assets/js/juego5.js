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

// Función para mover las bolas individualmente con efectos naturales y suaves
function shuffleBalls() {
    const balls = document.querySelectorAll('.ball');
    
    balls.forEach((ball, index) => {
        // Delay escalonado suave
        setTimeout(() => {
            // Generar movimiento suave en 2 fases
            const angle1 = Math.random() * Math.PI * 2;
            const dist1 = Math.random() * 90 + 40;
            const midX = Math.cos(angle1) * dist1;
            const midY = Math.sin(angle1) * dist1;
            
            // Posición final
            const angle2 = Math.random() * Math.PI * 2;
            const dist2 = Math.random() * 100 + 35;
            const finalX = Math.cos(angle2) * dist2;
            const finalY = Math.sin(angle2) * dist2;
            
            // Rotación suave
            const rotation = Math.random() * 180 - 90; // Entre -90 y 90 grados
            
            // Añadir clase de movimiento
            ball.classList.add('moving');
            
            // Primera fase - movimiento suave
            ball.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            ball.style.left = `calc(50% + ${midX}px - 10px)`;
            ball.style.top = `calc(50% + ${midY}px - 10px)`;
            ball.style.transform = `scale(1.15) rotate(${rotation * 0.5}deg)`;
            
            // Segunda fase - posición final suave
            setTimeout(() => {
                ball.style.transition = 'all 0.7s cubic-bezier(0.34, 1.2, 0.64, 1)';
                ball.style.left = `calc(50% + ${finalX}px - 10px)`;
                ball.style.top = `calc(50% + ${finalY}px - 10px)`;
                ball.style.transform = `scale(1) rotate(${rotation}deg)`;
                
                // Asentamiento final
                setTimeout(() => {
                    ball.style.transition = 'all 0.4s ease-out';
                    ball.style.transform = 'scale(1) rotate(0deg)';
                    ball.classList.remove('moving');
                }, 700);
            }, 600);
            
        }, index * 45); // Delay suave entre bolas
    });
}

// Función para añadir efecto de vibración suave a la tómbola
function vibrateContainer() {
    const container = document.querySelector('.tombola-container');
    container.classList.add('shaking');
    setTimeout(() => {
        container.classList.remove('shaking');
    }, 1500);
}

// Función para crear onda suave de impacto
function createShockwave() {
    const container = document.querySelector('.tombola');
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    container.appendChild(wave);
    
    setTimeout(() => {
        wave.remove();
    }, 1200);
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
        
        // Efecto de vibración suave del contenedor
        vibrateContainer();
        
        // Crear onda de impacto sutil
        createShockwave();
        
        // Mover las bolas suavemente
        shuffleBalls();
        
        // Esperar a que terminen de moverse (2 fases suaves)
        await new Promise(resolve => setTimeout(resolve, 1900));
    }

    attempts++;
    const won = Math.random() < 0.05;
    
    if (won) {
        wins++;
        if (!isAuto) {
            msgBox.innerHTML = "<span class='success'>¡ENCONTRASTE LA BOLA DORADA!</span> La suerte te sonrió esta vez.";
            // Efecto visual suave de bola dorada
            const balls = document.querySelectorAll('.ball');
            const luckyIdx = Math.floor(Math.random() * balls.length);
            
            // Añadir clases con efectos suaves
            balls[luckyIdx].classList.add('gold');
            balls[luckyIdx].classList.add('winner-ball');
            
            // Onda de victoria suave
            setTimeout(() => createShockwave(), 200);
            
            setTimeout(() => {
                balls[luckyIdx].classList.remove('winner-ball');
            }, 2000);
            setTimeout(() => balls[luckyIdx].classList.remove('gold'), 4000);
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