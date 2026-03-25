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

// 2. La funzione di rendering
window.renderHistory = function() {
    const list = document.getElementById('historyList');
    if (!list || !window.fitnessDB) return;

    list.innerHTML = window.fitnessDB.slice().reverse().map(r => `
        <div class="history-item" style="background:var(--card); padding:12px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #334155;">
            <div style="color:white; font-size:0.9rem;">
                <b style="color:var(--primary);">${r.date ? r.date.split('-').reverse().join('/') : '??/??'}</b> - 
                ${icons[r.type] || '📍'} ${r.type} 
                ${r.weight ? ' | <span style="color:#a855f7;">' + r.weight + 'kg</span>' : ''}
            </div>
            <button onclick="window.handleDelete('${r.id}')" 
                    style="background:var(--danger); color:white; border:none; border-radius:6px; padding:6px 12px; cursor:pointer; font-weight:bold; font-size:14px; flex-shrink:0;">
                X
            </button>
        </div>
    `).join('');
};

// 3. Funzioni Tab (esportate correttamente)
window.showTab = function(id) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const targetContent = document.getElementById(id);
    if (targetContent) targetContent.classList.add('active');

    const targetBtn = document.querySelector(`button[onclick*="${id}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    // Trigger immediato al cambio tab
    if(id === 'history' && window.renderHistory) window.renderHistory();
};

window.toggleFields = function() {
    const t = document.getElementById('typeIn').value;
    const kmBox = document.getElementById('kmBox');
    const minBox = document.getElementById('minBox');
    if(kmBox) kmBox.classList.toggle('hidden', t !== 'Corsa');
    if(minBox) minBox.classList.toggle('hidden', !['Corsa','Padel','Stretching','Routine'].includes(t));
};

// Rendi tutto globale per l'HTML
window.showTab = showTab;
window.toggleFields = toggleFields;
window.renderHistory = renderHistory;
