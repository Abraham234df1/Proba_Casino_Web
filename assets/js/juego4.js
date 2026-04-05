// Bio-Hazard: Contagio en el Salón - Lógica de Juego con Movimiento Fluido
const roomGrid = document.getElementById('room-grid');
const roundEl = document.getElementById('round-count');
const balanceEl = document.getElementById('balance');
const activeTokensEl = document.getElementById('active-tokens');
const healthyEl = document.getElementById('healthy-count');
const infectedEl = document.getElementById('infected-count');
const healthyBar = document.getElementById('healthy-bar');
const infectedBar = document.getElementById('infected-bar');
const probRange = document.getElementById('prob-range');
const probVal = document.getElementById('prob-val');
const maxInfRange = document.getElementById('max-inf-range');
const maxInfVal = document.getElementById('max-inf-val');
const nextBtn = document.getElementById('next-round');
const resetBtn = document.getElementById('reset-sim');
const terminal = document.getElementById('terminal-content');

let round = 1;
let balance = 100;
let population = [];
const gridSize = 10;
const numPeople = 30;

const EMOJIS = {
    HEALTHY: ['👤', '🏃', '🧍', '🚶'],
    AT_RISK: '😨',
    INFECTED: '🤢',
    ZOMBIE: '🧟'
};

class Person {
    constructor(id, x, y, status) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.status = status;
        this.emoji = status === 'healthy' ? 
            EMOJIS.HEALTHY[Math.floor(Math.random() * EMOJIS.HEALTHY.length)] : 
            EMOJIS.INFECTED;
        this.predicted = false;
        this.atRisk = false;
        this.element = null;
    }

    createDOM() {
        const div = document.createElement('div');
        div.className = `person ${this.status}`;
        // Posicionamiento absoluto porcentual
        div.style.left = `${this.x * 10}%`;
        div.style.top = `${this.y * 10}%`;
        div.innerText = this.emoji;
        div.onclick = () => this.togglePrediction();
        this.element = div;
        roomGrid.appendChild(div);
    }

    updateDOM() {
        // Actualizar emoji según estado
        if (this.status === 'infected') {
            this.emoji = EMOJIS.INFECTED;
        } else if (this.atRisk) {
            this.emoji = EMOJIS.AT_RISK;
        } else {
            if (this.emoji === EMOJIS.AT_RISK) {
                this.emoji = EMOJIS.HEALTHY[this.id % EMOJIS.HEALTHY.length];
            }
        }

        this.element.innerText = this.emoji;
        this.element.className = `person ${this.status} ${this.predicted ? 'predicted' : ''} ${this.atRisk ? 'at-risk' : ''}`;
        
        // El CSS Transition en 'left' y 'top' hará que se deslicen suavemente
        this.element.style.left = `${this.x * 10}%`;
        this.element.style.top = `${this.y * 10}%`;
    }

    togglePrediction() {
        if (this.status === 'infected' || isSimulating) return;
        this.predicted = !this.predicted;
        this.updateDOM();
        logTerminal(this.predicted ? "> Sujeto bajo vigilancia remota." : "> Vigilancia cancelada.");
        updateActiveTokens();
    }

    move() {
        // En cada ronda, mayor probabilidad de movimiento
        if (Math.random() > 0.4) { 
            const directions = [[0,1], [0,-1], [1,0], [-1,0], [1,1], [-1,-1], [1,-1], [-1,1]];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            
            let newX = this.x + dir[0];
            let newY = this.y + dir[1];

            if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                this.x = newX;
                this.y = newY;
                return true; // Se movió
            }
        }
        return false;
    }
}

let isSimulating = false;

function logTerminal(msg, color = null) {
    const line = document.createElement('div');
    line.textContent = msg;
    if (color) line.style.color = color;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    if (terminal.childNodes.length > 10) terminal.removeChild(terminal.firstChild);
}

function updateActiveTokens() {
    const active = population.filter(p => p.predicted).length;
    activeTokensEl.innerText = active;
}

function initGame() {
    roomGrid.innerHTML = '';
    terminal.innerHTML = '';
    population = [];
    round = 1;
    balance = 100;
    
    for (let i = 0; i < numPeople; i++) {
        let x = Math.floor(Math.random() * gridSize);
        let y = Math.floor(Math.random() * gridSize);
        while (population.some(p => p.x === x && p.y === y)) {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);
        }
        const status = (i === 0) ? 'infected' : 'healthy';
        const person = new Person(i, x, y, status);
        person.createDOM();
        population.push(person);
    }
    updateAtRisk();
    updateStats();
    updateActiveTokens();
    nextBtn.disabled = false;
    logTerminal("> PROTOCOLO BIO-DYNAMO ACTIVADO.");
}

function updateStats() {
    roundEl.innerText = round;
    balanceEl.innerText = balance;
    
    // Actualizar color del balance
    balanceEl.className = balance > 0 ? 'profit' : (balance < 0 ? 'loss' : '');

    const healthy = population.filter(p => p.status === 'healthy').length;
    const infected = population.filter(p => p.status === 'infected').length;
    healthyEl.innerText = healthy;
    infectedEl.innerText = infected;
    healthyBar.style.width = `${(healthy / numPeople) * 100}%`;
    infectedBar.style.width = `${(infected / numPeople) * 100}%`;
    if (healthy === 0) {
        logTerminal("> ESTADO: PANDEMIA GLOBAL.", "var(--danger-red)");
        nextBtn.disabled = true;
    }
}

function getDistance(p1, p2) {
    return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
}

function updateAtRisk() {
    const infectedOnes = population.filter(p => p.status === 'infected');
    population.forEach(p => {
        if (p.status === 'healthy') {
            p.atRisk = infectedOnes.some(i => getDistance(p, i) <= 1);
        } else {
            p.atRisk = false;
        }
        p.updateDOM();
    });
}

async function runRound() {
    if (isSimulating) return;
    isSimulating = true;
    nextBtn.disabled = true;
    nextBtn.classList.remove('pulse');

    const prob = probRange.value / 100;
    const maxInf = parseInt(maxInfRange.value);
    
    logTerminal(`> Calculando vectores de movimiento...`);

    // 1. Activar animación de "caminata" y mover
    population.forEach(p => {
        const moved = p.move();
        if (moved) p.element.classList.add('moving');
        p.updateDOM();
    });
    
    // Esperar a que termine el desplazamiento visual (800ms en el CSS)
    await new Promise(r => setTimeout(r, 800));
    
    // Quitar animación de caminata
    population.forEach(p => p.element.classList.remove('moving'));
    
    updateAtRisk();
    await new Promise(r => setTimeout(r, 400));

    // 2. Infección
    const healthyOnes = population.filter(p => p.status === 'healthy' && p.atRisk);
    healthyOnes.sort(() => Math.random() - 0.5);
    let newInfections = [];
    let count = 0;
    for (let candidate of healthyOnes) {
        if (count >= maxInf) break;
        if (Math.random() < prob) {
            newInfections.push(candidate);
            count++;
        }
    }

    // 3. Evaluar Tokens
    let win = 0, loss = 0;
    population.forEach(p => {
        if (p.predicted) {
            if (newInfections.includes(p)) {
                win += 10; balance += 10;
            } else {
                loss += 10; balance -= 10;
            }
            p.predicted = false; 
        }
    });
    updateActiveTokens();

    newInfections.forEach(h => {
        h.status = 'infected';
        h.emoji = EMOJIS.INFECTED;
        h.updateDOM();
    });

    updateAtRisk();
    if (newInfections.length > 0) {
        logTerminal(`> Alerta: ${newInfections.length} sujetos contaminados.`, "var(--danger-red)");
    } else {
        logTerminal("> Escaneo completado: Sin nuevos focos.");
    }
    if (win > 0) logTerminal(`> TOKENS OBTENIDOS: +${win}`, "var(--safe-green)");
    if (loss > 0) logTerminal(`> TOKENS EXTRAÍDOS: -${loss}`, "var(--danger-red)");

    round++;
    isSimulating = false;
    nextBtn.disabled = false;
    nextBtn.classList.add('pulse');
    updateStats();
}

// Eventos
probRange.oninput = () => { probVal.innerText = probRange.value + "%"; };
maxInfRange.oninput = () => { maxInfVal.innerText = maxInfRange.value; };
nextBtn.onclick = runRound;
resetBtn.onclick = initGame;

initGame();
