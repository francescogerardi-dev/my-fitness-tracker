import { db, auth } from './config.js';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { formatDateLocal } from './utils.js';

export async function handleSave() {
    console.log(document.getElementById('dateIn').value);
    console.log(document.getElementById('typeIn').value);
    const entry = {
        date: document.getElementById('dateIn').value,
        type: document.getElementById('typeIn').value,
        weight: parseFloat(document.getElementById('weightIn').value) || null,
        km: parseFloat(document.getElementById('kmIn').value) || 0,
        min: parseInt(document.getElementById('minIn').value) || 0
    };
    console.log('----->'||entry.type);
    await addDoc(collection(db, "users", auth.currentUser.uid, "records"), entry);
    window.showTab('main');
}

export async function quickSave(type, minutes) {
    let lastW = null;
    /*Elimino l'inserimento dell'ultimo peso su quick save perchè altera la gestione del peso*/
    /*
    if(window.fitnessDB.length > 0) {
        const last = [...window.fitnessDB].sort((a,b)=>new Date(b.date)-new Date(a.date)).find(r=>r.weight > 0);
        if(last) lastW = last.weight;
    }
    */
    await addDoc(collection(db, "users", auth.currentUser.uid, "records"), {
        date: formatDateLocal(new Date()), type: type, weight: lastW, km: 0, min: minutes
    });
    window.showTab('main');
}

window.deleteRecord = async (id) => {
    if (confirm("Vuoi davvero eliminare questo record?")) {
        try {
            await deleteDoc(doc(db, "fitness", id));
            console.log("Record eliminato:", id);
        } catch (e) {
            console.error("Errore durante l'eliminazione:", e);
        }
    }
}

// Esponiamo a window per i bottoni HTML
window.handleSave = handleSave;
window.quickSave = quickSave;
window.handleDelete = async (id) => {
    // 1. Chiedi conferma all'utente (Logica 3.0)
    if (!confirm("Vuoi eliminare definitivamente questo record?")) return;

    try {
        // 2. Recupera l'utente corrente (necessario per il percorso del database)
        const user = window.currentUser;
        if (!user) {
            alert("Errore: Utente non autenticato.");
            return;
        }

        // 3. Punta al documento specifico e cancellalo
        // Il percorso deve essere lo stesso usato in app.js: users -> UID -> records -> ID_DOC
        const docRef = doc(db, "users", user.uid, "records", id);
        await deleteDoc(docRef);
        
        console.log("Record eliminato con successo:", id);
        
        // NOTA: Non serve chiamare manualmente renderHistory(). 
        // Il listener onSnapshot in app.js rileverà la modifica e aggiornerà l'interfaccia da solo.
        
    } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        alert("Si è verificato un errore durante l'eliminazione.");
    }
};
