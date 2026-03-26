import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyATggTs_IGw_KMu-y3I7Vre5HnKbeyhAm4",
    authDomain: "myfitnesstracker-f2089.firebaseapp.com",
    projectId: "myfitnesstracker-f2089",
    storageBucket: "myfitnesstracker-f2089.firebasestorage.app",
    messagingSenderId: "229779508819",
    appId: "1:229779508819:web:d62f6a5e7abe89e75000a6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const icons = { 
    'Corsa': '🏃', 'Padel': '🎾', 'Stretching': '🧘', 
    'Pesi': '🏋️', 'Routine': '📋', 'Riposo': '💤', 'Addominali': '🧱' ,'Peso': '🐖'
};
