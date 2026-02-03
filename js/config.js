// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';

const firebaseConfig = {
    apiKey: "AIzaSyBR-Iz3V143KD4eQL_DHW9HvyeRIumlfxY",
    authDomain: "retirement-planning-2ea8c.firebaseapp.com",
    projectId: "retirement-planning-2ea8c",
    storageBucket: "retirement-planning-2ea8c.firebasestorage.app",
    messagingSenderId: "638834364301",
    appId: "1:638834364301:web:dd5e987f4bc1ff511437c4",
    measurementId: "G-C300GP56C2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
