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

    list.innerHTML = window.fitnessDB.slice().reverse().map(r => {
        const icon = iconsMap[r.type] || '📍';
        const dateFmt = r.date.split('-').reverse().join('/');
        
        return `
            <div class="history-item">
                <div style="color: white; font-size: 0.95rem;">
                    <b style="color:var(--primary);">${dateFmt}</b> - ${icon} ${r.type} 
                    ${r.weight ? ' | <span style="color:#a855f7;">' + r.weight + 'kg</span>' : ''}
                </div>
                <button class="btn-delete" onclick="handleDelete('${r.id}')">
                    X
                </button>
            </div>`;
    }).join('');
};
// Rendi tutto globale per l'HTML
window.showTab = showTab;
window.toggleFields = toggleFields;
window.renderHistory = renderHistory;
