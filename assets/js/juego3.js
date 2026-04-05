// Elementos del DOM
const selectionGrid = document.getElementById('selection-grid');
const frequencyList = document.getElementById('frequency-list');
const resultCard = document.getElementById('result-card');
const balanceEl = document.getElementById('balance');
const hitsEl = document.getElementById('hits');
const msgBox = document.getElementById('msg-box');
const selectedCardDisplay = document.getElementById('selected-card-display');
const draw1Btn = document.getElementById('draw-1');
const draw20Btn = document.getElementById('draw-20');
const resetBtn = document.getElementById('reset-game');

// Estado del juego
let balance = 1000;
let hits = 0;
let selectedCard = null;
let cardFrequencies = Array(21).fill(0);
let lastSeen = Array(21).fill(0);
let totalDraws = 0;
let isSimulating = false;

// Inicializar selección
function initSelection() {
    selectionGrid.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-card';
        if (selectedCard === i) btn.classList.add('selected');
        
        // Bloquear visualmente durante simulación
        if (isSimulating) {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            if (selectedCard === i) {
                btn.style.boxShadow = "0 0 20px var(--gold)";
                btn.style.border = "3px solid #fff";
            } else {
                btn.style.opacity = "0.4";
            }
        }

        btn.innerText = i;
        btn.onclick = () => selectCard(i);
        
        // Solo mostrar multiplicadores si no estamos simulando para evitar distracciones
        if (!isSimulating) {
            const idleTime = totalDraws - lastSeen[i];
            if (totalDraws > 10 && idleTime > 8) {
                const tag = document.createElement('span');
                tag.className = 'multiplier-tag';
                tag.innerText = idleTime > 15 ? 'x3' : 'x2';
                btn.appendChild(tag);
            }
        }
        
        selectionGrid.appendChild(btn);
    }
}

function selectCard(num) {
    if (isSimulating) return; 
    
    selectedCard = num;
    selectedCardDisplay.innerText = num;
    draw1Btn.disabled = false;
    draw20Btn.disabled = false;
    
    initSelection(); 
    msgBox.innerHTML = `Has seleccionado la carta <strong>${num}</strong>. <br>¡Prueba si la suerte te acompaña!`;
}

function updateFrequencies() {
    frequencyList.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const item = document.createElement('div');
        item.className = 'freq-item';
        // Resaltar en la lista si es la elegida
        if (selectedCard === i) item.style.color = "var(--gold)";
        item.innerHTML = `<span class="freq-num">${i}:</span> <span>${cardFrequencies[i]}</span>`;
        frequencyList.appendChild(item);
    }
}

function drawCard(isAuto = false) {
    if (balance < 10) return null;

    const result = Math.floor(Math.random() * 20) + 1;
    totalDraws++;
    cardFrequencies[result]++;
    lastSeen[result] = totalDraws;

    // Mostrar siempre el resultado visualmente
    resultCard.classList.remove('hidden');
    resultCard.innerText = result;
    resultCard.style.animation = 'none';
    resultCard.offsetHeight; 
    resultCard.style.animation = null;

    if (result === selectedCard) {
        let multiplier = 1;
        const idleTime = (totalDraws - 1) - (lastSeen[selectedCard] || 0);
        if (idleTime > 15) multiplier = 3;
        else if (idleTime > 8) multiplier = 2;
        
        const win = 10 * multiplier;
        balance += win;
        hits++;
        if (!isAuto) msgBox.innerHTML = `¡ACIERTO! Salió el ${result}. <span class="profit">+${win} fichas.</span>`;
        return { result, win: true, amount: win };
    } else {
        balance -= 10;
        if (!isAuto) msgBox.innerHTML = `Salió el ${result}. <span class="loss">-10 fichas.</span>`;
        return { result, win: false, amount: 10 };
    }
}

function updateUI() {
    balanceEl.innerText = balance;
    hitsEl.innerText = hits;
    updateFrequencies();
    initSelection();
    
    if (balance < 10 && !isSimulating) {
        msgBox.innerHTML = "<span class='loss'>BANCARROTA.</span> El azar no tiene memoria, pero el casino sí tiene tu dinero.";
        draw1Btn.disabled = true;
        draw20Btn.disabled = true;
    }
}

draw1Btn.onclick = () => {
    if (isSimulating || !selectedCard) return;
    isSimulating = true;
    draw1Btn.disabled = true;
    draw20Btn.disabled = true;
    
    drawCard();
    
    setTimeout(() => {
        isSimulating = false;
        updateUI();
        if (balance >= 10) {
            draw1Btn.disabled = false;
            draw20Btn.disabled = false;
        }
    }, 600);
};

draw20Btn.onclick = () => {
    if (isSimulating || !selectedCard) return;
    isSimulating = true;
    draw20Btn.disabled = true;
    draw1Btn.disabled = true;
    resetBtn.disabled = true;
    
    const fixedCard = selectedCard; // Fijamos la carta objetivo
    let count = 0;
    
    msgBox.innerHTML = `Iniciando 20 intentos para la carta <strong>${fixedCard}</strong>...`;

    const interval = setInterval(() => {
        count++;
        const resData = drawCard(true); // Pasamos true para no sobreescribir el msgBox principal
        
        if (resData) {
            msgBox.innerHTML = `Intento <strong>${count}/20</strong>: Salió el <strong>${resData.result}</strong>.<br>` + 
                               (resData.win ? `<span class="profit">¡ACIERTO! +${resData.amount}</span>` : `<span class="loss">No es tu carta (-10)</span>`);
        }

        updateUI();

        if (count >= 20 || balance < 10) {
            clearInterval(interval);
            isSimulating = false;
            resetBtn.disabled = false;
            
            if (balance >= 10) {
                draw20Btn.disabled = false;
                draw1Btn.disabled = false;
                msgBox.innerHTML += `<br><strong>Simulación terminada para el número ${fixedCard}.</strong>`;
            } else {
                msgBox.innerHTML = "<span class='loss'>¡BANCARROTA DURANTE LA SIMULACIÓN!</span>";
            }
            updateUI();
        }
    }, 250); // Un poco más lento para que sea vea la comparación
};

resetBtn.onclick = () => {
    if (isSimulating) return;
    balance = 1000;
    hits = 0;
    selectedCard = null;
    cardFrequencies = Array(21).fill(0);
    lastSeen = Array(21).fill(0);
    totalDraws = 0;
    isSimulating = false;
    selectedCardDisplay.innerText = "Ninguna";
    resultCard.classList.add('hidden');
    draw1Btn.disabled = true;
    draw20Btn.disabled = true;
    msgBox.innerText = "Juego reiniciado. Selecciona una carta.";
    updateUI();
};

// Inicio
initSelection();
updateFrequencies();