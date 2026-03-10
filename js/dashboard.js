// Dashboard Module - Simple and Bulletproof
import { database } from './config.js';
import { getUserId } from './auth.js';

export function initDashboard() {
    console.log('Dashboard initializing...');
    
    const container = document.getElementById('content');
    if (!container) {
        console.error('No content container');
        return;
    }
    
    loadData();
}

async function loadData() {
    const userId = getUserId();
    if (!userId) {
        renderEmpty();
        return;
    }
    
    try {
        const profileSnap = await database.ref('users/' + userId + '/profile').once('value');
        const profile = profileSnap.val() || {};
        
        const familySnap = await database.ref('users/' + userId + '/familyMembers').once('value');
        const familyData = familySnap.val() || {};
        
        const incomeSnap = await database.ref('users/' + userId + '/incomes').once('value');
        const incomeData = incomeSnap.val() || {};
        
        render(profile, familyData, incomeData);
        
    } catch (err) {
        console.error('Load error:', err);
        renderEmpty();
    }
}

function render(profile, familyData, incomeData) {
    const container = document.getElementById('content');
    
    const age = profile.currentAge || 'Not set';
    const retireAge = profile.retirementAge || 67;
    const yearsLeft = typeof age === 'number' ? Math.max(0, retireAge - age) : '--';
    
    const incomes = Object.values(incomeData);
    const totalIncome = incomes.reduce((sum, inc) => sum + (inc.annualAmount || 0), 0);
    
    const family = Object.values(familyData);
    
    container.innerHTML = '<div class="card"><h2 class="card-title">Welcome to Wealth!</h2><p style="font-size: 17px; color: #666; margin-bottom: 24px;">Your personal retirement planning dashboard</p><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;"><div class="stat-card"><div class="stat-label">Your Age</div><div class="stat-value">' + age + '</div><div class="stat-change">' + (typeof age === 'number' ? 'Born ' + (new Date().getFullYear() - age) : 'Set in Settings') + '</div></div><div class="stat-card"><div class="stat-label">Annual Income</div><div class="stat-value">$' + Math.round(totalIncome).toLocaleString() + '</div><div class="stat-change">' + incomes.length + ' sources</div></div><div class="stat-card"><div class="stat-label">Years to Retirement</div><div class="stat-value">' + yearsLeft + '</div><div class="stat-change">Target age ' + retireAge + '</div></div><div class="stat-card"><div class="stat-label">Family Members</div><div class="stat-value">' + family.length + '</div><div class="stat-change">View in Family tab</div></div></div></div>';
    
    if (!document.getElementById('dashStyles')) {
        const style = document.createElement('style');
        style.id = 'dashStyles';
        style.textContent = '.stat-card{padding:20px;background:white;border-radius:12px;border:1px solid #e0e0e0}.stat-label{font-size:14px;color:#666;margin-bottom:8px;font-weight:500}.stat-value{font-size:32px;font-weight:700;color:#1d1d1f;margin-bottom:4px}.stat-change{font-size:13px;color:#999}';
        document.head.appendChild(style);
    }
}

function renderEmpty() {
    const container = document.getElementById('content');
    container.innerHTML = '<div class="card"><h2>Welcome!</h2><p>Loading your data...</p></div>';
}

console.log('Dashboard module loaded');
