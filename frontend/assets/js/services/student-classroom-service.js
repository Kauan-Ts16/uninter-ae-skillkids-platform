// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTA DA TURMA ====================

export function getCurrentStudentClassroom(token) {
    return apiRequest(
        "/student/classrooms",
        { token }
    );
}

// ==================== ENTRADA NA TURMA ====================

export function joinStudentClassroom(joinCode, token) {
    return apiRequest("/student/classrooms/join", {
        method: "PATCH",
        body: { joinCode },
        token
    });
}

// ==================== SAÍDA DA TURMA ====================

export function leaveStudentClassroom(token) {
    return apiRequest("/student/classrooms", {
        method: "DELETE",
        token
    });
}