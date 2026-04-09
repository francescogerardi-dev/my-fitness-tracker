// js/charts.js
import { icons, db, auth } from './config.js';
import { getMonday, formatDateLocal, getWeekNumber,days2today,days2todayUp,isCurrentWeek } from './utils.js';

let mainChart = null;
let analisiChart = null;

export function renderChart() {
    if (!window.fitnessDB || !document.getElementById('mainChart')) return;
    //console.log(window.fitnessDB);
    //etichette del chart
    const monday = getMonday(window.referenceDate || new Date());
    const labels = [];
    for(let i=0; i<7; i++) { 
        let d = new Date(monday); d.setDate(monday.getDate() + i); 
        labels.push(formatDateLocal(d));
    }

    console.log(isCurrentWeek());
    
    document.getElementById('currentWeekLabel').innerText = `Sett. ${monday.getDate()}/${monday.getMonth()+1}`;
    var counter1 = 0;
    var counter2 = 0;
    const grouped = window.fitnessDB.reduce((acc, curr) => {
        if(!acc[curr.date]) acc[curr.date] = { weight: null, activities: [] };
        if(curr.type !== 'Riposo'){ 
            acc[curr.date].activities.push(curr.type);
        }
        if(curr.type === 'Riposo'){
            acc[curr.date].activities.push('Peso');
        }
        if(curr.weight) acc[curr.date].weight = curr.weight; return acc;
    }, {});

    // Calcolo Punteggio Costanza
    let score = 0;
    labels.forEach(day => {
        const acts = window.fitnessDB.filter(r => r.date === day);
        if(acts.some(r => !['Stretching', 'Riposo','Peso'].includes(r.type))) score += 1;
        else if(acts.some(r => r.type === 'Stretching')) score += 0.5;
    });

    let fullscore = 0;
    labels.forEach(day => {
        const totalacts = window.fitnessDB.filter(r => r.date === day);
        console.log(totalacts);
        //if(totalacts.forEach(r => !['Stretching', 'Riposo','Peso'].includes(r.type))) fullscore += 1;
        //totalacts.forEach(r => {if(r.type !=='Stretching') fullscore += 1)});
        //else if(totalacts.forEach(r => r.type === 'Stretching')) fullscore += 0.5;
    });
    
    //Disegno blocco div costanza
    var perc = 0;
    if(isCurrentWeek()){
        perc = score/days2todayUp(getMonday(new Date()));
    }else{
        perc = score/7;
    }
    
    document.getElementById('costanzaVal').innerText = `${score} / 7 Punti`;
    const icon = document.getElementById('moodIcon'), msg = document.getElementById('statusMessage'), card = document.getElementById('mainStatCard'),pmsg = document.getElementById('percMessage');
    pmsg.innerText = perc.toFixed(2)*100+`% `; 
    //const perc = score/days2todayUp(getMonday(new Date()));

    //console.log(perc);
    
    //calcolo dell'icona logica vecchia
    /*
    if(score >= 3.5 && score <= 4.5) { 
            icon.innerText = '🔥'; 
            card.style.borderLeftColor = 'var(--success)'; 
            msg.innerText = "Ci siamo! Forza!"; 
    }
    else if(score < 2) { 
            icon.innerText = '⚠️'; 
            card.style.borderLeftColor = 'var(--danger)'; 
            msg.innerText = "Serve una scossa!"; 
    }else if(score > 4.5){
            icon.innerText = '🔝'; 
            card.style.borderLeftColor = 'var(--danger)'; 
            msg.innerText = "Booooom!"; 
    }
    else { 
            icon.innerText = '⚖️'; 
            card.style.borderLeftColor = 'var(--warning)'; 
            msg.innerText = "Non mollareeeee"; 
    }
    */
    //logica nuova
    //lower
    if(perc < 0.25) { 
            icon.innerText = '⚠️'; 
            card.style.borderLeftColor = 'var(--danger)'; 
            msg.innerText = "Alzati pigrone!"; 
    //mid lower
    }else if(perc >= 0.25 && perc <=0.5) { 
            icon.innerText = '⚖️'; 
            card.style.borderLeftColor = 'var(--warning)'; 
            msg.innerText = "Non mollareeeee"; 
    //mid high
    }else if(perc > 0.5 && perc < 0.7) { 
            icon.innerText = '🔥'; 
            card.style.borderLeftColor = 'var(--success)'; 
            msg.innerText = "Ci siamo! Forza!"; 
    }
    //high
    else if(perc >= 0.7){
            icon.innerText = '🔝'; 
            card.style.borderLeftColor = 'var(--danger)'; 
            msg.innerText = "Booooom!"; 
    //top
    }else if(perc = 1){
        icon.innerText = '🏆'; 
            card.style.borderLeftColor = 'var(--danger)'; 
            msg.innerText = "Master!"; 
    }
    
    const ctx = document.getElementById('mainChart').getContext('2d');
    if(mainChart) mainChart.destroy();
    //crea il chart
    mainChart = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: labels.map(l => l.split('-').reverse().slice(0,2).join('/')), 
            datasets: [{ data: labels.map(l => grouped[l]?.weight || null), borderColor: '#38bdf8', tension: 0.3, spanGaps: true }] 
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, position:'top',align:'left',title: {display: true,text: 'Weekly Chart',color: '#FFFFFF',font: {
                size: 20, // 'size' invece di 'fontsize'
                weight: 'bold' // facoltativo, per farlo risaltare
            }} }, scales: { y: { min: 73, max: 81 } } },
        plugins: [{ 
            afterDraw: chart => { 
                chart.data.datasets[0].data.forEach((v, i) => {
                    const meta = chart.getDatasetMeta(0); if(!meta.data[i]) return;
                    const {x, y} = meta.data[i]; const acts = grouped[labels[i]]?.activities || [];
                    acts.forEach((a, idx) => { 
                        chart.ctx.font = '14px serif'; 
                        chart.ctx.fillText(icons[a], x-7, y - 20 - (idx*16)); 
                    });
                });
            }
        }]
    });
}
/**
 * Disegna la Heatmap Annuale della Costanza
 */

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
            if(acts.some(r => !['Stretching', 'Riposo','Peso'].includes(r.type))) wScore += 1;
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
    // 1. Recupero Filtri
    const sport = document.getElementById('sportFilter')?.value || 'Peso';
    const daysCount = parseInt(document.getElementById('periodFilter')?.value || 30);
    const labelsRaw = []; 
    const labelsFmt = [];
    
    // 2. Generazione asse temporale (Giorni scorsi)
    for(let i=daysCount-1; i>=0; i--) {
        let d = new Date(); 
        d.setDate(d.getDate()-i);
        const raw = formatDateLocal(d);
        labelsRaw.push(raw);
        labelsFmt.push(raw.split('-').reverse().slice(0,2).join('/'));
    }

    const isPeso = (sport === 'Peso');
    const statsContainer = document.getElementById('analisiStats');
    
    // 3. Calcolo Statistiche (Peso vs Sport/Streak)
    if (statsContainer) {
        let statsHTML = "";
        if (isPeso) {
            const recs = window.fitnessDB.filter(r => labelsRaw.includes(r.date) && r.weight > 0);
            if (recs.length > 0) {
                const val = recs.map(r => parseFloat(r.weight));
                const media = (val.reduce((a, b) => a + b, 0) / val.length).toFixed(1);
                const delta = (val[val.length-1] - val[0]).toFixed(1);
                const last = val[val.length-1];
                statsHTML = `
                    <div class="stat-card" style="flex:1"><small>Media</small><br><big>${media}kg</big></div>
                    <div class="stat-card" style="flex:1"><small>Ultimo</small><br><big>${last}kg</big></div>
                    <div class="stat-card" style="flex:1"><small>Delta</small><br><big>${delta > 0 ? '+' : ''}${delta}kg</big></div>`;
            } else {
                statsHTML = `<div class="stat-card" style="flex:1; opacity:0.5;">Nessun dato peso nel periodo</div>`;
            }
        } else {
            // --- LOGICA STREAK 3.0 ---
            const allDates = [...new Set(window.fitnessDB
                .filter(r => r.type === sport)
                .map(r => r.date))].sort();

            let curStreak = 0, bestStreak = 0;
            if (allDates.length > 0) {
                // Calcolo Best Streak
                let temp = 1;
                for (let i = 0; i < allDates.length - 1; i++) {
                    const d1 = new Date(allDates[i] + 'T00:00:00');
                    const d2 = new Date(allDates[i+1] + 'T00:00:00');
                    if ((d2 - d1) / 86400000 === 1) temp++;
                    else { bestStreak = Math.max(bestStreak, temp); temp = 1; }
                }
                bestStreak = Math.max(bestStreak, temp);

                // Calcolo Current Streak
                const oggi = new Date(); oggi.setHours(0,0,0,0);
                const lastRec = new Date(allDates[allDates.length-1] + 'T00:00:00');
                if ((oggi - lastRec) / 86400000 <= 1) {
                    curStreak = 1;
                    for (let i = allDates.length-1; i > 0; i--) {
                        const d1 = new Date(allDates[i] + 'T00:00:00');
                        const d2 = new Date(allDates[i-1] + 'T00:00:00');
                        if ((d1 - d2) / 86400000 === 1) curStreak++;
                        else break;
                    }
                }
            }

            const filtered = window.fitnessDB.filter(r => labelsRaw.includes(r.date) && r.type === sport);
            const totalMin = filtered.reduce((sum, r) => sum + (parseInt(r.min) || 0), 0);
            
            statsHTML = `
                <div class="stat-card" style="flex:1; border-left:4px solid #eab308">
                    <small>Serie Attiva🔥</small><br><big>${curStreak}</big>
                </div>
                <div class="stat-card" style="flex:1; border-left:4px solid #22c55e">
                    <small>Serie Record 🏆</small><br><big>${bestStreak}</big>
                </div>
                <div class="stat-card" style="flex:1">
                    <small>Totale</small><br><big>${totalMin}'</big>
                </div>`;
        }
        statsContainer.innerHTML = statsHTML;
    }

    // 4. Mappatura serie dati per il grafico
    const dataSeries = labelsRaw.map(date => {
        const dayRecords = window.fitnessDB.filter(r => r.date === date);
        if (isPeso) {
            const rec = dayRecords.find(r => r.weight > 0);
            return rec ? parseFloat(rec.weight) : null;
        } else {
            return dayRecords.some(r => r.type === sport) ? 1 : null;
        }
    });

    // 5. Gestione Canvas e Grafico
    const canvas = document.getElementById('analysisChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // FIX: Controllo ultra-sicuro per la distruzione
    if (window.analysisChart instanceof Chart) {
        window.analysisChart.destroy();
    }
    window.analysisChart = null; // Reset totale prima di ricreare
    
    window.analysisChart = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: labelsFmt,
            datasets: [{
                data: dataSeries,
                borderColor: isPeso ? '#a855f7' : 'transparent',
                backgroundColor: isPeso ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                fill: isPeso,
                showLine: isPeso,
                pointRadius: isPeso ? 4 : 0, 
                spanGaps: isPeso
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: isPeso }
            },
            scales: {
                y: {
                    display: isPeso,
                    min: (isPeso && dataSeries.some(v => v !== null)) ? Math.floor(Math.min(...dataSeries.filter(v => v > 0)) - 1) : 0,
                    max: (isPeso && dataSeries.some(v => v !== null)) ? Math.ceil(Math.max(...dataSeries.filter(v => v > 0)) + 1) : 2
                },
                x: {
                    grid: { display: false },
                    ticks: { autoSkip: true, maxRotation: 0 }
                }
            }
        },
        plugins: [{
            id: 'iconDrawer',
            afterDraw: (chart) => {
                if (sport === 'Peso') return;
                const { ctx, scales: { x, y } } = chart;
                chart.data.datasets[0].data.forEach((val, i) => {
                    if (val === 1) {
                        const xPos = x.getPixelForValue(chart.data.labels[i], i);
                        const yPos = y.getPixelForValue(1); 
                        ctx.save();
                        ctx.font = "24px Arial";
                        ctx.textAlign = "center";
                        ctx.fillText(icons[sport] || '📍', xPos, yPos);
                        ctx.restore();
                    }
                });
            }
        }]
    });

    // 6. Aggiornamento Tile Sport
    const tc = document.getElementById('sportTiles');
    if (tc) {
        tc.innerHTML = '';
        ['Corsa', 'Padel', 'Stretching', 'Pesi', 'Routine'].forEach(s => {
            const count = window.fitnessDB.filter(r => labelsRaw.includes(r.date) && r.type === s).length;
            const tile = document.createElement('div');
            tile.className = `sport-tile ${sport === s ? 'active' : ''}`;
            tile.innerHTML = `<span>${icons[s] || ''}</span><br><b>${count}</b>`;
            tile.onclick = () => {
                const filter = document.getElementById('sportFilter');
                if(filter) filter.value = s;
                renderAnalisi();
            };
            tc.appendChild(tile);
        });
    }
}

// Esponi le funzioni a window per l'accesso dalle tab
window.renderChart = renderChart;
window.renderHeatmap = renderHeatmap; // <--- Assicurati che ci sia!
window.renderAnalisi = renderAnalisi;
window.changeWeek = (days) => { 
    if(!window.referenceDate) window.referenceDate = new Date();
    window.referenceDate.setDate(window.referenceDate.getDate() + days); 
    renderChart(); 
};
