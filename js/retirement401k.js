// Retirement Calculator Module - Comprehensive Analysis
import { database } from './config.js';
import { getUserId } from './auth.js';

let userProfile = {};
let investments = {};
let incomes = [];

export function initRetirement401k() {
    console.log('🏦 Initializing Retirement Calculator...');
    loadRetirementData();
}

async function loadRetirementData() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const profileSnap = await database.ref(`users/${userId}/profile`).once('value');
        userProfile = profileSnap.val() || {};
        
        const investSnap = await database.ref(`users/${userId}/investments`).once('value');
        investments = investSnap.val() || {};
        
        const incomeSnap = await database.ref(`users/${userId}/incomes`).once('value');
        const incomeData = incomeSnap.val() || {};
        incomes = Object.values(incomeData);
        
        renderRetirementPage();
        
    } catch (error) {
        console.error('Error loading retirement data:', error);
        renderRetirementPage();
    }
}

function renderRetirementPage() {
    const container = document.getElementById('content');
    if (!container) return;
    
    const currentAge = userProfile.currentAge || 35;
    const retirementAge = userProfile.retirementAge || 67;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const lifeExpectancy = 90;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    const growthRate = userProfile.projectionMode === 'conservative' ? 0.04 :
                       userProfile.projectionMode === 'optimistic' ? 0.13 : 0.10;
    
    const accounts = Object.values(investments);
    const currentBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
    const annualContributions = accounts.reduce((sum, acc) => sum + (acc.annualContribution || 0), 0);
    
    const projectedBalance = calculateFutureValue(currentBalance, annualContributions, growthRate, yearsToRetirement);
    
    const annualIncome = incomes.reduce((sum, inc) => sum + (inc.annualAmount || 0), 0);
    const estimatedExpenses = Math.round(annualIncome * 0.70);
    
    const safeWithdrawalRate = 0.04;
    const annualRetirementIncome = Math.round(projectedBalance * safeWithdrawalRate);
    
    const isOnTrack = annualRetirementIncome >= estimatedExpenses;
    const shortfall = Math.max(0, estimatedExpenses - annualRetirementIncome);
    
    const monthlyNeeded = Math.round(estimatedExpenses / 12);
    const monthlyProjected = Math.round(annualRetirementIncome / 12);
    
    container.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, ${isOnTrack ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)'} 0%, ${isOnTrack ? 'rgba(52, 199, 89, 0.05)' : 'rgba(255, 149, 0, 0.05)'} 100%); border: 2px solid ${isOnTrack ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 149, 0, 0.2)'};">
            <div style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 16px;">${isOnTrack ? '✅' : '⚠️'}</div>
                <h2 style="font-size: 32px; margin-bottom: 8px; color: ${isOnTrack ? '#34C759' : '#FF9500'};">
                    ${isOnTrack ? 'On Track!' : 'Needs Attention'}
                </h2>
                <p style="font-size: 18px; color: #666;">
                    ${isOnTrack ? 'Your retirement plan is looking good' : 'You may need to save more or adjust your retirement age'}
                </p>
            </div>
        </div>
        
        <div class="card">
            <h3 class="card-title">📊 Retirement Snapshot</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
                <div class="stat-box">
                    <div class="stat-label">Current Age</div>
                    <div class="stat-value">${currentAge}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Retirement Age</div>
                    <div class="stat-value">${retirementAge}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Years to Save</div>
                    <div class="stat-value">${yearsToRetirement}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Years in Retirement</div>
                    <div class="stat-value">${yearsInRetirement}</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3 class="card-title">💰 Projected Retirement Savings</h3>
            
            <div style="padding: 24px; background: #f8f9fa; border-radius: 12px; margin: 16px 0;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 15px; color: #666; margin-bottom: 8px;">Current Balance</div>
                    <div style="font-size: 32px; font-weight: 700; color: #007AFF;">${formatCurrency(currentBalance)}</div>
                </div>
                
                <div style="text-align: center; font-size: 32px; color: #999; margin: 16px 0;">↓</div>
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 15px; color: #666; margin-bottom: 8px;">Annual Contributions</div>
                    <div style="font-size: 24px; font-weight: 700; color: #34C759;">${formatCurrency(annualContributions)}/year</div>
                    <div style="font-size: 13px; color: #999; margin-top: 4px;">for ${yearsToRetirement} years @ ${(growthRate * 100).toFixed(0)}% growth</div>
                </div>
                
                <div style="text-align: center; font-size: 32px; color: #999; margin: 16px 0;">↓</div>
                
                <div style="text-align: center;">
                    <div style="font-size: 15px; color: #666; margin-bottom: 8px;">Balance at Age ${retirementAge}</div>
                    <div style="font-size: 48px; font-weight: 700; color: #FF9500;">${formatCurrency(projectedBalance)}</div>
                </div>
            </div>
            
            <div style="padding: 16px; background: #fff3cd; border-radius: 12px; border-left: 4px solid #FF9500;">
                <div style="font-size: 13px; color: #666; margin-bottom: 4px; font-weight: 600;">ASSUMPTION</div>
                <div style="font-size: 15px; color: #1d1d1f;">
                    Using ${userProfile.projectionMode || 'average'} growth rate of ${(growthRate * 100).toFixed(0)}% annually
                </div>
                <div style="font-size: 13px; color: #999; margin-top: 4px;">
                    Change this in Settings to see different scenarios
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3 class="card-title">🏡 Retirement Income Analysis</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 16px 0;">
                <div style="padding: 20px; background: #f8f9fa; border-radius: 12px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 600;">ESTIMATED MONTHLY EXPENSES</div>
                    <div style="font-size: 36px; font-weight: 700; color: #FF3B30; margin-bottom: 8px;">${formatCurrency(monthlyNeeded)}</div>
                    <div style="font-size: 13px; color: #999;">Based on 70% of current income</div>
                </div>
                
                <div style="padding: 20px; background: #f8f9fa; border-radius: 12px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 600;">PROJECTED MONTHLY INCOME</div>
                    <div style="font-size: 36px; font-weight: 700; color: ${isOnTrack ? '#34C759' : '#FF9500'}; margin-bottom: 8px;">${formatCurrency(monthlyProjected)}</div>
                    <div style="font-size: 13px; color: #999;">4% safe withdrawal rule</div>
                </div>
            </div>
            
            ${!isOnTrack ? `
                <div style="padding: 16px; background: #fff3cd; border-radius: 12px; border-left: 4px solid #FF9500; margin-top: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">⚠️ Potential Shortfall</div>
                    <div style="font-size: 15px; color: #1d1d1f;">
                        You may be short ${formatCurrency(shortfall)}/year (${formatCurrency(Math.round(shortfall / 12))}/month) in retirement
                    </div>
                </div>
            ` : `
                <div style="padding: 16px; background: rgba(52, 199, 89, 0.12); border-radius: 12px; border-left: 4px solid #34C759; margin-top: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">✅ Great News!</div>
                    <div style="font-size: 15px; color: #1d1d1f;">
                        Your projected retirement income covers your estimated expenses with room to spare!
                    </div>
                </div>
            `}
        </div>
        
        <div class="card">
            <h3 class="card-title">💡 Ways to Improve Your Retirement</h3>
            
            <div style="display: grid; gap: 12px; margin-top: 16px;">
                ${getImprovementSuggestions(currentAge, retirementAge, annualContributions, annualIncome, projectedBalance, estimatedExpenses).map(suggestion => `
                    <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid ${suggestion.color};">
                        <div style="font-weight: 600; margin-bottom: 8px;">${suggestion.icon} ${suggestion.title}</div>
                        <div style="font-size: 15px; color: #666;">${suggestion.description}</div>
                        ${suggestion.impact ? `
                            <div style="font-size: 13px; color: #34C759; margin-top: 8px; font-weight: 600;">
                                💰 Impact: ${suggestion.impact}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="card">
            <h3 class="card-title">📖 Understanding the Numbers</h3>
            
            <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; margin-top: 16px;">
                <div style="font-weight: 600; margin-bottom: 12px;">The 4% Rule</div>
                <p style="font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 12px;">
                    Financial planners often recommend withdrawing 4% of your retirement savings each year. 
                    This rate is designed to make your money last 30+ years while adjusting for inflation.
                </p>
                <p style="font-size: 15px; color: #666; line-height: 1.6;">
                    Your projected balance: ${formatCurrency(projectedBalance)}<br>
                    × 4% = ${formatCurrency(annualRetirementIncome)}/year (${formatCurrency(monthlyProjected)}/month)
                </p>
            </div>
            
            <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; margin-top: 16px;">
                <div style="font-weight: 600; margin-bottom: 12px;">70% Rule</div>
                <p style="font-size: 15px; color: #666; line-height: 1.6;">
                    Most people need about 70% of their pre-retirement income to maintain their lifestyle in retirement.
                    You won't have work expenses (commuting, work clothes) and no retirement savings contributions.
                </p>
            </div>
        </div>
        
        <style>
            .stat-box {
                padding: 16px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
                text-align: center;
            }
            .stat-box .stat-label {
                font-size: 13px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 600;
            }
            .stat-box .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: #007AFF;
            }
        </style>
    `;
}

function calculateFutureValue(currentBalance, annualContribution, growthRate, years) {
    const fvOfBalance = currentBalance * Math.pow(1 + growthRate, years);
    const fvOfContributions = annualContribution * ((Math.pow(1 + growthRate, years) - 1) / growthRate);
    return fvOfBalance + fvOfContributions;
}

function getImprovementSuggestions(currentAge, retirementAge, annualContributions, annualIncome, projectedBalance, estimatedExpenses) {
    const suggestions = [];
    const savingsRate = annualIncome > 0 ? (annualContributions / annualIncome) : 0;
    
    if (savingsRate < 0.15) {
        const additionalSavings = Math.round(annualIncome * 0.15 - annualContributions);
        suggestions.push({
            icon: '💰',
            title: 'Increase Your Savings Rate',
            description: `You're currently saving ${(savingsRate * 100).toFixed(1)}% of your income. Try to reach 15% by adding ${formatCurrency(additionalSavings)}/year (${formatCurrency(Math.round(additionalSavings / 12))}/month).`,
            impact: `Could add ${formatCurrency(Math.round(additionalSavings * 20))} over 20 years`,
            color: '#007AFF'
        });
    }
    
    if (retirementAge < 70) {
        const extraYears = 3;
        const newRetirementAge = retirementAge + extraYears;
        const extraYearsToSave = extraYears;
        const extraSavings = annualContributions * extraYearsToSave * 1.5;
        suggestions.push({
            icon: '⏰',
            title: 'Work a Few More Years',
            description: `Retiring at ${newRetirementAge} instead of ${retirementAge} gives you ${extraYears} more years to save and ${extraYears} fewer years to fund.`,
            impact: `Could add ${formatCurrency(Math.round(extraSavings))} to your nest egg`,
            color: '#FF9500'
        });
    }
    
    if (currentAge < 50) {
        suggestions.push({
            icon: '📈',
            title: 'Maximize Employer Match',
            description: 'If your employer offers 401(k) matching, make sure you contribute enough to get the full match. It\'s free money!',
            color: '#34C759'
        });
    }
    
    if (projectedBalance < estimatedExpenses * 25) {
        suggestions.push({
            icon: '🏠',
            title: 'Reduce Retirement Expenses',
            description: 'Consider downsizing your home, relocating to a lower cost area, or finding ways to reduce monthly expenses in retirement.',
            impact: 'Every $100/month reduction = $30,000 less needed',
            color: '#AF52DE'
        });
    }
    
    suggestions.push({
        icon: '📚',
        title: 'Diversify Income Sources',
        description: 'Consider part-time work, rental income, or dividend-paying investments to supplement your retirement withdrawals.',
        color: '#007AFF'
    });
    
    return suggestions.slice(0, 4);
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '$0';
    return '$' + Math.round(amount).toLocaleString('en-US');
}

console.log('✅ Retirement calculator loaded');
