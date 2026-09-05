// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

import { getActiveCourses } from "./course-service.js";

import {
    getTeacherClassroom,
    getTeacherClassrooms,
    getTeacherClassroomStudents
} from "./teacher-classroom-service.js";

// ==================== VALIDAÇÃO DAS LISTAS ====================

function validateList(data, message) {
    if (!Array.isArray(data)) {
        throw new Error(message);
    }

    return data;
}

// ==================== PROGRESSO DO ALUNO ====================

export async function getTeacherStudentProgress(
    studentId,
    token
) {
    const progress = await apiRequest(
        `/teacher/exercise-progress/student/${studentId}`,
        { token }
    );

    return validateList(
        progress,
        "O servidor retornou uma lista de progresso inválida."
    );
}

// ==================== EXERCÍCIOS ====================

export async function getTeacherExercisesByCourse(
    courseId,
    token
) {
    const exercises = await apiRequest(
        `/teacher/exercises/course/${courseId}`,
        { token }
    );

    return validateList(
        exercises,
        "O servidor retornou uma lista de exercícios inválida."
    );
}

// ==================== VISÃO GERAL ====================

export async function getTeacherProgressOverview(token) {
    const [classrooms, courses] = await Promise.all([
        getTeacherClassrooms(token),
        getActiveCourses(token)
    ]);

    validateList(
        classrooms,
        "O servidor retornou uma lista de turmas inválida."
    );

    validateList(
        courses,
        "O servidor retornou uma lista de cursos inválida."
    );

    const exercisesByCourse = await Promise.all(
        courses.map(course =>
            getTeacherExercisesByCourse(
                course.id,
                token
            )
        )
    );

    const availableExerciseIds = new Set(
        exercisesByCourse
            .flat()
            .map(exercise => exercise.id)
    );

    const classroomsWithStudents = await Promise.all(
        classrooms.map(async classroom => {
            const students = validateList(
                await getTeacherClassroomStudents(
                    classroom.id,
                    token
                ),
                "O servidor retornou uma lista de alunos inválida."
            );

            const studentsWithProgress = await Promise.all(
                students.map(async student => {
                    const progress =
                        await getTeacherStudentProgress(
                            student.id,
                            token
                        );

                    return {
                        ...student,
                        progress: progress.filter(item =>
                            availableExerciseIds.has(
                                item.exerciseId
                            )
                        )
                    };
                })
            );

            return {
                ...classroom,
                students: studentsWithProgress
            };
        })
    );

    return {
        classrooms: classroomsWithStudents,
        totalExercises: availableExerciseIds.size
    };
}

// ==================== ACOMPANHAMENTO INDIVIDUAL ====================

export async function getTeacherStudentProgressOverview(
    classroomId,
    studentId,
    token
) {
    const [classroom, students, courses, progress] =
        await Promise.all([
            getTeacherClassroom(classroomId, token),
            getTeacherClassroomStudents(
                classroomId,
                token
            ),
            getActiveCourses(token),
            getTeacherStudentProgress(
                studentId,
                token
            )
        ]);

    validateList(
        students,
        "O servidor retornou uma lista de alunos inválida."
    );

    validateList(
        courses,
        "O servidor retornou uma lista de cursos inválida."
    );

    const student = students.find(
        item => item.id === studentId
    );

    if (!student) {
        throw new Error(
            "O aluno informado não pertence a esta turma."
        );
    }

    const coursesWithExercises = await Promise.all(
        courses.map(async course => {
            const exercises = await getTeacherExercisesByCourse(
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
        classroom,
        student,
        courses: coursesWithExercises,
        progress
    };
}