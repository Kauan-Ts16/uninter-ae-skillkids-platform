// ==================== IMPORTAÇÕES ====================

import {
    getSession,
    getToken
} from "../../auth.js";

import {
    renderStudentPanel
} from "../../components/student-panel.js";

import {
    getActiveCourse
} from "../../services/course-service.js";

import {
    getStudentExercisesByCourse
} from "../../services/student-exercise-service.js";

import {
    getStudentProgress
} from "../../services/student-progress-service.js";

// ==================== CONSTANTES ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

const EXERCISE_URL = new URL(
    "../../../../student/exercise.html",
    import.meta.url
);

const DIFFICULTY_LABELS = {
    EASY: "Fácil",
    MEDIUM: "Média",
    HARD: "Difícil"
};

// ==================== ELEMENTOS ====================

const courseFeedback = document.querySelector(
    "#course-feedback"
);

const courseContent = document.querySelector(
    "#course-content"
);

const courseTitle = document.querySelector(
    "#course-title"
);

const courseDescription = document.querySelector(
    "#course-description"
);

const courseProgressCount = document.querySelector(
    "#course-progress-count"
);

const courseProgressBar = document.querySelector(
    "#course-progress-bar"
);

const exercisesCount = document.querySelector(
    "#exercises-count"
);

const exercisesFeedback = document.querySelector(
    "#exercises-feedback"
);

const exercisesList = document.querySelector(
    "#exercises-list"
);

const courseReload = document.querySelector(
    "#course-reload"
);

// ==================== ESTADO ====================

const courseId = new URLSearchParams(
    window.location.search
).get("id");

let isLoading = false;

// ==================== CARREGAMENTO ====================

async function loadCourse() {
    if (isLoading || !courseId) {
        return;
    }

    isLoading = true;
    courseReload.disabled = true;

    showCourseFeedback(
        "Carregando dados do curso..."
    );

    try {
        const token = getToken();

        const [
            course,
            exercises,
            progress
        ] = await Promise.all([
            getActiveCourse(courseId, token),
            getStudentExercisesByCourse(
                courseId,
                token
            ),
            getStudentProgress(token)
        ]);

        const orderedExercises = [...exercises].sort(
            (firstExercise, secondExercise) =>
                firstExercise.sequence -
                secondExercise.sequence
        );

        renderCourse(course);

        renderExercises(
            orderedExercises,
            progress
        );

        courseFeedback.hidden = true;
        courseContent.hidden = false;
    } catch (error) {
        if (
            error.status === 401 ||
            error.status === 403
        ) {
            window.location.replace(LOGIN_URL.href);
            return;
        }

        showCourseFeedback(
            "Não foi possível carregar os dados do curso.",
            "error"
        );
    } finally {
        isLoading = false;
        courseReload.disabled = false;
    }
}

// ==================== CURSO ====================

function renderCourse(course) {
    courseTitle.textContent = course.title;

    courseDescription.textContent =
        course.description ||
        "Continue aprendendo com os exercícios deste curso.";
}

// ==================== EXERCÍCIOS ====================

function renderExercises(exercises, progressList) {
    exercisesList.replaceChildren();

    const progressByExercise = new Map(
        progressList.map(progress => [
            progress.exerciseId,
            progress
        ])
    );

    let completedExercises = 0;

    for (const exercise of exercises) {
        const progress = progressByExercise.get(
            exercise.id
        );

        if (progress?.completed) {
            completedExercises++;
        }

        exercisesList.append(
            createExerciseCard(exercise, progress)
        );
    }

    updateCourseProgress(
        completedExercises,
        exercises.length
    );

    const label = exercises.length === 1
        ? "exercício disponível"
        : "exercícios disponíveis";

    exercisesCount.textContent =
        `${exercises.length} ${label}`;

    exercisesFeedback.hidden =
        exercises.length > 0;

    exercisesFeedback.textContent =
        exercises.length === 0
            ? "Este curso ainda não possui exercícios disponíveis."
            : "";
}

function createExerciseCard(exercise, progress) {
    const card = document.createElement("article");
    const sequence = document.createElement("div");
    const content = document.createElement("div");
    const topline = document.createElement("div");
    const difficulty = document.createElement("span");
    const status = document.createElement("span");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const metadata = document.createElement("p");
    const action = document.createElement("button");

    const exerciseStatus = getExerciseStatus(progress);

    card.className = "student-exercise-card";

    sequence.className = "student-exercise-sequence";
    sequence.textContent = exercise.sequence;

    content.className = "student-exercise-content";
    topline.className = "student-exercise-topline";

    difficulty.className =
        "student-exercise-difficulty";

    difficulty.dataset.difficulty =
        exercise.difficulty;

    difficulty.textContent =
        DIFFICULTY_LABELS[exercise.difficulty] ??
        exercise.difficulty;

    status.className = "student-exercise-status";
    status.dataset.status = exerciseStatus.value;
    status.textContent = exerciseStatus.label;

    title.textContent = exercise.title;

    description.className =
        "student-exercise-description";

    description.textContent =
        exercise.description;

    metadata.className = "student-exercise-meta";
    metadata.textContent =
        createExerciseMetadata(progress);

    action.type = "button";
    action.className = "student-exercise-action";
    action.textContent =
        getExerciseActionLabel(progress);

    action.addEventListener("click", () => {
        const exerciseUrl = new URL(
            EXERCISE_URL.href
        );

        exerciseUrl.searchParams.set(
            "id",
            exercise.id
        );

        window.location.href = exerciseUrl.href;
    });

    topline.append(difficulty, status);

    content.append(
        topline,
        title,
        description,
        metadata
    );

    card.append(sequence, content, action);

    return card;
}

function getExerciseStatus(progress) {
    if (!progress) {
        return {
            value: "not-started",
            label: "Não iniciado"
        };
    }

    if (progress.completed) {
        return {
            value: "completed",
            label: "Concluído"
        };
    }

    return {
        value: "in-progress",
        label: "Em andamento"
    };
}

function getExerciseActionLabel(progress) {
    if (progress?.completed) {
        return "Ver exercício";
    }

    if (progress) {
        return "Continuar";
    }

    return "Começar";
}

function createExerciseMetadata(progress) {
    if (!progress) {
        return "Você ainda não respondeu este exercício.";
    }

    const attemptsLabel = progress.attempts === 1
        ? "1 tentativa"
        : `${progress.attempts} tentativas`;

    if (!progress.lastAnsweredAt) {
        return attemptsLabel;
    }

    const lastAnswerDate = formatDate(
        progress.lastAnsweredAt
    );

    return `${attemptsLabel} • Última resposta em ${lastAnswerDate}`;
}

// ==================== PROGRESSO ====================

function updateCourseProgress(completed, total) {
    courseProgressCount.textContent =
        `${completed} de ${total}`;

    const progressPercentage = total === 0
        ? 0
        : (completed / total) * 100;

    courseProgressBar.style.width =
        `${progressPercentage}%`;
}

// ==================== FORMATAÇÃO ====================

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "data não disponível";
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);
}

// ==================== FEEDBACK ====================

function showCourseFeedback(
    message,
    type = "loading"
) {
    courseContent.hidden = true;
    courseFeedback.hidden = false;
    courseFeedback.dataset.type = type;
    courseFeedback.textContent = message;
}

// ==================== INICIALIZAÇÃO ====================

async function initializePage() {
    const session = getSession();

    if (
        !session ||
        session.user.role !== "STUDENT"
    ) {
        window.location.replace(LOGIN_URL.href);
        return;
    }

    renderStudentPanel(session.user);

    if (!courseId) {
        showCourseFeedback(
            "O curso informado é inválido.",
            "error"
        );

        courseReload.disabled = true;
        return;
    }

    courseReload.addEventListener(
        "click",
        loadCourse
    );

    await loadCourse();
}

initializePage();