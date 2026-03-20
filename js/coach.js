// js/coach.js
const icons = { 
    'Corsa': '🏃', 'Padel': '🎾', 'Stretching': '🧘', 
    'Pesi': '🏋️', 'Routine': '💪', 'Riposo': '😴' 
};

export function updateSuggestion() {
    if (!window.fitnessDB || window.fitnessDB.length === 0) return;

    const sports = ['Corsa', 'Padel', 'Stretching', 'Pesi', 'Routine'];
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const oggiString = oggi.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    let streaks = {};
    let lastSeen = {};

    // 1. Calcolo Streak e Ultima volta per ogni sport reale
    sports.forEach(s => {
        const sDates = [...new Set(window.fitnessDB
            .filter(r => r.type === s)
            .map(r => r.date))]
            .sort((a, b) => new Date(a) - new Date(b));

        let currentStreak = 0;
        if (sDates.length > 0) {
            const sortedDesc = [...sDates].sort((a,b) => new Date(b) - new Date(a));
            const lastDate = new Date(sortedDesc[0]);
            lastDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((oggi - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                currentStreak = 1;
                for (let i = 0; i < sortedDesc.length - 1; i++) {
                    const d1 = new Date(sortedDesc[i]); 
                    const d2 = new Date(sortedDesc[i+1]);
                    d1.setHours(0,0,0,0); d2.setHours(0,0,0,0);
                    if ((d1 - d2) / (1000 * 60 * 60 * 24) === 1) currentStreak++;
                    else break;
                }
            }
            lastSeen[s] = lastDate;
        } else { 
            lastSeen[s] = new Date(0); 
        }
        streaks[s] = currentStreak;
    });

    // 2. Determina il suggerimento base
    let suggestion = "";
    const maxVal = Math.max(...Object.values(streaks));
    const activeStreaks = Object.entries(streaks).filter(([s, val]) => val === maxVal && val >= 2);

    if (activeStreaks.length > 0) {
        const topSports = activeStreaks.map(x => `${icons[x[0]] || ''} ${x[0]} (${x[1]}g 🔥)`);
        suggestion = `Serie attiva! Continua con: ${topSports.join(' e ')}`;
    /*} else {
        const sortedByLast = Object.entries(lastSeen).sort((a, b) => a[1] - b[1]);
        const oldestSport = sortedByLast[0][0];
        suggestion = `Coach: Riprendiamo con ${icons[oldestSport] || ''} ${oldestSport}?`;
    }*/
    }else {
        const sortedByLast = Object.entries(lastSeen).sort((a, b) => a[1] - b[1]);
        const oldestSport = sortedByLast[0][0];
        const diffDays = Math.floor((oggi  - sortedByLast[0][1]) / (1000 * 60 * 60 * 24));
        const missingTime = diffDays > 365 ? "molto tempo" : `${diffDays} giorni`;
        suggestion = `Coach: Riprendiamo con ${icons[oldestSport] || ''} ${oldestSport}? (Manca da ${missingTime})`;
    }

    // 3. IL FIX: Controlla se oggi hai fatto uno SPORT REALE
    // Ignora i record che sono solo "Riposo" o dove non c'è attività sportiva
    //const haFattoSportOggi = window.fitnessDB.some(r => 
    //    r.date === oggiString && 
    //    sports.includes(r.type) // Deve essere uno dei tipi in 'sports'
    //);

    //if (haFattoSportOggi) {
    //    suggestion = "✅ Obiettivo sportivo centrato per oggi!";
    //}

    const sugEl = document.getElementById('suggestionText');
    if(sugEl) sugEl.innerText = suggestion;
}

// Rendila globale per app.js
window.updateSuggestion = updateSuggestion;
