// Enhanced Professional Dashboard Module
import { formatCurrency, calculateAge, formatPercent } from './utils.js';
import { incomes } from './income.js';
import { expenses } from './expenses.js';
import { investments } from './investments.js';
import { retirementAccounts } from './retirement401k.js';
import { ssRecords } from './socialSecurity.js';

let marketData = {
    dow: { value: 0, change: 0, changePercent: 0 },
    nasdaq: { value: 0, change: 0, changePercent: 0 },
    sp500: { value: 0, change: 0, changePercent: 0 }
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
    
    container.innerHTML = `
        <div class="professional-header">
            <h2>Financial Dashboard</h2>
            <div class="dashboard-date">${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
        </div>

        <!-- Market Overview Section -->
        <div class="market-section">
            <h3 style="margin-bottom: 20px; color: #333;">
                <span style="font-size: 24px;">📈</span> Market Overview
            </h3>
            <div class="market-grid">
                <div class="market-card dow-card">
                    <div class="market-label">Dow Jones</div>
                    <div class="market-value" id="dowValue">Loading...</div>
                    <div class="market-change" id="dowChange">—</div>
                </div>
                <div class="market-card nasdaq-card">
                    <div class="market-label">NASDAQ</div>
                    <div class="market-value" id="nasdaqValue">Loading...</div>
                    <div class="market-change" id="nasdaqChange">—</div>
                </div>
                <div class="market-card sp500-card">
                    <div class="market-label">S&P 500</div>
                    <div class="market-value" id="sp500Value">Loading...</div>
                    <div class="market-change" id="sp500Change">—</div>
                </div>
            </div>
        </div>

        <!-- Watchlist Section -->
        <div class="card watchlist-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">
                    <span style="font-size: 24px;">👁️</span> My Investment Watchlist
                </h3>
                <button class="btn btn-small" onclick="showAddWatchlistForm()">+ Add Stock</button>
            </div>
            <div id="watchlistContent"></div>
        </div>

        <!-- Add Watchlist Form -->
        <div id="addWatchlistForm" class="card hidden">
            <h3>Add to Watchlist</h3>
            <div class="form-group">
                <label>Stock Symbol (e.g., AAPL, MSFT, VOO)</label>
                <input type="text" id="watchlistSymbol" placeholder="Enter ticker symbol" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
                <label>Shares Owned (optional)</label>
                <input type="number" id="watchlistShares" step="0.01" placeholder="Number of shares">
            </div>
            <button class="btn" onclick="addToWatchlist()">Add to Watchlist</button>
            <button class="btn btn-secondary" onclick="hideAddWatchlistForm()">Cancel</button>
            <div id="watchlistMessage" class="hidden"></div>
        </div>

        <!-- Net Worth Summary -->
        <div class="dashboard-grid">
            <div class="stat-card primary-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <div class="stat-label">Total Net Worth</div>
                    <div class="stat-value" id="totalNetWorth">$0</div>
                    <div class="stat-sublabel">All Assets Combined</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-label">Investment Accounts</div>
                    <div class="stat-value" id="investmentTotal">$0</div>
                    <div class="stat-sublabel" id="investmentCount">0 accounts</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">🏦</div>
                <div class="stat-content">
                    <div class="stat-label">Retirement Accounts</div>
                    <div class="stat-value" id="retirementTotal">$0</div>
                    <div class="stat-sublabel" id="retirementCount">0 accounts</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💵</div>
                <div class="stat-content">
                    <div class="stat-label">Monthly Cash Flow</div>
                    <div class="stat-value" id="monthlyCashFlow">$0</div>
                    <div class="stat-sublabel" id="cashFlowStatus">—</div>
                </div>
            </div>
        </div>

        <!-- Retirement Readiness -->
        <div class="card readiness-card">
            <h3>
                <span style="font-size: 24px;">🎯</span> Retirement Readiness Score
            </h3>
            <div id="retirementReadinessContent"></div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
            <h3 style="margin-bottom: 20px;">⚡ Quick Actions</h3>
            <div class="quick-actions-grid">
                <button class="action-btn" onclick="showPage('family')">
                    <span class="action-icon">👥</span>
                    <span>Add Family</span>
                </button>
                <button class="action-btn" onclick="showPage('income')">
                    <span class="action-icon">💼</span>
                    <span>Add Income</span>
                </button>
                <button class="action-btn" onclick="showPage('expenses')">
                    <span class="action-icon">🛒</span>
                    <span>Add Expense</span>
                </button>
                <button class="action-btn" onclick="showPage('investments')">
                    <span class="action-icon">📈</span>
                    <span>Add Investment</span>
                </button>
                <button class="action-btn" onclick="showPage('retirement401k')">
                    <span class="action-icon">🏦</span>
                    <span>Add 401(k)</span>
                </button>
                <button class="action-btn" onclick="showPage('socialSecurity')">
                    <span class="action-icon">🎓</span>
                    <span>Add SS Benefit</span>
                </button>
            </div>
        </div>
    `;
    
    // Fetch market data
    fetchMarketData();
    
    // Render all sections
    renderNetWorthSummary();
    renderRetirementReadiness();
    renderWatchlist();
}

// Fetch real-time market data
async function fetchMarketData() {
    // Using Yahoo Finance API alternative or fallback to static data
    try {
        // For demo purposes, using approximate values
        // In production, you'd use a real API like Alpha Vantage, Finnhub, or Yahoo Finance
        
        // Simulating market data (you'll replace this with actual API calls)
        marketData = {
            dow: { value: 43500.12, change: 125.45, changePercent: 0.29 },
            nasdaq: { value: 19250.78, change: -45.23, changePercent: -0.23 },
            sp500: { value: 5875.34, change: 18.91, changePercent: 0.32 }
        };
        
        updateMarketDisplay();
    } catch (error) {
        console.error('Error fetching market data:', error);
        document.getElementById('dowValue').textContent = 'N/A';
        document.getElementById('nasdaqValue').textContent = 'N/A';
        document.getElementById('sp500Value').textContent = 'N/A';
    }
}

function updateMarketDisplay() {
    // Dow Jones
    document.getElementById('dowValue').textContent = marketData.dow.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const dowChange = document.getElementById('dowChange');
    dowChange.textContent = `${marketData.dow.change > 0 ? '+' : ''}${marketData.dow.change.toFixed(2)} (${marketData.dow.changePercent > 0 ? '+' : ''}${marketData.dow.changePercent.toFixed(2)}%)`;
    dowChange.className = `market-change ${marketData.dow.change >= 0 ? 'positive' : 'negative'}`;
    
    // NASDAQ
    document.getElementById('nasdaqValue').textContent = marketData.nasdaq.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const nasdaqChange = document.getElementById('nasdaqChange');
    nasdaqChange.textContent = `${marketData.nasdaq.change > 0 ? '+' : ''}${marketData.nasdaq.change.toFixed(2)} (${marketData.nasdaq.changePercent > 0 ? '+' : ''}${marketData.nasdaq.changePercent.toFixed(2)}%)`;
    nasdaqChange.className = `market-change ${marketData.nasdaq.change >= 0 ? 'positive' : 'negative'}`;
    
    // S&P 500
    document.getElementById('sp500Value').textContent = marketData.sp500.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const sp500Change = document.getElementById('sp500Change');
    sp500Change.textContent = `${marketData.sp500.change > 0 ? '+' : ''}${marketData.sp500.change.toFixed(2)} (${marketData.sp500.changePercent > 0 ? '+' : ''}${marketData.sp500.changePercent.toFixed(2)}%)`;
    sp500Change.className = `market-change ${marketData.sp500.change >= 0 ? 'positive' : 'negative'}`;
}

// Watchlist functions
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
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No stocks in watchlist. Click "+ Add Stock" to start tracking.</p>';
        return;
    }
    
    let html = '<div class="watchlist-grid">';
    
    watchlistStocks.forEach(stock => {
        // Mock price data - in production, fetch from API
        const currentPrice = Math.random() * 500 + 50;
        const change = (Math.random() - 0.5) * 10;
        const changePercent = (change / currentPrice) * 100;
        const value = stock.shares * currentPrice;
        
        html += `
            <div class="watchlist-item">
                <div class="watchlist-header">
                    <div>
                        <div class="watchlist-symbol">${stock.symbol}</div>
                        ${stock.shares > 0 ? `<div class="watchlist-shares">${stock.shares} shares</div>` : ''}
                    </div>
                    <button class="btn-icon" onclick="deleteFromWatchlist('${stock.id}')" title="Remove">✕</button>
                </div>
                <div class="watchlist-price">${formatCurrency(currentPrice)}</div>
                <div class="watchlist-change ${change >= 0 ? 'positive' : 'negative'}">
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
                </div>
                ${stock.shares > 0 ? `<div class="watchlist-value">Value: ${formatCurrency(value)}</div>` : ''}
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
    
    document.getElementById('totalNetWorth').textContent = formatCurrency(totalNetWorth);
    document.getElementById('investmentTotal').textContent = formatCurrency(investmentTotal);
    document.getElementById('investmentCount').textContent = `${investments.length} accounts`;
    document.getElementById('retirementTotal').textContent = formatCurrency(retirementTotal);
    document.getElementById('retirementCount').textContent = `${retirementAccounts.length} accounts`;
    document.getElementById('monthlyCashFlow').textContent = formatCurrency(monthlyCashFlow);
    
    const cashFlowStatus = document.getElementById('cashFlowStatus');
    if (monthlyCashFlow > 0) {
        cashFlowStatus.textContent = '✓ Positive';
        cashFlowStatus.style.color = 'green';
    } else {
        cashFlowStatus.textContent = '⚠ Negative';
        cashFlowStatus.style.color = '#dc3545';
    }
}

function renderRetirementReadiness() {
    const container = document.getElementById('retirementReadinessContent');
    if (!container) return;
    
    const retirementTotal = retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const ssAnnual = ssRecords.reduce((sum, rec) => sum + rec.annualBenefit, 0);
    const annualExpenses = expenses.reduce((sum, exp) => sum + exp.annualAmount, 0);
    
    const safeWithdrawal = retirementTotal * 0.04;
    const totalRetirementIncome = safeWithdrawal + ssAnnual;
    const incomeReplacement = annualExpenses > 0 ? (totalRetirementIncome / annualExpenses) * 100 : 0;
    
    const scoreColor = incomeReplacement >= 100 ? '#22c55e' : incomeReplacement >= 80 ? '#f59e0b' : '#dc3545';
    const scoreLabel = incomeReplacement >= 100 ? 'On Track!' : incomeReplacement >= 80 ? 'Almost There' : 'Needs Attention';
    
    container.innerHTML = `
        <div class="readiness-score-container">
            <div class="readiness-score" style="background: ${scoreColor}20; border: 3px solid ${scoreColor};">
                <div class="readiness-percentage" style="color: ${scoreColor};">${Math.round(incomeReplacement)}%</div>
                <div class="readiness-label">${scoreLabel}</div>
            </div>
            <div class="readiness-details">
                <div class="readiness-detail-item">
                    <span class="detail-label">Projected Annual Income</span>
                    <span class="detail-value">${formatCurrency(totalRetirementIncome)}</span>
                </div>
                <div class="readiness-detail-item">
                    <span class="detail-label">From Investments (4% rule)</span>
                    <span class="detail-value">${formatCurrency(safeWithdrawal)}</span>
                </div>
                <div class="readiness-detail-item">
                    <span class="detail-label">From Social Security</span>
                    <span class="detail-value">${formatCurrency(ssAnnual)}</span>
                </div>
                <div class="readiness-detail-item">
                    <span class="detail-label">Current Annual Expenses</span>
                    <span class="detail-value">${formatCurrency(annualExpenses)}</span>
                </div>
            </div>
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 14px; line-height: 1.6;">
            💡 <strong>Tip:</strong> Most financial advisors recommend replacing 70-80% of pre-retirement income. 
            The 4% rule suggests withdrawing 4% of your retirement savings annually for a sustainable retirement.
        </p>
    `;
}

initDashboard();
