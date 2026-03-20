import { auth, db, provider } from './config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// IMPORTANTE: Questi devono essere caricati SUBITO
import './ui.js';
import './database.js';
import './charts.js';
import './coach.js';
import './routine.js';

window.login = () => signInWithPopup(auth, provider);
window.logout = () => signOut(auth);


onAuthStateChanged(auth, (user) => {
    if (user) {
        window.currentUser = user;
        document.getElementById('loginOverlay').classList.add('hidden');
        
        // Listener Records
        const q = query(collection(db, "users", user.uid, "records"), orderBy("date", "asc"));
        onSnapshot(q, (snapshot) => {
            window.fitnessDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Dati Fitness Caricati:", window.fitnessDB.length); // Verifica in console

            // Chiama le funzioni solo se sono state caricate dai moduli
            if (typeof window.renderChart === 'function') window.renderChart();
            if (typeof window.updateSuggestion === 'function') window.updateSuggestion();
            if (typeof window.renderHeatmap === 'function') window.renderHeatmap();
        });

        // Listener Routine
        const qRoutine = query(collection(db, "users", user.uid, "routine"), orderBy("order", "asc"));
        onSnapshot(qRoutine, (snapshot) => {
            window.routineDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if(window.renderRoutine) window.renderRoutine();
        });

    } else {
        document.getElementById('loginOverlay').classList.remove('hidden');
    }

    // js/app.js - Aggiungi in fondo temporaneamente
    window.renderChart = () => console.log("Grafico in attesa di charts.js");
    window.renderHeatmap = () => console.log("Heatmap in attesa di charts.js");
    window.updateSuggestion = () => console.log("Coach in attesa di coach.js");
    window.renderAnalisi = () => console.log("Analisi in attesa di charts.js");
    window.renderHistory = () => {
    const list = document.getElementById('historyList');
    if(list) list.innerHTML = "Caricamento storico...";
};
});
