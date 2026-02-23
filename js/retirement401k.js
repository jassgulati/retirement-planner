// Retirement 401k Module - Minimal Version
export function initRetirement401k() {
    console.log('🏦 Initializing Retirement...');
    const container = document.getElementById('content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">🏦 Retirement Accounts</h2>
            <p>401(k) and IRA tracking coming soon!</p>
        </div>
    `;
}
console.log('✅ Retirement module loaded');
