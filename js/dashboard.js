// Apple-Inspired Dashboard Module
import { formatCurrency, calculateAge, formatPercent } from './utils.js';
import { incomes } from './income.js';
import { expenses } from './expenses.js';
import { investments } from './investments.js';
import { retirementAccounts } from './retirement401k.js';
import { ssRecords } from './socialSecurity.js';

let marketData = {
    dow: { value: 43520.15, change: 145.32, changePercent: 0.34 },
    nasdaq: { value: 19280.45, change: -28.67, changePercent: -0.15 },
    sp500: { value: 5892.18, change: 22.45, changePercent: 0.38 }
};

let watchlistStocks = [];

export function initDashboard() {
    window.addEventListener('userLoggedIn', () => {
        loadWatchlist();
        renderDashboard();
    });
}

export function renderDashboard() {
    const container = document.getElementById('dashboard');
    if (!container) return;
    
    const isMobile = window.innerWidth < 768;
    
    container.innerHTML = `
        <!-- Welcome Section -->
        <div style="margin-bottom: 32px;">
            <h2 style="font-size: ${isMobile ? '28px' : '34px'}; font-weight: 700; letter-spacing: -0.6px; margin-bottom: 8px;">
                Good ${getTimeOfDay()} 👋
            </h2>
            <p style="font-size: ${isMobile ? '15px' : '17px'}; color: var(--text-secondary);">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
        </div>

        <!-- Net Worth Summary Card -->
        <div class="card" style="background: linear-gradient(135deg, var(--apple-blue) 0%, var(--apple-purple) 100%); color: white; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                    <p style="font-size: 15px; opacity: 0.9; margin-bottom: 8px; font-weight: 600;">Total Net Worth</p>
                    <p id="totalNetWorth" style="font-size: ${isMobile ? '40px' : '48px'}; font-weight: 700; letter-spacing: -1.5px; line-height: 1;">$0</p>
                </div>
                <div style="background: rgba(255,255,255,0.2); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    💰
                </div>
            </div>
            <div id="netWorthChange" style="font-size: 15px; font-weight: 600; opacity: 0.95;"></div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-label">Investments</span>
                    <div class="stat-icon" style="background: rgba(0, 122, 255, 0.1);">
                        <span style="color: var(--apple-blue);">📊</span>
                    </div>
                </div>
                <div class="stat-value" id="investmentTotal" style="color: var(--text-primary);">$0</div>
                <div class="stat-change" id="investmentChange">—</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-label">Retirement</span>
                    <div class="stat-icon" style="background: rgba(175, 82, 222, 0.1);">
                        <span style="color: var(--apple-purple);">🏦</span>
                    </div>
                </div>
                <div class="stat-value" id="retirementTotal" style="color: var(--text-primary);">$0</div>
                <div class="stat-change" id="retirementChange">—</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-label">Monthly Income</span>
                    <div class="stat-icon" style="background: rgba(52, 199, 89, 0.1);">
                        <span style="color: var(--apple-green);">💵</span>
                    </div>
                </div>
                <div class="stat-value" id="monthlyIncome" style="color: var(--text-primary);">$0</div>
                <div class="stat-change positive" id="incomeChange">—</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-label">Cash Flow</span>
                    <div class="stat-icon" style="background: rgba(255, 204, 0, 0.1);">
                        <span style="color: var(--apple-yellow);">💳</span>
                    </div>
                </div>
                <div class="stat-value" id="monthlyCashFlow" style="color: var(--text-primary);">$0</div>
                <div class="stat-change" id="cashFlowChange">—</div>
            </div>
        </div>

        <!-- Market Overview -->
        <div class="card">
            <h3 class="card-title">Market Overview</h3>
            <div class="market-grid">
                <div class="market-card">
                    <div class="market-label">Dow Jones</div>
                    <div class="market-value" id="dowValue">—</div>
                    <div class="market-change" id="dowChange">—</div>
                </div>
                <div class="market-card">
                    <div class="market-label">NASDAQ</div>
                    <div class="market-value" id="nasdaqValue">—</div>
                    <div class="market-change" id="nasdaqChange">—</div>
                </div>
                <div class="market-card">
                    <div class="market-label">S&P 500</div>
                    <div class="market-value" id="sp500Value">—</div>
                    <div class="market-change" id="sp500Change">—</div>
                </div>
            </div>
        </div>

        <!-- Watchlist -->
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 class="card-title" style="margin: 0;">Watchlist</h3>
                <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 15px;" onclick="showAddWatchlistForm()">+ Add</button>
            </div>
            <div id="watchlistContent"></div>
        </div>

        <!-- Add Watchlist Form -->
        <div id="addWatchlistForm" class="card hidden">
            <h3 class="card-title">Add to Watchlist</h3>
            <div class="form-group">
                <label class="form-label">Stock Symbol</label>
                <input type="text" class="form-input" id="watchlistSymbol" placeholder="AAPL, MSFT, VOO..." style="text-transform: uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label">Shares Owned (optional)</label>
                <input type="number" class="form-input" id="watchlistShares" step="0.01" placeholder="0">
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary" onclick="addToWatchlist()" style="flex: 1;">Add</button>
                <button class="btn btn-secondary" onclick="hideAddWatchlistForm()">Cancel</button>
            </div>
        </div>

        <!-- Retirement Readiness -->
        <div class="card" id="retirementReadinessCard"></div>

        <!-- Quick Actions -->
        <div class="card">
            <h3 class="card-title">Quick Actions</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(${isMobile ? '140px' : '160px'}, 1fr)); gap: 12px;">
                <button class="btn btn-secondary" onclick="showPage('income')" style="flex-direction: column; gap: 8px; padding: 16px;">
                    <span style="font-size: 28px;">💼</span>
                    <span style="font-size: 15px;">Add Income</span>
                </button>
                <button class="btn btn-secondary" onclick="showPage('expenses')" style="flex-direction: column; gap: 8px; padding: 16px;">
                    <span style="font-size: 28px;">🛒</span>
                    <span style="font-size: 15px;">Add Expense</span>
                </button>
                <button class="btn btn-secondary" onclick="showPage('investments')" style="flex-direction: column; gap: 8px; padding: 16px;">
                    <span style="font-size: 28px;">📈</span>
                    <span style="font-size: 15px;">Add Investment</span>
                </button>
                <button class="btn btn-secondary" onclick="showPage('retirement401k')" style="flex-direction: column; gap: 8px; padding: 16px;">
                    <span style="font-size: 28px;">🏦</span>
                    <span style="font-size: 15px;">Add 401(k)</span>
                </button>
            </div>
        </div>
    `;
    
    updateMarketDisplay();
    renderNetWorthSummary();
    renderWatchlist();
    renderRetirementReadiness();
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
}

function updateMarketDisplay() {
    // Dow
    document.getElementById('dowValue').textContent = marketData.dow.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const dowChange = document.getElementById('dowChange');
    dowChange.textContent = `${marketData.dow.change > 0 ? '+' : ''}${marketData.dow.change.toFixed(2)} (${marketData.dow.changePercent > 0 ? '+' : ''}${marketData.dow.changePercent.toFixed(2)}%)`;
    dowChange.style.color = marketData.dow.change >= 0 ? 'var(--apple-green)' : 'var(--apple-red)';
    dowChange.style.background = marketData.dow.change >= 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)';
    
    // NASDAQ
    document.getElementById('nasdaqValue').textContent = marketData.nasdaq.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const nasdaqChange = document.getElementById('nasdaqChange');
    nasdaqChange.textContent = `${marketData.nasdaq.change > 0 ? '+' : ''}${marketData.nasdaq.change.toFixed(2)} (${marketData.nasdaq.changePercent > 0 ? '+' : ''}${marketData.nasdaq.changePercent.toFixed(2)}%)`;
    nasdaqChange.style.color = marketData.nasdaq.change >= 0 ? 'var(--apple-green)' : 'var(--apple-red)';
    nasdaqChange.style.background = marketData.nasdaq.change >= 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)';
    
    // S&P 500
    document.getElementById('sp500Value').textContent = marketData.sp500.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const sp500Change = document.getElementById('sp500Change');
    sp500Change.textContent = `${marketData.sp500.change > 0 ? '+' : ''}${marketData.sp500.change.toFixed(2)} (${marketData.sp500.changePercent > 0 ? '+' : ''}${marketData.sp500.changePercent.toFixed(2)}%)`;
    sp500Change.style.color = marketData.sp500.change >= 0 ? 'var(--apple-green)' : 'var(--apple-red)';
    sp500Change.style.background = marketData.sp500.change >= 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)';
}

async function loadWatchlist() {
    const userId = window.getUserId ? window.getUserId() : null;
    if (!userId) return;
    
    try {
        const { database } = await import('./config.js').then(m => ({ database: firebase.database() }));
        const snapshot = await database.ref(`users/${userId}/watchlist`).once('value');
        watchlistStocks = [];
        
        snapshot.forEach(child => {
            watchlistStocks.push({
                id: child.key,
                ...child.val()
            });
        });
        
        renderWatchlist();
    } catch (error) {
        console.error('Error loading watchlist:', error);
    }
}

window.showAddWatchlistForm = function() {
    document.getElementById('addWatchlistForm').classList.remove('hidden');
};

window.hideAddWatchlistForm = function() {
    document.getElementById('addWatchlistForm').classList.add('hidden');
    document.getElementById('watchlistSymbol').value = '';
    document.getElementById('watchlistShares').value = '';
};

window.addToWatchlist = async function() {
    const symbol = document.getElementById('watchlistSymbol').value.toUpperCase().trim();
    const shares = parseFloat(document.getElementById('watchlistShares').value) || 0;
    
    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }
    
    const userId = window.getUserId ? window.getUserId() : null;
    if (!userId) return;
    
    try {
        const { database } = await import('./config.js').then(m => ({ database: firebase.database() }));
        const watchlistId = Date.now().toString();
        
        await database.ref(`users/${userId}/watchlist/${watchlistId}`).set({
            symbol,
            shares,
            addedDate: new Date().toISOString()
        });
        
        await loadWatchlist();
        window.hideAddWatchlistForm();
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        alert('Error adding to watchlist');
    }
};

window.deleteFromWatchlist = async function(id) {
    if (!confirm('Remove from watchlist?')) return;
    
    const userId = window.getUserId ? window.getUserId() : null;
    if (!userId) return;
    
    try {
        const { database } = await import('./config.js').then(m => ({ database: firebase.database() }));
        await database.ref(`users/${userId}/watchlist/${id}`).remove();
        await loadWatchlist();
    } catch (error) {
        console.error('Error deleting from watchlist:', error);
    }
};

function renderWatchlist() {
    const container = document.getElementById('watchlistContent');
    if (!container) return;
    
    if (watchlistStocks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 32px 16px; font-size: 15px;">No stocks in watchlist yet.<br>Tap + Add to start tracking.</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 12px;">';
    
    watchlistStocks.forEach(stock => {
        const currentPrice = Math.random() * 500 + 50;
        const change = (Math.random() - 0.5) * 10;
        const changePercent = (change / currentPrice) * 100;
        const value = stock.shares * currentPrice;
        
        html += `
            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">${stock.symbol}</div>
                    ${stock.shares > 0 ? `<div style="font-size: 13px; color: var(--text-tertiary);">${stock.shares} shares</div>` : ''}
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">${formatCurrency(currentPrice)}</div>
                    <div style="font-size: 13px; font-weight: 600; color: ${change >= 0 ? 'var(--apple-green)' : 'var(--apple-red)'};">
                        ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
                    </div>
                    ${stock.shares > 0 ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${formatCurrency(value)}</div>` : ''}
                </div>
                <button onclick="deleteFromWatchlist('${stock.id}')" style="background: none; border: none; color: var(--apple-red); font-size: 20px; cursor: pointer; padding: 8px; margin-left: 8px;">×</button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderNetWorthSummary() {
    const investmentTotal = investments.reduce((sum, inv) => sum + inv.value, 0);
    const retirementTotal = retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalNetWorth = investmentTotal + retirementTotal;
    
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.annualAmount, 0);
    const monthlyCashFlow = (totalIncome - totalExpenses) / 12;
    const monthlyIncome = totalIncome / 12;
    
    document.getElementById('totalNetWorth').textContent = formatCurrency(totalNetWorth);
    document.getElementById('investmentTotal').textContent = formatCurrency(investmentTotal);
    document.getElementById('retirementTotal').textContent = formatCurrency(retirementTotal);
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('monthlyCashFlow').textContent = formatCurrency(monthlyCashFlow);
    
    // Update change indicators
    const cashFlowChange = document.getElementById('cashFlowChange');
    if (monthlyCashFlow >= 0) {
        cashFlowChange.textContent = '+' + formatCurrency(monthlyCashFlow);
        cashFlowChange.className = 'stat-change positive';
    } else {
        cashFlowChange.textContent = formatCurrency(monthlyCashFlow);
        cashFlowChange.className = 'stat-change negative';
    }
}

function renderRetirementReadiness() {
    const container = document.getElementById('retirementReadinessCard');
    if (!container) return;
    
    const retirementTotal = retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const ssAnnual = ssRecords.reduce((sum, rec) => sum + rec.annualBenefit, 0);
    const annualExpenses = expenses.reduce((sum, exp) => sum + exp.annualAmount, 0);
    
    const safeWithdrawal = retirementTotal * 0.04;
    const totalRetirementIncome = safeWithdrawal + ssAnnual;
    const incomeReplacement = annualExpenses > 0 ? (totalRetirementIncome / annualExpenses) * 100 : 0;
    
    const scoreColor = incomeReplacement >= 100 ? 'var(--apple-green)' : incomeReplacement >= 80 ? 'var(--apple-orange)' : 'var(--apple-red)';
    const scoreLabel = incomeReplacement >= 100 ? 'On Track' : incomeReplacement >= 80 ? 'Almost There' : 'Needs Attention';
    
    container.innerHTML = `
        <h3 class="card-title">Retirement Readiness</h3>
        <div style="display: flex; align-items: center; gap: 24px; margin: 24px 0;">
            <div style="width: 120px; height: 120px; border-radius: 60px; background: ${scoreColor}20; border: 4px solid ${scoreColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
                <div style="font-size: 36px; font-weight: 700; color: ${scoreColor};">${Math.round(incomeReplacement)}%</div>
                <div style="font-size: 12px; font-weight: 600; color: ${scoreColor}; opacity: 0.8;">${scoreLabel}</div>
            </div>
            <div style="flex: 1;">
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">Projected Income</div>
                    <div style="font-size: 20px; font-weight: 700;">${formatCurrency(totalRetirementIncome)}/year</div>
                </div>
                <div style="font-size: 13px; color: var(--text-tertiary); line-height: 1.5;">
                    Based on 4% withdrawal rule + Social Security
                </div>
            </div>
        </div>
    `;
}

initDashboard();
