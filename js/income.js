// Income Module - Enhanced with Family Members, Companies, and Tax Calculations
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { formatCurrency, generateId } from './utils.js';
import { familyMembers } from './familyMembers.js';

let database;
export let incomes = [];

export function initIncome() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', () => {
        loadIncomes();
    });
}

export function renderIncomePage() {
    const container = document.getElementById('income');
    if (!container) return;
    
    // Calculate totals and tax estimate
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.annualAmount, 0);
    const estimatedTax = calculateEstimatedTax(totalIncome);
    const netIncome = totalIncome - estimatedTax;
    
    container.innerHTML = `
        <!-- Income Summary Card -->
        <div class="card" style="background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%); border: 2px solid rgba(52, 199, 89, 0.2);">
            <h3 class="card-title">Family Income Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 16px;">
                <div>
                    <div style="font-size: 13px; color: var(--label-secondary); margin-bottom: 4px; font-weight: 600;">GROSS INCOME</div>
                    <div style="font-size: 28px; font-weight: 700; color: var(--apple-green);">${formatCurrency(totalIncome)}</div>
                    <div style="font-size: 13px; color: var(--label-tertiary);">per year</div>
                </div>
                <div>
                    <div style="font-size: 13px; color: var(--label-secondary); margin-bottom: 4px; font-weight: 600;">EST. TAXES</div>
                    <div style="font-size: 28px; font-weight: 700; color: var(--apple-orange);">${formatCurrency(estimatedTax)}</div>
                    <div style="font-size: 13px; color: var(--label-tertiary);">${((estimatedTax/totalIncome)*100).toFixed(1)}% rate</div>
                </div>
                <div>
                    <div style="font-size: 13px; color: var(--label-secondary); margin-bottom: 4px; font-weight: 600;">NET INCOME</div>
                    <div style="font-size: 28px; font-weight: 700; color: var(--apple-blue);">${formatCurrency(netIncome)}</div>
                    <div style="font-size: 13px; color: var(--label-tertiary);">${formatCurrency(netIncome/12)}/mo</div>
                </div>
            </div>
        </div>
        
        <!-- Add Income Form -->
        <div class="card">
            <h3 class="card-title">Add Income Source</h3>
            <div class="form-group">
                <label class="form-label">Income Type</label>
                <select class="form-select" id="incomeType" onchange="handleIncomeTypeChange()">
                    <option value="salary">Salary/Wages</option>
                    <option value="business">Business Income</option>
                    <option value="rental">Rental Income</option>
                    <option value="investment">Investment Income</option>
                    <option value="interest">Bank Interest</option>
                    <option value="dividends">Dividends</option>
                    <option value="pension">Pension</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div class="form-group" id="familyMemberGroup">
                <label class="form-label">Family Member (Optional)</label>
                <select class="form-select" id="incomeFamilyMember">
                    <option value="">Household/Family Income</option>
                    ${familyMembers.map(member => 
                        `<option value="${member.id}">${member.name}</option>`
                    ).join('')}
                </select>
                <p style="font-size: 13px; color: var(--label-tertiary); margin-top: 4px;">
                    Select a family member for personal income, or leave blank for household income (e.g., interest, joint investments)
                </p>
            </div>
            
            <div class="form-group" id="companyGroup">
                <label class="form-label">Company/Employer</label>
                <input type="text" class="form-input" id="incomeCompany" placeholder="e.g., Apple Inc., Self-employed">
            </div>
            
            <div class="form-group">
                <label class="form-label">Source Name</label>
                <input type="text" class="form-input" id="incomeSource" placeholder="e.g., Software Engineer, Rental Property">
            </div>
            
            <div class="form-group">
                <label class="form-label">Annual Amount</label>
                <input type="number" class="form-input" id="incomeAmount" placeholder="0" step="1000">
            </div>
            
            <div class="form-group">
                <label class="form-label">Growth Rate (% per year)</label>
                <input type="number" class="form-input" id="incomeGrowth" placeholder="3" step="0.1" value="3">
                <p style="font-size: 13px; color: var(--label-tertiary); margin-top: 4px;">
                    Expected annual raise/increase (typically 3-5% for salary)
                </p>
            </div>
            
            <button class="btn btn-primary" onclick="window.saveIncome()">Add Income Source</button>
            <div id="incomeMessage" style="margin-top: 12px; display: none;"></div>
        </div>
        
        <!-- Income List -->
        <div class="card">
            <h3 class="card-title">Income Sources</h3>
            <div id="incomeList"></div>
        </div>
    `;
    
    renderIncomeList();
}

window.handleIncomeTypeChange = function() {
    const type = document.getElementById('incomeType').value;
    const companyGroup = document.getElementById('companyGroup');
    const familyGroup = document.getElementById('familyMemberGroup');
    
    // Show company field for salary/business
    if (type === 'salary' || type === 'business') {
        companyGroup.style.display = 'block';
    } else {
        companyGroup.style.display = 'none';
    }
    
    // Hide family member for household income types
    if (type === 'interest' || type === 'rental') {
        familyGroup.querySelector('p').textContent = 
            'Household income - not attributed to a specific family member';
    } else {
        familyGroup.querySelector('p').textContent = 
            'Select a family member for personal income, or leave blank for household income';
    }
};

async function loadIncomes() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/incomes`).once('value');
        incomes = [];
        
        snapshot.forEach(child => {
            incomes.push({
                id: child.key,
                ...child.val()
            });
        });
        
        console.log('Loaded', incomes.length, 'income sources');
        renderIncomeList();
        
        // Trigger event for dashboard to update
        window.dispatchEvent(new CustomEvent('incomesLoaded', { detail: { incomes } }));
    } catch (error) {
        console.error('Error loading incomes:', error);
    }
}

window.saveIncome = async function() {
    const type = document.getElementById('incomeType').value;
    const familyMemberId = document.getElementById('incomeFamilyMember').value;
    const company = document.getElementById('incomeCompany').value.trim();
    const source = document.getElementById('incomeSource').value.trim();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const growthRate = parseFloat(document.getElementById('incomeGrowth').value) / 100;
    
    if (!source || !amount) {
        showIncomeMessage('Please fill in source name and amount', 'error');
        return;
    }
    
    const userId = getUserId();
    if (!userId) return;
    
    // Find family member name if selected
    let familyMemberName = 'Household';
    if (familyMemberId) {
        const member = familyMembers.find(m => m.id === familyMemberId);
        familyMemberName = member ? member.name : 'Household';
    }
    
    const income = {
        type,
        familyMemberId: familyMemberId || null,
        familyMemberName,
        company: company || null,
        source,
        annualAmount: amount,
        monthlyAmount: amount / 12,
        growthRate,
        createdAt: new Date().toISOString()
    };
    
    const incomeId = generateId();
    
    try {
        await database.ref(`users/${userId}/incomes/${incomeId}`).set(income);
        showIncomeMessage('Income source added!', 'success');
        
        // Clear form
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
        document.getElementById('incomeCompany').value = '';
        document.getElementById('incomeFamilyMember').value = '';
        document.getElementById('incomeGrowth').value = '3';
        
        await loadIncomes();
        
        // Re-render to update summary
        renderIncomePage();
        
    } catch (error) {
        console.error('Error saving income:', error);
        showIncomeMessage('Error saving income', 'error');
    }
};

window.deleteIncome = async function(incomeId) {
    if (!confirm('Delete this income source?')) return;
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        await database.ref(`users/${userId}/incomes/${incomeId}`).remove();
        await loadIncomes();
        renderIncomePage();
    } catch (error) {
        console.error('Error deleting income:', error);
    }
};

function renderIncomeList() {
    const container = document.getElementById('incomeList');
    if (!container) return;
    
    if (incomes.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: var(--label-tertiary); padding: 32px;">
                No income sources added yet.<br>Add your first income source above.
            </p>
        `;
        return;
    }
    
    // Group by family member
    const grouped = {};
    incomes.forEach(income => {
        const key = income.familyMemberName || 'Household';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(income);
    });
    
    let html = '';
    
    Object.keys(grouped).forEach(memberName => {
        const memberIncomes = grouped[memberName];
        const memberTotal = memberIncomes.reduce((sum, inc) => sum + inc.annualAmount, 0);
        
        html += `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--fill-quaternary); border-radius: 10px; margin-bottom: 8px;">
                    <div style="font-size: 17px; font-weight: 600;">${memberName === 'Household' ? '🏠 ' : '👤 '}${memberName}</div>
                    <div style="font-size: 17px; font-weight: 700; color: var(--apple-green);">${formatCurrency(memberTotal)}/year</div>
                </div>
                
                <div style="display: grid; gap: 8px;">
        `;
        
        memberIncomes.forEach(income => {
            const typeEmoji = {
                'salary': '💼',
                'business': '🏢',
                'rental': '🏡',
                'investment': '📈',
                'interest': '🏦',
                'dividends': '💰',
                'pension': '🎓',
                'other': '💵'
            }[income.type] || '💵';
            
            html += `
                <div style="background: var(--bg-tertiary); padding: 14px; border-radius: 10px; border: 0.5px solid var(--separator);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">
                                ${typeEmoji} ${income.source}
                            </div>
                            ${income.company ? `
                                <div style="font-size: 13px; color: var(--label-secondary);">
                                    at ${income.company}
                                </div>
                            ` : ''}
                        </div>
                        <button onclick="window.deleteIncome('${income.id}')" 
                            style="background: rgba(255, 59, 48, 0.12); color: var(--apple-red); border: none; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                            Delete
                        </button>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 20px; font-weight: 700; color: var(--apple-green);">${formatCurrency(income.annualAmount)}</div>
                            <div style="font-size: 13px; color: var(--label-tertiary);">${formatCurrency(income.monthlyAmount)}/month</div>
                        </div>
                        ${income.growthRate > 0 ? `
                            <div style="font-size: 13px; color: var(--label-secondary); background: var(--fill-tertiary); padding: 4px 8px; border-radius: 6px;">
                                +${(income.growthRate * 100).toFixed(1)}% growth/year
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function calculateEstimatedTax(income) {
    // Simplified 2025 federal tax calculation (married filing jointly assumed)
    // This is a rough estimate - real calculation would need filing status, deductions, etc.
    
    const standardDeduction = 29200; // 2025 married filing jointly
    const taxableIncome = Math.max(0, income - standardDeduction);
    
    let tax = 0;
    
    // 2025 tax brackets (married filing jointly)
    if (taxableIncome > 731200) {
        tax += (taxableIncome - 731200) * 0.37;
        tax += (731200 - 487450) * 0.35;
        tax += (487450 - 383900) * 0.32;
        tax += (383900 - 201050) * 0.24;
        tax += (201050 - 94300) * 0.22;
        tax += (94300 - 23200) * 0.12;
        tax += 23200 * 0.10;
    } else if (taxableIncome > 487450) {
        tax += (taxableIncome - 487450) * 0.35;
        tax += (487450 - 383900) * 0.32;
        tax += (383900 - 201050) * 0.24;
        tax += (201050 - 94300) * 0.22;
        tax += (94300 - 23200) * 0.12;
        tax += 23200 * 0.10;
    } else if (taxableIncome > 383900) {
        tax += (taxableIncome - 383900) * 0.32;
        tax += (383900 - 201050) * 0.24;
        tax += (201050 - 94300) * 0.22;
        tax += (94300 - 23200) * 0.12;
        tax += 23200 * 0.10;
    } else if (taxableIncome > 201050) {
        tax += (taxableIncome - 201050) * 0.24;
        tax += (201050 - 94300) * 0.22;
        tax += (94300 - 23200) * 0.12;
        tax += 23200 * 0.10;
    } else if (taxableIncome > 94300) {
        tax += (taxableIncome - 94300) * 0.22;
        tax += (94300 - 23200) * 0.12;
        tax += 23200 * 0.10;
    } else if (taxableIncome > 23200) {
        tax += (taxableIncome - 23200) * 0.12;
        tax += 23200 * 0.10;
    } else {
        tax += taxableIncome * 0.10;
    }
    
    // Add estimated FICA (7.65% up to Social Security wage base)
    const ficaBase = Math.min(income, 168600); // 2025 SS wage base
    tax += ficaBase * 0.0765;
    
    // Medicare tax on income over $250k (married)
    if (income > 250000) {
        tax += (income - 250000) * 0.009; // Additional 0.9% Medicare
    }
    
    return Math.round(tax);
}

function showIncomeMessage(text, type) {
    const message = document.getElementById('incomeMessage');
    if (!message) return;
    
    message.textContent = text;
    message.style.display = 'block';
    message.style.padding = '12px';
    message.style.borderRadius = '10px';
    
    if (type === 'success') {
        message.style.background = 'rgba(52, 199, 89, 0.12)';
        message.style.color = 'var(--apple-green)';
    } else {
        message.style.background = 'rgba(255, 59, 48, 0.12)';
        message.style.color = 'var(--apple-red)';
    }
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

console.log('✅ Income module loaded');
initIncome();
