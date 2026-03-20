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
    if (!list) {
        console.error("ERRORE: Elemento 'historyList' non trovato nell'HTML");
        return;
    }

    if (!window.fitnessDB || window.fitnessDB.length === 0) {
        list.innerHTML = "<p>Nessun dato caricato.</p>";
        return;
    }

    console.log("Rendering storico in corso per", window.fitnessDB.length, "record...");

    const html = window.fitnessDB.slice().reverse().map(r => {
        // Fallback per icone e ID se mancano
        const icona = (typeof icons !== 'undefined' && icons[r.type]) ? icons[r.type] : '📍';
        const idRecord = r.id || 'no-id';
        const dataFmt = r.date ? r.date.split('-').reverse().join('/') : '??/??/??';

        return `
            <div class="history-item" style="background:#1e293b; color:white; padding:15px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; border:1px solid #334155;">
                <div>
                    <strong>${dataFmt}</strong> - ${icona} ${r.type || 'Attività'}
                </div>
                <button onclick="handleDelete('${idRecord}')" 
                        style="background:#ef4444 !important; color:white !important; border:none !important; padding:8px 12px !important; border-radius:5px !important; cursor:pointer !important; font-weight:bold !important; display:block !important; visibility:visible !important;">
                    ELIMINA
                </button>
            </div>
        `;
    }).join('');

    list.innerHTML = html;
};

// Rendi tutto globale per l'HTML
window.showTab = showTab;
window.toggleFields = toggleFields;
window.renderHistory = renderHistory;
