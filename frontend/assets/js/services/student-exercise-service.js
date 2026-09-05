// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTAS ====================

export async function getStudentExercisesByCourse(
    courseId,
    token
) {
    const exercises = await apiRequest(
        `/student/exercises/course/${courseId}`,
        {
            token
        }
    );

    return Array.isArray(exercises)
        ? exercises
        : [];
}

export function getStudentExercise(id, token) {
    return apiRequest(`/student/exercises/${id}`, {
        token
    });
}