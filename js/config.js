// Firebase Configuration
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
