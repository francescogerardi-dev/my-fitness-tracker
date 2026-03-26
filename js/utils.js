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

export function days2today(d) {
    var differenza;
    var today = new Date();
    console.log(d);
    console.log(today);
    differenza = today-d;
    differenza = Math.floor(differenza/86400000);
    console.log(differenza);
    return differenza;
}
