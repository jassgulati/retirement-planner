// Investments Module - Minimal Version
export function initInvestments() {
    console.log('📈 Initializing Investments...');
    const container = document.getElementById('content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">📈 Investments</h2>
            <p>Investment tracking coming soon!</p>
        </div>
    `;
}
console.log('✅ Investments module loaded');
