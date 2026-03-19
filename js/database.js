import { db, auth } from './config.js';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { formatDateLocal } from './utils.js';

export async function handleSave() {
    const entry = {
        date: document.getElementById('dateIn').value,
        type: document.getElementById('typeIn').value,
        weight: parseFloat(document.getElementById('weightIn').value) || null,
        km: parseFloat(document.getElementById('kmIn').value) || 0,
        min: parseInt(document.getElementById('minIn').value) || 0
    };
    await addDoc(collection(db, "users", auth.currentUser.uid, "records"), entry);
    window.showTab('main');
}

export async function quickSave(type, minutes) {
    let lastW = null;
    if(window.fitnessDB.length > 0) {
        const last = [...window.fitnessDB].sort((a,b)=>new Date(b.date)-new Date(a.date)).find(r=>r.weight > 0);
        if(last) lastW = last.weight;
    }
    await addDoc(collection(db, "users", auth.currentUser.uid, "records"), {
        date: formatDateLocal(new Date()), type: type, weight: lastW, km: 0, min: minutes
    });
    window.showTab('main');
}

// Esponiamo a window per i bottoni HTML
window.handleSave = handleSave;
window.quickSave = quickSave;
window.handleDelete = async (id) => {
    if (confirm("Eliminare?")) await deleteDoc(doc(db, "users", auth.currentUser.uid, "records", id));
};
