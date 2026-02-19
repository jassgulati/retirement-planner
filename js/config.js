// Main Application File - Apple Design
import { renderDashboard } from './dashboard.js';
import { renderFamilyPage } from './familyMembers.js';
import { renderIncomePage } from './income.js';
import { renderExpensesPage } from './expenses.js';
import { renderInvestmentsPage } from './investments.js';
import { renderRetirement401kPage } from './retirement401k.js';
import { renderSocialSecurityPage } from './socialSecurity.js';
import { renderTaxPage } from './taxProjections.js';

// Page navigation with mobile support
window.showPage = function(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav items (desktop and mobile)
    document.querySelectorAll('.nav-item').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
        
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Set active desktop tab
    const desktopTabs = document.querySelectorAll('.nav-item');
    desktopTabs.forEach(tab => {
        const tabText = tab.textContent.toLowerCase();
        if ((pageName === 'dashboard' && tabText.includes('overview')) ||
            (pageName === 'family' && tabText.includes('family')) ||
            (pageName === 'income' && tabText.includes('income')) ||
            (pageName === 'expenses' && tabText.includes('expenses')) ||
            (pageName === 'investments' && tabText.includes('investments')) ||
            (pageName === 'retirement401k' && tabText.includes('retirement')) ||
            (pageName === 'socialSecurity' && tabText.includes('social')) ||
            (pageName === 'taxes' && tabText.includes('taxes'))) {
            tab.classList.add('active');
        }
    });
    
    // Set active mobile nav
    const mobileItems = document.querySelectorAll('.mobile-nav-item');
    mobileItems.forEach(item => {
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
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
    
    // Add responsive behavior
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
});

// Handle responsive behavior
function handleResponsive() {
    const isMobile = window.innerWidth < 768;
    
    // Update any responsive-specific behaviors here
    if (isMobile) {
        // Mobile-specific initialization
        document.body.classList.add('is-mobile');
    } else {
        // Desktop-specific initialization
        document.body.classList.remove('is-mobile');
    }
}

// Prevent zoom on input focus (iOS)
document.addEventListener('touchstart', function() {}, {passive: true});

// Handle safe area insets for iOS
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        document.documentElement.style.setProperty(
            '--viewport-height',
            `${window.visualViewport.height}px`
        );
    });
}

console.log('Wealth App Loaded Successfully');
