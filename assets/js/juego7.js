// Elementos del DOM
const numberGrid = document.getElementById('number-grid');
const barsContainer = document.getElementById('bars-container');
const spin1Btn = document.getElementById('spin-1');
const spin100Btn = document.getElementById('spin-100');
const resetBtn = document.getElementById('reset-sim');
const selectedValEl = document.getElementById('selected-val');
const statHitsEl = document.getElementById('stat-hits');
const statFreqEl = document.getElementById('stat-freq');
const msgBox = document.getElementById('msg-box');

// Estado
let selectedNum = null;
let counts = Array(11).fill(0); // 1-10
let total = 0;

// Inicializar interfaz
function init() {
    // Generar botones 1-10
    numberGrid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.innerText = i;
        btn.onclick = () => selectNum(i);
        numberGrid.appendChild(btn);
    }

    // Generar barras
    updateBars();
}

function selectNum(num) {
    selectedNum = num;
    selectedValEl.innerText = num;
    spin1Btn.disabled = false;
    spin100Btn.disabled = false;

    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.innerText) === num) btn.classList.add('selected');
    });

    msgBox.innerHTML = `Has elegido el número <strong>${num}</strong>. Genera números para ver su frecuencia relativa.`;
    updateBars();
}

function updateBars() {
    barsContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const freq = total > 0 ? (counts[i] / total * 100).toFixed(1) : 0;
        
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
            <div class="bar-label">${i}</div>
            <div class="bar-bg">
                <div class="bar-fill ${selectedNum === i ? 'active-num' : ''}" style="width: ${freq}%"></div>
            </div>
            <div class="bar-percent">${freq}%</div>
        `;
        barsContainer.appendChild(row);
    }
    
    if (selectedNum) {
        statHitsEl.innerText = counts[selectedNum];
        const myFreq = total > 0 ? (counts[selectedNum] / total * 100).toFixed(1) : 0;
        statFreqEl.innerText = myFreq + '%';
    }
}

function generate(isAuto = false) {
    const res = Math.floor(Math.random() * 10) + 1;
    counts[res]++;
    total++;

    if (!isAuto) {
        msgBox.innerHTML = `Salió el número <strong>${res}</strong>.`;
        updateBars();
    }
}

spin1Btn.onclick = () => generate();

spin100Btn.onclick = () => {
    spin100Btn.disabled = true;
    spin1Btn.disabled = true;
    msgBox.innerText = "Generando 100 números rápidamente...";
    
    let i = 0;
    const interval = setInterval(() => {
        generate(true);
        updateBars();
        i++;
        if (i >= 100) {
            clearInterval(interval);
            spin100Btn.disabled = false;
            spin1Btn.disabled = false;
            msgBox.innerText = "100 números generados. Observa cómo todas las barras tienden al 10%.";
        }
    }, 20);
};

resetBtn.onclick = () => {
    counts = Array(11).fill(0);
    total = 0;
    selectedNum = null;
    selectedValEl.innerText = "?";
    statHitsEl.innerText = "0";
    statFreqEl.innerText = "0%";
    spin1Btn.disabled = true;
    spin100Btn.disabled = true;
    
    document.querySelectorAll('.num-btn').forEach(btn => btn.classList.remove('selected'));
    updateBars();
    msgBox.innerText = "Simulador reiniciado. Elige un número para empezar.";
};

// Inicio
init();