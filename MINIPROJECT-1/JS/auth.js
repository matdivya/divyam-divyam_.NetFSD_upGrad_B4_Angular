// auth.js - Authentication System

const ADMIN_EMAIL = 'admin@upgrad.com';
const ADMIN_PASS = '12345';

class Auth {
    constructor() {
        this.isAuthenticated = sessionStorage.getItem('isAdmin') === 'true';
    }

    login(email, password) {
        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            sessionStorage.setItem('isAdmin', 'true');
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }

    logout() {
        sessionStorage.removeItem('isAdmin');
        this.isAuthenticated = false;
        window.location.href = 'login.html';
    }

    protectRoute() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

const auth = new Auth();
