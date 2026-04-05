// Configuración de la Ruleta
const wheel = document.getElementById('wheel');
const wheelNumbersContainer = document.getElementById('wheel-numbers');
const ball = document.getElementById('ball');
const spinBtn = document.getElementById('spin-btn');
const balanceEl = document.getElementById('balance');
const currentTotalEl = document.getElementById('current-total');
const profitLossEl = document.getElementById('profit-loss');
const msgBox = document.getElementById('msg-box');
const resultsHistory = document.getElementById('results-history');
const betAmountSelect = document.getElementById('bet-amount');

// Stats Elements
const rateRed = document.getElementById('rate-red');
const rateBlack = document.getElementById('rate-black');
const rateGreen = document.getElementById('rate-green');
const barRed = document.getElementById('bar-red');
const barBlack = document.getElementById('bar-black');
const barGreen = document.getElementById('bar-green');

// Buttons
const betButtons = document.querySelectorAll('.btn-bet');
const retireBtn = document.getElementById('retire-btn');

let balance = 100;
const initialBalance = 100;
let selectedBet = { type: null, value: null };
let isSpinning = false;
let currentRotation = 0;
let history = [];

// European Roulette Order
const rouletteOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Initialize Wheel Numbers
function initWheel() {
    rouletteOrder.forEach((num, i) => {
        const numEl = document.createElement('div');
        numEl.className = 'wheel-number';
        numEl.innerText = num;
        numEl.style.transform = `rotate(${i * (360 / 37)}deg)`;
        wheelNumbersContainer.appendChild(numEl);
    });
}

// Selection of Bet
betButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isSpinning) return;
        
        betButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const id = btn.id.replace('bet-', '');
        selectedBet.type = id;
        
        spinBtn.disabled = false;
        msgBox.innerHTML = `Has apostado por <strong>${btn.innerText.toUpperCase()}</strong>. ¡Suerte!`;
    });
});

function getResultColor(number) {
    if (number === 0) return 'green';
    return reds.includes(number) ? 'red' : 'black';
}

function updateStats() {
    if (history.length === 0) return;
    
    const last50 = history.slice(0, 50);
    const counts = { red: 0, black: 0, green: 0 };
    
    last50.forEach(res => counts[res.color]++);
    
    const total = last50.length;
    const pRed = ((counts.red / total) * 100).toFixed(0);
    const pBlack = ((counts.black / total) * 100).toFixed(0);
    const pGreen = ((counts.green / total) * 100).toFixed(0);
    
    rateRed.innerText = `${pRed}%`;
    rateBlack.innerText = `${pBlack}%`;
    rateGreen.innerText = `${pGreen}%`;
    
    barRed.style.width = `${pRed}%`;
    barBlack.style.width = `${pBlack}%`;
    barGreen.style.width = `${pGreen}%`;
}

function updateUI() {
    balanceEl.innerText = balance;
    currentTotalEl.innerText = balance;
    
    const diff = balance - initialBalance;
    profitLossEl.innerText = (diff > 0 ? '+' : '') + diff;
    profitLossEl.className = diff > 0 ? 'profit' : (diff < 0 ? 'loss' : '');

    if (balance <= 0) {
        msgBox.innerHTML = "<strong class='loss'>¡TE HAS QUEDADO SIN FICHAS!</strong> El casino siempre gana al final. ¿Quieres reintentar?";
        spinBtn.innerText = "Reiniciar";
        spinBtn.disabled = false;
    }
}

function checkWin(number, bet) {
    const color = getResultColor(number);
    switch (bet.type) {
        case 'red': return color === 'red';
        case 'black': return color === 'black';
        case 'green': return color === 'green';
        case 'even': return number !== 0 && number % 2 === 0;
        case 'odd': return number % 2 !== 0;
        case 'low': return number >= 1 && number <= 18;
        case 'high': return number >= 19 && number <= 36;
        default: return false;
    }
}

spinBtn.addEventListener('click', () => {
    if (balance <= 0) {
        balance = 100;
        updateUI();
        spinBtn.innerText = "¡Girar Ruleta!";
        return;
    }

    if (isSpinning || !selectedBet.type) return;
    
    const betAmount = parseInt(betAmountSelect.value);
    if (betAmount > balance) {
        msgBox.innerText = "No tienes suficientes fichas para esa apuesta.";
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    ball.style.display = 'block';
    msgBox.innerText = "La bola está corriendo...";

    // Generate Result
    const resultIndex = Math.floor(Math.random() * 37);
    const resultNumber = rouletteOrder[resultIndex];
    const resultColor = getResultColor(resultNumber);

    // Rotation Logic
    // Each segment is 360/37 deg
    const segmentDeg = 360 / 37;
    const extraSpins = 5 + Math.random() * 2;
    // We want the resultIndex to be at the top (0 deg)
    // The current rotation of the wheel + the added rotation
    // should end with -(resultIndex * segmentDeg) at the pointer.
    const targetRotation = (360 * extraSpins) - (resultIndex * segmentDeg);
    currentRotation += targetRotation - (currentRotation % 360);
    
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        const won = checkWin(resultNumber, selectedBet);
        
        if (won) {
            let multiplier = (selectedBet.type === 'green') ? 35 : 1;
            const prize = betAmount * multiplier;
            balance += prize;
            msgBox.innerHTML = `¡Cayó el ${resultNumber} (${resultColor})! <span class='profit'>Ganaste ${prize} fichas.</span>`;
        } else {
            balance -= betAmount;
            msgBox.innerHTML = `Cayó el ${resultNumber} (${resultColor}). <span class='loss'>Perdiste ${betAmount} fichas.</span>`;
        }

        // Add to history
        history.unshift({ number: resultNumber, color: resultColor });
        const dot = document.createElement('div');
        dot.className = `res-item res-${resultColor}`;
        dot.innerText = resultNumber;
        resultsHistory.prepend(dot);

        updateStats();
        updateUI();
        if (balance > 0) spinBtn.disabled = false;
    }, 5000);
});

retireBtn.addEventListener('click', () => {
    const diff = balance - initialBalance;
    if (diff > 0) {
        alert(`Te retiras con una ganancia de ${diff} fichas. ¡Hoy la suerte estuvo de tu lado!`);
    } else if (diff < 0) {
        alert(`Te retiras con una pérdida de ${Math.abs(diff)} fichas. Recuerda: a largo plazo, el sistema está diseñado para que gane la casa.`);
    } else {
        alert("Te retiras tal como viniste.");
    }
    window.location.href = "index.html";
});

// Start
initWheel();
updateUI();