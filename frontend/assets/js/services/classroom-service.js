// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTA DE TURMAS ====================

export async function getClassrooms(token) {
    const classrooms = await apiRequest("/classrooms", { token });

    if (!Array.isArray(classrooms)) {
        throw new Error(
            "O servidor retornou uma lista de turmas inválida."
        );
    }

    return classrooms;
}

export async function getActiveClassrooms(token) {
    const classrooms = await apiRequest(
        "/classrooms/active",
        { token }
    );

    if (!Array.isArray(classrooms)) {
        throw new Error(
            "O servidor retornou uma lista de turmas inválida."
        );
    }

    return classrooms;
}

// ==================== CADASTRO DE TURMA ====================

export function createClassroom(data, token) {
    return apiRequest("/classrooms", {
        method: "POST",
        body: data,
        token
    });
}

// ==================== EDIÇÃO DE TURMA ====================

export function updateClassroom(id, data, token) {
    return apiRequest(`/classrooms/${id}`, {
        method: "PATCH",
        body: data,
        token
    });
}

// ==================== PROFESSOR DA TURMA ====================

export function updateClassroomTeacher(id, teacherId, token) {
    return apiRequest(`/classrooms/${id}/teacher`, {
        method: "PATCH",
        body: { teacherId },
        token
    });
}

export function removeClassroomTeacher(id, token) {
    return apiRequest(`/classrooms/${id}/teacher`, {
        method: "DELETE",
        token
    });
}

// ==================== STATUS DA TURMA ====================

export function activateClassroom(id, token) {
    return apiRequest(`/classrooms/${id}/activate`, {
        method: "PATCH",
        token
    });
}

export function deactivateClassroom(id, token) {
    return apiRequest(`/classrooms/${id}/deactivate`, {
        method: "PATCH",
        token
    });
}

// ==================== EXCLUSÃO DE TURMA ====================

export function deleteClassroom(id, token) {
    return apiRequest(`/classrooms/${id}`, {
        method: "DELETE",
        token
    });
}