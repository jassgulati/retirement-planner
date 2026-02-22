// Family Members Module - FIXED VERSION
import { database } from './config.js';
import { getUserId } from './auth.js';

let familyMembers = {};

// This is called by app.js when navigating to the Family page
export function initFamilyMembers() {
    console.log('👨‍👩‍👧‍👦 Initializing Family Members module...');
    
    // Render the page
    renderFamilyPage();
    
    // Load family members from Firebase
    loadFamilyMembers();
}

function renderFamilyPage() {
    const container = document.getElementById('content');
    if (!container) {
        console.error('❌ Content container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">👨‍👩‍👧‍👦 Family Members</h2>
            <p style="color: #666; margin-bottom: 20px;">
                Add your family members to track ages and link income sources.
            </p>
            <button id="addFamilyMemberBtn" class="btn btn-primary">
                + Add Family Member
            </button>
        </div>
        
        <div id="familyList"></div>
        
        <!-- Add/Edit Modal -->
        <div id="familyModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
            <div class="card" style="width: 90%; max-width: 500px; margin: 20px;">
                <h3 class="card-title">Add Family Member</h3>
                
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-input" id="memberName" placeholder="e.g., John Doe">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Relationship</label>
                    <select class="form-select" id="memberRelationship">
                        <option value="self">Self</option>
                        <option value="spouse">Spouse</option>
                        <option value="partner">Partner</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Birth Date</label>
                    <input type="date" class="form-input" id="memberBirthDate">
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button id="saveFamilyMemberBtn" class="btn btn-primary" style="flex: 1;">
                        Save
                    </button>
                    <button id="cancelFamilyMemberBtn" class="btn" style="flex: 1; background: #f5f5f7;">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Family page rendered');
}

function setupEventListeners() {
    const addBtn = document.getElementById('addFamilyMemberBtn');
    const saveBtn = document.getElementById('saveFamilyMemberBtn');
    const cancelBtn = document.getElementById('cancelFamilyMemberBtn');
    
    if (addBtn) {
        addBtn.addEventListener('click', showAddModal);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveFamilyMember);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideModal);
    }
}

function showAddModal() {
    const modal = document.getElementById('familyModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideModal() {
    const modal = document.getElementById('familyModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Clear form
    document.getElementById('memberName').value = '';
    document.getElementById('memberRelationship').value = 'self';
    document.getElementById('memberBirthDate').value = '';
}

async function saveFamilyMember() {
    const name = document.getElementById('memberName').value.trim();
    const relationship = document.getElementById('memberRelationship').value;
    const birthDate = document.getElementById('memberBirthDate').value;
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    if (!birthDate) {
        alert('Please enter a birth date');
        return;
    }
    
    const userId = getUserId();
    if (!userId) {
        alert('Please log in');
        return;
    }
    
    // Calculate age
    const age = calculateAge(birthDate);
    
    const member = {
        name,
        relationship,
        birthDate,
        age,
        createdAt: new Date().toISOString()
    };
    
    try {
        const memberId = 'fam_' + Date.now();
        await database.ref(`users/${userId}/familyMembers/${memberId}`).set(member);
        
        console.log('✅ Family member saved');
        hideModal();
        loadFamilyMembers();
    } catch (error) {
        console.error('❌ Error saving family member:', error);
        alert('Error saving family member');
    }
}

async function loadFamilyMembers() {
    const userId = getUserId();
    if (!userId) return;
    
    console.log('📥 Loading family members...');
    
    try {
        const snapshot = await database.ref(`users/${userId}/familyMembers`).once('value');
        familyMembers = snapshot.val() || {};
        
        console.log('✅ Loaded', Object.keys(familyMembers).length, 'family members');
        displayFamilyMembers();
    } catch (error) {
        console.error('❌ Error loading family members:', error);
    }
}

function displayFamilyMembers() {
    const container = document.getElementById('familyList');
    if (!container) {
        console.error('❌ familyList container not found');
        return;
    }
    
    const members = Object.entries(familyMembers);
    
    if (members.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px;">
                <p style="color: #666; font-size: 16px;">No family members yet. Add your first one!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = members.map(([id, member]) => `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">
                        ${member.name}
                    </h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 12px; color: #666; font-size: 15px;">
                        <span>${member.relationship}</span>
                        <span>•</span>
                        <span>Age ${member.age}</span>
                        <span>•</span>
                        <span>${formatDate(member.birthDate)}</span>
                    </div>
                </div>
                <button onclick="deleteFamilyMember('${id}')" class="btn" style="background: #ff3b30; color: white; padding: 8px 16px;">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Make delete function global so it can be called from HTML
window.deleteFamilyMember = async function(memberId) {
    if (!confirm('Are you sure you want to delete this family member?')) {
        return;
    }
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
        await database.ref(`users/${userId}/familyMembers/${memberId}`).remove();
        console.log('✅ Family member deleted');
        loadFamilyMembers();
    } catch (error) {
        console.error('❌ Error deleting family member:', error);
        alert('Error deleting family member');
    }
};

console.log('✅ Family Members module loaded');
