// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTAS ====================

export async function getStudentProgress(token) {
    const progress = await apiRequest(
        "/student/exercise-progress",
        {
            token
        }
    );

    return Array.isArray(progress)
        ? progress
        : [];
}

// ==================== RESPOSTA ====================

export function answerStudentExercise(
    exerciseId,
    selectedOptionIndex,
    token
) {
    return apiRequest(
        "/student/exercise-progress/answer",
        {
            method: "POST",
            body: {
                exerciseId,
                selectedOptionIndex
            },
            token
        }
    );
}