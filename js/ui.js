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
    console.log("--- START RENDER HISTORY ---");
    const list = document.getElementById('historyList');
    
    // LOG 1: Verifica esistenza contenitore
    if (!list) {
        console.error("LOG: Elemento 'historyList' NON trovato nell'HTML!");
        return;
    }

    // LOG 2: Verifica dati in memoria
    if (!window.fitnessDB) {
        console.warn("LOG: window.fitnessDB è undefined o null.");
        list.innerHTML = "In attesa dei dati...";
        return;
    }

    console.log("LOG: Dati trovati, totale record:", window.fitnessDB.length);

    const iconsMap = { 
        'Corsa': '🏃', 'Padel': '🎾', 'Stretching': '🧘', 
        'Pesi': '🏋️', 'Routine': '💪', 'Riposo': '😴' 
    };

    let finalHTML = "";

    // LOG 3: Controllo struttura del primo record
    if (window.fitnessDB.length > 0) {
        console.log("LOG: Struttura record d'esempio:", window.fitnessDB[0]);
    }

    window.fitnessDB.slice().reverse().forEach((r, i) => {
        try {
            const icon = iconsMap[r.type] || '📍';
            const dateFmt = r.date ? r.date.split('-').reverse().join('/') : '??/??';
            
            // LOG 4: Verifica ID per il tasto cancella
            if (!r.id) console.warn(`LOG: Record indice ${i} manca di ID!`, r);

            finalHTML += `
                <div class="history-item" style="background:#1e293b; padding:12px; margin-bottom:10px; display:flex !important; justify-content:space-between !important; align-items:center !important; border:1px solid #334155; width:100%; min-height:50px;">
                    <div style="color:white; flex:1;">
                        <b style="color:#38bdf8;">${dateFmt}</b> - ${icon} ${r.type}
                    </div>
                    <button onclick="window.handleDelete('${r.id}')" 
                            style="background:#ef4444 !important; color:white !important; border:none !important; border-radius:6px !important; padding:8px 12px !important; cursor:pointer !important; font-weight:bold !important; display:block !important; visibility:visible !important; opacity:1 !important; z-index:100;">
                        X
                    </button>
                </div>`;
        } catch (e) {
            console.error("LOG: Errore durante il loop del record", i, e);
        }
    });

    // LOG 5: Verifica finale prima della scrittura
    console.log("LOG: HTML generato (primi 100 char):", finalHTML.substring(0, 100));
    
    list.innerHTML = finalHTML;
    
    console.log("--- END RENDER HISTORY ---");
};
// Rendi tutto globale per l'HTML
window.showTab = showTab;
window.toggleFields = toggleFields;
window.renderHistory = renderHistory;
