// Elementos del DOM
const coin = document.getElementById('coin');
const toss1Btn = document.getElementById('toss-1');
const toss20Btn = document.getElementById('toss-20');
const resetBtn = document.getElementById('reset');
const headsBtn = document.getElementById('btn-heads');
const tailsBtn = document.getElementById('btn-tails');
const historyList = document.getElementById('history-list');
const educationalMsg = document.getElementById('educational-msg');

// Estadísticas
const statWins = document.getElementById('stat-wins');
const statHeads = document.getElementById('stat-heads');
const statTails = document.getElementById('stat-tails');
const barHeads = document.getElementById('bar-heads');
const barTails = document.getElementById('bar-tails');

let headsCount = 0;
let tailsCount = 0;
let winsCount = 0;
let totalCount = 0;
let userSelection = 'heads'; // Por defecto Cara
let isSimulating = false;

// Cambiar selección del usuario
function select(choice) {
    if (isSimulating) return;
    userSelection = choice;
    if (choice === 'heads') {
        headsBtn.classList.add('active');
        tailsBtn.classList.remove('active');
    } else {
        tailsBtn.classList.add('active');
        headsBtn.classList.remove('active');
    }
}

headsBtn.addEventListener('click', () => select('heads'));
tailsBtn.addEventListener('click', () => select('tails'));

// Función de lanzamiento
function tossCoin() {
    return Math.random() < 0.5 ? 'heads' : 'tails';
}

// Actualizar Interfaz
function updateStats() {
    totalCount = headsCount + tailsCount;
    statHeads.innerText = headsCount;
    statTails.innerText = tailsCount;
    statWins.innerText = winsCount;

    if (totalCount > 0) {
        const headsPerc = (headsCount / totalCount) * 100;
        const tailsPerc = (tailsCount / totalCount) * 100;
        barHeads.style.width = headsPerc + '%';
        barTails.style.width = tailsPerc + '%';
    }

    if (totalCount % 10 === 0 && totalCount > 0 && !isSimulating) {
        educationalMsg.innerText = `Llevas ${totalCount} lanzamientos. Observa cómo, a largo plazo, los porcentajes tienden a equilibrarse al 50%.`;
    }
}

function addToHistory(result) {
    if (historyList.querySelector('.empty-msg')) {
        historyList.innerHTML = '';
    }
    const item = document.createElement('div');
    item.className = `history-item ${result === 'heads' ? 'h-heads' : 'h-tails'}`;
    item.innerText = result === 'heads' ? 'C' : 'X';
    historyList.prepend(item);
    
    // Limitar historial visual para rendimiento
    if (historyList.children.length > 30) {
        historyList.removeChild(historyList.lastChild);
    }
}

// Lógica de Lanzar 1 vez
toss1Btn.addEventListener('click', () => {
    if (isSimulating) return;
    isSimulating = true;
    toss1Btn.disabled = true;
    toss20Btn.disabled = true;
    
    const result = tossCoin();
    const currentBet = userSelection;
    
    // Animación
    coin.classList.remove('flip-heads', 'flip-tails');
    void coin.offsetWidth; // Trigger reflow
    coin.classList.add(result === 'heads' ? 'flip-heads' : 'flip-tails');

    setTimeout(() => {
        if (result === 'heads') headsCount++;
        else tailsCount++;

        if (result === currentBet) winsCount++;

        addToHistory(result);
        updateStats();
        
        isSimulating = false;
        toss1Btn.disabled = false;
        toss20Btn.disabled = false;
    }, 2000);
});

// Lógica de Lanzar 20 veces
toss20Btn.addEventListener('click', () => {
    if (isSimulating) return;
    isSimulating = true;
    toss20Btn.disabled = true;
    toss1Btn.disabled = true;
    
    const fixedBet = userSelection;
    educationalMsg.innerHTML = `Lanzando 20 veces para <strong>${fixedBet === 'heads' ? 'CARA' : 'CRUZ'}</strong>...`;

    let count = 0;
    const interval = setInterval(() => {
        const result = tossCoin();
        if (result === 'heads') headsCount++;
        else tailsCount++;
        
        if (result === fixedBet) winsCount++;

        addToHistory(result);
        updateStats();

        count++;
        if (count >= 20) {
            clearInterval(interval);
            isSimulating = false;
            toss20Btn.disabled = false;
            toss1Btn.disabled = false;
            educationalMsg.innerText = "Simulación completada. Fíjate que aunque haya rachas, la probabilidad no cambia.";
        }
    }, 100);
});

// Reiniciar
resetBtn.addEventListener('click', () => {
    if (isSimulating) return;
    headsCount = 0;
    tailsCount = 0;
    winsCount = 0;
    totalCount = 0;
    historyList.innerHTML = '';
    updateStats();
    barHeads.style.width = '50%';
    barTails.style.width = '50%';
    educationalMsg.innerText = "Simulador reiniciado. ¡Prueba de nuevo!";
    coin.style.transform = "rotateY(0)";
    coin.classList.remove('flip-heads', 'flip-tails');
});