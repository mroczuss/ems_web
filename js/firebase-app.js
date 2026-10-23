// ==========================================================================
// FIREBASE FIRESTORE INTEGRATION - OBSŁUGA ZAPISU I POBIERANIA PODAŃ
// ==========================================================================

const Database = {
    db: null,
    isInitialized: false,

    // Inicjalizacja Firebase Firestore
    init() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK nie został załadowany.');
                return false;
            }

            // Sprawdzamy czy konfiguracja nie zawiera domyślnego placeholdera
            if (!CONFIG.FIREBASE.apiKey || CONFIG.FIREBASE.apiKey === "TWOJE_API_KEY") {
                console.warn('Uzupełnij dane w config.js, aby połączyć bazę Firebase Firestore.');
                return false;
            }

            if (!firebase.apps.length) {
                firebase.initializeApp(CONFIG.FIREBASE);
            }
            this.db = firebase.firestore();
            this.isInitialized = true;
            console.log('Połączono z bazą Firebase Firestore.');
            return true;
        } catch (e) {
            console.error('Błąd inicjalizacji Firebase:', e);
            return false;
        }
    },

    // Wysłanie nowego podania
    async submitApplication(applicationData) {
        if (!this.isInitialized && !this.init()) {
            // Tryb awaryjny (LocalStorage) jeśli Firebase nie jest jeszcze skonfigurowany
            console.warn('Zapisuję lokalnie w przeglądarce (Firebase nie jest skonfigurowany)');
            const existing = JSON.parse(localStorage.getItem('local_applications') || '{}');
            existing[applicationData.userId] = {
                ...applicationData,
                status: 'pending',
                submittedAt: new Date().toISOString()
            };
            localStorage.setItem('local_applications', JSON.stringify(existing));
            return { success: true, isLocal: true };
        }

        try {
            // Zapis w kolekcji "applications" o ID równym Discord ID kandydata
            const docRef = this.db.collection('applications').doc(applicationData.userId);
            
            const payload = {
                ...applicationData,
                status: 'pending', // 'pending' | 'accepted' | 'rejected'
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await docRef.set(payload, { merge: true });
            return { success: true };
        } catch (err) {
            console.error('Błąd zapisu w Firestore:', err);
            throw err;
        }
    },

    // Pobranie aktualnego podania użytkownika
    async getUserApplication(userId) {
        if (!this.isInitialized && !this.init()) {
            const local = JSON.parse(localStorage.getItem('local_applications') || '{}');
            return local[userId] || null;
        }

        try {
            const doc = await this.db.collection('applications').doc(userId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (err) {
            console.error('Błąd pobierania podania:', err);
            return null;
        }
    },

    // Nasłuch w czasie rzeczywistym na zmiany statusu podania (Real-time updates)
    subscribeToApplication(userId, callback) {
        if (!this.isInitialized && !this.init()) {
            const local = JSON.parse(localStorage.getItem('local_applications') || '{}');
            callback(local[userId] || null);
            return () => {};
        }

        return this.db.collection('applications').doc(userId).onSnapshot(doc => {
            if (doc.exists) {
                callback({ id: doc.id, ...doc.data() });
            } else {
                callback(null);
            }
        }, err => {
            console.error('Błąd subskrypcji podania:', err);
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Database.init();
});
