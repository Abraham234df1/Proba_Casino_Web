// Elementos del DOM
const lootBox = document.getElementById('loot-box');
const rewardDisplay = document.getElementById('reward-display');
const rewardRarity = document.getElementById('reward-rarity');
const rewardIcon = document.getElementById('reward-icon');
const open1Btn = document.getElementById('open-1');
const open10Btn = document.getElementById('open-10');
const resetBtn = document.getElementById('reset-sim');
const statMoney = document.getElementById('stat-money');
const statCount = document.getElementById('stat-count');
const legendOdds = document.getElementById('legendary-odds');
const msgBox = document.getElementById('msg-box');

// Contadores por rareza
const counts = {
    common: document.getElementById('count-common'),
    rare: document.getElementById('count-rare'),
    epic: document.getElementById('count-epic'),
    legendary: document.getElementById('count-legendary')
};

let moneySpent = 0;
let totalOpened = 0;
let raritiesFound = { common: 0, rare: 0, epic: 0, legendary: 0 };
let isOpening = false;

// Configuración de recompensas
const rewards = {
    common: { chance: 0.70, icon: '⚔️', label: 'COMÚN', color: '#6c757d' },
    rare: { chance: 0.20, icon: '🛡️', label: 'RARO', color: '#0d6efd' },
    epic: { chance: 0.09, icon: '💎', label: 'ÉPICO', color: '#6610f2' },
    legendary: { chance: 0.01, icon: '🏆', label: 'LEGENDARIO', color: '#ffb703' }
};

function updateUI() {
    statMoney.innerText = `$${moneySpent}`;
    statCount.innerText = totalOpened;
    
    counts.common.innerText = raritiesFound.common;
    counts.rare.innerText = raritiesFound.rare;
    counts.epic.innerText = raritiesFound.epic;
    counts.legendary.innerText = raritiesFound.legendary;
    
    // Probabilidad de NO haber ganado después de N intentos: (0.99)^N
    const failProb = (Math.pow(0.99, totalOpened) * 100).toFixed(1);
    legendOdds.innerHTML = `Probabilidad de NO haber sacado un Legendario: <strong>${failProb}%</strong>`;
    
    if (raritiesFound.legendary > 0) {
        legendOdds.style.borderColor = 'var(--success)';
        legendOdds.style.color = 'var(--success)';
    }
}

async function openBox(isAuto = false) {
    if (isOpening && !isAuto) return;
    
    if (!isAuto) {
        isOpening = true;
        open1Btn.disabled = true;
        lootBox.classList.add('opening');
        rewardDisplay.classList.add('hidden');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        lootBox.classList.remove('opening');
        lootBox.style.opacity = '0';
        rewardDisplay.classList.remove('hidden');
    }

    moneySpent += 2;
    totalOpened++;
    
    // Lógica de probabilidad
    const rand = Math.random();
    let rarity = 'common';
    
    if (rand < 0.01) rarity = 'legendary';
    else if (rand < 0.10) rarity = 'epic';
    else if (rand < 0.30) rarity = 'rare';
    
    raritiesFound[rarity]++;
    
    if (!isAuto) {
        const data = rewards[rarity];
        rewardRarity.innerText = data.label;
        rewardRarity.className = `rarity-tag ${rarity}`;
        rewardIcon.innerText = data.icon;
        rewardDisplay.style.borderColor = data.color;
        
        if (rarity === 'legendary') {
            msgBox.innerHTML = "<span class='success'>¡INCREÍBLE!</span> ¡Has conseguido el objeto LEGENDARIO!";
        } else {
            msgBox.innerText = `Has obtenido un objeto de tipo ${data.label}.`;
        }
        
        setTimeout(() => {
            lootBox.style.opacity = '1';
            rewardDisplay.classList.add('hidden');
            isOpening = false;
            open1Btn.disabled = false;
        }, 1500);
    }
    
    updateUI();
}

open1Btn.onclick = () => openBox();

open10Btn.onclick = async () => {
    open10Btn.disabled = true;
    open1Btn.disabled = true;
    msgBox.innerText = "Abriendo 10 cajas rápidamente...";
    
    for (let i = 0; i < 10; i++) {
        await openBox(true);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    open10Btn.disabled = false;
    open1Btn.disabled = false;
    msgBox.innerText = "10 cajas abiertas. Revisa tus gastos y tu colección.";
};

resetBtn.onclick = () => {
    moneySpent = 0;
    totalOpened = 0;
    raritiesFound = { common: 0, rare: 0, epic: 0, legendary: 0 };
    rewardDisplay.classList.add('hidden');
    lootBox.style.opacity = '1';
    msgBox.innerText = "Simulador reiniciado. ¿Cuántas cajas abrirás hoy?";
    updateUI();
};

// Inicio
updateUI();