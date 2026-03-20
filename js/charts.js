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

// Esponi le funzioni a window per l'accesso dalle tab
window.renderChart = renderChart;
window.renderHeatmap = renderHeatmap; // <--- Assicurati che ci sia!
window.renderAnalisi = renderAnalisi; // <--- Assicurati che ci sia!
window.changeWeek = (days) => { 
    if(!window.referenceDate) window.referenceDate = new Date();
    window.referenceDate.setDate(window.referenceDate.getDate() + days); 
    renderChart(); 
};
