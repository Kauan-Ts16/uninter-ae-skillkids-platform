// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

import {
    getActiveCourse,
    getActiveCourses
} from "./course-service.js";

// ==================== CURSOS ====================

export function getTeacherCourses(token) {
    return getActiveCourses(token);
}

export function getTeacherCourse(
    courseId,
    token
) {
    return getActiveCourse(
        courseId,
        token
    );
}

// ==================== EXERCÍCIOS ====================

export async function getTeacherCourseExercises(
    courseId,
    token
) {
    const exercises = await apiRequest(
        `/teacher/exercises/course/${courseId}`,
        { token }
    );

    if (!Array.isArray(exercises)) {
        throw new Error(
            "O servidor retornou uma lista de exercícios inválida."
        );
    }

    return exercises;
}

export function getTeacherExercise(
    exerciseId,
    token
) {
    return apiRequest(
        `/teacher/exercises/${exerciseId}`,
        { token }
    );
}