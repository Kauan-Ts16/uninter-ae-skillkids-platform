// ==================== IMPORTAÇÕES ====================

import {
    getSession,
    getToken,
    signOut
} from "../../auth.js";

import { renderTeacherPanel } from "../../components/teacher-panel.js";

import {
    clearMessage,
    showMessage
} from "../../components/toast.js";

import {
    getTeacherStudentProgressOverview
} from "../../services/teacher-progress-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== PARÂMETROS ====================

const pageParameters = new URLSearchParams(
    window.location.search
);

const studentId = pageParameters.get("studentId");
const classroomId = pageParameters.get("classroomId");

// ==================== CONFIGURAÇÕES ====================

const DIFFICULTY_LABELS = {
    EASY: "Fácil",
    MEDIUM: "Médio",
    HARD: "Difícil"
};

// ==================== ELEMENTOS ====================

const progressFeedback = document.querySelector(
    "#teacher-student-progress-feedback"
);

const progressContent = document.querySelector(
    "#teacher-student-progress-content"
);

const classroomName = document.querySelector(
    "#teacher-student-progress-classroom"
);

const studentName = document.querySelector(
    "#teacher-student-progress-name"
);

const studentEmail = document.querySelector(
    "#teacher-student-progress-email"
);

const progressPercentage = document.querySelector(
    "#teacher-student-progress-percentage"
);

const progressOverallTrack = document.querySelector(
    "#teacher-student-progress-overall-track"
);

const progressOverallBar = document.querySelector(
    "#teacher-student-progress-overall-bar"
);

const progressOverallDescription = document.querySelector(
    "#teacher-student-progress-overall-description"
);

const progressReload = document.querySelector(
    "#teacher-student-progress-reload"
);

const progressCompleted = document.querySelector(
    "#teacher-student-progress-completed"
);

const progressInProgress = document.querySelector(
    "#teacher-student-progress-in-progress"
);

const progressAttempts = document.querySelector(
    "#teacher-student-progress-attempts"
);

const progressLastActivity = document.querySelector(
    "#teacher-student-progress-last-activity"
);

const progressCoursesCount = document.querySelector(
    "#teacher-student-progress-courses-count"
);

const progressCoursesList = document.querySelector(
    "#teacher-student-progress-courses-list"
);

const progressCoursesEmpty = document.querySelector(
    "#teacher-student-progress-courses-empty"
);

// ==================== ESTADO ====================

let isLoading = false;

// ==================== FORMATAÇÃO ====================

function formatDate(value) {
    if (!value) {
        return "Nenhuma";
    }

    const date = value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Nenhuma";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

function calculatePercentage(completed, total) {
    if (total === 0) {
        return 0;
    }

    return Math.round((completed / total) * 100);
}

function getProgressStatus(progress) {
    if (progress?.completed) {
        return {
            key: "completed",
            label: "Concluído"
        };
    }

    if (progress) {
        return {
            key: "in-progress",
            label: "Em andamento"
        };
    }

    return {
        key: "not-started",
        label: "Não iniciado"
    };
}

function getCourseStatus(completed, started, total) {
    if (total > 0 && completed === total) {
        return {
            key: "completed",
            label: "Concluído"
        };
    }

    if (started > 0) {
        return {
            key: "in-progress",
            label: "Em andamento"
        };
    }

    return {
        key: "not-started",
        label: "Não iniciado"
    };
}

// ==================== CONTROLES ====================

function setLoading(loading) {
    isLoading = loading;

    progressReload.disabled = loading;
    progressReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";
}

// ==================== EXERCÍCIO ====================

function createExerciseItem(
    exercise,
    progress,
    index
) {
    const item = document.createElement("article");
    item.className =
        "teacher-student-progress-exercise";

    const sequence = document.createElement("span");
    sequence.className =
        "teacher-student-progress-exercise-sequence";

    sequence.textContent = String(
        exercise.sequence ?? index + 1
    );

    const content = document.createElement("div");
    content.className =
        "teacher-student-progress-exercise-content";

    const topline = document.createElement("div");
    topline.className =
        "teacher-student-progress-exercise-topline";

    const difficulty = document.createElement("span");
    difficulty.className =
        "teacher-student-progress-difficulty";
    difficulty.dataset.difficulty =
        exercise.difficulty;

    difficulty.textContent =
        DIFFICULTY_LABELS[exercise.difficulty] ||
        exercise.difficulty;

    const statusData = getProgressStatus(
        progress
    );

    const status = document.createElement("span");
    status.className =
        "teacher-student-progress-exercise-status";
    status.dataset.status = statusData.key;
    status.textContent = statusData.label;

    topline.append(difficulty, status);

    const title = document.createElement("h4");
    title.textContent = exercise.title;

    const description = document.createElement("p");
    description.className =
        "teacher-student-progress-exercise-description";
    description.textContent = exercise.description;

    const meta = document.createElement("p");
    meta.className =
        "teacher-student-progress-exercise-meta";

    const attempts = Number(
        progress?.attempts ?? 0
    );

    if (attempts === 0) {
        meta.textContent =
            "Nenhuma tentativa realizada.";
    } else {
        const attemptsLabel = attempts === 1
            ? "1 tentativa"
            : `${attempts} tentativas`;

        meta.textContent =
            `${attemptsLabel} • Última resposta em ${formatDate(progress.lastAnsweredAt)}`;
    }

    content.append(
        topline,
        title,
        description,
        meta
    );

    item.append(sequence, content);

    return item;
}

// ==================== CURSO ====================

function createCourseCard(
    course,
    progressByExercise
) {
    const total = course.exercises.length;

    const exerciseProgress = course.exercises
        .map(exercise =>
            progressByExercise.get(exercise.id)
        )
        .filter(Boolean);

    const started = exerciseProgress.length;

    const completed = exerciseProgress.filter(
        item => item.completed
    ).length;

    const percentage = calculatePercentage(
        completed,
        total
    );

    const statusData = getCourseStatus(
        completed,
        started,
        total
    );

    const card = document.createElement("article");
    card.className =
        "teacher-student-progress-course";

    const header = document.createElement("header");
    header.className =
        "teacher-student-progress-course-header";

    const heading = document.createElement("div");
    heading.className =
        "teacher-student-progress-course-heading";

    const title = document.createElement("h3");
    title.textContent = course.title;

    const description = document.createElement("p");
    description.textContent = course.description;

    heading.append(title, description);

    const status = document.createElement("span");
    status.className =
        "teacher-student-progress-course-status";
    status.dataset.status = statusData.key;
    status.textContent = statusData.label;

    header.append(heading, status);

    const progressHeading =
        document.createElement("div");

    progressHeading.className =
        "teacher-student-progress-course-progress-heading";

    const progressLabel =
        document.createElement("span");

    progressLabel.textContent =
        `${completed} de ${total} concluídos`;

    const percentageElement =
        document.createElement("strong");

    percentageElement.textContent =
        `${percentage}%`;

    progressHeading.append(
        progressLabel,
        percentageElement
    );

    const track = document.createElement("div");
    track.className =
        "teacher-student-progress-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute(
        "aria-label",
        `Progresso no curso ${course.title}`
    );
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute(
        "aria-valuenow",
        String(percentage)
    );

    const bar = document.createElement("div");
    bar.className =
        "teacher-student-progress-bar";
    bar.style.width = `${percentage}%`;

    track.append(bar);

    const exercises = document.createElement("div");
    exercises.className =
        "teacher-student-progress-exercises";

    if (total === 0) {
        const empty = document.createElement("p");
        empty.className =
            "teacher-student-progress-exercises-empty";

        empty.textContent =
            "Nenhum exercício está disponível neste curso.";

        exercises.append(empty);
    } else {
        for (
            const [index, exercise]
            of course.exercises.entries()
        ) {
            exercises.append(
                createExerciseItem(
                    exercise,
                    progressByExercise.get(
                        exercise.id
                    ),
                    index
                )
            );
        }
    }

    card.append(
        header,
        progressHeading,
        track,
        exercises
    );

    return card;
}

// ==================== EXIBIÇÃO ====================

function renderStudentProgress(data) {
    const progressByExercise = new Map(
        data.progress.map(item => [
            item.exerciseId,
            item
        ])
    );

    const availableExercises = data.courses.flatMap(
        course => course.exercises
    );

    const availableExerciseIds = new Set(
        availableExercises.map(
            exercise => exercise.id
        )
    );

    const availableProgress = data.progress.filter(
        item =>
            availableExerciseIds.has(
                item.exerciseId
            )
    );

    const totalExercises =
        availableExercises.length;

    const completed = availableProgress.filter(
        item => item.completed
    ).length;

    const inProgress = availableProgress.filter(
        item => !item.completed
    ).length;

    const attempts = availableProgress.reduce(
        (total, item) =>
            total + Number(item.attempts ?? 0),
        0
    );

    const percentage = calculatePercentage(
        completed,
        totalExercises
    );

    const lastActivity = availableProgress.reduce(
        (latest, item) => {
            if (!item.lastAnsweredAt) {
                return latest;
            }

            const current = new Date(
                item.lastAnsweredAt
            );

            if (Number.isNaN(current.getTime())) {
                return latest;
            }

            if (!latest || current > latest) {
                return current;
            }

            return latest;
        },
        null
    );

    classroomName.textContent =
        data.classroom.name;

    studentName.textContent =
        data.student.name;

    studentEmail.textContent =
        data.student.email;

    progressPercentage.textContent =
        `${percentage}%`;

    progressOverallBar.style.width =
        `${percentage}%`;

    progressOverallTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );

    progressOverallDescription.textContent =
        `${completed} de ${totalExercises} exercícios concluídos`;

    progressCompleted.textContent =
        String(completed);

    progressInProgress.textContent =
        String(inProgress);

    progressAttempts.textContent =
        String(attempts);

    progressLastActivity.textContent =
        formatDate(lastActivity);

    progressCoursesList.replaceChildren();

    const coursesLabel = data.courses.length === 1
        ? "1 curso disponível"
        : `${data.courses.length} cursos disponíveis`;

    progressCoursesCount.textContent =
        coursesLabel;

    for (const course of data.courses) {
        progressCoursesList.append(
            createCourseCard(
                course,
                progressByExercise
            )
        );
    }

    const hasCourses =
        data.courses.length > 0;

    progressCoursesList.hidden = !hasCourses;
    progressCoursesEmpty.hidden = hasCourses;

    progressFeedback.hidden = true;
    progressContent.hidden = false;
}

// ==================== ERROS ====================

function handleRequestError(error) {
    if (error.status === 401) {
        signOut();
        return;
    }

    progressFeedback.textContent =
        "Não foi possível carregar o progresso do aluno.";

    progressFeedback.hidden = false;
    progressContent.hidden = true;

    let message = error.message ||
        "Não foi possível carregar o progresso do aluno.";

    if (error.status === 403) {
        message =
            "Sua conta não tem permissão para consultar este progresso.";
    }

    if (error.status === 404) {
        message =
            "O aluno ou a turma informada não foi encontrado.";
    }

    showMessage(message, "error");
}

// ==================== CONSULTA ====================

async function loadStudentProgress() {
    if (isLoading) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    clearMessage();
    setLoading(true);

    progressContent.hidden = true;
    progressFeedback.hidden = false;
    progressFeedback.textContent =
        "Carregando progresso do aluno...";

    try {
        const data =
            await getTeacherStudentProgressOverview(
                classroomId,
                studentId,
                token
            );

        renderStudentProgress(data);
    } catch (error) {
        handleRequestError(error);
    } finally {
        setLoading(false);
    }
}

// ==================== INICIALIZAÇÃO ====================

async function initializePage() {
    const session = getSession();

    if (
        !session ||
        session.user.role !== "TEACHER"
    ) {
        window.location.replace(LOGIN_URL.href);
        return;
    }

    renderTeacherPanel(session.user);

    if (!studentId || !classroomId) {
        progressFeedback.textContent =
            "O aluno ou a turma não foi informado.";

        showMessage(
            "Não foi possível identificar o acompanhamento solicitado.",
            "error"
        );

        return;
    }

    progressReload.addEventListener(
        "click",
        loadStudentProgress
    );

    await loadStudentProgress();
}

initializePage();