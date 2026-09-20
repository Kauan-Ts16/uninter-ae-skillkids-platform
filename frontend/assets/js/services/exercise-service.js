// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTA DE EXERCÍCIOS ====================

export async function getExercises(token) {
    const exercises = await apiRequest("/exercises", { token });

    if (!Array.isArray(exercises)) {
        throw new Error(
            "O servidor retornou uma lista de exercícios inválida."
        );
    }

    return exercises;
}

// ==================== CADASTRO DE EXERCÍCIO ====================

export function createExercise(data, token) {
    return apiRequest("/exercises", {
        method: "POST",
        body: data,
        token
    });
}

// ==================== EDIÇÃO DE EXERCÍCIO ====================

export function updateExercise(id, data, token) {
    return apiRequest(`/exercises/${id}`, {
        method: "PATCH",
        body: data,
        token
    });
}

// ==================== ALTERNATIVAS DO EXERCÍCIO ====================

export function updateExerciseOptions(id, data, token) {
    return apiRequest(`/exercises/${id}/options`, {
        method: "PATCH",
        body: data,
        token
    });
}

// ==================== STATUS DO EXERCÍCIO ====================

export function activateExercise(id, token) {
    return apiRequest(`/exercises/${id}/activate`, {
        method: "PATCH",
        token
    });
}

export function deactivateExercise(id, token) {
    return apiRequest(`/exercises/${id}/deactivate`, {
        method: "PATCH",
        token
    });
}

// ==================== EXCLUSÃO DE EXERCÍCIO ====================

export function deleteExercise(id, token) {
    return apiRequest(`/exercises/${id}`, {
        method: "DELETE",
        token
    });
}