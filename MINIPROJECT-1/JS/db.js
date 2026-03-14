// db.js - IndexedDB wrapper for Event Management System

const DB_NAME = 'UpgradEventsDB';
const DB_VERSION = 1;
const STORE_NAME = 'events';

class LocalDB {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Database error: ", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.seedInitialData();
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    // Create indices for searching
                    objectStore.createIndex('name', 'name', { unique: false });
                    objectStore.createIndex('category', 'category', { unique: false });
                }
            };
        });
    }

    async seedInitialData() {
        const events = await this.getAllEvents();
        if (events.length === 0) {
            const initialEvents = [
                {
                    id: 'EVT001',
                    name: 'Tech Innovation Summit',
                    category: 'Tech & Innovations',
                    date: '2023-11-15',
                    time: '10:00',
                    url: 'https://upgrad.com/events/tech-summit'
                },
                {
                    id: 'EVT002',
                    name: 'Industrial Automation Expo',
                    category: 'Industrial Events',
                    date: '2023-12-05',
                    time: '09:30',
                    url: 'https://upgrad.com/events/industrial-expo'
                },
                 {
                    id: 'EVT003',
                    name: 'AI in Healthcare',
                    category: 'Tech & Innovations',
                    date: '2024-01-20',
                    time: '14:00',
                    url: 'https://upgrad.com/events/ai-health'
                }
            ];
            
            for (const evt of initialEvents) {
                await this.addEvent(evt);
            }
        }
    }

    async addEvent(eventData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(eventData);

            request.onsuccess = () => resolve(true);
            request.onerror = (err) => reject(err);
        });
    }

    async deleteEvent(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = (err) => reject(err);
        });
    }

    async getEventById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (err) => reject(err);
        });
    }

    async getAllEvents() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result || []);
            request.onerror = (err) => reject(err);
        });
    }
    
    async searchEvents(query) {
        const allEvents = await this.getAllEvents();
        if (!query) return allEvents;
        
        const lowerQuery = query.toLowerCase();
        return allEvents.filter(evt => 
            evt.id.toLowerCase().includes(lowerQuery) || 
            evt.name.toLowerCase().includes(lowerQuery) || 
            evt.category.toLowerCase().includes(lowerQuery)
        );
    }
}

// Global instance
const db = new LocalDB();
