// Dashboard Module - With Real Data Loading
import { database } from './config.js';
import { getUserId } from './auth.js';

let userProfile = {};
let familyMembers = {};
let incomes = [];

export function initDashboard() {
    console.log('📊 Initializing Dashboard...');
    
    const container = document.getElementById('content');
    if (!container) {
        console.error('❌ Content container not found');
        return;
    }
    
    // Load all data
    loadDashboardData();
}

async function loadDashboardData() {
    const userId = getUserId();
    if (!userId) {
        console.error('❌ No user ID');
        return;
    }
    
    try {
        // Load profile
        const profileSnapshot = await database.ref(`users/${userId}/profile`).once('value');
        userProfile = profileSnapshot.val() || {};
        
        // Load family members
        const familySnapshot = await database.ref(`users/${userId}/familyMembers`).once('value');
        const familyData = familySnapshot.val() || {};
        familyMembers = Object.values(familyData);
        
        // Load incomes
        const incomeSnapshot = await database.ref(`users/${userId}/incomes`).once('value');
        const incomeData = incomeSnapshot.val() || {};
        incomes = Object.values(incomeData);
        
        console.log('✅ Dashboard data loaded:', { userProfile, familyMembers, incomes });
        
        // Render the dashboard
        renderDashboard();
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        renderDashboard(); // Render anyway with empty data
    }
}

function renderDashboard() {
    const container = document.getElementById('content');
    if (!container) return;
    
    // Calculate stats
    const totalIncome = incomes.reduce((sum, inc) => sum + (inc.annualAmount || 0), 0);
    const currentAge = userProfile.currentAge || 'Not set';
    const retirementAge = userProfile.retirementAge || 67;
    const yearsToRetirement = typeof currentAge === 'number' ? Math.max(0, retirementAge - currentAge) : '--';
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">📊 Welcome to Wealth!</h2>
            <p style="font-size: 17px; color: #666; margin-bottom: 24px;">
                Your personal retirement planning dashboard
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
                <div class="stat-card">
                    <div class="stat-label">Your Age</div>
                    <div class="stat-value">${currentAge}</div>
                    <div class="stat-change">${typeof currentAge === 'number' ? 'Born ' + (new Date().getFullYear() - currentAge) : 'Set in Settings'}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Annual Income</div>
                    <div class="stat-value">${formatCurrency(totalIncome)}</div>
                    <div class="stat-change">${incomes.length} source${incomes.length !== 1 ? 's' : ''}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Years to Retirement</div>
                    <div class="stat-value">${yearsToRetirement}</div>
                    <div class="stat-change">Target age ${retirementAge}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Family Members</div>
                    <div class="stat-value">${familyMembers.length}</div>
                    <div class="stat-change">${familyMembers.length === 0 ? 'Add in Family tab' : 'View in Family tab'}</div>
                </div>
            </div>
        </div>
        
        ${familyMembers.length > 0 ? `
        <div class="card">
            <h3 class="card-title">👨‍👩‍👧‍👦 Your Family</h3>
            <div style="display: grid; gap: 12px; margin-top: 16px;">
                ${familyMembers.map(member => `
                    <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; font-size: 17px; margin-bottom: 4px;">${member.name}</div>
                            <div style="font-size: 15px; color: #666;">
                                ${member.relationship} • Age ${member.age || calculateAge(member.birthDate)}
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #999;">
                            Born ${formatDate(member.birthDate)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${incomes.length > 0 ? `
        <div class="card">
            <h3 class="card-title">💵 Income Summary</h3>
            <div style="display: grid; gap: 12px; margin-top: 16px;">
                ${incomes.map(income => `
                    <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; font-size: 17px; margin-bottom: 4px;">${income.source}</div>
                            <div style="font-size: 15px; color: #666;">
                                ${income.familyMemberName || 'Household'} • ${income.type}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 700; font-size: 20px; color: #34C759;">${formatCurrency(income.annualAmount)}</div>
                            <div style="font-size: 13px; color: #999;">${formatCurrency(income.monthlyAmount)}/mo</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="card">
            <h3 class="card-title">🚀 Getting Started</h3>
            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
                ${currentAge === 'Not set' ? `
                <div style="padding: 16px; background: #FFF3CD; border-radius: 12px; border-left: 4px solid #FF9500;">
                    <div style="font-weight: 600; margin-bottom: 4px;">⚠️ Set up your profile</div>
                    <div style="font-size: 15px; color: #666;">Go to Settings to add your age, state, and retirement goals</div>
                </div>
                ` : ''}
                
                ${familyMembers.length === 0 ? `
                <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #34C759;">
                    <div style="font-weight: 600; margin-bottom: 4px;">2. Add family members</div>
                    <div style="font-size: 15px; color: #666;">Track your household and link income to family members</div>
                </div>
                ` : ''}
                
                ${incomes.length === 0 ? `
                <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #FF9500;">
                    <div style="font-weight: 600; margin-bottom: 4px;">3. Add income sources</div>
                    <div style="font-size: 15px; color: #666;">Track salaries, business income, and investments</div>
                </div>
                ` : ''}
                
                <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #AF52DE;">
                    <div style="font-weight: 600; margin-bottom: 4px;">4. Plan for retirement</div>
                    <div style="font-size: 15px; color: #666;">Set goals and track your progress</div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for stat cards
    if (!document.getElementById('dashboardStyles')) {
        const style = document.createElement('style');
        style.id = 'dashboardStyles';
        style.textContent = `
            .stat-card {
                padding: 20px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            .stat-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 500;
            }
            .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: #1d1d1f;
                margin-bottom: 4px;
            }
            .stat-change {
                font-size: 13px;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Dashboard rendered');
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '$0';
    return '$' + Math.round(amount).toLocaleString('en-US');
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function calculateAge(birthDate) {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

console.log('✅ Dashboard module loaded');
