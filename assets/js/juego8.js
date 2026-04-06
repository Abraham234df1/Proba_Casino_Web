// Elementos del DOM
const reel1 = document.getElementById('reel-1');
const reel2 = document.getElementById('reel-2');
const reel3 = document.getElementById('reel-3');
const spinBtn = document.getElementById('spin-btn');
const resultText = document.getElementById('result-text');
const balanceEl = document.getElementById('balance');
const totalSpinsEl = document.getElementById('total-spins');
const statWins = document.getElementById('stat-wins');
const statNearWins = document.getElementById('stat-near-wins');
const statLosses = document.getElementById('stat-losses');
const probAfterNear = document.getElementById('prob-after-near');
const probAlways = document.getElementById('prob-always');
const msgBox = document.getElementById('msg-box');

// Símbolos disponibles (7 símbolos en total)
const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣', '💎'];

// Premios por combinación (solo cuando los 3 son iguales)
const payouts = {
    '💎': 500,
    '7️⃣': 200,
    '⭐': 100,
    '🍇': 50,
    '🍊': 40,
    '🍋': 30,
    '🍒': 20
};

// Estado del juego
let balance = 1000;
let totalSpins = 0;
let wins = 0;
let nearWins = 0;  // 2 de 3 símbolos iguales
let losses = 0;    // 0 símbolos iguales
let isSpinning = false;

// Tracking para calcular probabilidad real
let winsAfterNearMiss = 0;
let spinsAfterNearMiss = 0;
let lastWasNearMiss = false;

// Calcular probabilidad teórica de ganar (1/7 = 14.3% aprox)
// Cada rodillo tiene 7 símbolos, P(3 iguales) = 7 * (1/7)^3 = 1/7
const theoreticalWinProb = (1 / symbols.length * 100).toFixed(1);
probAlways.innerText = theoreticalWinProb + '%';

// Función para generar un símbolo aleatorio
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Función para animar un rodillo
async function spinReel(reelElement, finalSymbol, duration) {
    const symbolHeight = 100; // Altura de cada símbolo en px
    let currentPos = 0;
    const totalSpins = 20 + Math.random() * 10; // 20-30 símbolos de giro
    const startTime = Date.now();
    
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Efecto de desaceleración
            const easing = 1 - Math.pow(1 - progress, 3);
            const position = easing * totalSpins * symbolHeight;
            
            reelElement.style.transform = `translateY(-${position}px)`;
            
            if (progress >= 1) {
                clearInterval(interval);
                
                // Posicionar en el símbolo final
                const finalIndex = symbols.indexOf(finalSymbol);
                reelElement.style.transform = `translateY(-${finalIndex * symbolHeight}px)`;
                
                resolve();
            }
        }, 16); // ~60fps
    });
}

// Función principal de giro
async function spin() {
    if (isSpinning) return;
    
    // Verificar si tiene fichas suficientes
    if (balance < 10) {
        resultText.innerHTML = '<span class="loss">¡SIN FICHAS!</span> Has perdido todo tu dinero.';
        msgBox.innerHTML = '<strong class="loss">GAME OVER</strong> - El casino ganó. Esto demuestra por qué "casi ganar" es una ilusión: matemáticamente seguías perdiendo.';
        spinBtn.disabled = true;
        return;
    }
    
    isSpinning = true;
    spinBtn.disabled = true;
    balance -= 10;
    totalSpins++;
    
    updateUI();
    resultText.innerText = '🎰 Girando...';
    
    // Generar resultados finales
    const result1 = getRandomSymbol();
    const result2 = getRandomSymbol();
    const result3 = getRandomSymbol();
    
    // Animar los rodillos (con diferentes duraciones para efecto visual)
    await Promise.all([
        spinReel(reel1, result1, 1000),
        spinReel(reel2, result2, 1500),
        spinReel(reel3, result3, 2000)
    ]);
    
    // Evaluar resultado
    evaluateResult(result1, result2, result3);
    
    isSpinning = false;
    spinBtn.disabled = false;
}

// Evaluar el resultado del giro
function evaluateResult(s1, s2, s3) {
    // Contar cuántos símbolos son iguales
    let matches = 0;
    if (s1 === s2 && s2 === s3) matches = 3;
    else if (s1 === s2 || s2 === s3 || s1 === s3) matches = 2;
    
    // VICTORIA: Los 3 símbolos iguales
    if (matches === 3) {
        const payout = payouts[s1];
        balance += payout;
        wins++;
        
        resultText.innerHTML = `<span class="success">🎉 ¡GANASTE!</span> +${payout} fichas`;
        msgBox.innerHTML = `<strong class="success">¡VICTORIA!</strong> Ganaste ${payout} fichas con ${s1}${s1}${s1}. Pero recuerda: esto NO significa que el próximo giro sea más probable que ganes.`;
        
        // Tracking para probabilidad
        if (lastWasNearMiss) {
            winsAfterNearMiss++;
        }
        lastWasNearMiss = false;
        
        // Efecto de sonido
        if (window.SoundManager) {
            SoundManager.play('win');
        }
    }
    // "CASI GANASTE": 2 de 3 símbolos iguales
    else if (matches === 2) {
        nearWins++;
        
        // Determinar cuáles son iguales
        let matchSymbol;
        if (s1 === s2) matchSymbol = s1;
        else if (s2 === s3) matchSymbol = s2;
        else matchSymbol = s1;
        
        resultText.innerHTML = `<span class="near">⚠️ ¡CASI!</span> Dos ${matchSymbol} - ¡Estuviste cerca!`;
        msgBox.innerHTML = `<strong class="warning">¡CASI GANAS!</strong> Salieron dos símbolos iguales (${matchSymbol}). Esto es frecuente y está diseñado para hacerte pensar que "estás cerca", pero la probabilidad del próximo giro sigue siendo ${theoreticalWinProb}%.`;
        
        // Tracking: el siguiente giro será después de "casi ganar"
        lastWasNearMiss = true;
        spinsAfterNearMiss++;
        
        // Efecto de sonido
        if (window.SoundManager) {
            SoundManager.play('notification');
        }
    }
    // DERROTA TOTAL: 0 símbolos iguales
    else {
        losses++;
        
        resultText.innerHTML = `<span class="loss">❌ Perdiste</span> - ${s1} ${s2} ${s3}`;
        msgBox.innerText = 'Ningún símbolo coincidió. Cada giro es independiente, inténtalo de nuevo.';
        
        // Tracking
        if (lastWasNearMiss) {
            spinsAfterNearMiss++;
        }
        lastWasNearMiss = false;
        
        // Efecto de sonido
        if (window.SoundManager) {
            SoundManager.play('lose');
        }
    }
    
    updateUI();
    updateProbabilities();
}

// Actualizar UI
function updateUI() {
    balanceEl.innerText = balance;
    totalSpinsEl.innerText = totalSpins;
    statWins.innerText = wins;
    statNearWins.innerText = nearWins;
    statLosses.innerText = losses;
    
    // Cambiar color del balance
    if (balance > 1000) {
        balanceEl.className = 'balance-value profit';
    } else if (balance < 1000) {
        balanceEl.className = 'balance-value loss';
    } else {
        balanceEl.className = 'balance-value';
    }
}

// Actualizar cálculo de probabilidades
function updateProbabilities() {
    if (spinsAfterNearMiss > 0) {
        const probAfterNearValue = (winsAfterNearMiss / spinsAfterNearMiss * 100).toFixed(1);
        probAfterNear.innerText = probAfterNearValue + '%';
        
        // Si ha habido suficientes datos, verificar si son similares
        if (spinsAfterNearMiss >= 10) {
            const diff = Math.abs(parseFloat(probAfterNearValue) - parseFloat(theoreticalWinProb));
            
            if (diff < 5) {
                probAfterNear.style.color = 'var(--success)';
                msgBox.innerHTML += '<br><br><strong class="success">¡Verificado!</strong> La probabilidad después de "casi ganar" es igual que siempre. El "casi" no significa nada.';
            }
        }
    } else {
        probAfterNear.innerText = '0%';
    }
}

// Event listeners
spinBtn.addEventListener('click', spin);

// Inicializar UI
updateUI();