// js/routine.js
import { db, auth } from './config.js';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // Nota: usa firestore
import { formatDateLocal } from './utils.js';

// Importiamo correttamente le funzioni da firestore
import { 
    addDoc as fireAdd, 
    doc as fireDoc, 
    deleteDoc as fireDel, 
    updateDoc as fireUpd,
    collection as fireColl 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function addExercise() {
    const name = document.getElementById('exName').value;
    if(!name) { alert("Nome obbligatorio"); return; }
    
    const exercise = {
        name: name,
        duration: document.getElementById('exDuration').value || null,
        img: document.getElementById('exImg').value || null,
        note: document.getElementById('exNote').value || "",
        order: (window.routineDB?.length || 0) + 1,
        createdAt: new Date()
    };
    
    await fireAdd(fireColl(db, "users", auth.currentUser.uid, "routine"), exercise);
    document.getElementById('routineForm').querySelectorAll('input, textarea').forEach(i => i.value = '');
}

export async function completeRoutine() {
    if(!window.routineDB || window.routineDB.length === 0) return alert("Routine vuota!");
    
    if(confirm("Registrare il completamento? (Include Stretching)")) {
        let lastW = null;
        if(window.fitnessDB.length > 0) {
            const last = [...window.fitnessDB].sort((a,b)=>new Date(b.date)-new Date(a.date)).find(r=>r.weight > 0);
            if(last) lastW = last.weight;
        }

        const today = formatDateLocal(new Date());
        const recordsRef = fireColl(db, "users", auth.currentUser.uid, "records");

        await Promise.all([
            fireAdd(recordsRef, { date: today, type: 'Routine', weight: lastW, km: 0, min: 0 }),
            fireAdd(recordsRef, { date: today, type: 'Stretching', weight: lastW, km: 0, min: 10 })
        ]);
        window.showTab('main');
    }
}

export function renderRoutine() {
    const list = document.getElementById('exerciseList');
    if (!list || !window.routineDB) return;

    if (window.routineDB.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">Nessun esercizio salvato.</div>';
        return;
    }

    const sorted = [...window.routineDB].sort((a, b) => (a.order || 0) - (b.order || 0));

    list.innerHTML = sorted.map((ex) => `
        <div class="stat-card" style="margin-bottom:10px; padding:12px; border-left: 4px solid var(--primary); display: flex; align-items: center; gap: 12px;">
            <div style="width:45px; height:45px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border-radius:8px; overflow:hidden;">
                ${ex.img ? `<img src="${ex.img}" style="width:100%; height:100%; object-fit:cover;">` : '🏋️'}
            </div>
            <div style="flex-grow:1; min-width:0;">
                <b style="font-size:0.95rem; display:block; color:white;">${ex.name}</b>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${ex.duration ? `<small style="color:var(--primary); font-weight:bold;">${ex.duration}s</small>` : ''}
                    ${ex.note ? `<small style="color:#94a3b8; font-style:italic;">${ex.note}</small>` : ''}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:5px;">
                <button onclick="deleteEx('${ex.id}')" style="background:var(--danger); border:none; color:white; border-radius:6px; padding:8px 10px;">✕</button>
            </div>
        </div>
    `).join('');
}

// Esposizione globale
window.addExercise = addExercise;
window.completeRoutine = completeRoutine;
window.renderRoutine = renderRoutine;
window.deleteEx = async (id) => {
    if(confirm("Eliminare?")) await fireDel(fireDoc(db, "users", auth.currentUser.uid, "routine", id));
};
