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

// Result Ball Elements
const resultBall = document.getElementById('result-ball');
const resultNumberEl = document.querySelector('.result-number');

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
    const segmentDeg = 360 / 37; // ~9.73 grados por segmento
    const wheelSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--roulette-size'));
    const radius = (wheelSize / 2) * 0.72; // 72% del radio
    
    rouletteOrder.forEach((num, i) => {
        const numEl = document.createElement('div');
        numEl.className = 'wheel-number';
        numEl.innerText = num;
        numEl.dataset.index = i;
        
        // Ángulo de este segmento (centro del segmento)
        const angle = (i * segmentDeg) + (segmentDeg / 2);
        
        // Posicionar en círculo
        numEl.style.left = '50%';
        numEl.style.top = '50%';
        // Rotar el número Y desplazarlo hacia afuera, luego contra-rotar el texto
        numEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;
        
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
        resultBall.style.display = 'none'; // Hide result ball on game over
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
        resultBall.style.display = 'none'; // Hide result ball on restart
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
    resultBall.style.display = 'none'; // Hide previous result ball
    msgBox.innerText = "La bola está corriendo...";

    // Generate Result
    const resultIndex = Math.floor(Math.random() * 37);
    const resultNumber = rouletteOrder[resultIndex];
    const resultColor = getResultColor(resultNumber);

    // Rotation Logic - Corrected
    const segmentDeg = 360 / 37; // ~9.73 grados por segmento
    const extraSpins = 5 + Math.random() * 2; // 5-7 vueltas extra

    // Calculate the angle where the winning number currently is
    const winningSegmentCenter = (resultIndex * segmentDeg) + (segmentDeg / 2);

    // The pointer is at the top (0°). We want the winning segment to end up there.
    // We need to rotate the wheel so that the winning segment aligns with 0° (top)
    // Since the wheel rotates clockwise in CSS, and we want dramatic effect:
    const targetRotation = -winningSegmentCenter + (360 * extraSpins);
    
    // Add to current rotation for continuous spinning effect
    currentRotation += targetRotation;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;

        // Show result ball with winning number
        resultNumberEl.textContent = resultNumber;
        resultBall.style.display = 'flex';
        resultBall.className = `result-ball ${resultColor}`;
        
        const won = checkWin(resultNumber, selectedBet);
        
        // Primero restar la apuesta
        balance -= betAmount;
        
        if (won) {
            let multiplier = (selectedBet.type === 'green') ? 36 : 2;
            const prize = betAmount * multiplier;
            balance += prize;
            const profit = prize - betAmount;
            msgBox.innerHTML = `¡Cayó el ${resultNumber} (${resultColor})! <span class='profit'>Ganaste ${profit} fichas.</span>`;
        } else {
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