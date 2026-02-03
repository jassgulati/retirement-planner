// Main Application File
import { renderDashboard } from './dashboard.js';
import { renderFamilyPage } from './familyMembers.js';
import { renderIncomePage } from './income.js';
import { renderExpensesPage } from './expenses.js';
import { renderInvestmentsPage } from './investments.js';
import { renderRetirement401kPage } from './retirement401k.js';
import { renderSocialSecurityPage } from './socialSecurity.js';
import { renderTaxPage } from './taxProjections.js';

// Page navigation
window.showPage = function(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
    }
    
    // Set active tab
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase().includes(pageName.replace('retirement401k', '401(k)').toLowerCase()) ||
            (pageName === 'socialSecurity' && tab.textContent.includes('Social Security')) ||
            (pageName === 'retirement401k' && tab.textContent.includes('401(k)'))) {
            tab.classList.add('active');
        }
    });
    
    // Render the appropriate page content
    switch(pageName) {
        case 'dashboard':
            renderDashboard();
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
    }
};

// Initialize app when user logs in
window.addEventListener('userLoggedIn', () => {
    renderDashboard();
});

console.log('Retirement Planning App Loaded Successfully');
