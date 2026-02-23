// Utility Functions
export function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

export function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = '#FF3B30';
        element.style.display = 'block';
    }
}

export function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

console.log('✅ Utils module loaded');
