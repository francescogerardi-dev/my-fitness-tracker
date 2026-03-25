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
        
            // Esegui i rendering solo se le funzioni sono disponibili
            if (window.renderChart) window.renderChart();
            if (window.updateSuggestion) window.updateSuggestion();
            if (window.renderHeatmap) window.renderHeatmap();
            if (window.renderHistory) window.renderHistory();
             console.log("ho chiamato render history");
            
            // Aggiorna l'analisi solo se la tab è attiva
            if (document.getElementById('analisi').classList.contains('active') && window.renderAnalisi) {
                window.renderAnalisi();
            }
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
});
