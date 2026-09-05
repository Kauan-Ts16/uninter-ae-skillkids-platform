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
    getTeacherCourse,
    getTeacherCourseExercises
} from "../../services/teacher-content-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== PARÂMETROS ====================

const pageParameters = new URLSearchParams(
    window.location.search
);

const courseId = pageParameters.get("id");

// ==================== CONFIGURAÇÕES ====================

const DIFFICULTY_LABELS = {
    EASY: "Fácil",
    MEDIUM: "Médio",
    HARD: "Difícil"
};

const OPTION_LETTERS = [
    "A",
    "B",
    "C",
    "D"
];

// ==================== ELEMENTOS ====================

const contentFeedback = document.querySelector(
    "#teacher-content-feedback"
);

const content = document.querySelector(
    "#teacher-content"
);

const contentTitle = document.querySelector(
    "#teacher-content-title"
);

const contentDescription = document.querySelector(
    "#teacher-content-description"
);

const exercisesCount = document.querySelector(
    "#teacher-content-exercises-count"
);

const exercisesDescription = document.querySelector(
    "#teacher-content-exercises-description"
);

const exercisesReload = document.querySelector(
    "#teacher-content-reload"
);

const exercisesFeedback = document.querySelector(
    "#teacher-content-exercises-feedback"
);

const exercisesList = document.querySelector(
    "#teacher-content-exercises-list"
);

// ==================== ESTADO ====================

let isLoading = false;

// ==================== CARREGAMENTO ====================

function setLoading(loading) {
    isLoading = loading;

    exercisesReload.disabled = loading;
    exercisesReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";
}

function showContentFeedback(message) {
    contentFeedback.textContent = message;
    contentFeedback.hidden = false;
    content.hidden = true;
}

// ==================== ALTERNATIVA ====================

function createOption(
    option,
    index,
    correctOptionIndex
) {
    const item = document.createElement("li");
    item.className = "teacher-content-option";

    const letter = document.createElement("span");
    letter.className = "teacher-content-option-letter";
    letter.textContent = OPTION_LETTERS[index] ??
        String(index + 1);

    const text = document.createElement("span");
    text.className = "teacher-content-option-text";
    text.textContent = option;

    item.append(letter, text);

    if (index === correctOptionIndex) {
        item.dataset.correct = "true";

        const badge = document.createElement("span");
        badge.className = "teacher-content-option-badge";
        badge.textContent = "Correta";

        item.append(badge);
    }

    return item;
}

// ==================== EXERCÍCIO ====================

function createExerciseCard(exercise, index) {
    const card = document.createElement("article");
    card.className = "teacher-content-exercise-card";

    const sequence = document.createElement("span");
    sequence.className = "teacher-content-exercise-sequence";
    sequence.textContent = String(
        exercise.sequence ?? index + 1
    );

    const exerciseContent = document.createElement("div");
    exerciseContent.className = "teacher-content-exercise-content";

    const topline = document.createElement("div");
    topline.className = "teacher-content-exercise-topline";

    const label = document.createElement("span");
    label.className = "teacher-content-exercise-label";
    label.textContent = `Exercício ${index + 1}`;

    const difficulty = document.createElement("span");
    difficulty.className = "teacher-content-difficulty";
    difficulty.dataset.difficulty = exercise.difficulty;
    difficulty.textContent =
        DIFFICULTY_LABELS[exercise.difficulty] ??
        exercise.difficulty ??
        "Não informada";

    topline.append(label, difficulty);

    const title = document.createElement("h3");
    title.textContent = exercise.title;

    const description = document.createElement("p");
    description.className = "teacher-content-exercise-description";
    description.textContent = exercise.description ||
        "Este exercício não possui uma descrição.";

    const optionsTitle = document.createElement("h4");
    optionsTitle.textContent = "Alternativas";

    const options = document.createElement("ol");
    options.className = "teacher-content-options";

    const exerciseOptions = Array.isArray(exercise.options)
        ? exercise.options
        : [];

    for (const [optionIndex, option] of exerciseOptions.entries()) {
        options.append(
            createOption(
                option,
                optionIndex,
                exercise.correctOptionIndex
            )
        );
    }

    if (exerciseOptions.length === 0) {
        const emptyOption = document.createElement("li");
        emptyOption.className = "teacher-content-options-empty";
        emptyOption.textContent =
            "Nenhuma alternativa foi cadastrada para este exercício.";

        options.append(emptyOption);
    }

    exerciseContent.append(
        topline,
        title,
        description,
        optionsTitle,
        options
    );

    card.append(sequence, exerciseContent);

    return card;
}

// ==================== EXIBIÇÃO ====================

function renderContent(course, exercises) {
    const orderedExercises = [...exercises].sort(
        (firstExercise, secondExercise) =>
            (firstExercise.sequence ?? 0) -
            (secondExercise.sequence ?? 0)
    );

    contentTitle.textContent = course.title;
    contentDescription.textContent = course.description ||
        "Consulte os exercícios disponíveis neste curso.";

    exercisesCount.textContent = String(
        orderedExercises.length
    );

    const label = orderedExercises.length === 1
        ? "exercício disponível"
        : "exercícios disponíveis";

    exercisesDescription.textContent =
        `${orderedExercises.length} ${label}`;

    exercisesList.replaceChildren();

    if (orderedExercises.length === 0) {
        exercisesFeedback.textContent =
            "Este curso ainda não possui exercícios disponíveis.";

        exercisesFeedback.hidden = false;
        exercisesList.hidden = true;
    } else {
        for (const [index, exercise] of orderedExercises.entries()) {
            exercisesList.append(
                createExerciseCard(exercise, index)
            );
        }

        exercisesFeedback.hidden = true;
        exercisesList.hidden = false;
    }

    document.title = `${course.title} | SkillKids`;

    contentFeedback.hidden = true;
    content.hidden = false;
}

// ==================== ERROS ====================

function handleRequestError(error) {
    if (error.status === 401) {
        signOut();
        return;
    }

    const message = error.status === 403
        ? "Sua conta não tem permissão para consultar este conteúdo."
        : error.status === 404
            ? "O curso informado não foi encontrado."
            : error.message ||
            "Não foi possível carregar o conteúdo do curso.";

    showContentFeedback(message);
    showMessage(message, "error");
}

// ==================== CONSULTA ====================

async function loadContent() {
    if (isLoading || !courseId) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    clearMessage();
    setLoading(true);

    showContentFeedback(
        "Carregando conteúdo do curso..."
    );

    try {
        const [course, exercises] = await Promise.all([
            getTeacherCourse(courseId, token),
            getTeacherCourseExercises(courseId, token)
        ]);

        renderContent(course, exercises);
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

    exercisesReload.addEventListener(
        "click",
        loadContent
    );

    if (!courseId) {
        const message =
            "Não foi possível identificar o curso selecionado.";

        showContentFeedback(message);
        showMessage(message, "error");
        exercisesReload.disabled = true;
        return;
    }

    await loadContent();
}

initializePage();