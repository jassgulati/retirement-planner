// Dashboard Module - Enhanced with Financial Overview
import { formatCurrency } from './utils.js';
import { incomes } from './income.js';
import { getUserProfile, calculateStateTax } from './profile.js';

export function initDashboard() {
    // Listen for data updates
    window.addEventListener('incomesLoaded', () => {
        if (document.getElementById('dashboard').classList.contains('active')) {
            renderDashboard();
        }
    });
    
    window.addEventListener('profileUpdated', () => {
        if (document.getElementById('dashboard').classList.contains('active')) {
            renderDashboard();
        }
    });
}

export function renderDashboard() {
    const container = document.getElementById('dashboard');
    if (!container) return;
    
    // Get user profile
    const profile = getUserProfile();
    
    // Calculate financial summary
    const totalIncome = incomes.reduce((sum, inc) => sum + (inc.annualAmount || 0), 0);
    const federalTax = calculateFederalTax(totalIncome, profile.taxFilingStatus);
    const stateTax = calculateStateTax(totalIncome, profile.state);
    const totalTax = federalTax + stateTax;
    const netIncome = totalIncome - totalTax;
    
    // Projection calculations
    const projectionRates = {
        conservative: 0.04,
        average: 0.10,
        optimistic: 0.13
    };
    const projectionRate = projectionRates[profile.projectionMode] || 0.10;
    const yearsToRetirement = Math.max(0, profile.retirementAge - profile.currentAge);
    
    container.innerHTML = `
        <!-- Welcome Header -->
        <div class="card" style="background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(88, 86, 214, 0.1) 100%); border: 2px solid rgba(0, 122, 255, 0.2);">
            <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">
                ${getGreeting()} 👋
            </h2>
            <p style="font-size: 15px; color: var(--label-secondary);">
                ${yearsToRetirement > 0 ? `${yearsToRetirement} years until retirement at age ${profile.retirementAge}` : 'You\'ve reached retirement age!'}
            </p>
        </div>
        
        ${totalIncome > 0 ? `
        <!-- Financial Overview -->
        <div class="card">
            <h3 class="card-title">Financial Overview</h3>
            <div style="display: grid; gap: 16px;">
                <!-- Income -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(52, 199, 89, 0.1); border-radius: 10px;">
                    <div>
                        <div style="font-size: 13px; color: var(--label-secondary); margin-bottom: 4px; font-weight: 600;">GROSS INCOME</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--apple-green);">${formatCurrency(totalIncome)}</div>
                        <div style="font-size: 13px; color: var(--label-tertiary);">per year</div>
                    </div>
                    <div style="font-size: 32px;">💵</div>
                </div>
                
                <!-- Taxes -->
                <div style="background: var(--fill-quaternary); padding: 16px; border-radius: 10px;">
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">Tax Breakdown</div>
                    <div style="display: grid; gap: 8px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 15px; color: var(--label-secondary);">Federal Tax (${((federalTax/totalIncome)*100).toFixed(1)}%)</span>
                            <span style="font-size: 15px; font-weight: 600; color: var(--apple-red);">-${formatCurrency(federalTax)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 15px; color: var(--label-secondary);">${getStateName(profile.state)} Tax (${stateTax > 0 ? ((stateTax/totalIncome)*100).toFixed(1) : '0'}%)</span>
                            <span style="font-size: 15px; font-weight: 600; color: var(--apple-red);">${stateTax > 0 ? '-' + formatCurrency(stateTax) : '$0'}</span>
                        </div>
                        <div style="height: 1px; background: var(--separator); margin: 4px 0;"></div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 15px; font-weight: 600;">Total Taxes</span>
                            <span style="font-size: 17px; font-weight: 700; color: var(--apple-red);">-${formatCurrency(totalTax)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Net Income -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(0, 122, 255, 0.1); border-radius: 10px;">
                    <div>
                        <div style="font-size: 13px; color: var(--label-secondary); margin-bottom: 4px; font-weight: 600;">NET INCOME</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--apple-blue);">${formatCurrency(netIncome)}</div>
                        <div style="font-size: 13px; color: var(--label-tertiary);">${formatCurrency(netIncome/12)}/month</div>
                    </div>
                    <div style="font-size: 32px;">💰</div>
                </div>
            </div>
        </div>
        
        <!-- Retirement Projection -->
        ${yearsToRetirement > 0 ? `
        <div class="card">
            <h3 class="card-title">Retirement Projection</h3>
            <p style="font-size: 15px; color: var(--label-secondary); margin-bottom: 16px;">
                Using <strong>${profile.projectionMode}</strong> growth rate (${(projectionRate * 100).toFixed(0)}%)
            </p>
            
            <div style="background: var(--fill-quaternary); padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 13px; color: var(--label-secondary); margin-bottom: 8px; font-weight: 600;">PROJECTED SAVINGS POTENTIAL</div>
                <div style="font-size: 40px; font-weight: 700; color: var(--apple-blue); margin-bottom: 4px;">
                    ${formatCurrency(calculateProjectedSavings(netIncome * 0.25, yearsToRetirement, projectionRate))}
                </div>
                <div style="font-size: 15px; color: var(--label-tertiary);">
                    if saving 25% (${formatCurrency(netIncome * 0.25)}/year) for ${yearsToRetirement} years
                </div>
            </div>
            
            <div style="margin-top: 16px; padding: 12px; background: rgba(0, 122, 255, 0.05); border-radius: 10px;">
                <div style="font-size: 13px; color: var(--label-secondary); line-height: 1.6;">
                    💡 This assumes you save 25% of your net income and invest it with a ${(projectionRate * 100).toFixed(0)}% annual return.
                    Go to <a href="#" onclick="showPage('profile')" style="color: var(--apple-blue); text-decoration: none; font-weight: 600;">Settings</a> to adjust your projection mode.
                </div>
            </div>
        </div>
        ` : ''}
        ` : `
        <!-- Getting Started -->
        <div class="card">
            <h3 class="card-title">Get Started with Your Financial Plan</h3>
            <p style="font-size: 15px; color: var(--label-secondary); margin-bottom: 20px;">
                Set up your profile and add your financial information to see your complete retirement picture.
            </p>
            
            <div style="display: grid; gap: 12px;">
                <button onclick="showPage('profile')" class="btn btn-primary" style="justify-content: space-between; text-align: left;">
                    <span>⚙️ Set Up Your Profile</span>
                    <span>→</span>
                </button>
                <button onclick="showPage('family')" class="btn btn-secondary" style="justify-content: space-between; text-align: left;">
                    <span>👥 Add Family Members</span>
                    <span>→</span>
                </button>
                <button onclick="showPage('income')" class="btn btn-secondary" style="justify-content: space-between; text-align: left;">
                    <span>💼 Add Income Sources</span>
                    <span>→</span>
                </button>
            </div>
        </div>
        `}
        
        <!-- Quick Actions -->
        <div class="card">
            <h3 class="card-title">Quick Actions</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                <button onclick="showPage('income')" style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: var(--fill-tertiary); border: none; border-radius: 12px; cursor: pointer;">
                    <div style="font-size: 32px;">💼</div>
                    <div style="font-size: 15px; font-weight: 600;">Income</div>
                </button>
                <button onclick="showPage('expenses')" style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: var(--fill-tertiary); border: none; border-radius: 12px; cursor: pointer;">
                    <div style="font-size: 32px;">💳</div>
                    <div style="font-size: 15px; font-weight: 600;">Expenses</div>
                </button>
                <button onclick="showPage('investments')" style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: var(--fill-tertiary); border: none; border-radius: 12px; cursor: pointer;">
                    <div style="font-size: 32px;">📈</div>
                    <div style="font-size: 15px; font-weight: 600;">Invest</div>
                </button>
                <button onclick="showPage('retirement401k')" style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: var(--fill-tertiary); border: none; border-radius: 12px; cursor: pointer;">
                    <div style="font-size: 32px;">🏦</div>
                    <div style="font-size: 15px; font-weight: 600;">401(k)</div>
                </button>
            </div>
        </div>
    `;
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
}

function getStateName(stateCode) {
    const states = {
        'CA': 'California',
        'NY': 'New York',
        'TX': 'Texas',
        'FL': 'Florida',
        'IL': 'Illinois',
        'PA': 'Pennsylvania',
        'OH': 'Ohio',
        'GA': 'Georgia',
        'NC': 'North Carolina',
        'MI': 'Michigan'
    };
    return states[stateCode] || stateCode;
}

function calculateFederalTax(income, filingStatus) {
    const standardDeductions = {
        single: 14600,
        married_joint: 29200,
        married_separate: 14600,
        head_of_household: 21900
    };
    
    const standardDeduction = standardDeductions[filingStatus] || 29200;
    const taxableIncome = Math.max(0, income - standardDeduction);
    
    let tax = 0;
    
    // 2025 tax brackets (married filing jointly)
    const brackets = filingStatus === 'married_joint' ? [
        { limit: 23200, rate: 0.10 },
        { limit: 94300, rate: 0.12 },
        { limit: 201050, rate: 0.22 },
        { limit: 383900, rate: 0.24 },
        { limit: 487450, rate: 0.32 },
        { limit: 731200, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
    ] : [
        { limit: 11600, rate: 0.10 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
    ];
    
    let previousLimit = 0;
    for (const bracket of brackets) {
        if (taxableIncome > previousLimit) {
            const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
            tax += taxableInBracket * bracket.rate;
        }
        previousLimit = bracket.limit;
        if (taxableIncome <= bracket.limit) break;
    }
    
    // Add FICA
    const ficaBase = Math.min(income, 168600);
    tax += ficaBase * 0.0765;
    
    if (income > 250000) {
        tax += (income - 250000) * 0.009;
    }
    
    return Math.round(tax);
}

function calculateProjectedSavings(annualSavings, years, rate) {
    // Future value of annuity formula
    const futureValue = annualSavings * (((1 + rate) ** years - 1) / rate);
    return Math.round(futureValue);
}

console.log('✅ Dashboard module loaded');
initDashboard();
