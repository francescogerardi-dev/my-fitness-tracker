// js/coach.js
import { icons } from './config.js';
import { formatDateLocal } from './utils.js';

export function updateSuggestion() {
    if (!window.fitnessDB) return;
    const sports = ['Corsa', 'Padel', 'Stretching', 'Pesi', 'Routine'];
    const oggiMezzanotte = new Date();
    oggiMezzanotte.setHours(0, 0, 0, 0);
    
    let streaks = {};
    let lastSeen = {};

    sports.forEach(s => {
        const sDates = [...new Set(window.fitnessDB.filter(r => r.type === s).map(r => r.date))].sort((a, b) => new Date(a) - new Date(b));
        let currentStreak = 0;
        if (sDates.length > 0) {
            const sortedDesc = [...sDates].sort((a,b) => new Date(b) - new Date(a));
            const lastDate = new Date(sortedDesc[0]);
            lastDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((oggiMezzanotte - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                currentStreak = 1;
                for (let i = 0; i < sortedDesc.length - 1; i++) {
                    const d1 = new Date(sortedDesc[i]); const d2 = new Date(sortedDesc[i+1]);
                    d1.setHours(0,0,0,0); d2.setHours(0,0,0,0);
                    if ((d1 - d2) / (1000 * 60 * 60 * 24) === 1) currentStreak++;
                    else break;
                }
            }
            lastSeen[s] = lastDate;
        } else { lastSeen[s] = new Date(0); }
        streaks[s] = currentStreak;
    });

    let suggestion = "";
    const maxVal = Math.max(...Object.values(streaks));
    const activeStreaks = Object.entries(streaks).filter(([s, val]) => val === maxVal && val >= 2);

    if (activeStreaks.length > 0) {
        const topSports = activeStreaks.map(x => `${icons[x[0]] || ''} ${x[0]} (${x[1]}g 🔥)`);
        suggestion = `Serie attiva! Vai con: ${topSports.join(' e ')}`;
    } else {
        const sortedByLast = Object.entries(lastSeen).sort((a, b) => a[1] - b[1]);
        const oldestSport = sortedByLast[0][0];
        suggestion = `Coach: Riprendiamo con ${icons[oldestSport] || ''} ${oldestSport}?`;
    }

    if (window.fitnessDB.some(r => r.date === formatDateLocal(new Date()))) {
        suggestion = "✅ Obiettivo centrato per oggi!";
    }

    const sugEl = document.getElementById('suggestionText');
    if(sugEl) sugEl.innerText = suggestion;
}

window.updateSuggestion = updateSuggestion;
