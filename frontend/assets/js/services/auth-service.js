// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== LOGIN ====================

export function login(email, password) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: {
            email,
            password
        }
    });
}

// ==================== CONTA AUTENTICADA ====================

export function getAccount(token) {
    return apiRequest("/account", {
        token
    });
}

// ==================== CADASTRO ====================

export function register({ name, email, password, role }) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: {
            name,
            email,
            password,
            role
        }
    });
}