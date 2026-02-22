// Dashboard Module - Simple Working Version
import { database } from './config.js';
import { getUserId } from './auth.js';

export function initDashboard() {
    console.log('📊 Initializing Dashboard...');
    
    const container = document.getElementById('content');
    if (!container) {
        console.error('❌ Content container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">📊 Welcome to Wealth!</h2>
            <p style="font-size: 17px; color: #666; margin-bottom: 24px;">
                Your personal retirement planning dashboard
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
                <div class="stat-card">
                    <div class="stat-label">Net Worth</div>
                    <div class="stat-value">$0</div>
                    <div class="stat-change">Start adding data</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Annual Income</div>
                    <div class="stat-value">$0</div>
                    <div class="stat-change">Add income sources</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Years to Retirement</div>
                    <div class="stat-value">--</div>
                    <div class="stat-change">Set in Settings</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3 class="card-title">🚀 Getting Started</h3>
            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
                <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #007AFF;">
                    <div style="font-weight: 600; margin-bottom: 4px;">1. Set up your profile</div>
                    <div style="font-size: 15px; color: #666;">Go to Settings to add your age, state, and retirement goals</div>
                </div>
                
                <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #34C759;">
                    <div style="font-weight: 600; margin-bottom: 4px;">2. Add family members</div>
                    <div style="font-size: 15px; color: #666;">Track your household and link income to family members</div>
                </div>
                
                <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #FF9500;">
                    <div style="font-weight: 600; margin-bottom: 4px;">3. Add income sources</div>
                    <div style="font-size: 15px; color: #666;">Track salaries, business income, and investments</div>
                </div>
                
                <div style="padding: 16px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #AF52DE;">
                    <div style="font-weight: 600; margin-bottom: 4px;">4. Plan for retirement</div>
                    <div style="font-size: 15px; color: #666;">Set goals and track your progress</div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for stat cards
    if (!document.getElementById('dashboardStyles')) {
        const style = document.createElement('style');
        style.id = 'dashboardStyles';
        style.textContent = `
            .stat-card {
                padding: 20px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            .stat-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 500;
            }
            .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: #1d1d1f;
                margin-bottom: 4px;
            }
            .stat-change {
                font-size: 13px;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Dashboard loaded');
}

console.log('✅ Dashboard module loaded');
