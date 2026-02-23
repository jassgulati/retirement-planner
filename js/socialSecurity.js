// Social Security Module - Minimal Version
export function initSocialSecurity() {
    console.log('🇺🇸 Initializing Social Security...');
    const container = document.getElementById('content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">🇺🇸 Social Security</h2>
            <p>Social Security calculator coming soon!</p>
        </div>
    `;
}
console.log('✅ Social Security module loaded');
