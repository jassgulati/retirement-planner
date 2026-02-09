// Family Members Module - FULLY FIXED
import { initializeFirebase } from './config.js';
import { generateId, calculateAge } from './utils.js';

let database;
export let familyMembers = [];

export function initFamilyMembers() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', () => {
        loadFamilyMembers();
    });
}

// Make getUserId available globally
function getUserId() {
    if (window.getUserId) {
        return window.getUserId();
    }
    const user = firebase.auth().currentUser;
    return user ? user.uid : null;
}

export function renderFamilyPage() {
    const container = document.getElementById('family');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 class="card-title" style="margin: 0;">Family Members</h3>
                <button class="btn btn-primary" onclick="window.showAddFamilyForm()">+ Add Member</button>
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
                <button class="btn btn-primary" onclick="window.saveFamilyMember()" style="flex: 1;">Save</button>
                <button class="btn btn-secondary" onclick="window.hideAddFamilyForm()">Cancel</button>
            </div>
            <div id="familyMessage" style="margin-top: 12px; padding: 12px; border-radius: 8px; display: none;"></div>
        </div>
    `;
    
    renderFamilyList();
}

export async function loadFamilyMembers() {
    const userId = getUserId();
    if (!userId) {
        console.log('No user ID, skipping family load');
        return;
    }
    
    try {
        const snapshot = await database.ref(`users/${userId}/familyMembers`).once('value');
        familyMembers = [];
        
        snapshot.forEach(child => {
            familyMembers.push({
                id: child.key,
                ...child.val()
            });
        });
        
        console.log('Loaded family members:', familyMembers.length);
        renderFamilyList();
        window.dispatchEvent(new CustomEvent('familyMembersLoaded', { detail: { familyMembers } }));
    } catch (error) {
        console.error('Error loading family members:', error);
    }
}

window.showAddFamilyForm = function() {
    const form = document.getElementById('addFamilyForm');
    if (form) {
        form.classList.remove('hidden');
        // Scroll to form on mobile
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

window.hideAddFamilyForm = function() {
    const form = document.getElementById('addFamilyForm');
    if (form) {
        form.classList.add('hidden');
        clearFamilyForm();
    }
};

window.saveFamilyMember = async function() {
    console.log('Save button clicked');
    
    const name = document.getElementById('familyName').value.trim();
    const relationship = document.getElementById('familyRelationship').value;
    const birthDate = document.getElementById('familyBirthDate').value;
    
    console.log('Form values:', { name, relationship, birthDate });
    
    // Validation
    if (!name) {
        showMessage('Please enter a name', 'error');
        return;
    }
    
    if (!birthDate) {
        showMessage('Please enter a birth date', 'error');
        return;
    }
    
    const userId = getUserId();
    if (!userId) {
        showMessage('You must be logged in', 'error');
        return;
    }
    
    const member = {
        name,
        relationship,
        birthDate,
        age: calculateAge(birthDate),
        createdAt: new Date().toISOString()
    };
    
    const memberId = 'fam_' + Date.now();
    
    console.log('Saving member:', member);
    
    try {
        await database.ref(`users/${userId}/familyMembers/${memberId}`).set(member);
        console.log('Member saved successfully');
        
        showMessage('Family member saved!', 'success');
        
        // Reload the list
        await loadFamilyMembers();
        
        // Hide form after short delay
        setTimeout(() => {
            window.hideAddFamilyForm();
        }, 1500);
        
    } catch (error) {
        console.error('Error saving family member:', error);
        showMessage('Error saving. Please try again.', 'error');
    }
};

window.deleteFamilyMember = async function(memberId) {
    if (!confirm('Delete this family member?')) return;
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        await database.ref(`users/${userId}/familyMembers/${memberId}`).remove();
        console.log('Member deleted');
        await loadFamilyMembers();
    } catch (error) {
        console.error('Error deleting:', error);
        showMessage('Error deleting member', 'error');
    }
};

function renderFamilyList() {
    const container = document.getElementById('familyList');
    if (!container) return;
    
    if (familyMembers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 32px 16px;">No family members added yet.<br>Tap "+ Add Member" to get started.</p>';
        return;
    }
    
    // Mobile-friendly card layout
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        let html = '<div style="display: grid; gap: 12px;">';
        familyMembers.forEach(member => {
            html += `
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px;">${member.name}</div>
                            <div style="font-size: 15px; color: var(--text-secondary);">${member.relationship}</div>
                        </div>
                        <button onclick="window.deleteFamilyMember('${member.id}')" 
                            style="background: rgba(255, 59, 48, 0.1); color: var(--apple-red); border: none; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                            Delete
                        </button>
                    </div>
                    <div style="display: flex; gap: 16px; font-size: 15px; color: var(--text-secondary);">
                        <div><strong>Age:</strong> ${calculateAge(member.birthDate)}</div>
                        <div><strong>Born:</strong> ${new Date(member.birthDate).toLocaleDateString()}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } else {
        // Desktop table layout
        let html = '<div class="table-container"><table>';
        html += '<thead><tr><th>Name</th><th>Relationship</th><th>Age</th><th>Birth Date</th><th>Actions</th></tr></thead><tbody>';
        
        familyMembers.forEach(member => {
            html += `<tr>
                <td style="font-weight: 600;">${member.name}</td>
                <td>${member.relationship}</td>
                <td>${calculateAge(member.birthDate)}</td>
                <td>${new Date(member.birthDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary" onclick="window.deleteFamilyMember('${member.id}')" 
                        style="padding: 6px 12px; font-size: 13px;">
                        Delete
                    </button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }
}

function clearFamilyForm() {
    const nameInput = document.getElementById('familyName');
    const relationshipInput = document.getElementById('familyRelationship');
    const birthDateInput = document.getElementById('familyBirthDate');
    
    if (nameInput) nameInput.value = '';
    if (relationshipInput) relationshipInput.value = 'self';
    if (birthDateInput) birthDateInput.value = '';
    
    const message = document.getElementById('familyMessage');
    if (message) {
        message.style.display = 'none';
    }
}

function showMessage(text, type) {
    const message = document.getElementById('familyMessage');
    if (!message) return;
    
    message.textContent = text;
    message.style.display = 'block';
    
    if (type === 'success') {
        message.style.background = 'rgba(52, 199, 89, 0.1)';
        message.style.color = 'var(--apple-green)';
        message.style.border = '1px solid rgba(52, 199, 89, 0.3)';
    } else {
        message.style.background = 'rgba(255, 59, 48, 0.1)';
        message.style.color = 'var(--apple-red)';
        message.style.border = '1px solid rgba(255, 59, 48, 0.3)';
    }
}

initFamilyMembers();
