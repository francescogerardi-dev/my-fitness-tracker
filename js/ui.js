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

window.renderHistory = () => {
    const list = document.getElementById('historyList');
    if (!list || !window.fitnessDB) return;

    // Logica originale: slice().reverse() per mostrare i più recenti in alto
    list.innerHTML = window.fitnessDB.slice().reverse().map(r => `
        <div style="background:var(--card); padding:10px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; border:1px solid #334155; align-items:center;">
            <div>
                <b>${r.date.split('-').reverse().join('/')}</b> - 
                ${icons[r.type] || '📍'} ${r.type} 
                ${r.weight ? ' | ' + r.weight + 'kg' : ''}
            </div>
            <button onclick="handleDelete('${r.id}')" 
                    style="background:var(--danger); border:none; color:white; border-radius:4px; padding: 4px 10px; cursor:pointer; font-weight:bold;">
                X
            </button>
        </div>`).join('');
};

// Rendila globale
window.renderHistory = renderHistory;

window.showTab = showTab;
window.toggleFields = toggleFields;
