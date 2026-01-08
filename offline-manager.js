/**
 * Offline Manager - Handles degraded mode operations
 * Implements offline-first design patterns for emergency resilience
 */

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionQuality = 'unknown';
        this.degradedMode = false;
        this.init();
    }

    init() {
        this.setupConnectionMonitoring();
        this.setupServiceWorker();
        this.loadCachedData();
        this.detectConnectionQuality();
    }

    // Monitor connection status
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.degradedMode = false;
            this.showConnectionStatus('✅ Connection restored', 'success');
            this.syncPendingData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.degradedMode = true;
            this.showConnectionStatus('⚠️ Offline mode - Using cached data', 'warning');
        });

        // Periodic connection check
        setInterval(() => {
            this.detectConnectionQuality();
        }, 30000);
    }

    // Register service worker for PWA functionality
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Enable background sync for emergency reports
                if ('sync' in window.ServiceWorkerRegistration.prototype) {
                    await registration.sync.register('emergency-report-sync');
                }
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    // Detect connection quality for adaptive behavior
    async detectConnectionQuality() {
        if (!this.isOnline) {
            this.connectionQuality = 'offline';
            return;
        }

        try {
            const startTime = Date.now();
            const response = await fetch('/ping', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            const endTime = Date.now();
            const latency = endTime - startTime;

            if (latency < 500) {
                this.connectionQuality = 'good';
                this.degradedMode = false;
            } else if (latency < 2000) {
                this.connectionQuality = 'slow';
                this.degradedMode = true;
                this.showConnectionStatus('🐌 Slow connection - Limited features', 'warning');
            } else {
                this.connectionQuality = 'poor';
                this.degradedMode = true;
                this.showConnectionStatus('⚠️ Poor connection - Using cached data', 'warning');
            }
        } catch (error) {
            this.connectionQuality = 'offline';
            this.degradedMode = true;
        }
    }

    // Load and cache critical data
    loadCachedData() {
        // Cache emergency contacts
        const emergencyContacts = [
            { name: 'Manipur Emergency Control', number: '100' },
            { name: 'Police Emergency', number: '112' },
            { name: 'Medical Emergency', number: '108' },
            { name: 'Fire Emergency', number: '101' },
            { name: 'District Emergency Imphal', number: '+91 385 244 2233' }
        ];
        localStorage.setItem('cached_emergency_contacts', JSON.stringify(emergencyContacts));

        // Cache food centers for offline access
        const foodCenters = [
            {
                id: 1,
                name: 'Manipur State Emergency Center',
                lat: 24.8170,
                lng: 93.9368,
                address: 'Secretariat Complex, Imphal',
                contact: 'Emergency Control Room: 100',
                status: 'active',
                supplies: ['Emergency Rations', 'Water', 'Medical Supplies']
            },
            {
                id: 2,
                name: 'District Emergency Hub - Imphal East',
                lat: 24.8067,
                lng: 93.9449,
                address: 'DC Office Complex, Porompat',
                contact: '+91 385 244 2233',
                status: 'active',
                supplies: ['Food Packets', 'Water', 'First Aid']
            },
            {
                id: 3,
                name: 'Thoubal Emergency Relief',
                lat: 24.6340,
                lng: 93.9856,
                address: 'Thoubal District HQ',
                contact: '+91 385 242 1100',
                status: 'limited',
                supplies: ['Basic Food', 'Water Purification']
            }
        ];
        localStorage.setItem('cached_food_centers', JSON.stringify(foodCenters));

        // Cache emergency instructions
        const instructions = [
            'Stay calm and assess your immediate safety',
            'Contact emergency services using provided numbers',
            'Move to nearest safe food distribution center',
            'Follow instructions from local authorities',
            'Conserve phone battery for emergency use',
            'Share location with trusted contacts if possible'
        ];
        localStorage.setItem('cached_emergency_instructions', JSON.stringify(instructions));
    }

    // API wrapper with offline fallback
    async apiRequest(url, options = {}) {
        // Return cached data immediately if in degraded mode
        if (this.degradedMode && options.method === 'GET') {
            return this.getCachedResponse(url);
        }

        try {
            const response = await fetch(url, {
                ...options,
                timeout: this.connectionQuality === 'slow' ? 10000 : 5000
            });

            if (response.ok) {
                // Cache successful responses
                if (options.method === 'GET') {
                    const data = await response.clone().json();
                    this.cacheResponse(url, data);
                }
                return response;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`API request failed: ${url}`, error);
            
            // Return cached data for GET requests
            if (options.method === 'GET') {
                return this.getCachedResponse(url);
            }
            
            // Queue POST requests for later sync
            if (options.method === 'POST') {
                this.queueForSync(url, options);
                return { ok: true, json: () => ({ message: 'Queued for sync when online' }) };
            }
            
            throw error;
        }
    }

    // Get cached API response
    getCachedResponse(url) {
        const cached = localStorage.getItem(`cached_${url.replace(/[^a-zA-Z0-9]/g, '_')}`);
        if (cached) {
            return {
                ok: true,
                json: () => Promise.resolve(JSON.parse(cached))
            };
        }
        
        // Return default offline data
        if (url.includes('/api/food-centers')) {
            const centers = JSON.parse(localStorage.getItem('cached_food_centers') || '[]');
            return {
                ok: true,
                json: () => Promise.resolve({ centers })
            };
        }
        
        return {
            ok: false,
            json: () => Promise.resolve({ error: 'No cached data available' })
        };
    }

    // Cache API response
    cacheResponse(url, data) {
        const cacheKey = `cached_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    }

    // Queue requests for background sync
    queueForSync(url, options) {
        const pending = JSON.parse(localStorage.getItem('pending_requests') || '[]');
        pending.push({
            id: Date.now(),
            url,
            options,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('pending_requests', JSON.stringify(pending));
    }

    // Sync pending data when connection is restored
    async syncPendingData() {
        const pending = JSON.parse(localStorage.getItem('pending_requests') || '[]');
        
        for (const request of pending) {
            try {
                await fetch(request.url, request.options);
                console.log('Synced pending request:', request.id);
            } catch (error) {
                console.log('Failed to sync request:', request.id, error);
                continue; // Keep in queue for next sync attempt
            }
        }
        
        // Clear successfully synced requests
        localStorage.setItem('pending_requests', '[]');
    }

    // Show connection status to user
    showConnectionStatus(message, type = 'info') {
        // Remove existing status
        const existing = document.querySelector('.connection-status');
        if (existing) existing.remove();

        const statusDiv = document.createElement('div');
        statusDiv.className = `connection-status connection-${type}`;
        statusDiv.innerHTML = message;
        statusDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
        `;

        document.body.appendChild(statusDiv);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 5000);
    }

    // Get degraded mode status
    isDegraded() {
        return this.degradedMode;
    }

    // Get connection quality
    getConnectionQuality() {
        return this.connectionQuality;
    }

    // Emergency mode - minimal functionality only
    enableEmergencyMode() {
        this.degradedMode = true;
        this.showConnectionStatus('🚨 Emergency Mode - Essential functions only', 'warning');
        
        // Hide non-essential UI elements
        document.querySelectorAll('.non-essential').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show emergency contacts prominently
        this.showEmergencyContacts();
    }

    // Display emergency contacts
    showEmergencyContacts() {
        const contacts = JSON.parse(localStorage.getItem('cached_emergency_contacts') || '[]');
        
        const contactsDiv = document.createElement('div');
        contactsDiv.className = 'emergency-contacts-overlay';
        contactsDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #d32f2f; color: white; padding: 20px; border-radius: 12px; 
                        z-index: 10001; max-width: 300px; width: 90%;">
                <h3>🚨 Emergency Contacts</h3>
                ${contacts.map(contact => 
                    `<div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.3);">
                        <strong>${contact.name}</strong><br>
                        <a href="tel:${contact.number}" style="color: #ffeb3b; font-size: 18px;">${contact.number}</a>
                    </div>`
                ).join('')}
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-top: 15px; padding: 8px 16px; background: white; color: #d32f2f; 
                               border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        document.body.appendChild(contactsDiv);
    }
}

// Initialize offline manager
const offlineManager = new OfflineManager();

// Export for use in other modules
window.OfflineManager = offlineManager;