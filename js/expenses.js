// Expenses Module - Minimal Version
export function initExpenses() {
    console.log('💳 Initializing Expenses...');
    const container = document.getElementById('content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">💳 Expenses</h2>
            <p>Expense tracking coming soon!</p>
        </div>
    `;
}
console.log('✅ Expenses module loaded');
