/**
 * Unified Authentication System - Single source of truth
 * Eliminates "invalid session" errors and login failures
 */

window.FoodTechAuth = {
    // Demo users - consistent across all pages
    users: {
        'admin@foodtech.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
        'consumer@test.com': { password: 'consumer123', role: 'consumer', name: 'Test Consumer' },
        'supplier@test.com': { password: 'supplier123', role: 'supplier', name: 'Test Supplier' },
        'emergency@test.com': { password: 'emergency123', role: 'emergency', name: 'Emergency Coordinator' }
    },

    // Check if user is logged in
    isLoggedIn() {
        const user = localStorage.getItem('foodtech_user');
        return user !== null;
    },

    // Get current user
    getUser() {
        const user = localStorage.getItem('foodtech_user');
        return user ? JSON.parse(user) : null;
    },

    // Login user
    login(email, password) {
        const user = this.users[email];
        if (user && user.password === password) {
            const userData = {
                email: email,
                name: user.name,
                role: user.role,
                sessionToken: 'ft_' + Date.now(),
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('foodtech_user', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        return { success: false, error: 'Invalid credentials' };
    },

    // Register new user
    register(name, email, role, password) {
        if (this.users[email]) {
            return { success: false, error: 'Email already exists' };
        }

        this.users[email] = { password: password, role: role, name: name };
        
        const userData = {
            email: email,
            name: name,
            role: role,
            sessionToken: 'ft_' + Date.now(),
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('foodtech_user', JSON.stringify(userData));
        return { success: true, user: userData };
    },

    // Emergency access
    emergencyAccess() {
        const userData = {
            email: 'emergency@system.local',
            name: 'Emergency User',
            role: 'emergency',
            sessionToken: 'ft_emergency_' + Date.now(),
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('foodtech_user', JSON.stringify(userData));
        return { success: true, user: userData };
    },

    // Logout user
    logout() {
        localStorage.removeItem('foodtech_user');
        localStorage.removeItem('foodtech_session');
        localStorage.removeItem('foodtech_token');
    },

    // Require authentication - redirect if not logged in
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Get dashboard URL for user role
    getDashboardUrl(role) {
        switch(role) {
            case 'consumer': return 'consumer.html';
            case 'supplier': return 'supplier.html';
            case 'emergency': return 'emergency.html';
            case 'admin': return 'consumer.html'; // Admin can access all
            default: return 'consumer.html';
        }
    },

    // Redirect to appropriate dashboard
    redirectToDashboard() {
        const user = this.getUser();
        if (user) {
            window.location.href = this.getDashboardUrl(user.role);
        } else {
            window.location.href = 'login.html';
        }
    }
};