// Authentication Module - FIXED with direct imports
import { auth } from './config.js';

let currentUser = null;

export function initAuth() {
    console.log('🔐 Auth module initializing...');
    
    // Setup UI event listeners
    setupAuthUI();
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
        currentUser = user;
        console.log('🔐 Auth state changed:', user ? user.email : 'No user');
        
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

function setupAuthUI() {
    console.log('🎨 Setting up auth UI listeners...');
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Signup button
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }
    
    // Show signup link
    const showSignupLink = document.getElementById('showSignup');
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSignup();
        });
    }
    
    // Show login link
    const showLoginLink = document.getElementById('showLogin');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }
    
    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }
    
    // Enter key for login
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Enter key for signup
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSignup();
            }
        });
    }
    
    console.log('✅ Auth UI listeners set up');
}

function showAuthScreen() {
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    
    if (authContainer) authContainer.style.display = 'block';
    if (appContainer) appContainer.style.display = 'none';
    
    console.log('📱 Showing auth screen');
}

function showMainApp(user) {
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    
    if (authContainer) authContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';
    
    console.log('🏠 Showing main app for:', user.email);
    
    // Trigger app initialization
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user } }));
}

async function handleLogin() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('❌ Login inputs not found');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('🔐 Attempting login for:', email);
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    if (!password) {
        alert('Please enter your password');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login successful');
    } catch (error) {
        console.error('❌ Login error:', error);
        alert(getAuthErrorMessage(error.code));
    }
}

async function handleSignup() {
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('❌ Signup inputs not found');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('🔐 Attempting signup for:', email);
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ Signup successful');
    } catch (error) {
        console.error('❌ Signup error:', error);
        alert(getAuthErrorMessage(error.code));
    }
}

async function handleLogout() {
    console.log('🔐 Logging out...');
    
    try {
        await auth.signOut();
        console.log('✅ Logout successful');
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    
    console.log('📱 Showing login form');
}

function showSignup() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    
    console.log('📱 Showing signup form');
}

function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password is too weak',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/invalid-credential': 'Invalid email or password'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Initialize auth when module loads
console.log('✅ Auth module loaded');
initAuth();
