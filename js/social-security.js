// Social Security Calculation Module

// Social Security bend points and constants (2024 values)
const SS_CONSTANTS = {
    FULL_RETIREMENT_AGE: 67,
    MIN_COLLECTION_AGE: 62,
    MAX_COLLECTION_AGE: 70,
    MAX_TAXABLE_EARNINGS: 168600, // 2024 Social Security wage base
    BEND_POINT_1: 1174,
    BEND_POINT_2: 7078,
    REDUCTION_MONTHS_36: 36,
    REDUCTION_PER_MONTH_FIRST_36: 0.00555556, // 5/9 of 1%
    REDUCTION_PER_MONTH_AFTER_36: 0.00416667, // 5/12 of 1%
    INCREASE_PER_MONTH: 0.00666667 // 2/3 of 1%
};

/**
 * Calculate Average Indexed Monthly Earnings (AIME) from current salary
 * Simplified: assumes current salary represents career average
 */
export function calculateAIME(currentSalary) {
    // Cap at Social Security maximum
    const cappedSalary = Math.min(currentSalary, SS_CONSTANTS.MAX_TAXABLE_EARNINGS);
    // Convert annual to monthly
    return cappedSalary / 12;
}

/**
 * Calculate Primary Insurance Amount (PIA) at Full Retirement Age
 * Uses the bend point formula
 */
export function calculatePIA(aime) {
    let pia = 0;
    
    if (aime <= SS_CONSTANTS.BEND_POINT_1) {
        // 90% of first bend point
        pia = aime * 0.90;
    } else if (aime <= SS_CONSTANTS.BEND_POINT_2) {
        // 90% of first bend point + 32% of amount between bend points
        pia = (SS_CONSTANTS.BEND_POINT_1 * 0.90) + 
              ((aime - SS_CONSTANTS.BEND_POINT_1) * 0.32);
    } else {
        // 90% of first + 32% of second + 15% of remainder
        pia = (SS_CONSTANTS.BEND_POINT_1 * 0.90) + 
              ((SS_CONSTANTS.BEND_POINT_2 - SS_CONSTANTS.BEND_POINT_1) * 0.32) +
              ((aime - SS_CONSTANTS.BEND_POINT_2) * 0.15);
    }
    
    return Math.round(pia);
}

/**
 * Adjust PIA based on collection age
 */
export function adjustForCollectionAge(pia, collectionAge, fullRetirementAge = 67) {
    if (collectionAge === fullRetirementAge) {
        return pia;
    }
    
    if (collectionAge < fullRetirementAge) {
        // Early collection - reduce benefits
        const monthsEarly = (fullRetirementAge - collectionAge) * 12;
        
        let reduction = 0;
        if (monthsEarly <= SS_CONSTANTS.REDUCTION_MONTHS_36) {
            reduction = monthsEarly * SS_CONSTANTS.REDUCTION_PER_MONTH_FIRST_36;
        } else {
            reduction = (SS_CONSTANTS.REDUCTION_MONTHS_36 * SS_CONSTANTS.REDUCTION_PER_MONTH_FIRST_36) +
                       ((monthsEarly - SS_CONSTANTS.REDUCTION_MONTHS_36) * SS_CONSTANTS.REDUCTION_PER_MONTH_AFTER_36);
        }
        
        return Math.round(pia * (1 - reduction));
    } else {
        // Delayed collection - increase benefits
        const monthsLate = (collectionAge - fullRetirementAge) * 12;
        const increase = monthsLate * SS_CONSTANTS.INCREASE_PER_MONTH;
        return Math.round(pia * (1 + increase));
    }
}

/**
 * Calculate spousal benefit (50% of spouse's PIA at their full retirement age)
 */
export function calculateSpousalBenefit(spousePIA, ownPIA, collectionAge) {
    // Spousal benefit is 50% of spouse's PIA
    const maxSpousalBenefit = spousePIA * 0.5;
    
    // But they get the higher of their own benefit or spousal benefit
    const ownBenefit = ownPIA;
    
    if (ownBenefit >= maxSpousalBenefit) {
        return 0; // No spousal benefit needed
    }
    
    // Spousal benefit is reduced if claimed before full retirement age
    const spousalBoost = maxSpousalBenefit - ownBenefit;
    
    if (collectionAge < 67) {
        const monthsEarly = (67 - collectionAge) * 12;
        const reduction = Math.min(monthsEarly * SS_CONSTANTS.REDUCTION_PER_MONTH_FIRST_36, 0.30);
        return Math.round(spousalBoost * (1 - reduction));
    }
    
    return Math.round(spousalBoost);
}

/**
 * Calculate Social Security benefits for a person
 */
export function calculateSocialSecurityBenefit(person) {
    if (!person.currentSalary || person.currentSalary <= 0) {
        return {
            monthlyBenefit: 0,
            annualBenefit: 0,
            pia: 0
        };
    }
    
    const aime = calculateAIME(person.currentSalary);
    const pia = calculatePIA(aime);
    const collectionAge = person.ssCollectionAge || 67;
    const monthlyBenefit = adjustForCollectionAge(pia, collectionAge);
    
    return {
        monthlyBenefit,
        annualBenefit: monthlyBenefit * 12,
        pia,
        collectionAge
    };
}

/**
 * Calculate household Social Security benefits including spousal benefits
 */
export function calculateHouseholdSS(familyMembers) {
    const workers = familyMembers.filter(m => 
        (m.relation ===
