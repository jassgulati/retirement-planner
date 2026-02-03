// 401(k) and IRA Module
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { 
    formatCurrency, 
    formatPercent,
    generateId, 
    showError, 
    showSuccess,
    calculateFutureValue,
    calculateAge,
    getYearsUntilRetirement
} from './utils.js';

let database;
let retirementAccounts = [];
let familyMembers = [];

export function initRetirement401k() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', () => {
        loadRetirementAccounts();
        loadFamilyMembers();
    });
}

export function renderRetirement401kPage() {
    const container = document.getElementById('retirement401k');
    
    container.innerHTML = `
        <div class="card">
            <h2>401(k) & IRA Accounts</h2>
            <button class="btn" onclick="showAddRetirementAccountForm()">Add Account</button>
        </div>
        
        <div id="addRetirementAccountForm" class="card hidden">
            <h3>Add Retirement Account</h3>
            
            <div class="form-group">
                <label>Account Type</label>
                <select id="retirementAccountType" onchange="updateRetirementAccountFields()">
                    <option value="401k">401(k)</option>
                    <option value="roth_401k">Roth 401(k)</option>
                    <option value="traditional_ira">Traditional IRA</option>
                    <option value="roth_ira">Roth IRA</option>
                    <option value="sep_ira">SEP IRA</option>
                    <option value="simple_ira">SIMPLE IRA</option>
                    <option value="403b">403(b)</option>
                    <option value="457">457 Plan</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Account Owner</label>
                <select id="retirementAccountOwner">
                    <option value="">Select family member</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Employer/Institution</label>
                <input type="text" id="retirementEmployer" placeholder="e.g., Current Employer, Vanguard">
            </div>
            
            <div class="form-group">
                <label>Current Balance ($)</label>
                <input type="number" id="retirementBalance" step="0.01" placeholder="Current account balance">
            </div>
            
            <div class="form-group">
                <label>Your Annual Contribution ($)</label>
                <input type="number" id="retirementYourContribution" step="0.01" value="0">
            </div>
            
            <div id="employerMatchFields">
                <div class="form-group">
                    <label>Employer Match (%)</label>
                    <input type="number" id="retirementEmployerMatch" step="0.1" value="0" placeholder="e.g., 6 for 6%">
                </div>
                
                <div class="form-group">
                    <label>Employer Match Limit (% of salary)</label>
                    <input type="number" id="retirementMatchLimit" step="0.1" value="6" placeholder="e.g., 6 for up to 6% of salary">
                </div>
                
                <div class="form-group">
                    <label>Annual Salary ($)</label>
                    <input type="number" id="retirementSalary" step="0.01" value="0">
                </div>
            </div>
            
            <div class="form-group">
                <label>Expected Annual Return (%)</label>
                <input type="number" id="retirementReturn" step="0.1" value="7.0">
            </div>
            
            <div class="form-group">
                <label>Vested Percentage (%)</label>
                <input type="number" id="retirementVested" step="1" value="100" min="0" max="100">
            </div>
            
            <button class="btn" onclick="saveRetirementAccount()">Save Account</button>
            <button class="btn btn-secondary" onclick="hideAddRetirementAccountForm()">Cancel</button>
            <div id="retirementAccountMessage" class="hidden"></div>
        </div>
        
        <div class="card">
            <h3>Account Summary</h3>
            <div id="retirementAccountSummary"></div>
        </div>
        
        <div class="card">
            <h3>Retirement Accounts</h3>
            <div id="retirementAccountsList"></div>
        </div>
        
        <div class="card">
            <h3>Contribution Limits (2025)</h3>
            <div id="contributionLimits"></div>
        </div>
        
        <div class="card">
            <h3>Retirement Projections</h3>
            <div id="retirementProjections"></div>
        </div>
    `;
    
    renderRetirementAccountsList();
    renderRetirementAccountSummary();
    renderContributionLimits();
    renderRetirementProjections();
}

async function loadRetirementAccounts() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/retirementAccounts`).once('value');
        retirementAccounts = [];
        
        snapshot.forEach(child => {
            retirementAccounts.push({
                id: child.key,
                ...child.val()
            });
        });
        
        renderRetirementAccountsList();
        renderRetirementAccountSummary();
        renderRetirementProjections();
    } catch (error) {
        console.error('Error loading retirement accounts:', error);
    }
}

async function loadFamilyMembers() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/familyMembers`).once('value');
        familyMembers = [];
        
        snapshot.forEach(child => {
            familyMembers.push({
                id: child.key,
                ...child.val()
            });
        });
        
        updateFamilyMemberDropdown();
    } catch (error) {
        console.error('Error loading family members:', error);
    }
}

function updateFamilyMemberDropdown() {
    const select = document.getElementById('retirementAccountOwner');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select family member</option>';
    familyMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        select.appendChild(option);
    });
}

window.showAddRetirementAccountForm = function() {
    document.getElementById('addRetirementAccountForm').classList.remove('hidden');
    updateRetirementAccountFields();
};

window.hideAddRetirementAccountForm = function() {
    document.getElementById('addRetirementAccountForm').classList.add('hidden');
    clearRetirementAccountForm();
};

window.updateRetirementAccountFields = function() {
    const accountType = document.getElementById('retirementAccountType').value;
    const employerMatchFields = document.getElementById('employerMatchFields');
    
    // Show employer match fields only for employer-sponsored plans
    const employerPlans = ['401k', 'roth_401k', '403b', '457', 'simple_ira'];
    if (employerPlans.includes(accountType)) {
        employerMatchFields.style.display = 'block';
    } else {
        employerMatchFields.style.display = 'none';
    }
};

window.saveRetirementAccount = async function() {
    const accountType = document.getElementById('retirementAccountType').value;
    const ownerId = document.getElementById('retirementAccountOwner').value;
    const employer = document.getElementById('retirementEmployer').value;
    const balance = parseFloat(document.getElementById('retirementBalance').value);
    const yourContribution = parseFloat(document.getElementById('retirementYourContribution').value) || 0;
    const employerMatch = parseFloat(document.getElementById('retirementEmployerMatch').value) || 0;
    const matchLimit = parseFloat(document.getElementById('retirementMatchLimit').value) || 0;
    const salary = parseFloat(document.getElementById('retirementSalary').value) || 0;
    const expectedReturn = parseFloat(document.getElementById('retirementReturn').value) / 100;
    const vestedPercent = parseFloat(document.getElementById('retirementVested').value) || 100;
    
    if (!ownerId || !balance || balance < 0) {
        showError('retirementAccountMessage', 'Please fill in all required fields');
        return;
    }
    
    const owner = familyMembers.find(m => m.id === ownerId);
    
    // Calculate employer contribution
    let employerContribution = 0;
    if (employerMatch > 0 && salary > 0) {
        const contributionPercent = (yourContribution / salary) * 100;
        const matchedPercent = Math.min(contributionPercent, matchLimit);
        employerContribution = (matchedPercent / 100) * salary * (employerMatch / 100);
    }
    
    const account = {
        accountType,
        ownerId,
        ownerName: owner ? owner.name : '',
        employer,
        balance,
        yourContribution,
        employerMatch,
        matchLimit,
        salary,
        employerContribution,
        totalAnnualContribution: yourContribution + employerContribution,
        expectedReturn,
        vestedPercent: vestedPercent / 100,
        vestedValue: balance * (vestedPercent / 100),
        lastUpdated: new Date().toISOString()
    };
    
    const userId = getUserId();
    const accountId = generateId();
    
    try {
        await database.ref(`users/${userId}/retirementAccounts/${accountId}`).set(account);
        showSuccess('retirementAccountMessage', 'Account saved successfully!');
        await loadRetirementAccounts();
        setTimeout(() => {
            hideAddRetirementAccountForm();
        }, 1500);
    } catch (error) {
        console.error('Error saving retirement account:', error);
        showError('retirementAccountMessage', 'Error saving account. Please try again.');
    }
};

window.deleteRetirementAccount = async function(accountId) {
    if (!confirm('Are you sure you want to delete this retirement account?')) {
        return;
    }
    
    const userId = getUserId();
    
    try {
        await database.ref(`users/${userId}/retirementAccounts/${accountId}`).remove();
        await loadRetirementAccounts();
    } catch (error) {
        console.error('Error deleting retirement account:', error);
        alert('Error deleting account. Please try again.');
    }
};

function renderRetirementAccountsList() {
    const container = document.getElementById('retirementAccountsList');
    if (!container) return;
    
    if (retirementAccounts.length === 0) {
        container.innerHTML = '<p>No retirement accounts added yet. Click "Add Account" to get started.</p>';
        return;
    }
    
    let html = '<table><thead><tr>';
    html += '<th>Type</th><th>Owner</th><th>Employer</th><th>Balance</th>';
    html += '<th>Vested Value</th><th>Annual Contrib</th><th>Actions</th>';
    html += '</tr></thead><tbody>';
    
    retirementAccounts.forEach(account => {
        html += '<tr>';
        html += `<td>${account.accountType}</td>`;
        html += `<td>${account.ownerName}</td>`;
        html += `<td>${account.employer || 'N/A'}</td>`;
        html += `<td>${formatCurrency(account.balance)}</td>`;
        html += `<td>${formatCurrency(account.vestedValue)}</td>`;
        html += `<td>${formatCurrency(account.totalAnnualContribution)}</td>`;
        html += `<td><button class="btn btn-danger" onclick="deleteRetirementAccount('${account.id}')">Delete</button></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderRetirementAccountSummary() {
    const container = document.getElementById('retirementAccountSummary');
    if (!container) return;
    
    if (retirementAccounts.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    
    const totalBalance = retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalVestedValue = retirementAccounts.reduce((sum, acc) => sum + acc.vestedValue, 0);
    const totalAnnualContrib = retirementAccounts.reduce((sum, acc) => sum + acc.totalAnnualContribution, 0);
    const totalEmployerContrib = retirementAccounts.reduce((sum, acc) => sum + (acc.employerContribution || 0), 0);
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div>
                <h4>Total Balance</h4>
                <p style="font-size: 24px; font-weight: bold; color: #667eea;">${formatCurrency(totalBalance)}</p>
            </div>
            <div>
                <h4>Total Vested Value</h4>
                <p style="font-size: 24px; font-weight: bold;">${formatCurrency(totalVestedValue)}</p>
            </div>
            <div>
                <h4>Annual Contributions</h4>
                <p style="font-size: 24px;">${formatCurrency(totalAnnualContrib)}</p>
            </div>
            <div>
                <h4>Employer Match (Annual)</h4>
                <p style="font-size: 24px; color: green;">${formatCurrency(totalEmployerContrib)}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderContributionLimits() {
    const container = document.getElementById('contributionLimits');
    if (!container) return;
    
    const limits2025 = [
        { type: '401(k) / 403(b) / 457', employee: 23500, catchUp: 7500, age: '50+' },
        { type: 'Traditional/Roth IRA', employee: 7000, catchUp: 1000, age: '50+' },
        { type: 'SEP IRA', employee: 70000, catchUp: 0, age: 'N/A' },
        { type: 'SIMPLE IRA', employee: 16500, catchUp: 3500, age: '50+' }
    ];
    
    let html = '<table><thead><tr><th>Account Type</th><th>Employee Limit</th><th>Catch-Up (Age 50+)</th><th>Total Limit</th></tr></thead><tbody>';
    
    limits2025.forEach(limit => {
        html += '<tr>';
        html += `<td>${limit.type}</td>`;
        html += `<td>${formatCurrency(limit.employee)}</td>`;
        html += `<td>${limit.catchUp > 0 ? formatCurrency(limit.catchUp) : 'N/A'}</td>`;
        html += `<td><strong>${formatCurrency(limit.employee + limit.catchUp)}</strong></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += '<p style="margin-top: 15px; color: #666;"><em>* Contribution limits for 2025. Limits are subject to change annually.</em></p>';
    
    container.innerHTML = html;
}

function renderRetirementProjections() {
    const container = document.getElementById('retirementProjections');
    if (!container) return;
    
    if (retirementAccounts.length === 0 || familyMembers.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    
    let html = '';
    
    // Group accounts by owner
    const accountsByOwner = {};
    retirementAccounts.forEach(account => {
        if (!accountsByOwner[account.ownerId]) {
            accountsByOwner[account.ownerId] = [];
        }
        accountsByOwner[account.ownerId].push(account);
    });
    
    Object.entries(accountsByOwner).forEach(([ownerId, accounts]) => {
        const owner = familyMembers.find(m => m.id === ownerId);
        if (!owner || !owner.birthDate) return;
        
        const currentAge = calculateAge(owner.birthDate);
        const yearsToRetirement = getYearsUntilRetirement(owner.birthDate, 67);
        
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalAnnualContrib = accounts.reduce((sum, acc) => sum + acc.totalAnnualContribution, 0);
        const weightedReturn = accounts.reduce((sum, acc) => sum + (acc.expectedReturn * acc.balance), 0) / totalBalance;
        
        html += `<h4>${owner.name} (Age ${currentAge})</h4>`;
        html += '<table><thead><tr><th>Age</th><th>Years from Now</th><th>Projected Balance</th></tr></thead><tbody>';
        
        const milestones = [
            { age: 59.5, label: 'Age 59.5 (Penalty-free withdrawals)' },
            { age: 65, label: 'Age 65 (Medicare eligibility)' },
            { age: 67, label: 'Age 67 (Full retirement age)' },
            { age: 70, label: 'Age 70 (Max Social Security)' },
            { age: 73, label: 'Age 73 (RMD begins)' }
        ];
        
        milestones.forEach(milestone => {
            if (milestone.age >= currentAge) {
                const years = milestone.age - currentAge;
                const monthlyContrib = totalAnnualContrib / 12;
                const projectedBalance = calculateFutureValue(totalBalance, monthlyContrib, weightedReturn, years);
                
                html += '<tr>';
                html += `<td>${milestone.label}</td>`;
                html += `<td>${years.toFixed(1)} years</td>`;
                html += `<td style="font-weight: bold;">${formatCurrency(projectedBalance)}</td>`;
                html += '</tr>';
            }
        });
        
        html += '</tbody></table><br>';
    });
    
    html += '<p style="color: #666;"><em>Projections assume consistent contributions and returns. Actual results may vary.</em></p>';
    
    container.innerHTML = html;
}

function clearRetirementAccountForm() {
    document.getElementById('retirementAccountType').value = '401k';
    document.getElementById('retirementAccountOwner').value = '';
    document.getElementById('retirementEmployer').value = '';
    document.getElementById('retirementBalance').value = '';
    document.getElementById('retirementYourContribution').value = '0';
    document.getElementById('retirementEmployerMatch').value = '0';
    document.getElementById('retirementMatchLimit').value = '6';
    document.getElementById('retirementSalary').value = '0';
    document.getElementById('retirementReturn').value = '7.0';
    document.getElementById('retirementVested').value = '100';
}

// Initialize module
initRetirement401k();

export { retirementAccounts };
