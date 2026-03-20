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

// Funzione Render Storico (Logica 3.0)
export function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    if (!window.fitnessDB || window.fitnessDB.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.5;">Nessun dato presente</p>';
        return;
    }

    list.innerHTML = window.fitnessDB.slice().reverse().map(r => `
        <div style="background:var(--card); padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #334155; color: white;">
            <div style="flex: 1;">
                <b style="color:var(--primary);">${r.date.split('-').reverse().join('/')}</b> - 
                ${icons[r.type] || '📍'} ${r.type} 
                ${r.weight ? ' | <span style="color:#a855f7;">' + r.weight + 'kg</span>' : ''}
            </div>
            
            <button onclick="handleDelete('${r.id}')" 
                    style="
                        all: unset !important;
                        background-color: #ff4444 !important; 
                        color: white !important; 
                        padding: 5px 10px !important;
                        border-radius: 4px !important;
                        cursor: pointer !important;
                        font-family: sans-serif !important;
                        font-weight: bold !important;
                        font-size: 14px !important;
                        line-height: 1 !important;
                        display: inline-block !important;
                        min-width: 20px !important;
                        text-align: center !important;
                        z-index: 9999 !important;
                        position: relative !important;
                    ">
                X
            </button>
        </div>`).join('');
}

// Rendi tutto globale per l'HTML
window.showTab = showTab;
window.toggleFields = toggleFields;
window.renderHistory = renderHistory;
