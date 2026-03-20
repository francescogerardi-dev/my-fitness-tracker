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

    list.innerHTML = window.fitnessDB.slice().reverse().map(r => `
        <div style="background:var(--card); padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #334155; color: white;">
            <div style="flex: 1;">
                <b style="color:var(--primary);">${r.date.split('-').reverse().join('/')}</b> - 
                ${icons[r.type] || '📍'} ${r.type} 
                ${r.weight ? ' | <span style="color:#a855f7;">' + r.weight + 'kg</span>' : ''}
            </div>
            
            <button onclick="handleDelete('${r.id}')" 
                    style="
                        background: #ef4444 !important; 
                        color: white !important; 
                        border: none !important; 
                        border-radius: 6px !important; 
                        padding: 6px 12px !important; 
                        cursor: pointer !important; 
                        font-weight: bold !important;
                        font-size: 14px !important;
                        min-width: 35px;
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                    ">
                X
            </button>
        </div>`).join('');
};;

// Rendila globale
window.renderHistory = renderHistory;

window.showTab = showTab;
window.toggleFields = toggleFields;
