export function formatDateLocal(d) { return d.toISOString().split('T')[0]; }

export function getMonday(d) { 
    d = new Date(d); 
    const day = d.getDay(); 
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff)); 
}

export function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

export function days2todayUp(d) {
    var differenza;
    var today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    differenza = today-d;
    differenza = Math.ceil(differenza/86400000)+1;
    return differenza;
}

export function days2today(d) {
    var differenza;
    var today = new Date();
    differenza = today-d;
    differenza = Math.floor(differenza/86400000);
    return differenza;
}

export function calcolaCostanza(labels) {
    let score = 0;
    labels.forEach(day => {
        const acts = window.fitnessDB.filter(r => r.date === day);
        if(acts.some(r => !['Stretching', 'Riposo','Peso','Routine'].includes(r.type))) score += 1;
        else if(acts.some(r => r.type === 'Stretching')&&acts.some(r => r.type === 'Routine')) score += 1;
        else if(acts.some(r => r.type === 'Stretching')) score += 0.5;
    });
    return score;
}

export function calcolafullscore(labels) {
    let fullscore = 0;
    labels.forEach(day => {
        const totalacts = window.fitnessDB.filter(r => r.date === day);
        //console.log(totalacts);
        totalacts.forEach(r => {
            if(r.type === 'Stretching') fullscore +=0.5;
            if(r.type === 'Routine') fullscore +=0.5;
            if(r.type !== 'Peso'&&r.type !== 'Riposo'&&r.type !== 'Stretching'&&r.type !== 'Routine') fullscore +=1;
    });
    return fullscore;
}

/**
 * Verifica se la settimana di riferimento è quella attuale
 * @returns {boolean}
 */
export function isCurrentWeek() {
    // 1. Prendi il lunedì della settimana che stai guardando
    const refMonday = getMonday(window.referenceDate || new Date());
    // 2. Prendi il lunedì di "oggi"
    const todayMonday = getMonday(new Date());
    // 3. Confronta le date (formattate come stringhe per sicurezza)
    return refMonday.toDateString() === todayMonday.toDateString();
}
