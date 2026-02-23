// Investments Module - Complete with Retirement Accounts
import { database } from './config.js';
import { getUserId } from './auth.js';

let investments = {};
let userProfile = {};
let familyMembers = [];

export function initInvestments() {
    console.log('📈 Initializing Investments...');
    
    loadInvestmentsData();
}

async function loadInvestmentsData() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        // Load profile for growth rate
        const profileSnapshot = await database.ref(`users/${userId}/profile`).once('value');
        userProfile = profileSnapshot.val() || {};
        
        // Load family members
        const familySnapshot = await database.ref(`users/${userId}/familyMembers`).once('value');
        const familyData = familySnapshot.val() || {};
        familyMembers = Object.values(familyData);
        
        // Load investments
        const investSnapshot = await database.ref(`users/${userId}/investments`).once('value');
        investments = investSnapshot.val() || {};
        
        console.log('Investments data loaded:', investments);
        renderInvestmentsPage();
        
    } catch (error) {
        console.error('Error loading investments:', error);
        renderInvestmentsPage();
    }
}

function renderInvestmentsPage() {
    const container = document.getElementById('content');
    if (!container) return;
    
    // Calculate totals
    const accounts = Object.values(investments);
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
    const totalContributions = accounts.reduce((sum, acc) => sum + (acc.annualContribution || 0), 0);
    
    // Get growth rate from settings
    const growthRate = userProfile.projectionMode === 'conservative' ? 4 : 
                       userProfile.projectionMode === 'optimistic' ? 13 : 10;
    
    container.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%); border: 2px solid rgba(0, 122, 255, 0.2);">
            <h2 class="card-title">📈 Investment Portfolio</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
                <div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 4px; font-weight: 600;">TOTAL BALANCE</div>
                    <div style="font-size: 32px; font-weight: 700; color: #007AFF;">${formatCurrency(totalBalance)}</div>
                    <div style="font-size: 13px; color: #999;">${accounts.length} account${accounts.length !== 1 ? 's' : ''}</div>
                </div>
                <div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 4px; font-weight: 600;">ANNUAL CONTRIBUTIONS</div>
                    <div style="font-size: 32px; font-weight: 700; color: #34C759;">${formatCurrency(totalContributions)}</div>
                    <div style="font-size: 13px; color: #999;">${formatCurrency(totalContributions / 12)}/month</div>
                </div>
                <div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 4px; font-weight: 600;">GROWTH RATE</div>
                    <div style="font-size: 32px; font-weight: 700; color: #FF9500;">${growthRate}%</div>
                    <div style="font-size: 13px; color: #999;">${userProfile.projectionMode || 'average'} mode</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3 class="card-title">Add Investment Account</h3>
            
            <div class="form-group">
                <label class="form-label">Account Type</label>
                <select class="form-select" id="accountType">
                    <option value="">-- Select Account Type --</option>
                    <optgroup label="Retirement Accounts">
                        <option value="401k_active">401(k) - Active</option>
                        <option value="401k_roth_active">401(k) Roth - Active</option>
                        <option value="401k_rollover">401(k) - Rollover</option>
                        <option value="ira_traditional">IRA - Traditional</option>
                        <option value="ira_roth">IRA - Roth</option>
                        <option value="ira_rollover">IRA - Rollover</option>
                        <option value="sep_ira">SEP IRA</option>
                        <option value="simple_ira">SIMPLE IRA</option>
                    </optgroup>
                    <optgroup label="Taxable Accounts">
                        <option value="brokerage">Brokerage Account</option>
                        <option value="individual">Individual Investment Account</option>
                        <option value="joint">Joint Investment Account</option>
                    </optgroup>
                    <optgroup label="Other">
                        <option value="hsa">HSA (Health Savings)</option>
                        <option value="529">529 Education Savings</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="other">Other</option>
                    </optgroup>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Account Holder (Family Member)</label>
                <select class="form-select" id="accountHolder">
                    <option value="">-- Select Family Member --</option>
                    ${familyMembers.map(member => 
                        `<option value="${member.id || 'fam_' + member.name}">${member.name}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Account Name / Nickname</label>
                <input type="text" class="form-input" id="accountName" placeholder="e.g., Fidelity 401k, Vanguard Roth IRA">
            </div>
            
            <div class="form-group">
                <label class="form-label">Financial Institution</label>
                <input type="text" class="form-input" id="institution" placeholder="e.g., Fidelity, Vanguard, Charles Schwab">
            </div>
            
            <div class="form-group">
                <label class="form-label">Current Balance</label>
                <input type="number" class="form-input" id="currentBalance" placeholder="0" step="100">
            </div>
            
            <div class="form-group" id="contributionGroup">
                <label class="form-label">Annual Contribution (Your + Employer)</label>
                <input type="number" class="form-input" id="annualContribution" placeholder="0" step="100">
                <p style="font-size: 13px; color: #666; margin-top: 4px;">
                    For active accounts only. Leave 0 for rollover accounts.
                </p>
            </div>
            
            <div class="form-group" id="employerMatchGroup" style="display: none;">
                <label class="form-label">Employer Match (Annual)</label>
                <input type="number" class="form-input" id="employerMatch" placeholder="0" step="100">
                <p style="font-size: 13px; color: #666; margin-top: 4px;">
                    Already included in annual contribution above? If yes, leave at 0.
                </p>
            </div>
            
            <div class="form-group">
                <label class="form-label">Account Notes (Optional)</label>
                <input type="text" class="form-input" id="accountNotes" placeholder="e.g., Target Date 2050 Fund, 80/20 stocks/bonds">
            </div>
            
            <button class="btn btn-primary" onclick="window.saveInvestment()">Add Account</button>
            <div id="investmentMessage" style="margin-top: 12px; display: none;"></div>
        </div>
        
        <div class="card">
            <h3 class="card-title">Your Investment Accounts</h3>
            <div id="accountsList"></div>
        </div>
    `;
    
    // Setup event listeners
    setupEventListeners();
    
    // Render accounts list
    renderAccountsList();
}

function setupEventListeners() {
    const accountType = document.getElementById('accountType');
    if (accountType) {
        accountType.addEventListener('change', handleAccountTypeChange);
    }
}

function handleAccountTypeChange() {
    const accountType = document.getElementById('accountType').value;
    const contributionGroup = document.getElementById('contributionGroup');
    const employerMatchGroup = document.getElementById('employerMatchGroup');
    
    // Show/hide contribution fields based on account type
    const isRollover = accountType.includes('rollover');
    const is401k = accountType.includes('401k') && !isRollover;
    
    if (contributionGroup) {
        contributionGroup.style.display = isRollover ? 'none' : 'block';
    }
    
    if (employerMatchGroup) {
        employerMatchGroup.style.display = is401k ? 'block' : 'none';
    }
}

window.saveInvestment = async function() {
    const accountType = document.getElementById('accountType').value;
    const accountHolder = document.getElementById('accountHolder').value;
    const accountName = document.getElementById('accountName').value.trim();
    const institution = document.getElementById('institution').value.trim();
    const currentBalance = parseFloat(document.getElementById('currentBalance').value) || 0;
    const annualContribution = parseFloat(document.getElementById('annualContribution').value) || 0;
    const employerMatch = parseFloat(document.getElementById('employerMatch').value) || 0;
    const accountNotes = document.getElementById('accountNotes').value.trim();
    
    if (!accountType) {
        showMessage('Please select an account type', 'error');
        return;
    }
    
    if (!accountHolder) {
        showMessage('Please select an account holder', 'error');
        return;
    }
    
    if (!accountName) {
        showMessage('Please enter an account name', 'error');
        return;
    }
    
    const userId = getUserId();
    if (!userId) return;
    
    // Find holder name
    const holder = familyMembers.find(m => (m.id || 'fam_' + m.name) === accountHolder);
    const holderName = holder ? holder.name : 'Unknown';
    
    const investment = {
        accountType,
        accountHolder,
        holderName,
        accountName,
        institution,
        currentBalance,
        annualContribution,
        employerMatch,
        notes: accountNotes,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    const investmentId = 'inv_' + Date.now();
    
    try {
        await database.ref(`users/${userId}/investments/${investmentId}`).set(investment);
        showMessage('Investment account added!', 'success');
        
        // Clear form
        document.getElementById('accountType').value = '';
        document.getElementById('accountHolder').value = '';
        document.getElementById('accountName').value = '';
        document.getElementById('institution').value = '';
        document.getElementById('currentBalance').value = '';
        document.getElementById('annualContribution').value = '';
        document.getElementById('employerMatch').value = '';
        document.getElementById('accountNotes').value = '';
        
        // Reload data
        await loadInvestmentsData();
        
    } catch (error) {
        console.error('Error saving investment:', error);
        showMessage('Error saving account', 'error');
    }
};

window.deleteInvestment = async function(investmentId) {
    if (!confirm('Delete this investment account?')) return;
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        await database.ref(`users/${userId}/investments/${investmentId}`).remove();
        await loadInvestmentsData();
    } catch (error) {
        console.error('Error deleting investment:', error);
    }
};

function renderAccountsList() {
    const container = document.getElementById('accountsList');
    if (!container) return;
    
    const accounts = Object.entries(investments);
    
    if (accounts.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: #999; padding: 32px;">
                No investment accounts yet. Add your first account above!
            </p>
        `;
        return;
    }
    
    // Group by account holder
    const grouped = {};
    accounts.forEach(([id, account]) => {
        const key = account.holderName || 'Unknown';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ id, ...account });
    });
    
    let html = '';
    
    // Get current age and retirement age for projections
    const currentAge = userProfile.currentAge || 30;
    const retirementAge = userProfile.retirementAge || 67;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const growthRate = userProfile.projectionMode === 'conservative' ? 0.04 : 
                       userProfile.projectionMode === 'optimistic' ? 0.13 : 0.10;
    
    Object.keys(grouped).forEach(holderName => {
        const holderAccounts = grouped[holderName];
        const holderTotal = holderAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
        
        // Calculate projected value at retirement
        let projectedTotal = 0;
        holderAccounts.forEach(account => {
            const projected = calculateFutureValue(
                account.currentBalance,
                account.annualContribution || 0,
                growthRate,
                yearsToRetirement
            );
            projectedTotal += projected;
        });
        
        html += `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f5f5f7; border-radius: 12px; margin-bottom: 12px;">
                    <div>
                        <div style="font-size: 17px; font-weight: 600;">👤 ${holderName}</div>
                        <div style="font-size: 13px; color: #666; margin-top: 4px;">
                            Current: ${formatCurrency(holderTotal)} → 
                            At retirement: ${formatCurrency(projectedTotal)}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; gap: 12px;">
        `;
        
        holderAccounts.forEach(account => {
            const isRollover = account.accountType.includes('rollover');
            const projected = calculateFutureValue(
                account.currentBalance,
                account.annualContribution || 0,
                growthRate,
                yearsToRetirement
            );
            
            const accountTypeLabel = getAccountTypeLabel(account.accountType);
            
            html += `
                <div style="background: white; padding: 16px; border-radius: 12px; border: 1px solid #e0e0e0;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">
                                ${account.accountName}
                            </div>
                            <div style="font-size: 13px; color: #666;">
                                ${accountTypeLabel} • ${account.institution}
                            </div>
                            ${account.notes ? `
                                <div style="font-size: 13px; color: #999; margin-top: 4px;">
                                    📝 ${account.notes}
                                </div>
                            ` : ''}
                        </div>
                        <button onclick="window.deleteInvestment('${account.id}')" 
                            style="background: rgba(255, 59, 48, 0.12); color: #FF3B30; border: none; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                            Delete
                        </button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 12px;">
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 4px;">Current Balance</div>
                            <div style="font-size: 24px; font-weight: 700; color: #007AFF;">${formatCurrency(account.currentBalance)}</div>
                        </div>
                        ${!isRollover && account.annualContribution > 0 ? `
                            <div>
                                <div style="font-size: 13px; color: #666; margin-bottom: 4px;">Annual Contribution</div>
                                <div style="font-size: 24px; font-weight: 700; color: #34C759;">${formatCurrency(account.annualContribution)}</div>
                                <div style="font-size: 13px; color: #999;">${formatCurrency(account.annualContribution / 12)}/month</div>
                            </div>
                        ` : ''}
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 4px;">At Retirement (${retirementAge})</div>
                            <div style="font-size: 24px; font-weight: 700; color: #FF9500;">${formatCurrency(projected)}</div>
                            <div style="font-size: 13px; color: #999;">${yearsToRetirement} years @ ${(growthRate * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #999;">
                        Last updated: ${formatDate(account.lastUpdated)}
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

function calculateFutureValue(currentBalance, annualContribution, growthRate, years) {
    // Future value with contributions
    // FV = PV(1 + r)^n + PMT × [((1 + r)^n - 1) / r]
    const fvOfBalance = currentBalance * Math.pow(1 + growthRate, years);
    const fvOfContributions = annualContribution * ((Math.pow(1 + growthRate, years) - 1) / growthRate);
    
    return fvOfBalance + fvOfContributions;
}

function getAccountTypeLabel(type) {
    const labels = {
        '401k_active': '401(k) Active',
        '401k_roth_active': '401(k) Roth Active',
        '401k_rollover': '401(k) Rollover',
        'ira_traditional': 'Traditional IRA',
        'ira_roth': 'Roth IRA',
        'ira_rollover': 'IRA Rollover',
        'sep_ira': 'SEP IRA',
        'simple_ira': 'SIMPLE IRA',
        'brokerage': 'Brokerage',
        'individual': 'Individual Account',
        'joint': 'Joint Account',
        'hsa': 'HSA',
        '529': '529 Plan',
        'crypto': 'Cryptocurrency',
        'other': 'Other'
    };
    return labels[type] || type;
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '$0';
    return '$' + Math.round(amount).toLocaleString('en-US');
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
    });
}

function showMessage(text, type) {
    const message = document.getElementById('investmentMessage');
    if (!message) return;
    
    message.textContent = text;
    message.style.display = 'block';
    message.style.padding = '12px';
    message.style.borderRadius = '10px';
    
    if (type === 'success') {
        message.style.background = 'rgba(52, 199, 89, 0.12)';
        message.style.color = '#34C759';
    } else {
        message.style.background = 'rgba(255, 59, 48, 0.12)';
        message.style.color = '#FF3B30';
    }
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

console.log('✅ Investments module loaded');
