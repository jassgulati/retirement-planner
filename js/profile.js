// User Profile/Settings Module - FIXED VERSION
import { database } from './config.js';
import { getUserId } from './auth.js';

let userProfile = {
    taxFilingStatus: 'married_joint',
    projectionMode: 'average',
    currentAge: 35,
    retirementAge: 67,
    lifeExpectancy: 90,
    state: 'CA'
};

// This is the function app.js calls
export function initProfile() {
    console.log('🔧 Initializing Profile module...');
    
    // Load profile data when user logs in
    window.addEventListener('userLoggedIn', () => {
        console.log('👤 User logged in, loading profile...');
        loadProfile();
    });
    
    // Render the settings page
    renderProfilePage();
}

export function getUserProfile() {
    return userProfile;
}

function renderProfilePage() {
    const container = document.getElementById('content');
    if (!container) {
        console.error('❌ Content container not found');
        return;
    }
    
    console.log('📄 Rendering profile page with data:', userProfile);
    
    container.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <div class="card">
                <h2 class="card-title">⚙️ Settings</h2>
                <p style="font-size: 15px; color: #666; margin-bottom: 24px;">
                    These settings affect your tax calculations, retirement projections, and Social Security estimates.
                </p>
            </div>
            
            <!-- Personal Info -->
            <div class="card">
                <h3 class="card-title">Personal Information</h3>
                
                <div class="form-group">
                    <label class="form-label">Current Age</label>
                    <input type="number" class="form-input" id="currentAge" value="${userProfile.currentAge}" min="18" max="100">
                    <p style="font-size: 13px; color: #999; margin-top: 4px;">
                        Your current age in years
                    </p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">State of Residence</label>
                    <select class="form-select" id="userState">
                        ${generateStateOptions()}
                    </select>
                    <p style="font-size: 13px; color: #999; margin-top: 4px;">
                        Used to estimate state income tax. ${getStateTaxInfo(userProfile.state)}
                    </p>
                </div>
            </div>
            
            <!-- Tax Settings -->
            <div class="card">
                <h3 class="card-title">Tax Settings</h3>
                
                <div class="form-group">
                    <label class="form-label">Tax Filing Status</label>
                    <select class="form-select" id="taxFilingStatus">
                        <option value="single" ${userProfile.taxFilingStatus === 'single' ? 'selected' : ''}>Single</option>
                        <option value="married_joint" ${userProfile.taxFilingStatus === 'married_joint' ? 'selected' : ''}>Married Filing Jointly</option>
                        <option value="married_separate" ${userProfile.taxFilingStatus === 'married_separate' ? 'selected' : ''}>Married Filing Separately</option>
                        <option value="head_of_household" ${userProfile.taxFilingStatus === 'head_of_household' ? 'selected' : ''}>Head of Household</option>
                    </select>
                    <p style="font-size: 13px; color: #999; margin-top: 4px;">
                        Affects federal tax brackets and standard deduction
                    </p>
                </div>
            </div>
            
            <!-- Investment Projections -->
            <div class="card">
                <h3 class="card-title">Investment Projection Mode</h3>
                <p style="font-size: 15px; color: #666; margin-bottom: 16px;">
                    Choose how optimistic you want your retirement projections to be.
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <label style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 12px; cursor: pointer; border: 2px solid transparent;" 
                        class="projection-option ${userProfile.projectionMode === 'conservative' ? 'selected' : ''}" data-mode="conservative">
                        <input type="radio" name="projectionMode" value="conservative" ${userProfile.projectionMode === 'conservative' ? 'checked' : ''} 
                            style="width: 20px; height: 20px; cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">Conservative (4%)</div>
                            <div style="font-size: 15px; color: #666;">Bond-heavy portfolio, minimal risk</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 12px; cursor: pointer; border: 2px solid transparent;" 
                        class="projection-option ${userProfile.projectionMode === 'average' ? 'selected' : ''}" data-mode="average">
                        <input type="radio" name="projectionMode" value="average" ${userProfile.projectionMode === 'average' ? 'checked' : ''} 
                            style="width: 20px; height: 20px; cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">Average (10%)</div>
                            <div style="font-size: 15px; color: #666;">S&P 500 historical 10-year average</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 12px; cursor: pointer; border: 2px solid transparent;" 
                        class="projection-option ${userProfile.projectionMode === 'optimistic' ? 'selected' : ''}" data-mode="optimistic">
                        <input type="radio" name="projectionMode" value="optimistic" ${userProfile.projectionMode === 'optimistic' ? 'checked' : ''} 
                            style="width: 20px; height: 20px; cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">Optimistic (13%)</div>
                            <div style="font-size: 15px; color: #666;">Aggressive growth portfolio</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <!-- Retirement Planning -->
            <div class="card">
                <h3 class="card-title">Retirement Planning</h3>
                
                <div class="form-group">
                    <label class="form-label">Planned Retirement Age</label>
                    <input type="number" class="form-input" id="retirementAge" value="${userProfile.retirementAge}" min="55" max="75">
                    <p style="font-size: 13px; color: #999; margin-top: 4px;">
                        Used for Social Security benefit calculations and retirement projections
                    </p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Life Expectancy</label>
                    <input type="number" class="form-input" id="lifeExpectancy" value="${userProfile.lifeExpectancy}" min="70" max="120">
                    <p style="font-size: 13px; color: #999; margin-top: 4px;">
                        How long you expect to live (for retirement planning)
                    </p>
                </div>
                
                <div style="background: rgba(0, 122, 255, 0.1); padding: 16px; border-radius: 12px; margin-top: 16px;">
                    <div style="font-size: 15px; color: #666; margin-bottom: 8px;">
                        <strong>Years until retirement:</strong> ${Math.max(0, userProfile.retirementAge - userProfile.currentAge)} years
                    </div>
                    <div style="font-size: 15px; color: #666;">
                        <strong>Years in retirement:</strong> ${Math.max(0, userProfile.lifeExpectancy - userProfile.retirementAge)} years
                    </div>
                </div>
            </div>
            
            <!-- Save Button -->
            <div class="card" style="text-align: center;">
                <button id="saveProfileBtn" class="btn btn-primary" style="padding: 14px 32px; font-size: 17px;">
                    💾 Save Settings
                </button>
                <p style="font-size: 13px; color: #999; margin-top: 12px;">
                    Changes will update all calculations and projections
                </p>
            </div>
        </div>
    `;
    
    // Add styles for projection options
    addProjectionStyles();
    
    // Setup event listeners AFTER rendering
    setupEventListeners();
    
    console.log('✅ Profile page rendered successfully');
}

function generateStateOptions() {
    const states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'AK', name: 'Alaska' },
        { code: 'AZ', name: 'Arizona' },
        { code: 'AR', name: 'Arkansas' },
        { code: 'CA', name: 'California' },
        { code: 'CO', name: 'Colorado' },
        { code: 'CT', name: 'Connecticut' },
        { code: 'DE', name: 'Delaware' },
        { code: 'FL', name: 'Florida (No State Tax)' },
        { code: 'GA', name: 'Georgia' },
        { code: 'HI', name: 'Hawaii' },
        { code: 'ID', name: 'Idaho' },
        { code: 'IL', name: 'Illinois' },
        { code: 'IN', name: 'Indiana' },
        { code: 'IA', name: 'Iowa' },
        { code: 'KS', name: 'Kansas' },
        { code: 'KY', name: 'Kentucky' },
        { code: 'LA', name: 'Louisiana' },
        { code: 'ME', name: 'Maine' },
        { code: 'MD', name: 'Maryland' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'MI', name: 'Michigan' },
        { code: 'MN', name: 'Minnesota' },
        { code: 'MS', name: 'Mississippi' },
        { code: 'MO', name: 'Missouri' },
        { code: 'MT', name: 'Montana' },
        { code: 'NE', name: 'Nebraska' },
        { code: 'NV', name: 'Nevada (No State Tax)' },
        { code: 'NH', name: 'New Hampshire' },
        { code: 'NJ', name: 'New Jersey' },
        { code: 'NM', name: 'New Mexico' },
        { code: 'NY', name: 'New York' },
        { code: 'NC', name: 'North Carolina' },
        { code: 'ND', name: 'North Dakota' },
        { code: 'OH', name: 'Ohio' },
        { code: 'OK', name: 'Oklahoma' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'RI', name: 'Rhode Island' },
        { code: 'SC', name: 'South Carolina' },
        { code: 'SD', name: 'South Dakota (No State Tax)' },
        { code: 'TN', name: 'Tennessee (No State Tax)' },
        { code: 'TX', name: 'Texas (No State Tax)' },
        { code: 'UT', name: 'Utah' },
        { code: 'VT', name: 'Vermont' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WA', name: 'Washington (No State Tax)' },
        { code: 'WV', name: 'West Virginia' },
        { code: 'WI', name: 'Wisconsin' },
        { code: 'WY', name: 'Wyoming (No State Tax)' }
    ];
    
    return states.map(state => 
        `<option value="${state.code}" ${userProfile.state === state.code ? 'selected' : ''}>${state.name}</option>`
    ).join('');
}

function addProjectionStyles() {
    if (document.getElementById('projectionStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'projectionStyles';
    style.textContent = `
        .projection-option.selected {
            background: rgba(0, 122, 255, 0.1) !important;
            border-color: #007AFF !important;
        }
        .projection-option input[type="radio"] {
            accent-color: #007AFF;
        }
        .projection-option:hover {
            background: rgba(0, 122, 255, 0.05) !important;
        }
    `;
    document.head.appendChild(style);
}

function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Radio button selection styling
    const radioInputs = document.querySelectorAll('input[name="projectionMode"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.projection-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            radio.closest('.projection-option').classList.add('selected');
        });
    });
    
    // Save button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfile);
        console.log('✅ Save button listener attached');
    } else {
        console.error('❌ Save button not found!');
    }
}

async function loadProfile() {
    const userId = getUserId();
    if (!userId) {
        console.log('⚠️ No user ID, skipping profile load');
        return;
    }
    
    try {
        console.log('📥 Loading profile for user:', userId);
        const snapshot = await database.ref(`users/${userId}/profile`).once('value');
        
        if (snapshot.exists()) {
            const loadedProfile = snapshot.val();
            userProfile = { ...userProfile, ...loadedProfile };
            console.log('✅ Profile loaded:', userProfile);
            
            // Re-render if we're on the settings page
            if (document.getElementById('currentAge')) {
                renderProfilePage();
            }
        } else {
            console.log('ℹ️ No saved profile found, using defaults');
        }
        
        window.dispatchEvent(new CustomEvent('profileLoaded', { detail: { profile: userProfile } }));
    } catch (error) {
        console.error('❌ Error loading profile:', error);
    }
}

async function saveProfile() {
    console.log('💾 Save button clicked!');
    
    const currentAge = parseInt(document.getElementById('currentAge')?.value);
    const state = document.getElementById('userState')?.value;
    const taxFilingStatus = document.getElementById('taxFilingStatus')?.value;
    const projectionModeRadio = document.querySelector('input[name="projectionMode"]:checked');
    const projectionMode = projectionModeRadio?.value;
    const retirementAge = parseInt(document.getElementById('retirementAge')?.value);
    const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy')?.value);
    
    // Validation
    if (!currentAge || !state || !taxFilingStatus || !projectionMode || !retirementAge || !lifeExpectancy) {
        alert('Please fill in all fields');
        console.error('❌ Missing fields');
        return;
    }
    
    userProfile = {
        currentAge,
        state,
        taxFilingStatus,
        projectionMode,
        retirementAge,
        lifeExpectancy,
        updatedAt: new Date().toISOString()
    };
    
    console.log('📝 Saving profile:', userProfile);
    
    const userId = getUserId();
    if (!userId) {
        alert('Please log in to save settings');
        console.error('❌ No user ID');
        return;
    }
    
    try {
        await database.ref(`users/${userId}/profile`).set(userProfile);
        console.log('✅ Profile saved to Firebase');
        
        // Show success feedback
        const btn = document.getElementById('saveProfileBtn');
        if (btn) {
            const originalText = btn.textContent;
            const originalBg = btn.style.background;
            
            btn.textContent = '✓ Saved!';
            btn.style.background = '#34C759';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = originalBg;
                btn.disabled = false;
            }, 2000);
        }
        
        // Trigger update events
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { profile: userProfile } }));
        
    } catch (error) {
        console.error('❌ Error saving profile:', error);
        alert('Error saving settings: ' + error.message);
    }
}

function getStateTaxInfo(state) {
    const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'];
    const highTaxStates = {
        'CA': 'California has progressive rates from 1% to 13.3%',
        'NY': 'New York has progressive rates from 4% to 10.9%',
        'NJ': 'New Jersey has progressive rates from 1.4% to 10.75%',
        'OR': 'Oregon has progressive rates from 4.75% to 9.9%',
        'MN': 'Minnesota has progressive rates from 5.35% to 9.85%',
        'HI': 'Hawaii has progressive rates from 1.4% to 11%'
    };
    
    if (noTaxStates.includes(state)) {
        return '✅ No state income tax!';
    }
    
    if (highTaxStates[state]) {
        return '📊 ' + highTaxStates[state];
    }
    
    return '📊 State income tax will be estimated';
}

// Export function to calculate state tax
export function calculateStateTax(income, state) {
    const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'];
    
    if (noTaxStates.includes(state)) {
        return 0;
    }
    
    // California tax brackets (2025 - married filing jointly)
    if (state === 'CA') {
        let tax = 0;
        if (income > 1354550) {
            tax += (income - 1354550) * 0.133;
            tax += (1354550 - 677275) * 0.123;
            tax += (677275 - 480000) * 0.113;
            tax += (480000 - 384000) * 0.103;
            tax += (384000 - 246000) * 0.093;
            tax += (246000 - 136000) * 0.08;
            tax += (136000 - 102000) * 0.06;
            tax += (102000 - 64000) * 0.04;
            tax += (64000 - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else if (income > 677275) {
            tax += (income - 677275) * 0.123;
            tax += (677275 - 480000) * 0.113;
            tax += (480000 - 384000) * 0.103;
            tax += (384000 - 246000) * 0.093;
            tax += (246000 - 136000) * 0.08;
            tax += (136000 - 102000) * 0.06;
            tax += (102000 - 64000) * 0.04;
            tax += (64000 - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else if (income > 480000) {
            tax += (income - 480000) * 0.113;
            tax += (480000 - 384000) * 0.103;
            tax += (384000 - 246000) * 0.093;
            tax += (246000 - 136000) * 0.08;
            tax += (136000 - 102000) * 0.06;
            tax += (102000 - 64000) * 0.04;
            tax += (64000 - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else if (income > 246000) {
            tax += (income - 246000) * 0.093;
            tax += (246000 - 136000) * 0.08;
            tax += (136000 - 102000) * 0.06;
            tax += (102000 - 64000) * 0.04;
            tax += (64000 - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else if (income > 136000) {
            tax += (income - 136000) * 0.08;
            tax += (136000 - 102000) * 0.06;
            tax += (102000 - 64000) * 0.04;
            tax += (64000 - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else if (income > 102000) {
            tax += (income - 102000) * 0.06;
            tax += (102000 - 64000) * 0.04;
            tax += (64000 - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else if (income > 64000) {
            tax += (income - 64000) * 0.04;
            tax += (64000 - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else if (income > 40000) {
            tax += (income - 40000) * 0.02;
            tax += 40000 * 0.01;
        } else {
            tax += income * 0.01;
        }
        return Math.round(tax);
    }
    
    // Simplified estimates for other states
    const stateRates = {
        'NY': 0.065, 'NJ': 0.065, 'OR': 0.08, 'MN': 0.075,
        'HI': 0.08, 'MA': 0.05, 'CT': 0.065, 'IL': 0.0495,
        'PA': 0.0307, 'CO': 0.044, 'NC': 0.045, 'UT': 0.0465,
        'AZ': 0.025, 'GA': 0.055, 'VA': 0.055, 'OH': 0.04,
        'MI': 0.0425, 'WI': 0.065
    };
    
    const rate = stateRates[state] || 0.05;
    return Math.round(income * rate);
}

console.log('✅ Profile module loaded');
export { userProfile };
