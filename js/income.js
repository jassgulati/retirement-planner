// Income Module
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { formatCurrency, generateId, showError, showSuccess } from './utils.js';

let database;
let incomes = [];

export function initIncome() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', loadIncomes);
}

export function renderIncomePage() {
    document.getElementById('income').innerHTML = `
        <div class="card">
            <h2>Income Sources</h2>
            <button class="btn" onclick="showAddIncomeForm()">Add Income</button>
        </div>
        
        <div id="addIncomeForm" class="card hidden">
            <h3>Add Income Source</h3>
            <div class="form-group">
                <label>Source Name</label>
                <input type="text" id="incomeName" placeholder="e.g., Salary, Freelance">
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="incomeType">
                    <option value="salary">Salary/Wages</option>
                    <option value="business">Business Income</option>
                    <option value="rental">Rental Income</option>
                    <option value="investment">Investment Income</option>
                    <option value="pension">Pension</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Annual Amount ($)</label>
                <input type="number" id="incomeAmount" step="0.01">
            </div>
            <div class="form-group">
                <label>Growth Rate (% per year)</label>
                <input type="number" id="incomeGrowth" step="0.1" value="3.0">
            </div>
            <button class="btn" onclick="saveIncome()">Save</button>
            <button class="btn btn-secondary" onclick="hideAddIncomeForm()">Cancel</button>
            <div id="incomeMessage" class="hidden"></div>
        </div>
        
        <div class="card">
            <h3>Income Summary</h3>
            <div id="incomeSummary"></div>
        </div>
        
        <div class="card">
            <h3>Income List</h3>
            <div id="incomeList"></div>
        </div>
    `;
    
    renderIncomeList();
    renderIncomeSummary();
}

async function loadIncomes() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/incomes`).once('value');
        incomes = [];
        snapshot.forEach(child => {
            incomes.push({ id: child.key, ...child.val() });
        });
        renderIncomeList();
        renderIncomeSummary();
    } catch (error) {
        console.error('Error loading incomes:', error);
    }
}

window.showAddIncomeForm = () => document.getElementById('addIncomeForm').classList.remove('hidden');
window.hideAddIncomeForm = () => {
    document.getElementById('addIncomeForm').classList.add('hidden');
    document.getElementById('incomeName').value = '';
    document.getElementById('incomeAmount').value = '';
    document.getElementById('incomeGrowth').value = '3.0';
};

window.saveIncome = async function() {
    const name = document.getElementById('incomeName').value;
    const type = document.getElementById('incomeType').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const growthRate = parseFloat(document.getElementById('incomeGrowth').value) / 100;
    
    if (!name || !amount) {
        showError('incomeMessage', 'Please fill in all required fields');
        return;
    }
    
    const income = { name, type, amount, growthRate };
    const userId = getUserId();
    
    try {
        await database.ref(`users/${userId}/incomes/${generateId()}`).set(income);
        showSuccess('incomeMessage', 'Income saved!');
        await loadIncomes();
        setTimeout(window.hideAddIncomeForm, 1500);
    } catch (error) {
        showError('incomeMessage', 'Error saving income');
    }
};

window.deleteIncome = async function(id) {
    if (!confirm('Delete this income?')) return;
    try {
        await database.ref(`users/${getUserId()}/incomes/${id}`).remove();
        await loadIncomes();
    } catch (error) {
        console.error('Error deleting:', error);
    }
};

function renderIncomeList() {
    const container = document.getElementById('incomeList');
    if (!container) return;
    
    if (incomes.length === 0) {
        container.innerHTML = '<p>No income sources added yet.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Source</th><th>Type</th><th>Annual Amount</th><th>Growth Rate</th><th>Actions</th></tr></thead><tbody>';
    incomes.forEach(inc => {
        html += `<tr>
            <td>${inc.name}</td>
            <td>${inc.type}</td>
            <td>${formatCurrency(inc.amount)}</td>
            <td>${(inc.growthRate * 100).toFixed(1)}%</td>
            <td><button class="btn btn-danger" onclick="deleteIncome('${inc.id}')">Delete</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderIncomeSummary() {
    const container = document.getElementById('incomeSummary');
    if (!container) return;
    
    const totalAnnual = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalMonthly = totalAnnual / 12;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div>
                <h4>Total Annual Income</h4>
                <p style="font-size: 24px; font-weight: bold; color: #667eea;">${formatCurrency(totalAnnual)}</p>
            </div>
            <div>
                <h4>Total Monthly Income</h4>
                <p style="font-size: 24px; font-weight: bold;">${formatCurrency(totalMonthly)}</p>
            </div>
        </div>
    `;
}

initIncome();
export { incomes };
