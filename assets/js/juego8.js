// Elementos del DOM
const sim100Btn = document.getElementById('sim-100');
const sim1000Btn = document.getElementById('sim-1000');
const sim10000Btn = document.getElementById('sim-10000');
const resetBtn = document.getElementById('reset-sim');
const statTotal = document.getElementById('stat-total');
const statHeadsPerc = document.getElementById('stat-heads-perc');
const dataPoints = document.getElementById('data-points');
const maxLabel = document.getElementById('max-label');
const msgBox = document.getElementById('msg-box');

let total = 0;
let heads = 0;
let isSimulating = false;

async function runSimulation(count) {
    if (isSimulating) return;
    isSimulating = true;
    
    // UI Feedback
    msgBox.innerHTML = `Simulando ${count} lanzamientos...`;
    maxLabel.innerText = total + count;
    
    const batchSize = Math.max(1, Math.floor(count / 100)); // Para animar puntos
    
    for (let i = 1; i <= count; i++) {
        total++;
        if (Math.random() < 0.5) heads++;
        
        // Solo dibujar algunos puntos para no saturar el DOM
        if (i % batchSize === 0) {
            drawPoint(total, heads, total + count);
            updateStats();
            // Pequeña pausa para ver la animación
            if (count > 100) await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    msgBox.innerHTML = `Simulación de ${count} completada. Total acumulado: ${total}.`;
    isSimulating = false;
}

function drawPoint(currentTotal, currentHeads, maxExpected) {
    const perc = (currentHeads / currentTotal) * 100;
    const x = (currentTotal / maxExpected) * 100;
    
    // Invertimos Y para que 100% sea arriba (pero queremos 50% al centro)
    // El área tiene 300px. 50% es 150px.
    // Mapeamos 40%-60% para que se vea la fluctuación
    let y = 100 - perc; // Simplista: 0-100%
    
    // Para mejor visualización, centramos en el 50%
    // Si perc es 50%, y debe ser 50%
    // Queremos ver el detalle, así que amplificamos la escala cerca del 50%
    // Y = 50 + (50 - perc) * factor
    const factor = 5; 
    let yDisplay = 50 + (50 - perc) * factor;
    
    // Limitar para que no se salga del cuadro
    yDisplay = Math.max(5, Math.min(95, yDisplay));

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.left = `${x}%`;
    dot.style.top = `${yDisplay}%`;
    dataPoints.appendChild(dot);
}

function updateStats() {
    statTotal.innerText = total.toLocaleString();
    const perc = total > 0 ? (heads / total * 100).toFixed(2) : 0;
    statHeadsPerc.innerText = perc + '%';
    
    if (Math.abs(perc - 50) < 0.1 && total > 500) {
        statHeadsPerc.style.color = 'var(--success)';
    } else {
        statHeadsPerc.style.color = 'var(--gold)';
    }
}

sim100Btn.onclick = () => runSimulation(100);
sim1000Btn.onclick = () => runSimulation(1000);
sim10000Btn.onclick = () => runSimulation(10000);

resetBtn.onclick = () => {
    if (isSimulating) return;
    total = 0;
    heads = 0;
    dataPoints.innerHTML = '';
    maxLabel.innerText = "10000";
    msgBox.innerText = "Datos limpiados. ¡Comienza una nueva simulación masiva!";
    updateStats();
};

updateStats();