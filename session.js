/**
 * Simplified Session Manager - localStorage only for demo stability
 * Production backend auth available in app.py
 */

class SessionManager {
    static requireAuth() {
        const user = JSON.parse(localStorage.getItem('foodtech_user') || 'null');
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    static logout() {
        localStorage.removeItem('foodtech_user');
        localStorage.removeItem('foodtech_session');
        localStorage.removeItem('foodtech_token');
        window.location.href = 'login.html';
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('foodtech_user') || 'null');
    }
}

// Export for global use
window.SessionManager = SessionManager;