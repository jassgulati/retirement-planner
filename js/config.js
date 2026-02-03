// Firebase Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export function initializeFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    return {
        auth: firebase.auth(),
        database: firebase.database()
    };
}

// App Constants
export const APP_CONFIG = {
    CURRENT_YEAR: new Date().getFullYear(),
    RETIREMENT_AGE: 67,
    SOCIAL_SECURITY_FRA: 67,
    INFLATION_RATE: 0.03,
    INVESTMENT_RETURN: 0.07,
    MAX_SS_AGE: 70,
    MIN_SS_AGE: 62
};
