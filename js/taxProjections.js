// Tax Projections Module - FIXED
import { formatCurrency, formatPercent } from './utils.js';

export function initTaxProjections() {
    // Initialize module
}

export function renderTaxPage() {
    const container = document.getElementById('taxes');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">Tax Planning & Strategies</h2>
            <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 20px;">
                Smart tax strategies to maximize your retirement savings and minimize tax burden.
            </p>
        </div>
        
        <!-- 2025 Tax Brackets - Single -->
        <div class="card">
            <h3 class="card-title">2025 Federal Tax Brackets (Single)</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tax Rate</th>
                            <th>Income Range</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">10%</td><td>$0 to $11,600</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">12%</td><td>$11,600 to $47,150</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">22%</td><td>$47,150 to $100,525</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">24%</td><td>$100,525 to $191,950</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">32%</td><td>$191,950 to $243,725</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">35%</td><td>$243,725 to $609,350</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">37%</td><td>$609,350 and above</td></tr>
                    </tbody>
                </table>
            </div>
            <p style="font-size: 13px; color: var(--text-tertiary); margin-top: 12px;">
                Standard Deduction: $14,600
            </p>
        </div>
        
        <!-- 2025 Tax Brackets - Married Filing Jointly -->
        <div class="card">
            <h3 class="card-title">2025 Federal Tax Brackets (Married Filing Jointly)</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tax Rate</th>
                            <th>Income Range</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">10%</td><td>$0 to $23,200</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">12%</td><td>$23,200 to $94,300</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">22%</td><td>$94,300 to $201,050</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">24%</td><td>$201,050 to $383,900</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">32%</td><td>$383,900 to $487,450</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">35%</td><td>$487,450 to $731,200</td></tr>
                        <tr><td style="font-weight: 700; color: var(--apple-blue);">37%</td><td>$731,200 and above</td></tr>
                    </tbody>
                </table>
            </div>
            <p style="font-size: 13px; color: var(--text-tertiary); margin-top: 12px;">
                Standard Deduction: $29,200
            </p>
        </div>
        
        <!-- Tax Strategies -->
        <div class="card">
            <h3 class="card-title">Smart Tax Strategies</h3>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 32px;">💰</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Max Out Retirement Contributions</h4>
                </div>
                <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin: 0;">
                    Contribute the maximum to 401(k) ($23,500 in 2025, plus $7,500 catch-up if 50+) and IRA ($7,000, plus $1,000 catch-up). 
                    Traditional contributions reduce your current taxable income.
                </p>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 32px;">🏥</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Use an HSA (Health Savings Account)</h4>
                </div>
                <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin: 0;">
                    Triple tax advantage: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses. 
                    Can be used as a retirement account after age 65.
                </p>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 32px;">📊</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Tax-Loss Harvesting</h4>
                </div>
                <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin: 0;">
                    Offset capital gains by strategically selling investments at a loss. Can deduct up to $3,000 annually against ordinary income. 
                    Implement near year-end for maximum benefit.
                </p>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 32px;">🎯</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Roth vs Traditional</h4>
                </div>
                <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin: 0;">
                    <strong>Traditional:</strong> Tax deduction now, pay taxes in retirement. Best if you expect lower tax bracket later.<br>
                    <strong>Roth:</strong> No tax deduction now, but tax-free withdrawals forever. Best if you expect higher tax bracket later.
                </p>
            </div>
        </div>
        
        <!-- Retirement Account Benefits -->
        <div class="card">
            <h3 class="card-title">Retirement Account Tax Benefits</h3>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">🏦</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Traditional 401(k) / IRA</h4>
                </div>
                <ul style="margin-left: 20px; color: var(--text-secondary); font-size: 15px; line-height: 1.8;">
                    <li>Contributions reduce current taxable income</li>
                    <li>Tax-deferred growth - no taxes on gains until withdrawal</li>
                    <li>May lower your tax bracket today</li>
                    <li>Ideal if you expect lower tax bracket in retirement</li>
                    <li>RMDs (Required Minimum Distributions) begin at age 73</li>
                </ul>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">✨</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Roth 401(k) / IRA</h4>
                </div>
                <ul style="margin-left: 20px; color: var(--text-secondary); font-size: 15px; line-height: 1.8;">
                    <li>No tax deduction for contributions</li>
                    <li>Tax-free growth and withdrawals in retirement</li>
                    <li>No RMDs during owner's lifetime (Roth IRA only)</li>
                    <li>Ideal if you expect higher tax bracket in retirement</li>
                    <li>Tax-free inheritance for beneficiaries</li>
                </ul>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">🏥</span>
                    <h4 style="font-size: 17px; font-weight: 600; margin: 0;">Health Savings Account (HSA)</h4>
                </div>
                <ul style="margin-left: 20px; color: var(--text-secondary); font-size: 15px; line-height: 1.8;">
                    <li>Triple tax advantage: deductible contributions, tax-free growth, tax-free medical withdrawals</li>
                    <li>No "use it or lose it" - funds roll over forever</li>
                    <li>Can invest HSA funds for long-term growth</li>
                    <li>After 65, can withdraw for any purpose (taxed as income)</li>
                    <li>Best kept secret in retirement planning!</li>
                </ul>
            </div>
        </div>
        
        <!-- Important Dates -->
        <div class="card">
            <h3 class="card-title">Important Tax Dates for 2025</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>Date</th><th>Deadline</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-weight: 600;">April 15, 2025</td>
                            <td>2024 tax return filing deadline<br>2024 IRA contribution deadline</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">October 15, 2025</td>
                            <td>Extended tax return deadline (if extension filed)</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">December 31, 2025</td>
                            <td>2025 401(k) contribution deadline<br>RMD deadline (if required)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Disclaimer -->
        <div style="background: rgba(255, 204, 0, 0.1); padding: 16px; border-radius: 12px; border-left: 4px solid var(--apple-yellow);">
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                <strong>⚠️ Disclaimer:</strong> This information is for educational purposes only. Tax laws are complex and change frequently. 
                Consult with a qualified tax professional or CPA for personalized advice specific to your situation.
            </p>
        </div>
    `;
}

initTaxProjections();
