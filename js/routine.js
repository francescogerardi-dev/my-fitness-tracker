import { db, auth } from './config.js';
import { 
    collection, 
    addDoc, 
    doc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { formatDateLocal } from './utils.js';

/**
 * Aggiunge un nuovo esercizio alla lista routine su Firebase
 */
export async function addExercise() {
    const nameEl = document.getElementById('exName');
    const name = nameEl.value;
    if(!name) return alert("Inserisci il nome dell'esercizio");
    
    const exercise = {
        name: name,
        duration: document.getElementById('exDuration').value || null,
        img: document.getElementById('exImg').value || null,
        note: document.getElementById('exNote').value || "",
        order: (window.routineDB?.length || 0) + 1,
        createdAt: new Date()
    };
    
    try {
        await addDoc(collection(db, "users", auth.currentUser.uid, "routine"), exercise);
        // Pulizia campi
        nameEl.value = '';
        document.getElementById('exDuration').value = '';
        document.getElementById('exImg').value = '';
        document.getElementById('exNote').value = '';
    } catch (e) {
        console.error("Errore salvataggio esercizio:", e);
    }
}

/**
 * Registra il completamento dell'intera routine nel database Records
 */
export async function completeRoutine() {
    if(!window.routineDB || window.routineDB.length === 0) return alert("Aggiungi degli esercizi prima!");
    
    if(confirm("Registrare il completamento? (Aggiungerà Routine e 10m Stretching)")) {
        let lastW = null;
        /*fix ultimo peso in quick save riportata anche qui*/
        if(window.fitnessDB && window.fitnessDB.length > 0) {
            const last = [...window.fitnessDB].sort((a,b)=>new Date(b.date)-new Date(a.date)).find(r=>r.weight > 0);
            if(last) lastW = last.weight;
        }

        const today = formatDateLocal(new Date());
        const ref = collection(db, "users", auth.currentUser.uid, "records");

        try {
            await addDoc(ref, { date: today, type: 'Routine', weight: lastW, km: 0, min: 0 });
            await addDoc(ref, { date: today, type: 'Stretching', weight: lastW, km: 0, min: 10 });
            window.showTab('main');
        } catch (e) {
            console.error("Errore completamento routine:", e);
        }
    }
}

/**
 * Disegna la lista degli esercizi nella Tab Routine
 */
export function renderRoutine() {
    const list = document.getElementById('exerciseList');
    if (!list || !window.routineDB) return;

    if (window.routineDB.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">Nessun esercizio presente.</div>';
        return;
    }

    const sorted = [...window.routineDB].sort((a, b) => (a.order || 0) - (b.order || 0));

    list.innerHTML = sorted.map((ex) => `
        <div class="stat-card" style="margin-bottom:10px; padding:12px; border-left: 4px solid var(--primary); display: flex; align-items: center; gap: 12px;">
            <div style="width:40px; height:40px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border-radius:8px; overflow:hidden;">
                ${ex.img ? `<img src="${ex.img}" style="width:100%; height:100%; object-fit:cover;">` : '🏋️'}
            </div>
            <div style="flex-grow:1; min-width:0;">
                <b style="font-size:0.9rem; display:block; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ex.name}</b>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${ex.duration ? `<small style="color:var(--primary); font-weight:bold;">${ex.duration}s</small>` : ''}
                    ${ex.note ? `<small style="color:#94a3b8; font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ex.note}</small>` : ''}
                </div>
            </div>
            <button onclick="deleteEx('${ex.id}')" style="background:none; border:none; color:#ef4444; padding:5px; cursor:pointer;">✕</button>
        </div>
    `).join('');
}

// Esposizione per l'HTML
window.addExercise = addExercise;
window.completeRoutine = completeRoutine;
window.renderRoutine = renderRoutine;
window.deleteEx = async (id) => {
    if(confirm("Eliminare l'esercizio?")) {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "routine", id));
    }
};
