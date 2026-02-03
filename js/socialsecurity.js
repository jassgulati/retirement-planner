// Social Security Calculation Module

const SS_CONSTANTS = {
    FULL_RETIREMENT_AGE: 67,
    MIN_COLLECTION_AGE: 62,
    MAX_COLLECTION_AGE: 70,
    MAX_TAXABLE_EARNINGS: 168600,
    BEND_POINT_1: 1174,
    BEND_POINT_2: 7078,
    REDUCTION_PER_MONTH_FIRST_36: 0.00555556,
    REDUCTION_PER_MONTH_AFTER_36: 0.00416667,
    INCREASE_PER_MONTH: 0.00666667
};

export function calculateAIME(currentSalary) {
    const cappedSalary = Math.min(currentSalary, SS_CONSTANTS.MAX_TAXABLE_EARNINGS);
    return cappedSalary / 12;
}

export function calculatePIA(aime) {
    let pia = 0;
    
    if (aime <= SS_CONSTANTS.BEND_POINT_1) {
        pia = aime * 0.90;
    } else if (aime <= SS_CONSTANTS.BEND_POINT_2) {
        pia = (SS_CONSTANTS.BEND_POINT_1 * 0.90) + 
              ((aime - SS_CONSTANTS.BEND_POINT_1) * 0.32);
    } else {
        pia = (SS_CONSTANTS.BEND_POINT_1 * 0.90) + 
              ((SS_CONSTANTS.BEND_POINT_2 - SS_CONSTANTS.BEND_POINT_1) * 0.32) +
              ((aime - SS_CONSTANTS.BEND_POINT_2) * 0.15);
    }
    
    return Math.round(pia);
}

export function adjustForCollectionAge(pia, collectionAge, fullRetirementAge = 67) {
    if (collectionAge === fullRetirementAge) {
        return pia;
    }
    
    if (collectionAge < fullRetirementAge) {
        const monthsEarly = (fullRetirementAge - collectionAge) * 12;
        let reduction = 0;
        
        if (monthsEarly <= 36) {
            reduction = monthsEarly * SS_CONSTANTS.REDUCTION_PER_MONTH_FIRST_36;
        } else {
            reduction = (36 * SS_CONSTANTS.REDUCTION_PER_MONTH_FIRST_36) +
                       ((monthsEarly - 36) * SS_CONSTANTS.REDUCTION_PER_MONTH_AFTER_36);
        }
        
        return Math.round(pia * (1 - reduction));
    } else {
        const monthsLate = (collectionAge - fullRetirementAge) * 12;
        const increase = monthsLate * SS_CONSTANTS.INCREASE_PER_MONTH;
        return Math.round(pia * (1 + increase));
    }
}

export function calculateSpousalBenefit(spousePIA, ownPIA, collectionAge) {
    const maxSpousalBenefit = spousePIA * 0.5;
    const ownBenefit = ownPIA;
    
    if (ownBenefit >= maxSpousalBenefit) {
        return 0;
    }
    
    const spousalBoost = maxSpousalBenefit - ownBenefit;
    
    if (collectionAge < 67) {
        const monthsEarly = (67 - collectionAge) * 12;
        const reduction = Math.min(monthsEarly * SS_CONSTANTS.REDUCTION_PER_MONTH_FIRST_36, 0.30);
        return Math.round(spousalBoost * (1 - reduction));
    }
    
    return Math.round(spousalBoost);
}

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

export function calculateHouseholdSS(familyMembers) {
    const workers = familyMembers.filter(m => 
        (m.relation === 'Self' || m.relation === 'Spouse') && 
        m.currentSalary > 0
    );
    
    if (workers.length === 0) {
        return { members: [], totalMonthly: 0, totalAnnual: 0 };
    }
    
    const results = workers.map(person => {
        const benefit = calculateSocialSecurityBenefit(person);
        return {
            name: person.name,
            relation: person.relation,
            ...benefit
        };
    });
    
    if (workers.length === 2) {
        const person1 = results[0];
        const person2 = results[1];
        
        const person2SpousalBoost = calculateSpousalBenefit(
            person1.pia, 
            person2.pia, 
            person2.collectionAge
        );
        
        if (person2SpousalBoost > 0) {
            person2.spousalBenefit = person2SpousalBoost;
            person2.monthlyBenefit += person2SpousalBoost;
            person2.annualBenefit = person2.monthlyBenefit * 12;
        }
        
        const person1SpousalBoost = calculateSpousalBenefit(
            person2.pia, 
            person1.pia, 
            person1.collectionAge
        );
        
        if (person1SpousalBoost > 0) {
            person1.spousalBenefit = person1SpousalBoost;
            person1.monthlyBenefit += person1SpousalBoost;
            person1.annualBenefit = person1.monthlyBenefit * 12;
        }
    }
    
    const totalMonthly = results.reduce((sum, r) => sum + r.monthlyBenefit, 0);
    
    return {
        members: results,
        totalMonthly,
        totalAnnual: totalMonthly * 12
    };
}
