// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTA DE CURSOS ====================

export async function getCourses(token) {
    const courses = await apiRequest("/courses", { token });

    if (!Array.isArray(courses)) {
        throw new Error(
            "O servidor retornou uma lista de cursos inválida."
        );
    }

    return courses;
}

// ==================== CADASTRO DE CURSO ====================

export function createCourse(data, token) {
    return apiRequest("/courses", {
        method: "POST",
        body: data,
        token
    });
}

// ==================== EDIÇÃO DE CURSO ====================

export function updateCourse(id, data, token) {
    return apiRequest(`/courses/${id}`, {
        method: "PATCH",
        body: data,
        token
    });
}

// ==================== STATUS DO CURSO ====================

export function activateCourse(id, token) {
    return apiRequest(`/courses/${id}/activate`, {
        method: "PATCH",
        token
    });
}

export function deactivateCourse(id, token) {
    return apiRequest(`/courses/${id}/deactivate`, {
        method: "PATCH",
        token
    });
}

// ==================== EXCLUSÃO DE CURSO ====================

export function deleteCourse(id, token) {
    return apiRequest(`/courses/${id}`, {
        method: "DELETE",
        token
    });
}