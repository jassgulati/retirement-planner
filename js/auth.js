// Authentication Module
import { initializeFirebase } from './config.js';
import { validateEmail, showError, clearMessage } from './utils.js';

let auth;
let currentUser = null;

export function initAuth() {
    const { auth: firebaseAuth } = initializeFirebase();
    auth = firebaseAuth;
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            showMainApp(user);
        } else {
            showAuthScreen();
        }
    });
}

export function getCurrentUser() {
    return currentUser;
}

export function getUserId() {
    return currentUser ? currentUser.uid : null;
}

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp(user) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userEmail').textContent = user.email;
    
    // Trigger app initialization
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user } }));
}

window.handleLogin = async function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    clearMessage('authError');
    
    if (!validateEmail(email)) {
        showError('authError', 'Please enter a valid email address');
        return;
    }
    
    if (!password) {
        showError('authError', 'Please enter your password');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Login error:', error);
        showError('authError', getAuthErrorMessage(error.code));
    }
};

window.handleSignup = async function() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    clearMessage('authError');
    
    if (!validateEmail(email)) {
        showError('authError', 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('authError', 'Password must be at least 6 characters');
        return;
    }
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Signup error:', error);
        showError('authError', getAuthErrorMessage(error.code));
    }
};

window.handleLogout = async function() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
};

window.showLogin = function() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    clearMessage('authError');
};

window.showSignup = function() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    clearMessage('authError');
};

function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password is too weak',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many attempts. Please try again later'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Initialize auth when module loads
initAuth();
