// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";
import { getActiveCourses } from "./course-service.js";

// ==================== CONSULTAS INDIVIDUAIS ====================

async function getStudentProgress(token) {
    const progress = await apiRequest(
        "/student/exercise-progress",
        { token }
    );

    if (!Array.isArray(progress)) {
        throw new Error(
            "O servidor retornou uma lista de progresso inválida."
        );
    }

    return progress;
}

async function getExercisesByCourse(courseId, token) {
    const exercises = await apiRequest(
        `/student/exercises/course/${courseId}`,
        { token }
    );

    if (!Array.isArray(exercises)) {
        throw new Error(
            "O servidor retornou uma lista de exercícios inválida."
        );
    }

    return exercises;
}

// ==================== VISÃO GERAL ====================

export async function getStudentProgressOverview(token) {
    const [courses, progress] = await Promise.all([
        getActiveCourses(token),
        getStudentProgress(token)
    ]);

    const coursesWithExercises = await Promise.all(
        courses.map(async course => {
            const exercises = await getExercisesByCourse(
                course.id,
                token
            );

            return {
                ...course,
                exercises
            };
        })
    );

    return {
        courses: coursesWithExercises,
        progress
    };
}
