// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTA DE USUÁRIOS ====================

export async function getUsers(token) {
    const users = await apiRequest("/users", { token });

    if (!Array.isArray(users)) {
        throw new Error("O servidor retornou uma lista de usuários inválida.");
    }

    return users;
}

// ==================== CADASTRO DE USUÁRIO ====================

export function createUser(data, token) {
    return apiRequest("/users", {
        method: "POST",
        body: data,
        token
    });
}

// ==================== EDIÇÃO DE USUÁRIO ====================

export function updateUser(id, data, token) {
    return apiRequest(`/users/${id}`, {
        method: "PATCH",
        body: data,
        token
    });
}

// ==================== ALTERAÇÃO DE SENHA ====================

export function changeUserPassword(id, password, token) {
    return apiRequest(`/users/${id}/password`, {
        method: "PATCH",
        body: { password },
        token
    });
}

// ==================== TURMA DO ALUNO ====================

export function updateUserClassroom(id, classroomId, token) {
    return apiRequest(`/users/${id}/classroom`, {
        method: "PATCH",
        body: { classroomId },
        token
    });
}

export function removeUserClassroom(id, token) {
    return apiRequest(`/users/${id}/classroom`, {
        method: "DELETE",
        token
    });
}

// ==================== STATUS DO USUÁRIO ====================

export function activateUser(id, token) {
    return apiRequest(`/users/${id}/activate`, {
        method: "PATCH",
        token
    });
}

export function deactivateUser(id, token) {
    return apiRequest(`/users/${id}/deactivate`, {
        method: "PATCH",
        token
    });
}

export async function deleteUser(userId, token) {
    return apiRequest(`/users/${userId}`, {
        method: "DELETE",
        token
    });
}