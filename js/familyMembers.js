// Family Members Module - Enhanced with Tax Filing Status
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { generateId, showError, showSuccess, calculateAge } from './utils.js';

let database;
let familyMembers = [];
let userProfile = {
    taxFilingStatus: 'single', // single, married_joint, married_separate, head_of_household
    projectionMode: 'average' // conservative, average, optimistic
};

export function initFamilyMembers() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', () => {
        loadFamilyMembers();
        loadUserProfile();
    });
}

export function getUserProfile() {
    return userProfile;
}

export function renderFamilyPage() {
    const container = document.getElementById('family');
    
    container.innerHTML = `
        <!-- User Profile Settings -->
        <div class="card">
            <h2 class="card-title">Tax & Planning Settings</h2>
            <div class="form-group">
                <label class="form-label">Tax Filing Status</label>
                <select class="form-select" id="taxFilingStatus" onchange="saveTaxFilingStatus()">
                    <option value="single">Single</option>
                    <option value="married_joint">Married Filing Jointly</option>
                    <option value="married_separate">Married Filing Separately</option>
                    <option value="head_of_household">Head of Household</option>
                </select>
                <p style="font-size: 13px; color: var(--text-tertiary); margin-top: 8px;">
                    This determines which tax brackets and strategies we show you
                </p>
            </div>
            
            <div class="form-group">
                <label class="form-label">Projection Mode</label>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                    <label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; cursor: pointer;">
                        <input type="radio" name="projectionMode" value="conservative" onchange="saveProjectionMode()" style="width: 20px; height: 20px;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 2px;">Conservative (4%)</div>
                            <div style="font-size: 13px; color: var(--text-tertiary);">Safe, bond-heavy portfolio</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; cursor: pointer;">
                        <input type="radio" name="projectionMode" value="average" onchange="saveProjectionMode()" checked style="width: 20px; height: 20px;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 2px;">Average (10% - S&P 500 Historical)</div>
                            <div style="font-size: 13px; color: var(--text-tertiary);">Based on 10-year S&P 500 average</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; cursor: pointer;">
                        <input type="radio" name="projectionMode" value="optimistic" onchange="saveProjectionMode()" style="width: 20px; height: 20px;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 2px;">Optimistic (13% - S&P + 3%)</div>
                            <div style="font-size: 13px; color: var(--text-tertiary);">Aggressive growth portfolio</div>
                        </div>
                    </label>
                </div>
                <p style="font-size: 13px; color: var(--text-tertiary); margin-top: 8px;">
                    All retirement and investment projections use this rate
                </p>
            </div>
        </div>
        
        <!-- Family Members -->
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 class="card-title" style="margin: 0;">Family Members</h3>
                <button class="btn btn-primary" onclick="showAddFamilyForm()">+ Add Member</button>
            </div>
            <div id="familyList"></div>
        </div>
        
        <!-- Add Family Form -->
        <div id="addFamilyForm" class="card hidden">
            <h3 class="card-title">Add Family Member</h3>
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" id="familyName" placeholder="Full name">
            </div>
            <div class="form-group">
                <label class="form-label">Relationship</label>
                <select class="form-select" id="familyRelationship">
                    <option value="self">Self</option>
                    <option value="spouse">Spouse/Partner</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Birth Date</label>
                <input type="date" class="form-input" id="familyBirthDate">
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary" onclick="saveFamilyMember()" style="flex: 1;">Save</button>
                <button class="btn btn-secondary" onclick="hideAddFamilyForm()">Cancel</button>
            </div>
            <div id="familyMessage" class="hidden"></div>
        </div>
    `;
    
    // Load saved settings
    document.getElementById('taxFilingStatus').value = userProfile.taxFilingStatus;
    const projectionRadios = document.querySelectorAll('input[name="projectionMode"]');
    projectionRadios.forEach(radio => {
        if (radio.value === userProfile.projectionMode) {
            radio.checked = true;
        }
    });
    
    renderFamilyList();
}

async function loadUserProfile() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/profile`).once('value');
        if (snapshot.exists()) {
            const profile = snapshot.val();
            userProfile = {
                taxFilingStatus: profile.taxFilingStatus || 'single',
                projectionMode: profile.projectionMode || 'average'
            };
        }
        
        // Trigger update event
        window.dispatchEvent(new CustomEvent('userProfileLoaded', { detail: userProfile }));
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

window.saveTaxFilingStatus = async function() {
    const status = document.getElementById('taxFilingStatus').value;
    userProfile.taxFilingStatus = status;
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        await database.ref(`users/${userId}/profile/taxFilingStatus`).set(status);
        
        // Show feedback
        const select = document.getElementById('taxFilingStatus');
        const originalBg = select.style.background;
        select.style.background = 'rgba(52, 199, 89, 0.1)';
        select.style.borderColor = 'var(--apple-green)';
        
        setTimeout(() => {
            select.style.background = originalBg;
            select.style.borderColor = '';
        }, 1000);
        
        // Trigger update event for tax page
        window.dispatchEvent(new CustomEvent('taxFilingStatusChanged', { detail: { status } }));
    } catch (error) {
        console.error('Error saving tax filing status:', error);
    }
};

window.saveProjectionMode = async function() {
    const mode = document.querySelector('input[name="projectionMode"]:checked').value;
    userProfile.projectionMode = mode;
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        await database.ref(`users/${userId}/profile/projectionMode`).set(mode);
        
        // Show feedback
        const selectedLabel = document.querySelector('input[name="projectionMode"]:checked').closest('label');
        const originalBg = selectedLabel.style.background;
        selectedLabel.style.background = 'rgba(52, 199, 89, 0.1)';
        selectedLabel.style.border = '2px solid var(--apple-green)';
        
        setTimeout(() => {
            selectedLabel.style.background = originalBg;
            selectedLabel.style.border = '';
        }, 1000);
        
        // Trigger update event for investment/retirement pages
        window.dispatchEvent(new CustomEvent('projectionModeChanged', { detail: { mode } }));
    } catch (error) {
        console.error('Error saving projection mode:', error);
    }
};

async function loadFamilyMembers() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/familyMembers`).once('value');
        familyMembers = [];
        
        snapshot.forEach(child => {
            familyMembers.push({
                id: child.key,
                ...child.val()
            });
        });
        
        renderFamilyList();
        window.dispatchEvent(new CustomEvent('familyMembersLoaded', { detail: { familyMembers } }));
    } catch (error) {
        console.error('Error loading family members:', error);
    }
}

window.showAddFamilyForm = function() {
    document.getElementById('addFamilyForm').classList.remove('hidden');
};

window.hideAddFamilyForm = function() {
    document.getElementById('addFamilyForm').classList.add('hidden');
    clearFamilyForm();
};

window.saveFamilyMember = async function() {
    const name = document.getElementById('familyName').value;
    const relationship = document.getElementById('familyRelationship').value;
    const birthDate = document.getElementById('familyBirthDate').value;
    
    if (!name || !birthDate) {
        showError('familyMessage', 'Please fill in all fields');
        return;
    }
    
    const member = {
        name,
        relationship,
        birthDate,
        age: calculateAge(birthDate)
    };
    
    const userId = getUserId();
    const memberId = generateId();
    
    try {
        await database.ref(`users/${userId}/familyMembers/${memberId}`).set(member);
        showSuccess('familyMessage', 'Family member saved!');
        await loadFamilyMembers();
        setTimeout(() => window.hideAddFamilyForm(), 1500);
    } catch (error) {
        console.error('Error saving family member:', error);
        showError('familyMessage', 'Error saving. Please try again.');
    }
};

window.deleteFamilyMember = async function(memberId) {
    if (!confirm('Delete this family member?')) return;
    
    const userId = getUserId();
    try {
        await database.ref(`users/${userId}/familyMembers/${memberId}`).remove();
        await loadFamilyMembers();
    } catch (error) {
        console.error('Error deleting:', error);
    }
};

function renderFamilyList() {
    const container = document.getElementById('familyList');
    if (!container) return;
    
    if (familyMembers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 32px 16px;">No family members added yet.</p>';
        return;
    }
    
    let html = '<div class="table-container"><table>';
    html += '<thead><tr><th>Name</th><th>Relationship</th><th>Age</th><th>Birth Date</th><th>Actions</th></tr></thead><tbody>';
    
    familyMembers.forEach(member => {
        html += `<tr>
            <td style="font-weight: 600;">${member.name}</td>
            <td>${member.relationship}</td>
            <td>${calculateAge(member.birthDate)}</td>
            <td>${new Date(member.birthDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-secondary" onclick="deleteFamilyMember('${member.id}')" 
                    style="padding: 6px 12px; font-size: 13px; background: rgba(255, 59, 48, 0.1); color: var(--apple-red);">
                    Delete
                </button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function clearFamilyForm() {
    document.getElementById('familyName').value = '';
    document.getElementById('familyRelationship').value = 'self';
    document.getElementById('familyBirthDate').value = '';
}

initFamilyMembers();
export { familyMembers, loadFamilyMembers, getUserProfile };
