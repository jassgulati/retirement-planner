// Main Application File - Enhanced with Profile/Settings
import { renderDashboard } from './dashboard.js';
import { renderFamilyPage } from './familyMembers.js';
import { renderProfilePage } from './profile.js';
import { renderIncomePage } from './income.js';
import { renderExpensesPage } from './expenses.js';
import { renderInvestmentsPage } from './investments.js';
import { renderRetirement401kPage } from './retirement401k.js';
import { renderSocialSecurityPage } from './socialSecurity.js';
import { renderTaxPage } from './taxProjections.js';

// Page navigation - MUST be global for onclick to work
window.showPage = function(pageName) {
    console.log('Navigating to:', pageName);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item, .mobile-nav-item, .mobile-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Set active nav item
    document.querySelectorAll('.nav-item, .mobile-nav-item, .mobile-menu-item').forEach(item => {
        const itemText = item.textContent.toLowerCase();
        const dataPage = item.getAttribute('data-page');
        
        if (dataPage === pageName || 
            (pageName === 'dashboard' && (itemText.includes('overview') || itemText.includes('dashboard'))) ||
            (pageName === 'profile' && (itemText.includes('settings') || itemText.includes('profile'))) ||
            (pageName === 'family' && itemText.includes('family')) ||
            (pageName === 'income' && itemText.includes('income')) ||
            (pageName === 'expenses' && (itemText.includes('expenses') || itemText.includes('spend'))) ||
            (pageName === 'investments' && (itemText.includes('invest'))) ||
            (pageName === 'retirement401k' && (itemText.includes('retirement') || itemText.includes('retire'))) ||
            (pageName === 'socialSecurity' && itemText.includes('social')) ||
            (pageName === 'taxes' && itemText.includes('tax'))) {
            item.classList.add('active');
        }
    });
    
    // Render page content
    try {
        switch(pageName) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'profile':
                renderProfilePage();
                break;
            case 'family':
                renderFamilyPage();
                break;
            case 'income':
                renderIncomePage();
                break;
            case 'expenses':
                renderExpensesPage();
                break;
            case 'investments':
                renderInvestmentsPage();
                break;
            case 'retirement401k':
                renderRetirement401kPage();
                break;
            case 'socialSecurity':
                renderSocialSecurityPage();
                break;
            case 'taxes':
                renderTaxPage();
                break;
            default:
                console.error('Unknown page:', pageName);
        }
    } catch (error) {
        console.error('Error rendering page:', pageName, error);
    }
};

// Initialize app when user logs in
window.addEventListener('userLoggedIn', () => {
    console.log('User logged in - initializing app');
    renderDashboard();
});

console.log('✅ Retirement Planning App Loaded Successfully');
console.log('✅ showPage function available');
