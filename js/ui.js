export function showTab(id) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const targetContent = document.getElementById(id);
    if (targetContent) targetContent.classList.add('active');

    const targetBtn = document.querySelector(`button[onclick*="${id}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    if(id === 'main' && window.renderChart) window.renderChart();
    if(id === 'analisi' && window.renderAnalisi) window.renderAnalisi();
    if(id === 'history' && window.renderHistory) window.renderHistory();
}

export function toggleFields() {
    const t = document.getElementById('typeIn').value;
    document.getElementById('kmBox').classList.toggle('hidden', t !== 'Corsa');
    document.getElementById('minBox').classList.toggle('hidden', !['Corsa','Padel','Stretching','Routine'].includes(t));
}

export function renderHistory() {
    const container = document.getElementById('historyList');
    if (!container || !window.fitnessDB) return;

    container.innerHTML = '';

    // Ordina i record dal più recente al più vecchio
    const sortedData = [...window.fitnessDB].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedData.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.5;">Nessun dato registrato.</p>';
        return;
    }

    sortedData.forEach(reg => {
        const card = document.createElement('div');
        card.className = 'history-card'; // Assicurati di avere questo stile nel CSS
        
        // Icona in base al tipo (logica originale)
        const icons = { 'Corsa': '🏃', 'Padel': '🎾', 'Stretching': '🧘', 'Pesi': '🏋️', 'Routine': '💪' };
        const icon = icons[reg.type] || '📍';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:1.2rem;">${icon}</span>
                    <strong>${reg.type}</strong>
                    <div style="font-size:0.75rem; opacity:0.6;">${reg.date.split('-').reverse().join('/')}</div>
                </div>
                <div style="text-align:right;">
                    <div>${reg.km ? reg.km + ' km' : ''} ${reg.min ? reg.min + ' min' : ''}</div>
                    ${reg.weight ? `<div style="font-size:0.8rem; color:var(--primary);">${reg.weight} kg</div>` : ''}
                </div>
                <button onclick="deleteRecord('${reg.id}')" style="background:none; border:none; color:#ff4444; cursor:pointer; margin-left:10px;">
                    🗑️
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Rendila globale
window.renderHistory = renderHistory;

window.showTab = showTab;
window.toggleFields = toggleFields;
