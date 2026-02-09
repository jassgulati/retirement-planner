// Family Members Module - FIXED (No Duplicate Saves)
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { calculateAge } from './utils.js';

let database;
export let familyMembers = [];
let isSaving = false; // Prevent duplicate saves

export function initFamilyMembers() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', () => {
        console.log('Family module: user logged in, loading members');
        loadFamilyMembers();
    });
}

export function renderFamilyPage() {
    const container = document.getElementById('family');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 class="card-title" style="margin: 0;">Family Members</h3>
                <button class="btn btn-primary" id="showAddFamilyBtn" style="padding: 8px 16px; font-size: 15px;">+ Add</button>
            </div>
            <div id="familyList"></div>
        </div>
        
        <div id="addFamilyForm" class="card hidden">
            <h3 class="card-title">Add Family Member</h3>
            <form id="familyForm" onsubmit="return false;">
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-input" id="familyName" placeholder="Full name" autocomplete="off" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Relationship</label>
                    <select class="form-select" id="familyRelationship" required>
                        <option value="self">Self</option>
                        <option value="spouse">Spouse/Partner</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Birth Date</label>
                    <input type="date" class="form-input" id="familyBirthDate" required>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button type="submit" class="btn btn-primary" id="saveFamilyBtn" style="flex: 1;">Save</button>
                    <button type="button" class="btn btn-secondary" id="cancelFamilyBtn">Cancel</button>
                </div>
                <div id="familyMessage" style="margin-top: 12px; padding: 12px; border-radius: 10px; display: none;"></div>
            </form>
        </div>
    `;
    
    // Attach event listeners
    document.getElementById('showAddFamilyBtn').addEventListener('click', showAddFamilyForm);
    document.getElementById('familyForm').addEventListener('submit', saveFamilyMember);
    document.getElementById('cancelFamilyBtn').addEventListener('click', hideAddFamilyForm);
    
    renderFamilyList();
}

export async function loadFamilyMembers() {
    const userId = getUserId();
    console.log('Loading family members for user:', userId);
    
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
        
        console.log('Loaded', familyMembers.length, 'family members');
        renderFamilyList();
        window.dispatchEvent(new CustomEvent('familyMembersLoaded', { detail: { familyMembers } }));
    } catch (error) {
        console.error('Error loading family members:', error);
    }
}

function showAddFamilyForm(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Showing add family form');
    const form = document.getElementById('addFamilyForm');
    if (form) {
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        document.getElementById('familyName').focus();
    }
}

function hideAddFamilyForm(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const form = document.getElementById('addFamilyForm');
    if (form) {
        form.classList.add('hidden');
        clearFamilyForm();
    }
}

async function saveFamilyMember(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent duplicate saves
    if (isSaving) {
        console.log('Already saving, ignoring duplicate call');
        return false;
    }
    
    isSaving = true;
    console.log('=== SAVE FAMILY MEMBER CLICKED ===');
    
    const saveBtn = document.getElementById('saveFamilyBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }
    
    try {
        const name = document.getElementById('familyName').value.trim();
        const relationship = document.getElementById('familyRelationship').value;
        const birthDate = document.getElementById('familyBirthDate').value;
        
        console.log('Form values:', { name, relationship, birthDate });
        
        if (!name || !birthDate) {
            showMessage('Please fill in all fields', 'error');
            return false;
        }
        
        const userId = getUserId();
        console.log('User ID:', userId);
        
        if (!userId) {
            showMessage('You must be logged in', 'error');
            return false;
        }
        
        const member = {
            name,
            relationship,
            birthDate,
            age: calculateAge(birthDate),
            createdAt: new Date().toISOString()
        };
        
        const memberId = 'fam_' + Date.now();
        console.log('Saving to Firebase:', memberId);
        
        await database.ref(`users/${userId}/familyMembers/${memberId}`).set(member);
        console.log('✅ Saved successfully!');
        
        showMessage('✓ Family member added!', 'success');
        
        // Reload list
        await loadFamilyMembers();
        
        // Hide form after delay
        setTimeout(() => {
            hideAddFamilyForm();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error:', error);
        showMessage('Error: ' + error.message, 'error');
    } finally {
        isSaving = false;
        const saveBtn = document.getElementById('saveFamilyBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
        }
    }
    
    return false;
}

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
    }
};

function renderFamilyList() {
    const container = document.getElementById('familyList');
    if (!container) return;
    
    if (familyMembers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--label-tertiary); padding: 32px 16px; font-size: 15px;">No family members yet.<br>Tap "+ Add" to get started.</p>';
        return;
    }
    
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        let html = '<div style="display: grid; gap: 12px;">';
        familyMembers.forEach(member => {
            html += `
                <div style="background: var(--fill-quaternary); padding: 16px; border-radius: 12px; border: 0.5px solid var(--separator);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <div style="font-size: 17px; font-weight: 600; margin-bottom: 4px; color: var(--label-primary);">${member.name}</div>
                            <div style="font-size: 15px; color: var(--label-secondary); text-transform: capitalize;">${member.relationship}</div>
                        </div>
                        <button onclick="window.deleteFamilyMember('${member.id}')" 
                            style="background: rgba(255, 59, 48, 0.12); color: var(--apple-red); border: none; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                            Delete
                        </button>
                    </div>
                    <div style="display: flex; gap: 20px; font-size: 15px; color: var(--label-secondary);">
                        <div><strong>Age:</strong> ${calculateAge(member.birthDate)}</div>
                        <div><strong>Born:</strong> ${new Date(member.birthDate).toLocaleDateString()}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } else {
        let html = '<div class="table-container"><table>';
        html += '<thead><tr><th>Name</th><th>Relationship</th><th>Age</th><th>Birth Date</th><th>Actions</th></tr></thead><tbody>';
        
        familyMembers.forEach(member => {
            html += `<tr>
                <td style="font-weight: 600;">${member.name}</td>
                <td style="text-transform: capitalize;">${member.relationship}</td>
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
    const form = document.getElementById('familyForm');
    if (form) {
        form.reset();
    }
    
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
        message.style.background = 'rgba(52, 199, 89, 0.12)';
        message.style.color = 'var(--apple-green)';
        message.style.border = '1px solid rgba(52, 199, 89, 0.3)';
    } else {
        message.style.background = 'rgba(255, 59, 48, 0.12)';
        message.style.color = 'var(--apple-red)';
        message.style.border = '1px solid rgba(255, 59, 48, 0.3)';
    }
}

console.log('✅ Family Members module loaded');
initFamilyMembers();
