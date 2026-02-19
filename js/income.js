// Income Module - MINIMAL VERSION
import { database } from './config.js';
import { getUserId } from './auth.js';

export function initIncome() {
    console.log('💵 Initializing Income module...');
    
    const container = document.getElementById('content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">💵 Income</h2>
            <p>Income tracking page - coming soon!</p>
        </div>
    `;
    
    console.log('✅ Income page loaded');
}

console.log('✅ Income module loaded');
