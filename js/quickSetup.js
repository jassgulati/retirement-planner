// Quick Setup Wizard Module
import { database } from './config.js';
import { getUserId } from './auth.js';

let currentStep = 1;
let wizardData = {};

export function initQuickSetup() {
    console.log('🚀 Initializing Quick Setup Wizard...');
    checkIfSetupNeeded();
}

async function checkIfSetupNeeded() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        // Check if user has completed setup
        const profileSnapshot = await database.ref(`users/${userId}/profile`).once('value');
        const profile = profileSnapshot.val() || {};
        
        // If they have an age set, assume setup is done
        if (profile.currentAge && profile.setupCompleted) {
            console.log('✅ Setup already completed');
            return;
        }
        
        // Show the wizard
        showQuickSetup();
        
    } catch (error) {
        console.error('Error checking setup status:', error);
    }
}

function showQuickSetup() {
    const container = document.getElementById('content');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 40px;">
                <h1 style="font-size: 36px; margin-bottom: 12px;">👋 Welcome to Wealth!</h1>
                <p style="font-size: 18px; opacity: 0.9;">Let's get you set up in just 2 minutes</p>
                <div style="margin-top: 24px; display: flex; justify-content: center; gap: 8px;">
                    <div class="progress-dot ${currentStep >= 1 ? 'active' : ''}" id="dot1"></div>
                    <div class="progress-dot ${currentStep >= 2 ? 'active' : ''}" id="dot2"></div>
                    <div class="progress-dot ${currentStep >= 3 ? 'active' : ''}" id="dot3"></div>
                </div>
            </div>
            
            <div id="wizardContent"></div>
        </div>
        
        <style>
            .progress-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transition: all 0.3s;
            }
            .progress-dot.active {
                background: white;
                transform: scale(1.2);
            }
            .wizard-button {
                width: 100%;
                padding: 16px;
                font-size: 17px;
                font-weight: 600;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .wizard-button-primary {
                background: #007AFF;
                color: white;
            }
            .wizard-button-primary:hover {
                background: #0051D5;
                transform: translateY(-2px);
            }
            .wizard-button-secondary {
                background: #f5f5f7;
                color: #1d1d1f;
                margin-top: 12px;
            }
            .wizard-input {
                width: 100%;
                padding: 16px;
                font-size: 18px;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                margin-bottom: 16px;
                text-align: center;
                font-weight: 600;
            }
            .wizard-input:focus {
                outline: none;
                border-color: #007AFF;
            }
        </style>
    `;
    
    renderStep(1);
}

function renderStep(step) {
    currentStep = step;
    updateProgressDots();
    
    const container = document.getElementById('wizardContent');
    if (!container) return;
    
    if (step === 1) {
        container.innerHTML = `
            <div class="card" style="margin-top: 24px;">
                <h2 style="font-size: 28px; margin-bottom: 8px; text-align: center;">How old are you?</h2>
                <p style="text-align: center; color: #666; margin-bottom: 32px;">
                    We'll use this to calculate your retirement timeline
                </p>
                
                <input type="number" class="wizard-input" id="userAge" placeholder="35" min="18" max="100" autofocus>
                
                <div style="text-align: center; color: #999; margin-bottom: 24px;">
                    Don't worry, you can change this later in Settings
                </div>
                
                <button class="wizard-button wizard-button-primary" onclick="window.wizardStep1Next()">
                    Continue →
                </button>
            </div>
        `;
    } else if (step === 2) {
        const age = wizardData.age || 35;
        const retirementAge = 67;
        const yearsToRetirement = Math.max(0, retirementAge - age);
        
        container.innerHTML = `
            <div class="card" style="margin-top: 24px;">
                <div style="text-align: center; padding: 24px; background: #f8f9fa; border-radius: 12px; margin-bottom: 24px;">
                    <div style="font-size: 15px; color: #666; margin-bottom: 8px;">You have</div>
                    <div style="font-size: 48px; font-weight: 700; color: #007AFF; margin-bottom: 8px;">${yearsToRetirement}</div>
                    <div style="font-size: 17px; color: #666;">years until retirement at ${retirementAge}</div>
                </div>
                
                <h2 style="font-size: 28px; margin-bottom: 8px; text-align: center;">What's your annual income?</h2>
                <p style="text-align: center; color: #666; margin-bottom: 32px;">
                    Include your salary before taxes
                </p>
                
                <div style="position: relative;">
                    <span style="position: absolute; left: 16px; top: 16px; font-size: 18px; font-weight: 600; color: #999;">$</span>
                    <input type="number" class="wizard-input" id="userIncome" placeholder="85,000" step="1000" style="padding-left: 40px;">
                </div>
                
                <button class="wizard-button wizard-button-primary" onclick="window.wizardStep2Next()">
                    Continue →
                </button>
                <button class="wizard-button wizard-button-secondary" onclick="window.wizardGoBack(1)">
                    ← Back
                </button>
            </div>
        `;
    } else if (step === 3) {
        const income = wizardData.income || 0;
        const monthlyIncome = Math.round(income / 12);
        
        container.innerHTML = `
            <div class="card" style="margin-top: 24px;">
                <div style="text-align: center; padding: 24px; background: #f8f9fa; border-radius: 12px; margin-bottom: 24px;">
                    <div style="font-size: 15px; color: #666; margin-bottom: 8px;">Monthly income</div>
                    <div style="font-size: 48px; font-weight: 700; color: #34C759; margin-bottom: 8px;">$${monthlyIncome.toLocaleString()}</div>
                    <div style="font-size: 17px; color: #666;">after taxes: ~$${Math.round(monthlyIncome * 0.75).toLocaleString()}/mo</div>
                </div>
                
                <h2 style="font-size: 28px; margin-bottom: 8px; text-align: center;">Do you have a 401(k) or IRA?</h2>
                <p style="text-align: center; color: #666; margin-bottom: 32px;">
                    This helps us see if you're on track for retirement
                </p>
                
                <div style="position: relative; margin-bottom: 16px;">
                    <span style="position: absolute; left: 16px; top: 16px; font-size: 18px; font-weight: 600; color: #999;">$</span>
                    <input type="number" class="wizard-input" id="accountBalance" placeholder="50,000" step="1000" style="padding-left: 40px;">
                </div>
                
                <p style="text-align: center; color: #999; font-size: 14px; margin-bottom: 24px;">
                    Enter current balance (or 0 if you don't have one yet)
                </p>
                
                <button class="wizard-button wizard-button-primary" onclick="window.wizardFinish()">
                    Finish Setup 🎉
                </button>
                <button class="wizard-button wizard-button-secondary" onclick="window.wizardGoBack(2)">
                    ← Back
                </button>
            </div>
        `;
    }
}

window.wizardStep1Next = function() {
    const age = parseInt(document.getElementById('userAge').value);
    
    if (!age || age < 18 || age > 100) {
        alert('Please enter a valid age between 18 and 100');
        return;
    }
    
    wizardData.age = age;
    renderStep(2);
};

window.wizardStep2Next = function() {
    const income = parseFloat(document.getElementById('userIncome').value);
    
    if (!income || income < 0) {
        alert('Please enter a valid income');
        return;
    }
    
    wizardData.income = income;
    renderStep(3);
};

window.wizardFinish = async function() {
    const balance = parseFloat(document.getElementById('accountBalance').value) || 0;
    wizardData.accountBalance = balance;
    
    const userId = getUserId();
    if (!userId) {
        alert('Error: Not logged in');
        return;
    }
    
    try {
        // Save profile
        await database.ref(`users/${userId}/profile`).update({
            currentAge: wizardData.age,
            retirementAge: 67,
            state: 'CA',
            taxFilingStatus: 'single',
            projectionMode: 'average',
            setupCompleted: true,
            setupDate: new Date().toISOString()
        });
        
        // Save income
        if (wizardData.income > 0) {
            const incomeId = 'inc_' + Date.now();
            await database.ref(`users/${userId}/incomes/${incomeId}`).set({
                type: 'salary',
                source: 'My Income',
                annualAmount: wizardData.income,
                monthlyAmount: wizardData.income / 12,
                growthRate: 0.03,
                familyMemberId: null,
                familyMemberName: 'Household',
                createdAt: new Date().toISOString()
            });
        }
        
        // Save investment account if they have one
        if (wizardData.accountBalance > 0) {
            const investId = 'inv_' + Date.now();
            await database.ref(`users/${userId}/investments/${investId}`).set({
                accountType: '401k_active',
                accountName: 'My Retirement Account',
                institution: 'To be updated',
                currentBalance: wizardData.accountBalance,
                annualContribution: Math.round(wizardData.income * 0.06),
                employerMatch: 0,
                accountHolder: 'self',
                holderName: 'You',
                notes: 'Added during quick setup',
                lastUpdated: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
        }
        
        console.log('✅ Quick setup completed!');
        
        // Show success and redirect to dashboard
        showSuccess();
        
    } catch (error) {
        console.error('Error saving setup data:', error);
        alert('Error saving your information. Please try again.');
    }
};

window.wizardGoBack = function(step) {
    renderStep(step);
};

function updateProgressDots() {
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById('dot' + i);
        if (dot) {
            if (i <= currentStep) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        }
    }
}

function showSuccess() {
    const container = document.getElementById('wizardContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card" style="margin-top: 24px; text-align: center; padding: 48px 24px;">
            <div style="font-size: 72px; margin-bottom: 24px;">🎉</div>
            <h2 style="font-size: 32px; margin-bottom: 16px;">You're all set!</h2>
            <p style="font-size: 18px; color: #666; margin-bottom: 32px;">
                Your retirement dashboard is ready
            </p>
            
            <button class="wizard-button wizard-button-primary" onclick="window.location.reload()">
                Go to Dashboard
            </button>
        </div>
    `;
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Check if setup is needed when module loads
if (window.addEventListener) {
    window.addEventListener('userLoggedIn', () => {
        setTimeout(() => {
            initQuickSetup();
        }, 500);
    });
}

console.log('✅ Quick Setup Wizard loaded');
