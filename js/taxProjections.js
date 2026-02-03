// Tax Projections Module
import { formatCurrency, formatPercent } from './utils.js';

export function initTaxProjections() {
    // Initialize module
}

export function renderTaxPage() {
    document.getElementById('taxes').innerHTML = `
        <div class="card">
            <h2>Tax Planning & Projections</h2>
            <p>Tax planning tools and retirement tax projections.</p>
        </div>
        
        <div class="card">
            <h3>2025 Tax Brackets (Single)</h3>
            <div id="taxBracketsSingle"></div>
        </div>
        
        <div class="card">
            <h3>2025 Tax Brackets (Married Filing Jointly)</h3>
            <div id="taxBracketsMarried"></div>
        </div>
        
        <div class="card">
            <h3>Tax-Advantaged Account Benefits</h3>
            <div id="taxAdvantaged"></div>
        </div>
    `;
    
    renderTaxBracketsSingle();
    renderTaxBracketsMarried();
    renderTaxAdvantaged();
}

function renderTaxBracketsSingle() {
    const container = document.getElementById('taxBracketsSingle');
    if (!container) return;
    
    const brackets = [
        { rate: 0.10, min: 0, max: 11600 },
        { rate: 0.12, min: 11600, max: 47150 },
        { rate: 0.22, min: 47150, max: 100525 },
        { rate: 0.24, min: 100525, max: 191950 },
        { rate: 0.32, min: 191950, max: 243725 },
        { rate: 0.35, min: 243725, max: 609350 },
        { rate: 0.37, min: 609350, max: Infinity }
    ];
    
    let html = '<table><thead><tr><th>Tax Rate</th><th>Income Range</th></tr></thead><tbody>';
    brackets.forEach(b => {
        const max = b.max === Infinity ? 'and above' : formatCurrency(b.max);
        html += `<tr><td>${formatPercent(b.rate)}</td><td>${formatCurrency(b.min)} to ${max}</td></tr>`;
    });
    html += '</tbody></table>';
    
    container.innerHTML = html;
}

function renderTaxBracketsMarried() {
    const container = document.getElementById('taxBracketsMarried');
    if (!container) return;
    
    const brackets = [
        { rate: 0.10, min: 0, max: 23200 },
        { rate: 0.12, min: 23200, max: 94300 },
        { rate: 0.22, min: 94300, max: 201050 },
        { rate: 0.24, min: 201050, max: 383900 },
        { rate: 0.32, min: 383900, max: 487450 },
        { rate: 0.35, min: 487450, max: 731200 },
        { rate: 0.37, min: 731200, max: Infinity }
    ];
    
    let html = '<table><thead><tr><th>Tax Rate</th><th>Income Range</th></tr></thead><tbody>';
    brackets.forEach(b => {
        const max = b.max === Infinity ? 'and above' : formatCurrency(b.max);
        html += `<tr><td>${formatPercent(b.rate)}</td><td>${formatCurrency(b.min)} to ${max}</td></tr>`;
    });
    html += '</tbody></table>';
    
    container.innerHTML = html;
}

function renderTaxAdvantaged() {
    const container = document.getElementById('taxAdvantaged');
    if (!container) return;
    
    container.innerHTML = `
        <h4>Traditional 401(k) / IRA Benefits:</h4>
        <ul>
            <li>Contributions reduce current taxable income</li>
            <li>Tax-deferred growth - no taxes on gains until withdrawal</li>
            <li>Lower tax bracket in retirement may reduce overall tax burden</li>
            <li>RMDs (Required Minimum Distributions) begin at age 73</li>
        </ul>
        
        <h4>Roth 401(k) / IRA Benefits:</h4>
        <ul>
            <li>No tax deduction for contributions</li>
            <li>Tax-free growth - no taxes on qualified withdrawals</li>
            <li>No RMDs during owner's lifetime (Roth IRA only)</li>
            <li>Tax-free inheritance for beneficiaries</li>
        </ul>
        
        <h4>HSA (Health Savings Account) Benefits:</h4>
        <ul>
            <li>Triple tax advantage: tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses</li>
            <li>Can invest funds for long-term growth</li>
            <li>No expiration - funds roll over indefinitely</li>
            <li>After age 65, can withdraw for any purpose (taxed as ordinary income)</li>
        </ul>
    `;
}

initTaxProjections();
