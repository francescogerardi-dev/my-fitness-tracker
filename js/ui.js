// 1. Definiamo le icone (fondamentale, altrimenti il map si rompe)
const icons = { 
    'Corsa': '🏃', 'Padel': '🎾', 'Stretching': '🧘', 
    'Pesi': '🏋️', 'Routine': '💪', 'Riposo': '😴' 
};

export function showTab(id) {
    // Rimuovi active da tutti i contenuti (usa .tab-content o .content a seconda del tuo HTML)
    document.querySelectorAll('.tab-content, .content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const targetContent = document.getElementById(id);
    if (targetContent) targetContent.classList.add('active');

    // Trova il bottone che ha l'onclick corrispondente
    const targetBtn = document.querySelector(`button[onclick*="${id}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    // Trigger grafici e liste
    if(id === 'main' && window.renderChart) window.renderChart();
    if(id === 'analisi' && window.renderAnalisi) window.renderAnalisi();
    if(id === 'history' && window.renderHistory) window.renderHistory();
}

export function toggleFields() {
    const t = document.getElementById('typeIn').value;
    const kmBox = document.getElementById('kmBox');
    const minBox = document.getElementById('minBox');
    
    if(kmBox) kmBox.classList.toggle('hidden', t !== 'Corsa');
    if(minBox) minBox.classList.toggle('hidden', !['Corsa','Padel','Stretching','Routine'].includes(t));
}

window.renderHistory = () => {
    const list = document.getElementById('historyList');
    if (!list || !window.fitnessDB) return;

    const iconsMap = { 
        'Corsa': '🏃', 'Padel': '🎾', 'Stretching': '🧘', 
        'Pesi': '🏋️', 'Routine': '💪', 'Riposo': '😴' 
    };

    let html = "";
    window.fitnessDB.slice().reverse().forEach(r => {
        const icon = iconsMap[r.type] || '📍';
        const dateFmt = r.date ? r.date.split('-').reverse().join('/') : '??/??';
        
        html += `
            <div style="background:#1e293b; padding:12px; border-radius:8px; margin-bottom:10px; display:flex !important; justify-content:space-between !important; align-items:center !important; border:1px solid #334155; width: 100%; box-sizing: border-box;">
                <div style="color: white; flex-grow: 1;">
                    <b style="color:#38bdf8;">${dateFmt}</b> - ${icon} ${r.type} 
                    ${r.weight ? ' | <span style="color:#a855f7;">' + r.weight + 'kg</span>' : ''}
                </div>
                <button onclick="window.handleDelete('${r.id}')" 
                        style="background:#ef4444 !important; color:white !important; border:none !important; border-radius:4px !important; padding:5px 12px !important; cursor:pointer !important; font-weight:bold !important; min-width:30px !important; margin-left:10px !important; display:block !important;">
                    X
                </button>
            </div>`;
    });
    list.innerHTML = html;
};
// Rendi tutto globale per l'HTML
window.showTab = showTab;
window.toggleFields = toggleFields;
window.renderHistory = renderHistory;
