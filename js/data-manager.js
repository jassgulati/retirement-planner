// Data Management Module
import { db } from './firebase-config.js';
import { doc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export async function saveUserData(userId, data) {
    try {
        await setDoc(doc(db, 'users', userId), {
            ...data,
            lastUpdated: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving data:', error);
        return { success: false, error: error.message };
    }
}

export function subscribeToUserData(userId, callback) {
    return onSnapshot(doc(db, 'users', userId), (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            callback(null);
        }
    });
}
