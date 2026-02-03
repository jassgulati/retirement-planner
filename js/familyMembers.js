// Family Members Module
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
            <h2>Family Members</h2>
            <button class="btn" onclick="showAddFamilyForm()">Add Family Member</button>
        </div>
        
        <div id="addFamilyForm" class="card hidden">
            <h3>Add Family Member</h3>
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="familyName" placeholder="Full name">
            </div>
            <div class="form-group">
                <label>Relationship</label>
                <select id="familyRelationship">
                    <option value="self">Self</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Birth Date</label>
                <input type="date" id="familyBirthDate">
            </div>
            <button class="btn" onclick="saveFamilyMember()">Save</button>
            <button class="btn btn-secondary" onclick="hideAddFamilyForm()">Cancel</button>
            <div id="familyMessage" class="hidden"></div>
        </div>
        
        <div class="card">
            <h3>Family Members</h3>
            <div id="familyList"></div>
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
        setTimeout(() => hideAddFamilyForm(), 1500);
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
        container.innerHTML = '<p>No family members added yet.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Name</th><th>Relationship</th><th>Birth Date</th><th>Age</th><th>Actions</th></tr></thead><tbody>';
    
    familyMembers.forEach(member => {
        html += `<tr>
            <td>${member.name}</td>
            <td>${member.relationship}</td>
            <td>${member.birthDate}</td>
            <td>${calculateAge(member.birthDate)}</td>
            <td><button class="btn btn-danger" onclick="deleteFamilyMember('${member.id}')">Delete</button></td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function clearFamilyForm() {
    document.getElementById('familyName').value = '';
    document.getElementById('familyRelationship').value = 'self';
    document.getElementById('familyBirthDate').value = '';
}

initFamilyMembers();
export { familyMembers, loadFamilyMembers };
