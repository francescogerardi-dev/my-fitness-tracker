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
    if (!list) return;

    if (!window.fitnessDB || window.fitnessDB.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.5;">Nessun dato trovato.</div>';
        return;
    }

    const iconsMap = { 
        'Corsa': '🏃', 'Padel': '🎾', 'Stretching': '🧘', 
        'Pesi': '🏋️', 'Routine': '💪', 'Riposo': '😴' 
    };

    // Creiamo l'HTML un pezzo alla volta per evitare crash totali
    let finalHTML = "";

    window.fitnessDB.slice().reverse().forEach(r => {
        try {
            const icon = iconsMap[r.type] || '📍';
            // Protezione per la data: se manca o è strana, non rompiamo tutto
            const dateFmt = r.date ? r.date.split('-').reverse().join('/') : 'Data n.d.';
            const weightText = r.weight ? ` | <span style="color:#a855f7;">${r.weight}kg</span>` : '';
            const recordId = r.id || Math.random().toString(36); // Fallback ID

            finalHTML += `
                <div style="background:#1e293b; padding:12px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #334155; width:100%; box-sizing:border-box;">
                    <div style="color:white; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        <b style="color:#38bdf8;">${dateFmt}</b> - ${icon} ${r.type} ${weightText}
                    </div>
                    <button onclick="window.handleDelete('${recordId}')" 
                            style="background:#ef4444 !important; color:white !important; border:none !important; border-radius:6px !important; padding:6px 12px !important; cursor:pointer !important; font-weight:bold !important; font-size:14px !important; margin-left:10px !important; flex-shrink:0 !important; display:block !important;">
                        X
                    </button>
                </div>`;
        } catch (err) {
            console.error("Errore nel rendering di un record:", err, r);
        }
    });

    list.innerHTML = finalHTML;
};
// Rendi tutto globale per l'HTML
window.showTab = showTab;
window.toggleFields = toggleFields;
window.renderHistory = renderHistory;
