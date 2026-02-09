// Family Members Module - ULTRA DEBUG VERSION
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { calculateAge } from './utils.js';

let database;
export let familyMembers = [];
let isSaving = false;

export function initFamilyMembers() {
    console.log('🔵 Initializing Family Members module');
    const { database: db } = initializeFirebase();
    database = db;
    console.log('🔵 Database reference:', database ? 'OK' : 'MISSING');
    
    window.addEventListener('userLoggedIn', () => {
        console.log('🔵 User logged in event received');
        setTimeout(() => {
            loadFamilyMembers();
        }, 500);
    });
}

export function renderFamilyPage() {
    console.log('🔵 Rendering Family page');
    const container = document.getElementById('family');
    if (!container) {
        console.error('❌ Family container not found!');
        return;
    }
    
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
            <form id="familyForm">
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-input" id="familyName" placeholder="Full name" autocomplete="off">
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
                    <button type="button" class="btn btn-primary" id="saveFamilyBtn" style="flex: 1;">Save</button>
                    <button type="button" class="btn btn-secondary" id="cancelFamilyBtn">Cancel</button>
                </div>
                <div id="familyMessage" style="margin-top: 12px; padding: 12px; border-radius: 10px; display: none;"></div>
            </form>
        </div>
    `;
    
    document.getElementById('showAddFamilyBtn').onclick = showAddFamilyForm;
    document.getElementById('saveFamilyBtn').onclick = saveFamilyMember;
    document.getElementById('cancelFamilyBtn').onclick = hideAddFamilyForm;
    
    console.log('🔵 Event listeners attached');
    renderFamilyList();
}

export async function loadFamilyMembers() {
    const userId = getUserId();
    console.log('🔵 loadFamilyMembers called, userId:', userId);
    
    if (!userId) {
        console.log('⚠️ No user ID yet');
        return;
    }
    
    try {
        console.log('🔵 Fetching from Firebase path: users/' + userId + '/familyMembers');
        const snapshot = await database.ref(`users/${userId}/familyMembers`).once('value');
        console.log('🔵 Firebase snapshot exists:', snapshot.exists());
        console.log('🔵 Number of children:', snapshot.numChildren());
        
        familyMembers = [];
        snapshot.forEach(child => {
            const member = {
                id: child.key,
                ...child.val()
            };
            console.log('🔵 Found member:', member);
            familyMembers.push(member);
        });
        
        console.log('✅ Loaded', familyMembers.length, 'family members');
        renderFamilyList();
    } catch (error) {
        console.error('❌ Error loading family members:', error);
    }
}

function showAddFamilyForm() {
    console.log('🔵 showAddFamilyForm called');
    const form = document.getElementById('addFamilyForm');
    if (form) {
        form.classList.remove('hidden');
        document.getElementById('familyName').focus();
    }
}

function hideAddFamilyForm() {
    console.log('🔵 hideAddFamilyForm called');
    const form = document.getElementById('addFamilyForm');
    if (form) {
        form.classList.add('hidden');
        document.getElementById('familyForm').reset();
    }
    const message = document.getElementById('familyMessage');
    if (message) message.style.display = 'none';
}

async function saveFamilyMember() {
    console.log('🟢 ========== SAVE CLICKED ==========');
    
    if (isSaving) {
        console.log('⚠️ Already saving, aborting');
        return;
    }
    
    isSaving = true;
    const saveBtn = document.getElementById('saveFamilyBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }
    
    try {
        const name = document.getElementById('familyName').value.trim();
        const relationship = document.getElementById('familyRelationship').value;
        const birthDate = document.getElementById('familyBirthDate').value;
        
        console.log('🟢 Form data:', { name, relationship, birthDate });
        
        if (!name) {
            console.log('❌ Validation failed: no name');
            showMessage('Please enter a name', 'error');
            return;
        }
        
        if (!birthDate) {
            console.log('❌ Validation failed: no birth date');
            showMessage('Please enter a birth date', 'error');
            return;
        }
        
        const userId = getUserId();
        console.log('🟢 User ID:', userId);
        
        if (!userId) {
            console.log('❌ No user ID - not logged in');
            showMessage('Please log in first', 'error');
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
        const path = `users/${userId}/familyMembers/${memberId}`;
        
        console.log('🟢 Saving to path:', path);
        console.log('🟢 Member data:', member);
        console.log('🟢 Database ref exists:', database ? 'YES' : 'NO');
        
        // Try the save
        const ref = database.ref(path);
        console.log('🟢 Created reference');
        
        await ref.set(member);
        console.log('✅✅✅ SAVED TO FIREBASE SUCCESSFULLY! ✅✅✅');
        
        showMessage('✓ Saved successfully!', 'success');
        
        // Wait a moment then reload
        console.log('🟢 Waiting 1 second before reload...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🟢 Reloading family list...');
        await loadFamilyMembers();
        
        console.log('🟢 Hiding form...');
        setTimeout(() => {
            hideAddFamilyForm();
        }, 1500);
        
    } catch (error) {
        console.error('❌❌❌ ERROR SAVING:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        showMessage('Error: ' + error.message, 'error');
    } finally {
        isSaving = false;
        const saveBtn = document.getElementById('saveFamilyBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
        }
    }
}

window.deleteFamilyMember = async function(memberId) {
    if (!confirm('Delete this family member?')) return;
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        console.log('🔵 Deleting:', memberId);
        await database.ref(`users/${userId}/familyMembers/${memberId}`).remove();
        console.log('✅ Deleted successfully');
        await loadFamilyMembers();
    } catch (error) {
        console.error('❌ Error deleting:', error);
    }
};

function renderFamilyList() {
    const container = document.getElementById('familyList');
    if (!container) {
        console.error('❌ familyList container not found');
        return;
    }
    
    console.log('🔵 Rendering', familyMembers.length, 'family members');
    
    if (familyMembers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--label-tertiary);">
                <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                <p style="font-size: 17px; margin-bottom: 8px;">No family members yet</p>
                <p style="font-size: 15px;">Tap "+ Add" to add your first family member</p>
            </div>
        `;
        return;
    }
    
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        let html = '<div style="display: grid; gap: 12px;">';
        familyMembers.forEach(member => {
            html += `
                <div style="background: var(--fill-quaternary); padding: 16px; border-radius: 12px; border: 0.5px solid var(--separator);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 17px; font-weight: 600; color: var(--label-primary);">${member.name}</div>
                            <div style="font-size: 15px; color: var(--label-secondary); text-transform: capitalize;">${member.relationship}</div>
                        </div>
                        <button onclick="window.deleteFamilyMember('${member.id}')" 
                            style="background: rgba(255, 59, 48, 0.12); color: var(--apple-red); border: none; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600;">
                            Delete
                        </button>
                    </div>
                    <div style="font-size: 15px; color: var(--label-secondary);">
                        Age: ${calculateAge(member.birthDate)} • Born: ${new Date(member.birthDate).toLocaleDateString()}
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
                    <button onclick="window.deleteFamilyMember('${member.id}')" class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px;">
                        Delete
                    </button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }
}

function showMessage(text, type) {
    console.log('🔵 Showing message:', text, type);
    const message = document.getElementById('familyMessage');
    if (!message) return;
    
    message.textContent = text;
    message.style.display = 'block';
    
    if (type === 'success') {
        message.style.background = 'rgba(52, 199, 89, 0.12)';
        message.style.color = 'var(--apple-green)';
    } else {
        message.style.background = 'rgba(255, 59, 48, 0.12)';
        message.style.color = 'var(--apple-red)';
    }
}

console.log('✅✅✅ Family Members module loaded ✅✅✅');
initFamilyMembers();
