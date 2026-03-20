// js/charts.js
import { icons, db, auth } from './config.js';
import { getMonday, formatDateLocal, getWeekNumber } from './utils.js';

let mainChart = null;
let analisiChart = null;

export function renderChart() {
    if (!window.fitnessDB || !document.getElementById('mainChart')) return;
    
    const monday = getMonday(window.referenceDate || new Date());
    const labels = [];
    for(let i=0; i<7; i++) { 
        let d = new Date(monday); d.setDate(monday.getDate() + i); 
        labels.push(formatDateLocal(d));
    }

    document.getElementById('currentWeekLabel').innerText = `Sett. ${monday.getDate()}/${monday.getMonth()+1}`;
    
    const grouped = window.fitnessDB.reduce((acc, curr) => {
        if(!acc[curr.date]) acc[curr.date] = { weight: null, activities: [] };
        if(curr.type !== 'Riposo') acc[curr.date].activities.push(curr.type);
        if(curr.weight) acc[curr.date].weight = curr.weight; return acc;
    }, {});

    // Calcolo Punteggio Costanza
    let score = 0;
    labels.forEach(day => {
        const acts = window.fitnessDB.filter(r => r.date === day);
        if(acts.some(r => !['Stretching', 'Riposo'].includes(r.type))) score += 1;
        else if(acts.some(r => r.type === 'Stretching')) score += 0.5;
    });

    document.getElementById('costanzaVal').innerText = `${score} / 7 Punti`;
    const icon = document.getElementById('moodIcon'), msg = document.getElementById('statusMessage'), card = document.getElementById('mainStatCard');
    
    if(score >= 3.5) { icon.innerText = '🔥'; card.style.borderLeftColor = 'var(--success)'; msg.innerText = "Obiettivo raggiunto!"; }
    else if(score < 2) { icon.innerText = '⚠️'; card.style.borderLeftColor = 'var(--danger)'; msg.innerText = "Serve una scossa!"; }
    else { icon.innerText = '⚖️'; card.style.borderLeftColor = 'var(--warning)'; msg.innerText = "Continua così!"; }

    const ctx = document.getElementById('mainChart').getContext('2d');
    if(mainChart) mainChart.destroy();
    mainChart = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: labels.map(l => l.split('-').reverse().slice(0,2).join('/')), 
            datasets: [{ data: labels.map(l => grouped[l]?.weight || null), borderColor: '#38bdf8', tension: 0.3, spanGaps: true }] 
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 73, max: 81 } } },
        plugins: [{ 
            afterDraw: chart => { 
                chart.data.datasets[0].data.forEach((v, i) => {
                    const meta = chart.getDatasetMeta(0); if(!meta.data[i]) return;
                    const {x, y} = meta.data[i]; const acts = grouped[labels[i]]?.activities || [];
                    acts.forEach((a, idx) => { 
                        chart.ctx.font = '14px serif'; 
                        chart.ctx.fillText(icons[a] || '⚪', x-7, y - 20 - (idx*16)); 
                    });
                });
            }
        }]
    });
}
/**
 * Disegna la Heatmap Annuale della Costanza
 */
// Importa l'utility necessaria se non è già presente in cima al file
import { getWeekNumber } from './utils.js';

export function renderHeatmap() {
    const container = document.getElementById('annualHeatmap');
    if (!container || !window.fitnessDB) return;

    container.innerHTML = '';
    const currentYear = new Date().getFullYear();

    for (let w = 1; w <= 52; w++) {
        let wScore = 0;
        
        // Filtra i record per l'anno corrente e per la settimana specifica
        const records = window.fitnessDB.filter(r => { 
            const d = new Date(r.date); 
            return d.getFullYear() === currentYear && getWeekNumber(d) === w; 
        });

        const days = [...new Set(records.map(r => r.date))];
        
        days.forEach(d => {
            const acts = records.filter(r => r.date === d);
            // Logica Punteggio: 1 punto per sport, 0.5 per stretching
            if(acts.some(r => !['Stretching', 'Riposo'].includes(r.type))) wScore += 1;
            else if(acts.some(r => r.type === 'Stretching')) wScore += 0.5;
        });

        const el = document.createElement('div'); 
        el.className = 'heat-day';
        
        // Stile inline per mantenere il look originale
        el.style.display = 'flex'; 
        el.style.flexDirection = 'column'; 
        el.style.lineHeight = '0.9';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        
        el.innerHTML = `
            <span style="font-size:0.55rem; opacity:0.5;">${w}</span>
            <b style="font-size:0.75rem;">${wScore}</b>
        `;

        // Assegnazione classi colore basate sul punteggio settimanale
        if(wScore >= 5) el.classList.add('heat-ultra');
        else if(wScore >= 3.5) el.classList.add('heat-high');
        else if(wScore >= 2) el.classList.add('heat-mid');
        else if(wScore > 0) el.classList.add('heat-low');

        // Funzionalità click per navigare nel grafico
        el.onclick = () => {
            let target = new Date(currentYear, 0, 4);
            target.setDate(target.getDate() + (w - 1) * 7);
            const day = target.getDay();
            const diff = target.getDate() - day + (day === 0 ? -6 : 1);
            const finalMonday = new Date(target.setDate(diff));
            finalMonday.setHours(12, 0, 0, 0);
            
            window.referenceDate = finalMonday; 
            if (typeof renderChart === 'function') renderChart(); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        container.appendChild(el);
    }
}
/**
 * Disegna il grafico di Analisi Storica (Peso e Volume)
 */
export function renderAnalisi() {
    const ctx = document.getElementById('analisiChart')?.getContext('2d');
    if (!ctx || !window.fitnessDB) return;

    if (analisiChart) analisiChart.destroy();

    const data = [...window.fitnessDB].sort((a,b) => new Date(a.date) - new Date(b.date));

    analisiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date.split('-').reverse().slice(0,2).join('/')),
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: data.map(d => d.weight),
                    borderColor: '#38bdf8',
                    yAxisID: 'y',
                    spanGaps: true
                },
                {
                    label: 'Minuti/Km',
                    data: data.map(d => d.min || d.km),
                    borderColor: '#fbbf24',
                    yAxisID: 'y1',
                    type: 'bar'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Peso' } },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Volume' } }
            }
        }
    });
}

// Esponi le funzioni a window per l'accesso dalle tab
window.renderChart = renderChart;
window.renderHeatmap = renderHeatmap; // <--- Assicurati che ci sia!
window.renderAnalisi = renderAnalisi; // <--- Assicurati che ci sia!
window.changeWeek = (days) => { 
    if(!window.referenceDate) window.referenceDate = new Date();
    window.referenceDate.setDate(window.referenceDate.getDate() + days); 
    renderChart(); 
};
