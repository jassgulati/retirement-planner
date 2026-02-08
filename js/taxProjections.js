// Tax Projections Module - Enhanced with Personalized Strategies
import { formatCurrency, formatPercent } from './utils.js';
import { getUserProfile } from './familyMembers.js';

let currentTaxFilingStatus = 'single';

export function initTaxProjections() {
    // Listen for tax filing status changes
    window.addEventListener('taxFilingStatusChanged', (e) => {
        currentTaxFilingStatus = e.detail.status;
        renderTaxPage();
    });
    
    window.addEventListener('userProfileLoaded', (e) => {
        currentTaxFilingStatus = e.detail.taxFilingStatus || 'single';
    });
}

export function renderTaxPage() {
    const profile = getUserProfile();
    currentTaxFilingStatus = profile.taxFilingStatus || 'single';
    
    const container = document.getElementById('taxes');
    
    // Get relevant tax data
    const brackets = getTaxBrackets(currentTaxFilingStatus);
    const statusLabel = getStatusLabel(currentTaxFilingStatus);
    const strategies = getRelevantStrategies(currentTaxFilingStatus);
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">Tax Planning for ${statusLabel}</h2>
            <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 16px;">
                Personalized tax strategies based on your filing status. 
                <a href="#" onclick="showPage('family')" style="color: var(--apple-blue); text-decoration: none; font-weight: 600;">Change status</a>
            </p>
        </div>
        
        <!-- 2025 Tax Brackets -->
        <div class="card">
            <h3 class="card-title">2025 Federal Tax Brackets</h3>
            <p class="card-subtitle">${statusLabel}</p>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tax Rate</th>
                            <th>Income Range</th>
                            <th>Tax on Max</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderBracketsTable(brackets)}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Standard Deduction -->
        <div class="card" style="background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%); border: 2px solid rgba(52, 199, 89, 0.2);">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(52, 199, 89, 0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    📋
                </div>
                <div>
                    <h3 class="card-title" style="margin: 0;">Your Standard Deduction</h3>
                    <p style="font-size: 15px; color: var(--text-secondary); margin-top: 4px;">2025 Tax Year</p>
                </div>
            </div>
            <div style="font-size: 40px; font-weight: 700; color: var(--apple-green); margin: 16px 0;">
                ${formatCurrency(getStandardDeduction(currentTaxFilingStatus))}
            </div>
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6;">
                This amount is automatically deducted from your taxable income unless you itemize deductions.
            </p>
        </div>
        
        <!-- Tax Strategies -->
        <div class="card">
            <h3 class="card-title">Personalized Tax Strategies</h3>
            <p class="card-subtitle">Recommended for ${statusLabel}</p>
            <div style="display: grid; gap: 16px; margin-top: 20px;">
                ${renderStrategies(strategies)}
            </div>
        </div>
        
        <!-- Retirement Account Benefits -->
        <div class="card">
            <h3 class="card-title">Retirement Account Tax Benefits</h3>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">🏦</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Traditional 401(k) / IRA</h4>
                </div>
                <ul style="margin-left: 20px; color: var(--text-secondary); font-size: 15px; line-height: 1.8;">
                    <li>Contributions <strong>reduce current taxable income</strong></li>
                    <li>Tax-deferred growth - no taxes until withdrawal</li>
                    <li>May lower tax bracket today</li>
                    <li>Ideal if you expect lower tax bracket in retirement</li>
                    <li>RMDs (Required Minimum Distributions) begin at age 73</li>
                </ul>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">✨</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Roth 401(k) / IRA</h4>
                </div>
                <ul style="margin-left: 20px; color: var(--text-secondary); font-size: 15px; line-height: 1.8;">
                    <li>No tax deduction for contributions</li>
                    <li><strong>Tax-free growth and withdrawals</strong> in retirement</li>
                    <li>No RMDs during owner's lifetime (Roth IRA only)</li>
                    <li>Ideal if you expect higher tax bracket in retirement</li>
                    <li>Tax-free inheritance for beneficiaries</li>
                </ul>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">🏥</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Health Savings Account (HSA)</h4>
                </div>
                <ul style="margin-left: 20px; color: var(--text-secondary); font-size: 15px; line-height: 1.8;">
                    <li><strong>Triple tax advantage:</strong> deductible contributions, tax-free growth, tax-free medical withdrawals</li>
                    <li>No "use it or lose it" - funds roll over forever</li>
                    <li>Can invest HSA funds for long-term growth</li>
                    <li>After 65, can withdraw for any purpose (taxed as income)</li>
                    <li>Best kept secret in retirement planning!</li>
                </ul>
            </div>
        </div>
        
        <!-- Tax-Loss Harvesting -->
        ${currentTaxFilingStatus !== 'married_separate' ? `
        <div class="card">
            <h3 class="card-title">Tax-Loss Harvesting</h3>
            <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.6;">
                Offset capital gains by selling investments at a loss. Can deduct up to $3,000 in losses against ordinary income annually.
            </p>
            <div style="background: rgba(0, 122, 255, 0.1); padding: 16px; border-radius: 12px; border-left: 4px solid var(--apple-blue);">
                <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                    <strong>Strategy:</strong> Near year-end, review your portfolio for investments showing losses. 
                    Sell them to realize losses, then immediately buy similar (but not identical) investments to maintain market exposure.
                </p>
            </div>
        </div>
        ` : ''}
        
        <!-- Important Dates -->
        <div class="card">
            <h3 class="card-title">Important Tax Dates for 2025</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>Date</th><th>Deadline</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-weight: 600;">January 15, 2025</td>
                            <td>Q4 2024 estimated tax payment due</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">April 15, 2025</td>
                            <td>2024 tax return filing deadline<br>2024 IRA contribution deadline</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">June 16, 2025</td>
                            <td>Q2 2025 estimated tax payment due</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">October 15, 2025</td>
                            <td>Extended tax return deadline (if extension filed)</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">December 31, 2025</td>
                            <td>2025 401(k) contribution deadline<br>RMD deadline (if required)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Disclaimer -->
        <div style="background: rgba(255, 204, 0, 0.1); padding: 16px; border-radius: 12px; border-left: 4px solid var(--apple-yellow);">
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                <strong>⚠️ Disclaimer:</strong> This information is for educational purposes only. Tax laws are complex and change frequently. 
                Consult with a qualified tax professional or CPA for personalized advice specific to your situation.
            </p>
        </div>
    `;
}

function getTaxBrackets(status) {
    const brackets = {
        single: [
            { rate: 0.10, min: 0, max: 11600 },
            { rate: 0.12, min: 11600, max: 47150 },
            { rate: 0.22, min: 47150, max: 100525 },
            { rate: 0.24, min: 100525, max: 191950 },
            { rate: 0.32, min: 191950, max: 243725 },
            { rate: 0.35, min: 243725, max: 609350 },
            { rate: 0.37, min: 609350, max: Infinity }
        ],
        married_joint: [
            { rate: 0.10, min: 0, max: 23200 },
            { rate: 0.12, min: 23200, max: 94300 },
            { rate: 0.22, min: 94300, max: 201050 },
            { rate: 0.24, min: 201050, max: 383900 },
            { rate: 0.32, min: 383900, max: 487450 },
            { rate: 0.35, min: 487450, max: 731200 },
            { rate: 0.37, min: 731200, max: Infinity }
        ],
        married_separate: [
            { rate: 0.10, min: 0, max: 11600 },
            { rate: 0.12, min: 11600, max: 47150 },
            { rate: 0.22, min: 47150, max: 100525 },
            { rate: 0.24, min: 100525, max: 191950 },
            { rate: 0.32, min: 191950, max: 243725 },
            { rate: 0.35, min: 243725, max: 365600 },
            { rate: 0.37, min: 365600, max: Infinity }
        ],
        head_of_household: [
            { rate: 0.10, min: 0, max: 16550 },
            { rate: 0.12, min: 16550, max: 63100 },
            { rate: 0.22, min: 63100, max: 100500 },
            { rate: 0.24, min: 100500, max: 191950 },
            { rate: 0.32, min: 191950, max: 243700 },
            { rate: 0.35, min: 243700, max: 609350 },
            { rate: 0.37, min: 609350, max: Infinity }
        ]
    };
    
    return brackets[status] || brackets.single;
}

function getStandardDeduction(status) {
    const deductions = {
        single: 14600,
        married_joint: 29200,
        married_separate: 14600,
        head_of_household: 21900
    };
    
    return deductions[status] || deductions.single;
}

function getStatusLabel(status) {
    const labels = {
        single: 'Single Filers',
        married_joint: 'Married Filing Jointly',
        married_separate: 'Married Filing Separately',
        head_of_household: 'Head of Household'
    };
    
    return labels[status] || 'Single Filers';
}

function getRelevantStrategies(status) {
    const commonStrategies = [
        {
            icon: '💰',
            title: 'Max Out Retirement Contributions',
            description: 'Contribute the maximum to 401(k) ($23,500 in 2025, plus $7,500 catch-up if 50+) and IRA ($7,000, plus $1,000 catch-up). Immediate tax deduction for traditional accounts.',
            color: 'var(--apple-blue)'
        },
        {
            icon: '🏥',
            title: 'Use an HSA',
            description: 'If eligible, max out your Health Savings Account. Triple tax advantage and can be used as a retirement account after 65.',
            color: 'var(--apple-green)'
        },
        {
            icon: '📊',
            title: 'Tax-Loss Harvesting',
            description: 'Offset capital gains by strategically selling investments at a loss. Can deduct up to $3,000 annually against ordinary income.',
            color: 'var(--apple-purple)'
        }
    ];
    
    const marriedStrategies = [
        {
            icon: '💑',
            title: 'Spousal IRA Contributions',
            description: 'Non-working spouse can contribute to an IRA based on working spouse\'s income. Doubles your retirement savings.',
            color: 'var(--apple-pink)'
        },
        {
            icon: '🎁',
            title: 'Gift Tax Exclusion',
            description: 'Each spouse can gift up to $18,000 per person annually (2024) without tax consequences. Useful for estate planning.',
            color: 'var(--apple-orange)'
        }
    ];
    
    const singleStrategies = [
        {
            icon: '🏠',
            title: 'Consider Head of Household Status',
            description: 'If you support a dependent, you may qualify for Head of Household status with lower tax rates and higher deductions.',
            color: 'var(--apple-teal)'
        }
    ];
    
    const headOfHouseholdStrategies = [
        {
            icon: '👶',
            title: 'Child Tax Credit',
            description: 'Claim up to $2,000 per qualifying child under 17. Partially refundable even if you don\'t owe taxes.',
            color: 'var(--apple-green)'
        },
        {
            icon: '👨‍👩‍👧',
            title: 'Dependent Care Credit',
            description: 'Claim credit for childcare expenses. Can be worth up to $3,000 for one dependent or $6,000 for two or more.',
            color: 'var(--apple-cyan)'
        }
    ];
    
    let strategies = [...commonStrategies];
    
    if (status === 'married_joint') {
        strategies = [...strategies, ...marriedStrategies];
    } else if (status === 'single') {
        strategies = [...strategies, ...singleStrategies];
    } else if (status === 'head_of_household') {
        strategies = [...strategies, ...headOfHouseholdStrategies];
    }
    
    return strategies;
}

function renderBracketsTable(brackets) {
    let html = '';
    let previousMax = 0;
    
    brackets.forEach((bracket, index) => {
        const maxStr = bracket.max === Infinity ? 'and above' : formatCurrency(bracket.max);
        const taxOnMax = calculateTaxOnIncome(bracket.max === Infinity ? bracket.min + 100000 : bracket.max, brackets);
        
        html += `<tr>
            <td style="font-weight: 700; color: var(--apple-blue);">${formatPercent(bracket.rate)}</td>
            <td>${formatCurrency(bracket.min)} to ${maxStr}</td>
            <td style="font-weight: 600;">${bracket.max === Infinity ? '—' : formatCurrency(taxOnMax)}</td>
        </tr>`;
    });
    
    return html;
}

function calculateTaxOnIncome(income, brackets) {
    let tax = 0;
    let previousMax = 0;
    
    for (const bracket of brackets) {
        if (income > bracket.min) {
            const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
            tax += taxableInThisBracket * bracket.rate;
        }
        if (income <= bracket.max) break;
    }
    
    return tax;
}

function renderStrategies(strategies) {
    return strategies.map(strategy => `
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; border-left: 4px solid ${strategy.color};">
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="font-size: 32px;">${strategy.icon}</div>
                <div style="flex: 1;">
                    <h4 style="font-size: 17px; font-weight: 600; margin-bottom: 8px;">${strategy.title}</h4>
                    <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                        ${strategy.description}
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

initTaxProjections();
