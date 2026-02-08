// Family Members Module - Fixed
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { generateId, showError, showSuccess, calculateAge } from './utils.js';

let database;
let familyMembers = [];

export function initFamilyMembers() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', () => {
        loadFamilyMembers();
    });
}

export function renderFamilyPage() {
    const container = document.getElementById('family');
    
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 class="card-title" style="margin: 0;">Family Members</h3>
                <button class="btn btn-primary" onclick="showAddFamilyForm()">+ Add Member</button>
            </div>
            <div id="familyList"></div>
        </div>
        
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
    
    renderFamilyList();
}

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
                    style="padding: 6px 12px; font-size: 13px;">
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

// Single export statement - no duplicates
export { familyMembers, loadFamilyMembers };
