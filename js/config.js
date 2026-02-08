// Firebase Configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBR-Iz3V143KD4eQL_DHW9HvyeRIumlfxY",
    authDomain: "retirement-planning-2ea8c.firebaseapp.com",
    databaseURL: "https://retirement-planning-2ea8c-default-rtdb.firebaseio.com",
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

// Projection Rates - User Selectable
export const PROJECTION_RATES = {
    conservative: 0.04,  // 4% - Safe, bond-heavy portfolio
    average: 0.10,       // 10% - S&P 500 10-year historical average
    optimistic: 0.13     // 13% - S&P 500 + 3% for aggressive growth
};

// Get current projection rate based on user preference
export function getProjectionRate(mode = 'average') {
    return PROJECTION_RATES[mode] || PROJECTION_RATES.average;
}

// App Constants
export const APP_CONFIG = {
    CURRENT_YEAR: new Date().getFullYear(),
    RETIREMENT_AGE: 67,
    SOCIAL_SECURITY_FRA: 67,
    INFLATION_RATE: 0.03,
    INVESTMENT_RETURN: 0.07, // Default - user can override with projection mode
    MAX_SS_AGE: 70,
    MIN_SS_AGE: 62,
    
    // 2025 Retirement Account Contribution Limits
    CONTRIBUTION_LIMITS: {
        '401k': 23500,
        '401k_catchup': 7500,      // Age 50+
        'ira': 7000,
        'ira_catchup': 1000,       // Age 50+
        'sep_ira': 70000,
        'simple_ira': 16500,
        'simple_ira_catchup': 3500, // Age 50+
        'hsa_individual': 4300,
        'hsa_family': 8550,
        'hsa_catchup': 1000        // Age 55+
    },
    
    // 2025 Tax Year Standard Deductions
    STANDARD_DEDUCTIONS: {
        'single': 14600,
        'married_joint': 29200,
        'married_separate': 14600,
        'head_of_household': 21900
    }
};
