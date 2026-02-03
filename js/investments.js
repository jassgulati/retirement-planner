// Investments Module
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { 
    formatCurrency, 
    formatPercent, 
    generateId, 
    showError, 
    showSuccess,
    calculateFutureValue,
    calculateCompoundGrowth
} from './utils.js';

let database;
let investments = [];

export function initInvestments() {
    const { database: db } = initializeFirebase();
    database = db;
    
    // Load investments when user logs in
    window.addEventListener('userLoggedIn', () => {
        loadInvestments();
    });
}

export function renderInvestmentsPage() {
    const container = document.getElementById('investments');
    
    container.innerHTML = `
        <div class="card">
            <h2>Investment Portfolio</h2>
            <button class="btn" onclick="showAddInvestmentForm()">Add Investment</button>
        </div>
        
        <div id="addInvestmentForm" class="card hidden">
            <h3>Add New Investment</h3>
            <div class="form-group">
                <label>Investment Type</label>
                <select id="investmentType">
                    <option value="stock">Individual Stock</option>
                    <option value="etf">ETF</option>
                    <option value="mutual_fund">Mutual Fund</option>
                    <option value="index_fund">Index Fund</option>
                    <option value="bond">Bond</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Name/Symbol</label>
                <input type="text" id="investmentName" placeholder="e.g., VTSAX, AAPL">
            </div>
            
            <div class="form-group">
                <label>Account/Brokerage</label>
                <input type="text" id="investmentAccount" placeholder="e.g., Vanguard, Fidelity">
            </div>
            
            <div class="form-group">
                <label>Current Value ($)</label>
                <input type="number" id="investmentValue" step="0.01" placeholder="Current market value">
            </div>
            
            <div class="form-group">
                <label>Cost Basis ($)</label>
                <input type="number" id="investmentCostBasis" step="0.01" placeholder="Original purchase price">
            </div>
            
            <div class="form-group">
                <label>Monthly Contribution ($)</label>
                <input type="number" id="investmentMonthlyContribution" step="0.01" value="0">
            </div>
            
            <div class="form-group">
                <label>Expected Annual Return (%)</label>
                <input type="number" id="investmentReturn" step="0.1" value="7.0" placeholder="Average annual return">
            </div>
            
            <div class="form-group">
                <label>Taxable Account?</label>
                <select id="investmentTaxable">
                    <option value="false">No (Tax-Advantaged)</option>
                    <option value="true">Yes (Taxable)</option>
                </select>
            </div>
            
            <button class="btn" onclick="saveInvestment()">Save Investment</button>
            <button class="btn btn-secondary" onclick="hideAddInvestmentForm()">Cancel</button>
            <div id="investmentMessage" class="hidden"></div>
        </div>
        
        <div class="card">
            <h3>Portfolio Summary</h3>
            <div id="portfolioSummary"></div>
        </div>
        
        <div class="card">
            <h3>Investment Holdings</h3>
            <div id="investmentsList"></div>
        </div>
        
        <div class="card">
            <h3>Portfolio Projections</h3>
            <div id="investmentProjections"></div>
        </div>
    `;
    
    renderInvestmentsList();
    renderPortfolioSummary();
    renderInvestmentProjections();
}

async function loadInvestments() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/investments`).once('value');
        investments = [];
        
        snapshot.forEach(child => {
            investments.push({
                id: child.key,
                ...child.val()
            });
        });
        
        renderInvestmentsList();
        renderPortfolioSummary();
        renderInvestmentProjections();
    } catch (error) {
        console.error('Error loading investments:', error);
    }
}

window.showAddInvestmentForm = function() {
    document.getElementById('addInvestmentForm').classList.remove('hidden');
};

window.hideAddInvestmentForm = function() {
    document.getElementById('addInvestmentForm').classList.add('hidden');
    clearInvestmentForm();
};

window.saveInvestment = async function() {
    const type = document.getElementById('investmentType').value;
    const name = document.getElementById('investmentName').value;
    const account = document.getElementById('investmentAccount').value;
    const value = parseFloat(document.getElementById('investmentValue').value);
    const costBasis = parseFloat(document.getElementById('investmentCostBasis').value);
    const monthlyContribution = parseFloat(document.getElementById('investmentMonthlyContribution').value) || 0;
    const expectedReturn = parseFloat(document.getElementById('investmentReturn').value) / 100;
    const taxable = document.getElementById('investmentTaxable').value === 'true';
    
    if (!name || !value || !costBasis) {
        showError('investmentMessage', 'Please fill in all required fields');
        return;
    }
    
    const investment = {
        type,
        name,
        account,
        value,
        costBasis,
        monthlyContribution,
        expectedReturn,
        taxable,
        gainLoss: value - costBasis,
        gainLossPercent: ((value - costBasis) / costBasis),
        lastUpdated: new Date().toISOString()
    };
    
    const userId = getUserId();
    const investmentId = generateId();
    
    try {
        await database.ref(`users/${userId}/investments/${investmentId}`).set(investment);
        showSuccess('investmentMessage', 'Investment saved successfully!');
        await loadInvestments();
        setTimeout(() => {
            hideAddInvestmentForm();
        }, 1500);
    } catch (error) {
        console.error('Error saving investment:', error);
        showError('investmentMessage', 'Error saving investment. Please try again.');
    }
};

window.deleteInvestment = async function(investmentId) {
    if (!confirm('Are you sure you want to delete this investment?')) {
        return;
    }
    
    const userId = getUserId();
    
    try {
        await database.ref(`users/${userId}/investments/${investmentId}`).remove();
        await loadInvestments();
    } catch (error) {
        console.error('Error deleting investment:', error);
        alert('Error deleting investment. Please try again.');
    }
};

function renderInvestmentsList() {
    const container = document.getElementById('investmentsList');
    if (!container) return;
    
    if (investments.length === 0) {
        container.innerHTML = '<p>No investments added yet. Click "Add Investment" to get started.</p>';
        return;
    }
    
    let html = '<table><thead><tr>';
    html += '<th>Type</th><th>Name</th><th>Account</th><th>Value</th><th>Cost Basis</th>';
    html += '<th>Gain/Loss</th><th>Return</th><th>Monthly Contrib</th><th>Actions</th>';
    html += '</tr></thead><tbody>';
    
    investments.forEach(inv => {
        const gainLossClass = inv.gainLoss >= 0 ? 'style="color: green;"' : 'style="color: red;"';
        
        html += '<tr>';
        html += `<td>${inv.type}</td>`;
        html += `<td>${inv.name}</td>`;
        html += `<td>${inv.account || 'N/A'}</td>`;
        html += `<td>${formatCurrency(inv.value)}</td>`;
        html += `<td>${formatCurrency(inv.costBasis)}</td>`;
        html += `<td ${gainLossClass}>${formatCurrency(inv.gainLoss)}</td>`;
        html += `<td ${gainLossClass}>${formatPercent(inv.gainLossPercent)}</td>`;
        html += `<td>${formatCurrency(inv.monthlyContribution)}</td>`;
        html += `<td><button class="btn btn-danger" onclick="deleteInvestment('${inv.id}')">Delete</button></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderPortfolioSummary() {
    const container = document.getElementById('portfolioSummary');
    if (!container) return;
    
    if (investments.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    
    const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
    const totalCostBasis = investments.reduce((sum, inv) => sum + inv.costBasis, 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const totalGainLossPercent = (totalGainLoss / totalCostBasis);
    const totalMonthlyContrib = investments.reduce((sum, inv) => sum + inv.monthlyContribution, 0);
    
    const byType = {};
    investments.forEach(inv => {
        if (!byType[inv.type]) {
            byType[inv.type] = 0;
        }
        byType[inv.type] += inv.value;
    });
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div>
                <h4>Total Portfolio Value</h4>
                <p style="font-size: 24px; font-weight: bold; color: #667eea;">${formatCurrency(totalValue)}</p>
            </div>
            <div>
                <h4>Total Cost Basis</h4>
                <p style="font-size: 24px;">${formatCurrency(totalCostBasis)}</p>
            </div>
            <div>
                <h4>Total Gain/Loss</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${totalGainLoss >= 0 ? 'green' : 'red'};">
                    ${formatCurrency(totalGainLoss)} (${formatPercent(totalGainLossPercent)})
                </p>
            </div>
            <div>
                <h4>Monthly Contributions</h4>
                <p style="font-size: 24px;">${formatCurrency(totalMonthlyContrib)}</p>
            </div>
        </div>
        
        <h4>Portfolio Allocation</h4>
        <table>
            <thead>
                <tr><th>Type</th><th>Value</th><th>Allocation</th></tr>
            </thead>
            <tbody>
    `;
    
    Object.entries(byType).forEach(([type, value]) => {
        const allocation = value / totalValue;
        html += `<tr><td>${type}</td><td>${formatCurrency(value)}</td><td>${formatPercent(allocation)}</td></tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderInvestmentProjections() {
    const container = document.getElementById('investmentProjections');
    if (!container) return;
    
    if (investments.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    
    const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
    const totalMonthlyContrib = investments.reduce((sum, inv) => sum + inv.monthlyContribution, 0);
    
    // Calculate weighted average return
    const weightedReturn = investments.reduce((sum, inv) => {
        return sum + (inv.expectedReturn * inv.value);
    }, 0) / totalValue;
    
    let html = '<table><thead><tr><th>Year</th><th>Projected Value</th><th>Total Contributions</th><th>Investment Gains</th></tr></thead><tbody>';
    
    const years = [5, 10, 15, 20, 25, 30];
    
    years.forEach(year => {
        const futureValue = calculateFutureValue(totalValue, totalMonthlyContrib, weightedReturn, year);
        const totalContributions = totalValue + (totalMonthlyContrib * 12 * year);
        const investmentGains = futureValue - totalContributions;
        
        html += '<tr>';
        html += `<td>${year} years</td>`;
        html += `<td style="font-weight: bold;">${formatCurrency(futureValue)}</td>`;
        html += `<td>${formatCurrency(totalContributions)}</td>`;
        html += `<td style="color: green;">${formatCurrency(investmentGains)}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += `<p style="margin-top: 15px; color: #666;"><em>Projections assume a ${formatPercent(weightedReturn)} average annual return and consistent monthly contributions.</em></p>`;
    
    container.innerHTML = html;
}

function clearInvestmentForm() {
    document.getElementById('investmentType').value = 'stock';
    document.getElementById('investmentName').value = '';
    document.getElementById('investmentAccount').value = '';
    document.getElementById('investmentValue').value = '';
    document.getElementById('investmentCostBasis').value = '';
    document.getElementById('investmentMonthlyContribution').value = '0';
    document.getElementById('investmentReturn').value = '7.0';
    document.getElementById('investmentTaxable').value = 'false';
}

// Initialize module
initInvestments();

export { investments };
