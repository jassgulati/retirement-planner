// Expenses Module
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { formatCurrency, generateId, showError, showSuccess, groupBy, sumBy } from './utils.js';

let database;
let expenses = [];

export function initExpenses() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', loadExpenses);
}

export function renderExpensesPage() {
    document.getElementById('expenses').innerHTML = `
        <div class="card">
            <h2>Expenses</h2>
            <button class="btn" onclick="showAddExpenseForm()">Add Expense</button>
        </div>
        
        <div id="addExpenseForm" class="card hidden">
            <h3>Add Expense</h3>
            <div class="form-group">
                <label>Category</label>
                <select id="expenseCategory">
                    <option value="housing">Housing</option>
                    <option value="utilities">Utilities</option>
                    <option value="food">Food & Groceries</option>
                    <option value="transportation">Transportation</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="insurance">Insurance</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" id="expenseDescription" placeholder="e.g., Mortgage, Car payment">
            </div>
            <div class="form-group">
                <label>Monthly Amount ($)</label>
                <input type="number" id="expenseAmount" step="0.01">
            </div>
            <button class="btn" onclick="saveExpense()">Save</button>
            <button class="btn btn-secondary" onclick="hideAddExpenseForm()">Cancel</button>
            <div id="expenseMessage" class="hidden"></div>
        </div>
        
        <div class="card">
            <h3>Expense Summary</h3>
            <div id="expenseSummary"></div>
        </div>
        
        <div class="card">
            <h3>Expenses by Category</h3>
            <div id="expensesByCategory"></div>
        </div>
        
        <div class="card">
            <h3>All Expenses</h3>
            <div id="expensesList"></div>
        </div>
    `;
    
    renderExpensesList();
    renderExpenseSummary();
    renderExpensesByCategory();
}

async function loadExpenses() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/expenses`).once('value');
        expenses = [];
        snapshot.forEach(child => {
            expenses.push({ id: child.key, ...child.val() });
        });
        renderExpensesList();
        renderExpenseSummary();
        renderExpensesByCategory();
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

window.showAddExpenseForm = () => document.getElementById('addExpenseForm').classList.remove('hidden');
window.hideAddExpenseForm = () => {
    document.getElementById('addExpenseForm').classList.add('hidden');
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
};

window.saveExpense = async function() {
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const monthlyAmount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!description || !monthlyAmount) {
        showError('expenseMessage', 'Please fill in all fields');
        return;
    }
    
    const expense = {
        category,
        description,
        monthlyAmount,
        annualAmount: monthlyAmount * 12
    };
    
    try {
        await database.ref(`users/${getUserId()}/expenses/${generateId()}`).set(expense);
        showSuccess('expenseMessage', 'Expense saved!');
        await loadExpenses();
        setTimeout(window.hideAddExpenseForm, 1500);
    } catch (error) {
        showError('expenseMessage', 'Error saving expense');
    }
};

window.deleteExpense = async function(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        await database.ref(`users/${getUserId()}/expenses/${id}`).remove();
        await loadExpenses();
    } catch (error) {
        console.error('Error deleting:', error);
    }
};

function renderExpensesList() {
    const container = document.getElementById('expensesList');
    if (!container) return;
    
    if (expenses.length === 0) {
        container.innerHTML = '<p>No expenses added yet.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Category</th><th>Description</th><th>Monthly</th><th>Annual</th><th>Actions</th></tr></thead><tbody>';
    expenses.forEach(exp => {
        html += `<tr>
            <td>${exp.category}</td>
            <td>${exp.description}</td>
            <td>${formatCurrency(exp.monthlyAmount)}</td>
            <td>${formatCurrency(exp.annualAmount)}</td>
            <td><button class="btn btn-danger" onclick="deleteExpense('${exp.id}')">Delete</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderExpenseSummary() {
    const container = document.getElementById('expenseSummary');
    if (!container) return;
    
    const totalMonthly = sumBy(expenses, 'monthlyAmount');
    const totalAnnual = totalMonthly * 12;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div>
                <h4>Total Monthly Expenses</h4>
                <p style="font-size: 24px; font-weight: bold; color: #667eea;">${formatCurrency(totalMonthly)}</p>
            </div>
            <div>
                <h4>Total Annual Expenses</h4>
                <p style="font-size: 24px; font-weight: bold;">${formatCurrency(totalAnnual)}</p>
            </div>
        </div>
    `;
}

function renderExpensesByCategory() {
    const container = document.getElementById('expensesByCategory');
    if (!container) return;
    
    if (expenses.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    
    const byCategory = groupBy(expenses, 'category');
    const totalMonthly = sumBy(expenses, 'monthlyAmount');
    
    let html = '<table><thead><tr><th>Category</th><th>Monthly Total</th><th>Percentage</th></tr></thead><tbody>';
    
    Object.entries(byCategory).forEach(([category, items]) => {
        const categoryTotal = sumBy(items, 'monthlyAmount');
        const percentage = (categoryTotal / totalMonthly) * 100;
        
        html += `<tr>
            <td>${category}</td>
            <td>${formatCurrency(categoryTotal)}</td>
            <td>${percentage.toFixed(1)}%</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

initExpenses();
export { expenses };
