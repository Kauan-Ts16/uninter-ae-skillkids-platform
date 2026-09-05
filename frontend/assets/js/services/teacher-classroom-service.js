// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== TURMAS DO PROFESSOR ====================

export function getTeacherClassrooms(token) {
    return apiRequest("/teacher/classrooms", {
        token
    });
}

export function createTeacherClassroom(name, token) {
    return apiRequest("/teacher/classrooms", {
        method: "POST",
        body: {
            name
        },
        token
    });
}

export function getTeacherClassroom(classroomId, token) {
    return apiRequest(
        `/teacher/classrooms/${classroomId}`,
        { token }
    );
}

// ==================== ALUNOS ====================

export function getTeacherClassroomStudents(
    classroomId,
    token
) {
    return apiRequest(
        `/teacher/classrooms/${classroomId}/students`,
        { token }
    );
}

export function getAvailableStudents(token) {
    return apiRequest(
        "/teacher/classrooms/students/available",
        { token }
    );
}

export function addStudentToTeacherClassroom(
    classroomId,
    studentId,
    token
) {
    return apiRequest(
        `/teacher/classrooms/${classroomId}/students/${studentId}`,
        {
            method: "PATCH",
            token
        }
    );
}

export function removeStudentFromTeacherClassroom(
    classroomId,
    studentId,
    token
) {
    return apiRequest(
        `/teacher/classrooms/${classroomId}/students/${studentId}`,
        {
            method: "DELETE",
            token
        }
    );
}