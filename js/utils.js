// Utility Functions

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatPercent(value) {
    return (value * 100).toFixed(2) + '%';
}

export function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export function getYearsUntilRetirement(birthDate, retirementAge = 67) {
    const age = calculateAge(birthDate);
    return Math.max(0, retirementAge - age);
}

export function calculateCompoundGrowth(principal, rate, years) {
    return principal * Math.pow(1 + rate, years);
}

export function calculateFutureValue(principal, monthlyContribution, rate, years) {
    const monthlyRate = rate / 12;
    const months = years * 12;
    
    // Future value of principal
    const fvPrincipal = principal * Math.pow(1 + rate, years);
    
    // Future value of monthly contributions (annuity)
    const fvContributions = monthlyContribution * 
        (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    
    return fvPrincipal + fvContributions;
}

export function calculateMonthlyPayment(principal, rate, years) {
    const monthlyRate = rate / 12;
    const months = years * 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
}

export function inflationAdjust(amount, years, inflationRate = 0.03) {
    return amount * Math.pow(1 + inflationRate, years);
}

export function presentValue(futureAmount, years, discountRate = 0.03) {
    return futureAmount / Math.pow(1 + discountRate, years);
}

export function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = type;
    element.classList.remove('hidden');
    
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

export function showError(elementId, message) {
    showMessage(elementId, message, 'error');
}

export function showSuccess(elementId, message) {
    showMessage(elementId, message, 'success');
}

export function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function sortByDate(array, dateField, ascending = false) {
    return array.sort((a, b) => {
        const dateA = new Date(a[dateField]);
        const dateB = new Date(b[dateField]);
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

export function sumBy(array, key) {
    return array.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

export function validateNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

export function validatePositiveNumber(value) {
    return validateNumber(value) && parseFloat(value) > 0;
}

export function validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function createTable(data, columns) {
    let html = '<table><thead><tr>';
    columns.forEach(col => {
        html += `<th>${col.header}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    data.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            const value = col.format ? col.format(row[col.key]) : row[col.key];
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
}

export function downloadCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}
