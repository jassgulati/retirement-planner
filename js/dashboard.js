// Dashboard Module
import { formatCurrency, calculateAge } from './utils.js';
import { incomes } from './income.js';
import { expenses } from './expenses.js';
import { investments } from './investments.js';
import { retirementAccounts } from './retirement401k.js';
import { ssRecords } from './socialSecurity.js';

export function initDashboard() {
    window.addEventListener('userLoggedIn', renderDashboard);
}

export function renderDashboard() {
    const container = document.getElementById('dashboard');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2>Retirement Planning Overview</h2>
            <p>Your complete financial picture at a glance</p>
        </div>
        
        <div class="card">
            <h3>Net Worth Summary</h3>
            <div id="netWorthSummary"></div>
        </div>
        
        <div class="card">
            <h3>Cash Flow Summary</h3>
            <div id="cashFlowSummary"></div>
        </div>
        
        <div class="card">
            <h3>Retirement Readiness</h3>
            <div id="retirementReadiness"></div>
        </div>
        
        <div class="card">
            <h3>Quick Actions</h3>
            <div id="quickActions"></div>
        </div>
    `;
    
    renderNetWorthSummary();
    renderCashFlowSummary();
    renderRetirementReadiness();
    renderQuickActions();
}

function renderNetWorthSummary() {
    const container = document.getElementById('netWorthSummary');
    if (!container) return;
    
    const investmentTotal = investments.reduce((sum, inv) => sum + inv.value, 0);
    const retirementTotal = retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAssets = investmentTotal + retirementTotal;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div>
                <h4>Investment Accounts</h4>
                <p style="font-size: 24px; font-weight: bold;">${formatCurrency(investmentTotal)}</p>
                <p style="color: #666;">${investments.length} accounts</p>
            </div>
            <div>
                <h4>Retirement Accounts</h4>
                <p style="font-size: 24px; font-weight: bold;">${formatCurrency(retirementTotal)}</p>
                <p style="color: #666;">${retirementAccounts.length} accounts</p>
            </div>
            <div>
                <h4>Total Assets</h4>
                <p style="font-size: 28px; font-weight: bold; color: #667eea;">${formatCurrency(totalAssets)}</p>
            </div>
        </div>
    `;
}

function renderCashFlowSummary() {
    const container = document.getElementById('cashFlowSummary');
    if (!container) return;
    
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.annualAmount, 0);
    const netCashFlow = totalIncome - totalExpenses;
    const monthlyNet = netCashFlow / 12;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div>
                <h4>Annual Income</h4>
                <p style="font-size: 24px; font-weight: bold; color: green;">${formatCurrency(totalIncome)}</p>
            </div>
            <div>
                <h4>Annual Expenses</h4>
                <p style="font-size: 24px; font-weight: bold; color: #dc3545;">${formatCurrency(totalExpenses)}</p>
            </div>
            <div>
                <h4>Net Cash Flow</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${netCashFlow >= 0 ? 'green' : '#dc3545'};">${formatCurrency(netCashFlow)}</p>
                <p style="color: #666;">${formatCurrency(monthlyNet)}/month</p>
            </div>
        </div>
    `;
}

function renderRetirementReadiness() {
    const container = document.getElementById('retirementReadiness');
    if (!container) return;
    
    const retirementTotal = retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const ssAnnual = ssRecords.reduce((sum, rec) => sum + rec.annualBenefit, 0);
    const annualExpenses = expenses.reduce((sum, exp) => sum + exp.annualAmount, 0);
    
    // Simple 4% rule calculation
    const safeWithdrawal = retirementTotal * 0.04;
    const totalRetirementIncome = safeWithdrawal + ssAnnual;
    const incomeReplacement = annualExpenses > 0 ? (totalRetirementIncome / annualExpenses) * 100 : 0;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div>
                <h4>Projected Retirement Income</h4>
                <p style="font-size: 20px; font-weight: bold;">${formatCurrency(totalRetirementIncome)}/year</p>
                <p style="color: #666; font-size: 14px;">
                    ${formatCurrency(safeWithdrawal)} (4% rule)<br>
                    + ${formatCurrency(ssAnnual)} (Social Security)
                </p>
            </div>
            <div>
                <h4>Current Annual Expenses</h4>
                <p style="font-size: 20px; font-weight: bold;">${formatCurrency(annualExpenses)}</p>
            </div>
            <div>
                <h4>Income Replacement Rate</h4>
                <p style="font-size: 28px; font-weight: bold; color: ${incomeReplacement >= 100 ? 'green' : '#dc3545'};">
                    ${incomeReplacement.toFixed(0)}%
                </p>
                <p style="color: #666; font-size: 14px;">
                    ${incomeReplacement >= 100 ? '✓ On track!' : '⚠ Below target'}
                </p>
            </div>
        </div>
        
        <p style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; color: #666;">
            <strong>Note:</strong> The 4% rule suggests you can safely withdraw 4% of your retirement savings annually. 
            Most financial advisors recommend replacing 70-80% of pre-retirement income in retirement.
        </p>
    `;
}

function renderQuickActions() {
    const container = document.getElementById('quickActions');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <button class="btn" onclick="showPage('family')">Add Family Member</button>
            <button class="btn" onclick="showPage('income')">Add Income</button>
            <button class="btn" onclick="showPage('expenses')">Add Expense</button>
            <button class="btn" onclick="showPage('investments')">Add Investment</button>
            <button class="btn" onclick="showPage('retirement401k')">Add Retirement Account</button>
            <button class="btn" onclick="showPage('socialSecurity')">Add SS Benefit</button>
        </div>
    `;
}

initDashboard();
