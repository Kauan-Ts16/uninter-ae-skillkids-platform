// ==================== IMPORTAÇÕES ====================

import {
    getSession,
    getToken,
    signOut
} from "../../auth.js";

import { renderStudentPanel } from "../../components/student-panel.js";

import {
    clearMessage,
    showMessage
} from "../../components/toast.js";

import {
    getStudentProgressOverview
} from "../../services/student-progress-overview-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================

const studentFirstName = document.querySelector(
    "#student-progress-first-name"
);

const progressReload = document.querySelector(
    "#student-progress-reload"
);

const progressFeedback = document.querySelector(
    "#student-progress-feedback"
);

const progressContent = document.querySelector(
    "#student-progress-content"
);

const progressPercentage = document.querySelector(
    "#student-progress-percentage"
);

const progressOverallTrack = document.querySelector(
    "#student-progress-overall-track"
);

const progressOverallBar = document.querySelector(
    "#student-progress-overall-bar"
);

const progressOverallDescription = document.querySelector(
    "#student-progress-overall-description"
);

const progressCompleted = document.querySelector(
    "#student-progress-completed"
);

const progressInProgress = document.querySelector(
    "#student-progress-in-progress"
);

const progressAttempts = document.querySelector(
    "#student-progress-attempts"
);

const progressLastActivity = document.querySelector(
    "#student-progress-last-activity"
);

const progressCoursesCount = document.querySelector(
    "#student-progress-courses-count"
);

const progressCoursesGrid = document.querySelector(
    "#student-progress-courses-grid"
);

const progressCoursesEmpty = document.querySelector(
    "#student-progress-courses-empty"
);

// ==================== ESTADO ====================

let isLoading = false;

// ==================== FORMATAÇÃO ====================

function formatDate(value) {
    if (!value) {
        return "Nenhuma";
    }

    const date = new Date(value);

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

function getCourseStatus(completed, started, total) {
    if (total > 0 && completed === total) {
        return {
            key: "completed",
            label: "Concluído",
            action: "Revisar curso"
        };
    }

    if (started > 0) {
        return {
            key: "in-progress",
            label: "Em andamento",
            action: "Continuar curso"
        };
    }

    return {
        key: "not-started",
        label: "Não iniciado",
        action: "Começar curso"
    };
}

// ==================== CARREGAMENTO ====================

function setLoading(loading) {
    isLoading = loading;

    progressReload.disabled = loading;
    progressReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";
}

// ==================== CARTÃO DO CURSO ====================

function createCourseCard(course, progressByExercise) {
    const total = course.exercises.length;

    const exerciseProgress = course.exercises
        .map(exercise => progressByExercise.get(exercise.id))
        .filter(Boolean);

    const started = exerciseProgress.length;

    const completed = exerciseProgress.filter(
        item => item.completed
    ).length;

    const percentage = calculatePercentage(
        completed,
        total
    );

    const status = getCourseStatus(
        completed,
        started,
        total
    );

    const card = document.createElement("article");
    card.className = "student-progress-course-card";

    const header = document.createElement("header");
    header.className = "student-progress-course-card-header";

    const title = document.createElement("h3");
    title.textContent = course.title;

    const statusElement = document.createElement("span");
    statusElement.className = "student-progress-course-status";
    statusElement.dataset.status = status.key;
    statusElement.textContent = status.label;

    header.append(title, statusElement);

    const description = document.createElement("p");
    description.className = "student-progress-course-description";
    description.textContent = course.description;

    const progressHeading = document.createElement("div");
    progressHeading.className = "student-progress-course-heading";

    const progressLabel = document.createElement("span");
    progressLabel.textContent = `${completed} de ${total} concluídos`;

    const percentageElement = document.createElement("strong");
    percentageElement.textContent = `${percentage}%`;

    progressHeading.append(
        progressLabel,
        percentageElement
    );

    const track = document.createElement("div");
    track.className = "student-progress-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute(
        "aria-label",
        `Progresso no curso ${course.title}`
    );
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(percentage));

    const bar = document.createElement("div");
    bar.className = "student-progress-bar";
    bar.style.width = `${percentage}%`;

    track.append(bar);

    const footer = document.createElement("footer");
    footer.className = "student-progress-course-footer";

    const attempts = exerciseProgress.reduce(
        (totalAttempts, item) =>
            totalAttempts + Number(item.attempts ?? 0),
        0
    );

    const attemptsLabel = attempts === 1
        ? "1 tentativa realizada"
        : `${attempts} tentativas realizadas`;

    const attemptsElement = document.createElement("span");
    attemptsElement.textContent = attemptsLabel;

    const action = document.createElement("a");
    action.className = "student-progress-course-action";
    action.textContent = status.action;

    const courseUrl = new URL(
        "../../../../student/course.html",
        import.meta.url
    );

    courseUrl.searchParams.set("id", course.id);

    action.href = courseUrl.href;

    footer.append(attemptsElement, action);

    card.append(
        header,
        description,
        progressHeading,
        track,
        footer
    );

    return card;
}

// ==================== EXIBIÇÃO ====================

function renderProgress(data) {
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
        availableExercises.map(exercise => exercise.id)
    );

    const availableProgress = data.progress.filter(
        item => availableExerciseIds.has(item.exerciseId)
    );

    const totalExercises = availableExercises.length;

    const completed = availableProgress.filter(
        item => item.completed
    ).length;

    const inProgress = availableProgress.filter(
        item => !item.completed
    ).length;

    const attempts = availableProgress.reduce(
        (total, item) => total + Number(item.attempts ?? 0),
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

            const current = new Date(item.lastAnsweredAt);

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

    progressPercentage.textContent = `${percentage}%`;
    progressOverallBar.style.width = `${percentage}%`;
    progressOverallTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );

    progressOverallDescription.textContent =
        `${completed} de ${totalExercises} exercícios concluídos`;

    progressCompleted.textContent = String(completed);
    progressInProgress.textContent = String(inProgress);
    progressAttempts.textContent = String(attempts);
    progressLastActivity.textContent = formatDate(lastActivity);

    progressCoursesGrid.replaceChildren();

    const coursesLabel = data.courses.length === 1
        ? "1 curso disponível"
        : `${data.courses.length} cursos disponíveis`;

    progressCoursesCount.textContent = coursesLabel;

    for (const course of data.courses) {
        progressCoursesGrid.append(
            createCourseCard(
                course,
                progressByExercise
            )
        );
    }

    const hasCourses = data.courses.length > 0;

    progressCoursesGrid.hidden = !hasCourses;
    progressCoursesEmpty.hidden = hasCourses;
    progressContent.hidden = false;
    progressFeedback.hidden = true;
}

// ==================== CONSULTA ====================

async function loadProgress() {
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
    progressFeedback.dataset.type = "loading";
    progressFeedback.textContent =
        "Carregando seu progresso...";

    try {
        const data = await getStudentProgressOverview(
            token
        );

        renderProgress(data);
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        progressFeedback.dataset.type = "error";
        progressFeedback.textContent =
            "Não foi possível carregar seu progresso.";

        const message = error.status === 403
            ? "Sua conta não tem permissão para consultar este progresso."
            : error.message ||
            "Não foi possível carregar seu progresso.";

        showMessage(message, "error");
    } finally {
        setLoading(false);
    }
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

    studentFirstName.textContent = session.user.name
        .trim()
        .split(/\s+/)[0];

    progressReload.addEventListener(
        "click",
        loadProgress
    );

    await loadProgress();
}

initializePage();