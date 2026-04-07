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
            // Generar 3 posiciones para movimiento en zigzag
            const positions = [];
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 120 + 40;
                positions.push({
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist
                });
            }
            
            // Rotaciones aleatorias más dramáticas
            const rotations = [
                Math.random() * 360 - 180,
                Math.random() * 720 - 360,
                Math.random() * 1080 - 540
            ];
            
            // Añadir clase de movimiento
            ball.classList.add('moving');
            
            // Primera fase - explosión inicial
            ball.style.transition = 'all 0.25s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            ball.style.left = `calc(50% + ${positions[0].x}px - 10px)`;
            ball.style.top = `calc(50% + ${positions[0].y}px - 10px)`;
            ball.style.transform = `scale(1.4) rotate(${rotations[0]}deg)`;
            ball.style.filter = 'brightness(1.5) saturate(1.5)';
            
            // Segunda fase - rebote intermedio
            setTimeout(() => {
                ball.style.transition = 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                ball.style.left = `calc(50% + ${positions[1].x}px - 10px)`;
                ball.style.top = `calc(50% + ${positions[1].y}px - 10px)`;
                ball.style.transform = `scale(1.2) rotate(${rotations[1]}deg)`;
            }, 250);
            
            // Tercera fase - posición final con rebote
            setTimeout(() => {
                ball.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                ball.style.left = `calc(50% + ${positions[2].x}px - 10px)`;
                ball.style.top = `calc(50% + ${positions[2].y}px - 10px)`;
                ball.style.transform = `scale(1.3) rotate(${rotations[2]}deg)`;
            }, 600);
            
            // Cuarta fase - asentamiento final
            setTimeout(() => {
                ball.style.transition = 'all 0.3s ease-out';
                ball.style.transform = `scale(1) rotate(${rotations[2]}deg)`;
                ball.style.filter = 'brightness(1) saturate(1)';
                
                // Resetear después de asentarse
                setTimeout(() => {
                    ball.style.transform = 'scale(1) rotate(0deg)';
                    ball.classList.remove('moving');
                }, 300);
            }, 1000);
            
        }, index * 35); // Cada bola empieza 35ms después de la anterior
    });
}

// Función para añadir efecto de vibración a la tómbola
function vibrateContainer() {
    const container = document.querySelector('.tombola-container');
    container.classList.add('shaking');
    setTimeout(() => {
        container.classList.remove('shaking');
    }, 1800);
}

// Función para crear ondas de impacto
function createShockwave() {
    const container = document.querySelector('.tombola');
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    container.appendChild(wave);
    
    setTimeout(() => {
        wave.remove();
    }, 1000);
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
        
        // Crear onda de impacto inicial
        createShockwave();
        
        // Mover las bolas individualmente a posiciones aleatorias con efectos
        shuffleBalls();
        
        // Esperar a que terminen de moverse todas las bolas (4 fases)
        await new Promise(resolve => setTimeout(resolve, 2200));
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
            
            // Añadir múltiples clases para efectos combinados
            balls[luckyIdx].classList.add('gold');
            balls[luckyIdx].classList.add('explode');
            balls[luckyIdx].classList.add('winner-ball');
            
            // Crear ondas de victoria
            createShockwave();
            setTimeout(() => createShockwave(), 300);
            
            setTimeout(() => {
                balls[luckyIdx].classList.remove('explode');
                balls[luckyIdx].classList.remove('winner-ball');
            }, 1500);
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