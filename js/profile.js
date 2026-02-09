// User Profile/Settings Module
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';

let database;
let userProfile = {
    taxFilingStatus: 'married_joint',
    projectionMode: 'average',
    currentAge: 35,
    retirementAge: 67,
    lifeExpectancy: 90,
    state: 'CA' // Default to California
};

export function initProfile() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', () => {
        loadProfile();
    });
}

export function getUserProfile() {
    return userProfile;
}

export function renderProfilePage() {
    const container = document.getElementById('profile');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">Your Profile & Settings</h2>
            <p style="font-size: 15px; color: var(--label-secondary); margin-bottom: 24px;">
                These settings affect your tax calculations, retirement projections, and Social Security estimates.
            </p>
        </div>
        
        <!-- Personal Info -->
        <div class="card">
            <h3 class="card-title">Personal Information</h3>
            
            <div class="form-group">
                <label class="form-label">Current Age</label>
                <input type="number" class="form-input" id="currentAge" value="${userProfile.currentAge}" min="18" max="100">
            </div>
            
            <div class="form-group">
                <label class="form-label">State of Residence</label>
                <select class="form-select" id="userState">
                    <option value="AL" ${userProfile.state === 'AL' ? 'selected' : ''}>Alabama</option>
                    <option value="AK" ${userProfile.state === 'AK' ? 'selected' : ''}>Alaska</option>
                    <option value="AZ" ${userProfile.state === 'AZ' ? 'selected' : ''}>Arizona</option>
                    <option value="AR" ${userProfile.state === 'AR' ? 'selected' : ''}>Arkansas</option>
                    <option value="CA" ${userProfile.state === 'CA' ? 'selected' : ''}>California</option>
                    <option value="CO" ${userProfile.state === 'CO' ? 'selected' : ''}>Colorado</option>
                    <option value="CT" ${userProfile.state === 'CT' ? 'selected' : ''}>Connecticut</option>
                    <option value="DE" ${userProfile.state === 'DE' ? 'selected' : ''}>Delaware</option>
                    <option value="FL" ${userProfile.state === 'FL' ? 'selected' : ''}>Florida (No State Tax)</option>
                    <option value="GA" ${userProfile.state === 'GA' ? 'selected' : ''}>Georgia</option>
                    <option value="HI" ${userProfile.state === 'HI' ? 'selected' : ''}>Hawaii</option>
                    <option value="ID" ${userProfile.state === 'ID' ? 'selected' : ''}>Idaho</option>
                    <option value="IL" ${userProfile.state === 'IL' ? 'selected' : ''}>Illinois</option>
                    <option value="IN" ${userProfile.state === 'IN' ? 'selected' : ''}>Indiana</option>
                    <option value="IA" ${userProfile.state === 'IA' ? 'selected' : ''}>Iowa</option>
                    <option value="KS" ${userProfile.state === 'KS' ? 'selected' : ''}>Kansas</option>
                    <option value="KY" ${userProfile.state === 'KY' ? 'selected' : ''}>Kentucky</option>
                    <option value="LA" ${userProfile.state === 'LA' ? 'selected' : ''}>Louisiana</option>
                    <option value="ME" ${userProfile.state === 'ME' ? 'selected' : ''}>Maine</option>
                    <option value="MD" ${userProfile.state === 'MD' ? 'selected' : ''}>Maryland</option>
                    <option value="MA" ${userProfile.state === 'MA' ? 'selected' : ''}>Massachusetts</option>
                    <option value="MI" ${userProfile.state === 'MI' ? 'selected' : ''}>Michigan</option>
                    <option value="MN" ${userProfile.state === 'MN' ? 'selected' : ''}>Minnesota</option>
                    <option value="MS" ${userProfile.state === 'MS' ? 'selected' : ''}>Mississippi</option>
                    <option value="MO" ${userProfile.state === 'MO' ? 'selected' : ''}>Missouri</option>
                    <option value="MT" ${userProfile.state === 'MT' ? 'selected' : ''}>Montana</option>
                    <option value="NE" ${userProfile.state === 'NE' ? 'selected' : ''}>Nebraska</option>
                    <option value="NV" ${userProfile.state === 'NV' ? 'selected' : ''}>Nevada (No State Tax)</option>
                    <option value="NH" ${userProfile.state === 'NH' ? 'selected' : ''}>New Hampshire</option>
                    <option value="NJ" ${userProfile.state === 'NJ' ? 'selected' : ''}>New Jersey</option>
                    <option value="NM" ${userProfile.state === 'NM' ? 'selected' : ''}>New Mexico</option>
                    <option value="NY" ${userProfile.state === 'NY' ? 'selected' : ''}>New York</option>
                    <option value="NC" ${userProfile.state === 'NC' ? 'selected' : ''}>North Carolina</option>
                    <option value="ND" ${userProfile.state === 'ND' ? 'selected' : ''}>North Dakota</option>
                    <option value="OH" ${userProfile.state === 'OH' ? 'selected' : ''}>Ohio</option>
                    <option value="OK" ${userProfile.state === 'OK' ? 'selected' : ''}>Oklahoma</option>
                    <option value="OR" ${userProfile.state === 'OR' ? 'selected' : ''}>Oregon</option>
                    <option value="PA" ${userProfile.state === 'PA' ? 'selected' : ''}>Pennsylvania</option>
                    <option value="RI" ${userProfile.state === 'RI' ? 'selected' : ''}>Rhode Island</option>
                    <option value="SC" ${userProfile.state === 'SC' ? 'selected' : ''}>South Carolina</option>
                    <option value="SD" ${userProfile.state === 'SD' ? 'selected' : ''}>South Dakota (No State Tax)</option>
                    <option value="TN" ${userProfile.state === 'TN' ? 'selected' : ''}>Tennessee (No State Tax)</option>
                    <option value="TX" ${userProfile.state === 'TX' ? 'selected' : ''}>Texas (No State Tax)</option>
                    <option value="UT" ${userProfile.state === 'UT' ? 'selected' : ''}>Utah</option>
                    <option value="VT" ${userProfile.state === 'VT' ? 'selected' : ''}>Vermont</option>
                    <option value="VA" ${userProfile.state === 'VA' ? 'selected' : ''}>Virginia</option>
                    <option value="WA" ${userProfile.state === 'WA' ? 'selected' : ''}>Washington (No State Tax)</option>
                    <option value="WV" ${userProfile.state === 'WV' ? 'selected' : ''}>West Virginia</option>
                    <option value="WI" ${userProfile.state === 'WI' ? 'selected' : ''}>Wisconsin</option>
                    <option value="WY" ${userProfile.state === 'WY' ? 'selected' : ''}>Wyoming (No State Tax)</option>
                </select>
                <p style="font-size: 13px; color: var(--label-tertiary); margin-top: 4px;">
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
                <p style="font-size: 13px; color: var(--label-tertiary); margin-top: 4px;">
                    Affects federal tax brackets and standard deduction
                </p>
            </div>
        </div>
        
        <!-- Investment Projections -->
        <div class="card">
            <h3 class="card-title">Investment Projection Mode</h3>
            <p style="font-size: 15px; color: var(--label-secondary); margin-bottom: 16px;">
                Choose how optimistic you want your retirement projections to be.
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--fill-tertiary); border-radius: 12px; cursor: pointer; border: 2px solid transparent;" 
                    class="projection-option ${userProfile.projectionMode === 'conservative' ? 'selected' : ''}">
                    <input type="radio" name="projectionMode" value="conservative" ${userProfile.projectionMode === 'conservative' ? 'checked' : ''} 
                        style="width: 20px; height: 20px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">Conservative (4%)</div>
                        <div style="font-size: 15px; color: var(--label-secondary);">Bond-heavy portfolio, minimal risk</div>
                    </div>
                </label>
                
                <label style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--fill-tertiary); border-radius: 12px; cursor: pointer; border: 2px solid transparent;" 
                    class="projection-option ${userProfile.projectionMode === 'average' ? 'selected' : ''}">
                    <input type="radio" name="projectionMode" value="average" ${userProfile.projectionMode === 'average' ? 'checked' : ''} 
                        style="width: 20px; height: 20px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">Average (10%)</div>
                        <div style="font-size: 15px; color: var(--label-secondary);">S&P 500 historical 10-year average</div>
                    </div>
                </label>
                
                <label style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--fill-tertiary); border-radius: 12px; cursor: pointer; border: 2px solid transparent;" 
                    class="projection-option ${userProfile.projectionMode === 'optimistic' ? 'selected' : ''}">
                    <input type="radio" name="projectionMode" value="optimistic" ${userProfile.projectionMode === 'optimistic' ? 'checked' : ''} 
                        style="width: 20px; height: 20px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">Optimistic (13%)</div>
                        <div style="font-size: 15px; color: var(--label-secondary);">Aggressive growth portfolio</div>
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
                <p style="font-size: 13px; color: var(--label-tertiary); margin-top: 4px;">
                    Used for Social Security benefit calculations and retirement projections
                </p>
            </div>
            
            <div class="form-group">
                <label class="form-label">Life Expectancy</label>
                <input type="number" class="form-input" id="lifeExpectancy" value="${userProfile.lifeExpectancy}" min="70" max="120">
                <p style="font-size: 13px; color: var(--label-tertiary); margin-top: 4px;">
                    How long you expect to live (for retirement planning)
                </p>
            </div>
            
            <div style="background: rgba(0, 122, 255, 0.1); padding: 16px; border-radius: 12px; margin-top: 16px;">
                <div style="font-size: 15px; color: var(--label-secondary); margin-bottom: 8px;">
                    <strong>Years until retirement:</strong> ${Math.max(0, userProfile.retirementAge - userProfile.currentAge)} years
                </div>
                <div style="font-size: 15px; color: var(--label-secondary);">
                    <strong>Years in retirement:</strong> ${Math.max(0, userProfile.lifeExpectancy - userProfile.retirementAge)} years
                </div>
            </div>
        </div>
        
        <!-- Save Button -->
        <div class="card" style="text-align: center;">
            <button class="btn btn-primary" onclick="window.saveProfile()" style="padding: 14px 32px; font-size: 17px;">
                💾 Save Settings
            </button>
            <p style="font-size: 13px; color: var(--label-tertiary); margin-top: 12px;">
                Changes will update all calculations and projections
            </p>
        </div>
    `;
    
    // Add radio button styling
    const style = document.createElement('style');
    style.textContent = `
        .projection-option.selected {
            background: rgba(0, 122, 255, 0.1) !important;
            border-color: var(--apple-blue) !important;
        }
        .projection-option input[type="radio"] {
            accent-color: var(--apple-blue);
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners for radio buttons
    document.querySelectorAll('input[name="projectionMode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.projection-option').forEach(opt => opt.classList.remove('selected'));
            radio.closest('.projection-option').classList.add('selected');
        });
    });
}

async function loadProfile() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/profile`).once('value');
        if (snapshot.exists()) {
            userProfile = { ...userProfile, ...snapshot.val() };
        }
        
        window.dispatchEvent(new CustomEvent('profileLoaded', { detail: { profile: userProfile } }));
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

window.saveProfile = async function() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const state = document.getElementById('userState').value;
    const taxFilingStatus = document.getElementById('taxFilingStatus').value;
    const projectionMode = document.querySelector('input[name="projectionMode"]:checked').value;
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy').value);
    
    userProfile = {
        currentAge,
        state,
        taxFilingStatus,
        projectionMode,
        retirementAge,
        lifeExpectancy,
        updatedAt: new Date().toISOString()
    };
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        await database.ref(`users/${userId}/profile`).set(userProfile);
        
        // Show success
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.textContent;
        btn.textContent = '✓ Saved!';
        btn.style.background = 'var(--apple-green)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
        
        // Trigger update events
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { profile: userProfile } }));
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving settings');
    }
};

function getStateTaxInfo(state) {
    const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'];
    const highTaxStates = {
        'CA': 'California has progressive rates from 1% to 13.3%',
        'NY': 'New York has progressive rates from 4% to 10.9%',
        'NJ': 'New Jersey has progressive rates from 1.4% to 10.75%',
        'OR': 'Oregon has progressive rates from 4.75% to 9.9%',
        'MN': 'Minnesota has progressive rates from 5.35% to 9.85%',
        'DC': 'D.C. has progressive rates from 4% to 10.75%',
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
        'NY': 0.065,  // ~6.5% average
        'NJ': 0.065,  // ~6.5% average
        'OR': 0.08,   // ~8% average
        'MN': 0.075,  // ~7.5% average
        'HI': 0.08,   // ~8% average
        'MA': 0.05,   // 5% flat
        'CT': 0.065,  // ~6.5% average
        'IL': 0.0495, // 4.95% flat
        'PA': 0.0307, // 3.07% flat
        'CO': 0.044,  // 4.4% flat
        'NC': 0.045,  // 4.5% flat
        'UT': 0.0465, // 4.65% flat
        'AZ': 0.025,  // 2.5% flat
        'GA': 0.055,  // ~5.5% average
        'VA': 0.055,  // ~5.5% average
        'OH': 0.04,   // ~4% average
        'MI': 0.0425, // 4.25% flat
        'WI': 0.065,  // ~6.5% average
    };
    
    const rate = stateRates[state] || 0.05; // Default 5% if state not listed
    return Math.round(income * rate);
}

console.log('✅ Profile module loaded');
initProfile();
export { userProfile };
