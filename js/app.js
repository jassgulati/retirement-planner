// Main Application Logic
import { signup, login, logout, onAuthChange } from './auth.js';
import { saveUserData, subscribeToUserData } from './data-manager.js';
import { calculateHouseholdSS } from './social-security.js';

class RetirementApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'login';
        this.currentTab = 'family';
        this.familyMembers = [{ 
    id: 1, 
    name: '', 
    dateOfBirth: '',
    birthYear: new Date().getFullYear() - 30,
    relation: 'Self',
    currentSalary: 0,
    yearStartedWorking: null,
    retirementAge: 67,
    ssCollectionAge: 67
}];

        this.incomes = [];
        this.expenses = [];
        this.dataUnsubscribe = null;

        // Listen for auth changes
        onAuthChange((user) => {
            if (user) {
                this.currentUser = user;
                this.currentView = 'app';
                this.loadUserData();
            } else {
                this.currentUser = null;
                this.currentView = 'login';
                this.render();
            }
        });
    }

    loadUserData() {
        if (!this.currentUser) return;

        this.dataUnsubscribe = subscribeToUserData(this.currentUser.uid, (data) => {
            if (data) {
                this.familyMembers = data.familyMembers || [{ 
                    id: 1, 
                    name: '', 
                    birthYear: new Date().getFullYear() - 30,
                    relation: 'Self',
                    currentSalary: 0,
                    yearStartedWorking: null,
                    retirementAge: 67,
                    ssCollectionAge: 67
                }];
                this.incomes = data.incomes || [];
                this.expenses = data.expenses || [];
            }
            this.render();
        });
    }

    async saveData() {
        if (!this.currentUser) return;
        
        await saveUserData(this.currentUser.uid, {
            familyMembers: this.familyMembers,
            incomes: this.incomes,
            expenses: this.expenses
        });
    }

    async handleSignup(email, password) {
        const result = await signup(email, password);
        if (!result.success) {
            alert(result.error);
        }
    }

    async handleLogin(email, password) {
        const result = await login(email, password);
        if (!result.success) {
            alert(result.error);
        }
    }

    async handleLogout() {
        if (this.dataUnsubscribe) {
            this.dataUnsubscribe();
        }
        await logout();
    }

    // Family Members
    addFamilyMember() {
    this.familyMembers.push({ 
        id: Date.now(), 
        name: '', 
        dateOfBirth: '',
        birthYear: new Date().getFullYear() - 30,
        relation: 'Spouse',
        currentSalary: 0,
        yearStartedWorking: null,
        retirementAge: 67,
        ssCollectionAge: 67
    });
    this.saveData();
}


    updateFamilyMember(id, field, value) {
        this.familyMembers = this.familyMembers.map(m => 
            m.id === id ? { ...m, [field]: value } : m
        );
        this.saveData();
    }
    
updateBirthYear(id, dateOfBirth) {
    if (dateOfBirth) {
        const birthYear = new Date(dateOfBirth).getFullYear();
        this.familyMembers = this.familyMembers.map(m => 
            m.id === id ? { ...m, birthYear, dateOfBirth } : m
        );
        this.saveData();
    }
}

    removeFamilyMember(id) {
        this.familyMembers = this.familyMembers.filter(m => m.id !== id);
        this.saveData();
    }

    // Income
    addIncome() {
        this.incomes.push({ id: Date.now(), type: 'Salary', person: '', amount: 0 });
        this.saveData();
    }

    updateIncome(id, field, value) {
        this.incomes = this.incomes.map(i => 
            i.id === id ? { ...i, [field]: value } : i
        );
        this.saveData();
    }

    removeIncome(id) {
        this.incomes = this.incomes.filter(i => i.id !== id);
        this.saveData();
    }

    // Expenses
    addExpense() {
        this.expenses.push({ id: Date.now(), category: 'Living', name: '', amount: 0, frequency: 'Monthly' });
        this.saveData();
    }

    updateExpense(id, field, value) {
        this.expenses = this.expenses.map(e => 
            e.id === id ? { ...e, [field]: value } : e
        );
        this.saveData();
    }

    removeExpense(id) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.saveData();
    }

    // UI Methods
    switchTab(tabId) {
        this.currentTab = tabId;
        this.render();
    }

    switchAuthTab(tab) {
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const buttonText = document.getElementById('auth-button-text');

        if (tab === 'login') {
            loginTab.className = 'flex-1 py-2 px-4 text-center font-medium border-b-2 border-blue-600 text-blue-600';
            signupTab.className = 'flex-1 py-2 px-4 text-center font-medium text-gray-600 hover:text-gray-800';
            buttonText.textContent = 'Login';
            this.authMode = 'login';
        } else {
            signupTab.className = 'flex-1 py-2 px-4 text-center font-medium border-b-2 border-blue-600 text-blue-600';
            loginTab.className = 'flex-1 py-2 px-4 text-center font-medium text-gray-600 hover:text-gray-800';
            buttonText.textContent = 'Sign Up';
            this.authMode = 'signup';
        }
    }

    handleAuthSubmit(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (this.authMode === 'signup') {
            this.handleSignup(email, password);
        } else {
            this.handleLogin(email, password);
        }
        return false;
    }

    render() {
        const root = document.getElementById('root');
        if (this.currentView === 'login') {
            root.innerHTML = this.renderLoginView();
            this.authMode = 'login';
        } else {
            root.innerHTML = this.renderAppView();
        }
    }

    renderLoginView() {
        return `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">Retirement Planner</h1>
                        <p class="text-gray-600">Plan your financial future</p>
                    </div>
                    
                    <div id="auth-tabs" class="flex border-b border-gray-200 mb-6">
                        <button onclick="app.switchAuthTab('login')" id="login-tab" class="flex-1 py-2 px-4 text-center font-medium border-b-2 border-blue-600 text-blue-600">
                            Login
                        </button>
                        <button onclick="app.switchAuthTab('signup')" id="signup-tab" class="flex-1 py-2 px-4 text-center font-medium text-gray-600 hover:text-gray-800">
                            Sign Up
                        </button>
                    </div>

                    <form id="auth-form" onsubmit="return app.handleAuthSubmit(event)">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" id="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            <span id="auth-button-text">Login</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    renderAppView() {
        const totalIncome = this.incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        const totalExpenses = this.expenses.reduce((sum, e) => {
            const amount = parseFloat(e.amount) || 0;
            return sum + (e.frequency === 'Monthly' ? amount * 12 : amount);
        }, 0);
        const surplus = totalIncome - totalExpenses;

        return `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div class="max-w-7xl mx-auto">
                    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h1 class="text-3xl font-bold mb-2">Retirement Planning Dashboard</h1>
                                    <p class="text-blue-100">Logged in as: ${this.currentUser.email}</p>
                                </div>
                                <button onclick="app.handleLogout()" class="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div class="border-b border-gray-200 bg-gray-50 flex overflow-x-auto">
                            ${['family', 'income', 'expenses', 'projection'].map(tab => `
                                <button onclick="app.switchTab('${tab}')" class="px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                                    this.currentTab === tab ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-600 hover:text-gray-900'
                                }">
                                    ${tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            `).join('')}
                        </div>

                        <div class="p-6">
                            ${this.currentTab === 'family' ? this.renderFamily() : ''}
                            ${this.currentTab === 'income' ? this.renderIncome() : ''}
                            ${this.currentTab === 'expenses' ? this.renderExpenses() : ''}
                            ${this.currentTab === 'projection' ? this.renderProjection(totalIncome, totalExpenses, surplus) : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFamily() {
    const currentYear = new Date().getFullYear();
    
    return `
        <div>
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Family Members</h2>
                <button onclick="app.addFamilyMember()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Member</button>
            </div>
            ${this.familyMembers.map(m => {
                const age = currentYear - (m.birthYear || currentYear);
                const birthDate = m.dateOfBirth || '';
                
                // Calculate age from date of birth if available
                let calculatedAge = age;
                if (m.dateOfBirth) {
                    const birth = new Date(m.dateOfBirth);
                    const today = new Date();
                    calculatedAge = today.getFullYear() - birth.getFullYear();
                    const monthDiff = today.getMonth() - birth.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                        calculatedAge--;
                    }
                }
                
                return `
                    <div class="bg-gray-50 p-6 rounded-lg mb-4">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" value="${m.name || ''}" 
                                    onchange="app.updateFamilyMember(${m.id}, 'name', this.value)" 
                                    placeholder="Enter name" 
                                    class="w-full px-3 py-2 border rounded">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input type="date" value="${birthDate}" 
                                    onchange="app.updateFamilyMember(${m.id}, 'dateOfBirth', this.value); app.updateBirthYear(${m.id}, this.value)" 
                                    class="w-full px-3 py-2 border rounded">
                                <p class="text-xs text-gray-500 mt-1">Age: ${calculatedAge}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                                <select 
                                    onchange="app.updateFamilyMember(${m.id}, 'relation', this.value)" 
                                    class="w-full px-3 py-2 border rounded">
                                    <option value="Self" ${m.relation === 'Self' ? 'selected' : ''}>Self</option>
                                    <option value="Spouse" ${m.relation === 'Spouse' ? 'selected' : ''}>Spouse</option>
                                    <option value="Child" ${m.relation === 'Child' ? 'selected' : ''}>Child</option>
                                    <option value="Other" ${m.relation === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                ${this.familyMembers.length > 1 ? `
                                    <button onclick="app.removeFamilyMember(${m.id})" class="w-full bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100">
                                        🗑️ Remove
                                    </button>
                                ` : '<div></div>'}
                            </div>
                        </div>
                        
                        ${m.relation === 'Self' || m.relation === 'Spouse' ? `
                            <div class="border-t pt-4 mt-4">
                                <h3 class="font-semibold text-gray-700 mb-3">💼 Work & Retirement Planning</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Current Annual Salary ($)</label>
                                        <input type="number" value="${m.currentSalary || 0}" 
                                            onchange="app.updateFamilyMember(${m.id}, 'currentSalary', parseFloat(this.value)||0)" 
                                            placeholder="75000" 
                                            class="w-full px-3 py-2 border rounded">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Year Started Working</label>
                                        <input type="number" value="${m.yearStartedWorking || ''}" 
                                            onchange="app.updateFamilyMember(${m.id}, 'yearStartedWorking', parseInt(this.value)||null)" 
                                            placeholder="2005" 
                                            class="w-full px-3 py-2 border rounded">
                                        ${m.yearStartedWorking ? `<p class="text-xs text-gray-500 mt-1">Years worked: ${currentYear - m.yearStartedWorking}</p>` : ''}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Desired Retirement Age</label>
                                        <input type="number" value="${m.retirementAge || 67}" 
                                            onchange="app.updateFamilyMember(${m.id}, 'retirementAge', parseInt(this.value)||67)" 
                                            placeholder="67" 
                                            min="55" max="75"
                                            class="w-full px-3 py-2 border rounded">
                                        <p class="text-xs text-gray-500 mt-1">Retirement year: ${(m.birthYear || currentYear) + (m.retirementAge || 67)}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Social Security Collection Age</label>
                                        <input type="number" value="${m.ssCollectionAge || 67}" 
                                            onchange="app.updateFamilyMember(${m.id}, 'ssCollectionAge', parseInt(this.value)||67)" 
                                            placeholder="67" 
                                            min="62" max="70"
                                            class="w-full px-3 py-2 border rounded">
                                        <p class="text-xs text-gray-500 mt-1">Start collecting: ${(m.birthYear || currentYear) + (m.ssCollectionAge || 67)}</p>
                                    </div>
                                </div>
                                ${m.ssCollectionAge && m.ssCollectionAge !== 67 ? `
                                    <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                        <p class="text-sm text-yellow-800">
                                            ${m.ssCollectionAge < 67 
                                                ? `⚠️ Collecting before age 67 will reduce your monthly benefit by approximately ${Math.round(((67 - m.ssCollectionAge) / 12) * 0.00555556 * 100)}%` 
                                                : `✓ Collecting after age 67 will increase your monthly benefit by approximately ${Math.round(((m.ssCollectionAge - 67) / 12) * 0.00666667 * 100)}%`
                                            }
                                        </p>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}


    renderIncome() {
        return `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Income Sources</h2>
                    <button onclick="app.addIncome()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Income</button>
                </div>
                ${this.incomes.length === 0 ? '<p class="text-gray-500 text-center py-8">No income sources yet</p>' : ''}
                ${this.incomes.map(i => `
                    <div class="bg-gray-50 p-4 rounded-lg mb-4 flex gap-4">
                        <div class="flex-1 grid grid-cols-3 gap-4">
                            <select value="${i.type}" onchange="app.updateIncome(${i.id}, 'type', this.value)" class="px-3 py-2 border rounded">
                                <option>Salary</option><option>Social Security</option><option>Pension</option><option>Business</option><option>Other</option>
                            </select>
                            <select value="${i.person}" onchange="app.updateIncome(${i.id}, 'person', this.value)" class="px-3 py-2 border rounded">
                                <option value="">Select...</option>
                                ${this.familyMembers.map(m => `<option value="${m.name}">${m.name||'Unnamed'}</option>`).join('')}
                            </select>
                            <input type="number" value="${i.amount}" onchange="app.updateIncome(${i.id}, 'amount', parseFloat(this.value)||0)" placeholder="Amount" class="px-3 py-2 border rounded">
                        </div>
                        <button onclick="app.removeIncome(${i.id})" class="text-red-600">🗑️</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderExpenses() {
        return `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Expenses</h2>
                    <button onclick="app.addExpense()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Expense</button>
                </div>
                ${this.expenses.length === 0 ? '<p class="text-gray-500 text-center py-8">No expenses yet</p>' : ''}
                ${this.expenses.map(e => `
                    <div class="bg-gray-50 p-4 rounded-lg mb-4 flex gap-4">
                        <div class="flex-1 grid grid-cols-3 gap-4">
                            <select value="${e.category}" onchange="app.updateExpense(${e.id}, 'category', this.value)" class="px-3 py-2 border rounded">
                                <option>Living</option><option>Healthcare</option><option>Education</option><option>Travel</option><option>Entertainment</option>
                            </select>
                            <input type="text" value="${e.name}" onchange="app.updateExpense(${e.id}, 'name', this.value)" placeholder="Name" class="px-3 py-2 border rounded">
                            <input type="number" value="${e.amount}" onchange="app.updateExpense(${e.id}, 'amount', parseFloat(this.value)||0)" placeholder="Amount" class="px-3 py-2 border rounded">
                        </div>
                        <button onclick="app.removeExpense(${e.id})" class="text-red-600">🗑️</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProjection(income, expenses, surplus) {
        // Calculate Social Security
        const ssData = calculateHouseholdSS(this.familyMembers);
        
        return `
            <div>
                <h2 class="text-2xl font-bold mb-6">Financial Projection</h2>
                
                <!-- Current Annual Summary -->
                <div class="grid grid-cols-3 gap-4 mb-8">
                    <div class="bg-blue-50 p-6 rounded-lg">
                        <p class="text-sm text-gray-600">Total Annual Income</p>
                        <p class="text-3xl font-bold text-blue-600">$${income.toLocaleString()}</p>
                    </div>
                    <div class="bg-red-50 p-6 rounded-lg">
                        <p class="text-sm text-gray-600">Total Annual Expenses</p>
                        <p class="text-3xl font-bold text-red-600">$${expenses.toLocaleString()}</p>
                    </div>
                    <div class="${surplus >= 0 ? 'bg-green-50' : 'bg-orange-50'} p-6 rounded-lg">
                        <p class="text-sm text-gray-600">Annual Surplus/Deficit</p>
                        <p class="text-3xl font-bold ${surplus >= 0 ? 'text-green-600' : 'text-orange-600'}">$${surplus.toLocaleString()}</p>
                    </div>
                </div>
                
                <!-- Social Security Projections -->
                <div class="bg-white border-2 border-blue-200 rounded-lg p-6 mb-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">💰 Social Security Projections</h3>
                    ${ssData.members.length > 0 ? `
                        <div class="space-y-4">
                            ${ssData.members.map(member => `
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 class="font-semibold text-gray-800">${member.name || 'Unnamed'} (${member.relation})</h4>
                                            <p class="text-sm text-gray-600">Collecting at age ${member.collectionAge}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-2xl font-bold text-blue-600">$${member.monthlyBenefit.toLocaleString()}<span class="text-sm">/mo</span></p>
                                            <p class="text-sm text-gray-600">$${member.annualBenefit.toLocaleString()}/year</p>
                                        </div>
                                    </div>
                                    ${member.spousalBenefit ? `
                                        <p class="text-xs text-green-600 mt-2">✓ Includes $${member.spousalBenefit.toLocaleString()}/mo spousal benefit</p>
                                    ` : ''}
                                </div>
                            `).join('')}
                            <div class="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                                <div class="flex justify-between items-center">
                                    <h4 class="font-semibold text-gray-800">Total Household Social Security</h4>
                                    <div class="text-right">
                                        <p class="text-2xl font-bold text-green-600">$${ssData.totalMonthly.toLocaleString()}<span class="text-sm">/mo</span></p>
                                        <p class="text-sm text-gray-600">$${ssData.totalAnnual.toLocaleString()}/year</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <p class="text-gray-500 text-center py-4">Add salary information to family members to see Social Security projections</p>
                    `}
                </div>
                
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">📋 About These Projections</h3>
                    <p class="text-sm text-gray-600 mb-2">Social Security estimates are based on current salary and assume it represents your career average. Actual benefits may vary based on your complete earnings history.</p>
                    <p class="text-sm text-gray-600"><strong>Important:</strong> These are estimates only. For accurate benefit information, check your official Social Security statement at <a href="https://www.ssa.gov/myaccount" target="_blank" class="text-blue-600 underline">ssa.gov/myaccount</a></p>
                </div>
            </div>
        `;
    }
}

// Initialize app
window.app = new RetirementApp();
