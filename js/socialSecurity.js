// Social Security Module
import { initializeFirebase } from './config.js';
import { getUserId } from './auth.js';
import { formatCurrency, calculateAge, generateId, showError, showSuccess } from './utils.js';

let database;
let ssRecords = [];
let familyMembers = [];

export function initSocialSecurity() {
    const { database: db } = initializeFirebase();
    database = db;
    
    window.addEventListener('userLoggedIn', loadSSRecords);
    window.addEventListener('familyMembersLoaded', (e) => {
        familyMembers = e.detail.familyMembers;
        updateSSFamilyDropdown();
    });
}

export function renderSocialSecurityPage() {
    document.getElementById('socialSecurity').innerHTML = `
        <div class="card">
            <h2>Social Security Benefits</h2>
            <button class="btn" onclick="showAddSSForm()">Add SS Record</button>
        </div>
        
        <div id="addSSForm" class="card hidden">
            <h3>Add Social Security Record</h3>
            <div class="form-group">
                <label>Family Member</label>
                <select id="ssMember"></select>
            </div>
            <div class="form-group">
                <label>Full Retirement Age (FRA) Monthly Benefit ($)</label>
                <input type="number" id="ssMonthlyBenefit" step="0.01" placeholder="Benefit at age 67">
            </div>
            <div class="form-group">
                <label>Planned Claiming Age</label>
                <input type="number" id="ssClaimAge" min="62" max="70" value="67">
            </div>
            <button class="btn" onclick="saveSS()">Save</button>
            <button class="btn btn-secondary" onclick="hideAddSSForm()">Cancel</button>
            <div id="ssMessage" class="hidden"></div>
        </div>
        
        <div class="card">
            <h3>Social Security Records</h3>
            <div id="ssList"></div>
        </div>
        
        <div class="card">
            <h3>Benefit Scenarios</h3>
            <div id="ssScenarios"></div>
        </div>
    `;
    
    renderSSList();
    renderSSScenarios();
}

async function loadSSRecords() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const snapshot = await database.ref(`users/${userId}/socialSecurity`).once('value');
        ssRecords = [];
        snapshot.forEach(child => {
            ssRecords.push({ id: child.key, ...child.val() });
        });
        renderSSList();
        renderSSScenarios();
    } catch (error) {
        console.error('Error loading SS records:', error);
    }
}

function updateSSFamilyDropdown() {
    const select = document.getElementById('ssMember');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select family member</option>';
    familyMembers.forEach(member => {
        select.innerHTML += `<option value="${member.id}">${member.name}</option>`;
    });
}

window.showAddSSForm = () => document.getElementById('addSSForm').classList.remove('hidden');
window.hideAddSSForm = () => {
    document.getElementById('addSSForm').classList.add('hidden');
    document.getElementById('ssMonthlyBenefit').value = '';
    document.getElementById('ssClaimAge').value = '67';
};

window.saveSS = async function() {
    const memberId = document.getElementById('ssMember').value;
    const monthlyBenefit = parseFloat(document.getElementById('ssMonthlyBenefit').value);
    const claimAge = parseInt(document.getElementById('ssClaimAge').value);
    
    if (!memberId || !monthlyBenefit) {
        showError('ssMessage', 'Please fill in all fields');
        return;
    }
    
    const member = familyMembers.find(m => m.id === memberId);
    const adjustedBenefit = calculateSSBenefit(monthlyBenefit, claimAge);
    
    const record = {
        memberId,
        memberName: member?.name || '',
        monthlyBenefitFRA: monthlyBenefit,
        claimAge,
        adjustedMonthlyBenefit: adjustedBenefit,
        annualBenefit: adjustedBenefit * 12
    };
    
    try {
        await database.ref(`users/${getUserId()}/socialSecurity/${generateId()}`).set(record);
        showSuccess('ssMessage', 'SS record saved!');
        await loadSSRecords();
        setTimeout(window.hideAddSSForm, 1500);
    } catch (error) {
        showError('ssMessage', 'Error saving record');
    }
};

window.deleteSS = async function(id) {
    if (!confirm('Delete this SS record?')) return;
    try {
        await database.ref(`users/${getUserId()}/socialSecurity/${id}`).remove();
        await loadSSRecords();
    } catch (error) {
        console.error('Error deleting:', error);
    }
};

function calculateSSBenefit(fraAmount, claimAge) {
    // Simplified SS adjustment calculation
    const fra = 67;
    if (claimAge === fra) return fraAmount;
    
    if (claimAge < fra) {
        // Early claiming reduction: ~6.67% per year before FRA
        const yearsEarly = fra - claimAge;
        const reduction = yearsEarly * 0.0667;
        return fraAmount * (1 - reduction);
    } else {
        // Delayed claiming increase: 8% per year after FRA
        const yearsLate = claimAge - fra;
        const increase = yearsLate * 0.08;
        return fraAmount * (1 + increase);
    }
}

function renderSSList() {
    const container = document.getElementById('ssList');
    if (!container) return;
    
    if (ssRecords.length === 0) {
        container.innerHTML = '<p>No SS records added yet.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Member</th><th>FRA Benefit</th><th>Claim Age</th><th>Adjusted Benefit</th><th>Annual</th><th>Actions</th></tr></thead><tbody>';
    ssRecords.forEach(record => {
        html += `<tr>
            <td>${record.memberName}</td>
            <td>${formatCurrency(record.monthlyBenefitFRA)}</td>
            <td>${record.claimAge}</td>
            <td>${formatCurrency(record.adjustedMonthlyBenefit)}</td>
            <td>${formatCurrency(record.annualBenefit)}</td>
            <td><button class="btn btn-danger" onclick="deleteSS('${record.id}')">Delete</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderSSScenarios() {
    const container = document.getElementById('ssScenarios');
    if (!container) return;
    
    if (ssRecords.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    
    let html = '';
    
    ssRecords.forEach(record => {
        html += `<h4>${record.memberName}</h4>`;
        html += '<table><thead><tr><th>Claim Age</th><th>Monthly Benefit</th><th>Annual Benefit</th></tr></thead><tbody>';
        
        for (let age = 62; age <= 70; age++) {
            const benefit = calculateSSBenefit(record.monthlyBenefitFRA, age);
            const highlight = age === record.claimAge ? ' style="background: #e8f4fd; font-weight: bold;"' : '';
            
            html += `<tr${highlight}>
                <td>${age}</td>
                <td>${formatCurrency(benefit)}</td>
                <td>${formatCurrency(benefit * 12)}</td>
            </tr>`;
        }
        
        html += '</tbody></table><br>';
    });
    
    container.innerHTML = html;
}

initSocialSecurity();
export { ssRecords };
