// Main App Navigation and Routing
console.log('📱 App.js loading...');

// Import page initialization functions
import { initDashboard } from './dashboard.js';
import { initFamilyMembers } from './familyMembers.js';
import { initIncome } from './income.js';
import { initExpenses } from './expenses.js';
import { initInvestments } from './investments.js';
import { initRetirement401k } from './retirement401k.js';
import { initSocialSecurity } from './socialSecurity.js';
import { initTaxProjections } from './taxProjections.js';
import { initProfile } from './profile.js';

// Page routing map
const routes = {
    'dashboard': initDashboard,
    'family': initFamilyMembers,
    'income': initIncome,
    'expenses': initExpenses,
    'investments': initInvestments,
    'retirement': initRetirement401k,
    'social-security': initSocialSecurity,
    'taxes': initTaxProjections,
    'settings': initProfile
};

let currentPage = 'dashboard';

// Navigate to a page
function navigate(page) {
    console.log('🧭 Navigating to:', page);
    
    if (!routes[page]) {
        console.error('❌ Page not found:', page);
        return;
    }
    
    currentPage = page;
    
    // Update active nav items
    document.querySelectorAll('.nav-item, .mobile-nav-item, .nav-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-page="${page}"]`).forEach(item => {
        item.classList.add('active');
    });
    
    // Close mobile hamburger menu if open
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }
    
    // Clear content and initialize the page
    const content = document.getElementById('content');
    if (content) {
        content.innerHTML = '';
    }
    
    // Initialize the page
    try {
        routes[page]();
        console.log('✅ Page loaded:', page);
    } catch (error) {
        console.error('❌ Error loading page:', page, error);
        content.innerHTML = `
            <div class="card">
                <h2>Error Loading Page</h2>
                <p>There was an error loading this page. Please try again.</p>
            </div>
        `;
    }
}

// Setup navigation event listeners
function setupNavigation() {
    console.log('🎯 Setting up navigation...');
    
    // Desktop nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) navigate(page);
        });
    });
    
    // Mobile bottom nav items
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) navigate(page);
        });
    });
    
    // Hamburger menu items
    document.querySelectorAll('.nav-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) navigate(page);
        });
    });
    
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            console.log('🍔 Hamburger menu toggled');
        });
    }
    
    // Close menu button
    const closeMenu = document.querySelector('.close-menu');
    if (closeMenu && navMenu) {
        closeMenu.addEventListener('click', () => {
            navMenu.classList.remove('active');
            console.log('❌ Menu closed');
        });
    }
    
    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }
    
    console.log('✅ Navigation setup complete');
}

// Handle logout
async function handleLogout() {
    console.log('👋 Logging out...');
    try {
        await firebase.auth().signOut();
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

// Initialize app when user logs in
function initializeApp() {
    console.log('🚀 Initializing app...');
    
    // Setup navigation
    setupNavigation();
    
    // Navigate to dashboard by default
    navigate('dashboard');
    
    console.log('✅ App initialized');
}

// Listen for user login
window.addEventListener('userLoggedIn', () => {
    console.log('👤 User logged in event received');
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// If app container is already visible (user already logged in), initialize
if (document.getElementById('appContainer')?.style.display !== 'none') {
    console.log('👤 User already logged in, initializing...');
    initializeApp();
}

console.log('✅ App.js loaded');
