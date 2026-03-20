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
        list.innerHTML = "Nessun dato caricato nel database.";
        return;
    }

    console.log("LOG: Avvio rendering di", window.fitnessDB.length, "elementi");

    let html = "";
    window.fitnessDB.slice().reverse().forEach((r, index) => {
        // Se un record è corrotto, lo segnaliamo in console ma andiamo avanti
        if (!r.type || !r.date) {
            console.warn(`Record ${index} incompleto:`, r);
        }

        const idSafe = r.id || 'no-id-' + index;
        const tipoSafe = r.type || 'Attività';
        const dataSafe = r.date ? r.date.split('-').reverse().join('/') : '??/??';

        html += `
            <div style="background:#1e293b; padding:12px; margin-bottom:8px; border-radius:8px; border:1px solid #334155; display:flex !important; justify-content:space-between !important; align-items:center !important;">
                <div style="color:white;">
                    <b>${dataSafe}</b> - ${tipoSafe}
                </div>
                <button onclick="window.handleDelete('${idSafe}')" 
                        style="background:#ef4444 !important; color:white !important; border:none !important; border-radius:4px !important; padding:4px 10px !important; cursor:pointer !important; display:block !important; min-width:30px !important;">
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
