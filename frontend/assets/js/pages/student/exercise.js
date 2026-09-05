// ==================== IMPORTAÇÕES ====================

import {
    getSession,
    getToken,
    signOut
} from "../../auth.js";

import {
    renderStudentPanel
} from "../../components/student-panel.js";

import {
    getStudentExercise
} from "../../services/student-exercise-service.js";

import {
    answerStudentExercise,
    getStudentProgress
} from "../../services/student-progress-service.js";

// ==================== CONSTANTES ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

const COURSE_URL = new URL(
    "../../../../student/course.html",
    import.meta.url
);

const DIFFICULTY_LABELS = {
    EASY: "Fácil",
    MEDIUM: "Média",
    HARD: "Difícil"
};

const OPTION_LETTERS = [
    "A",
    "B",
    "C",
    "D"
];

// ==================== ELEMENTOS ====================

const exerciseBack = document.querySelector(
    "#exercise-back"
);

const pageFeedback = document.querySelector(
    "#exercise-page-feedback"
);

const exerciseContent = document.querySelector(
    "#exercise-content"
);

const exerciseCourseTitle = document.querySelector(
    "#exercise-course-title"
);

const exerciseTitle = document.querySelector(
    "#exercise-title"
);

const exerciseDescription = document.querySelector(
    "#exercise-description"
);

const exerciseSequence = document.querySelector(
    "#exercise-sequence"
);

const exerciseDifficulty = document.querySelector(
    "#exercise-difficulty"
);

const exerciseProgress = document.querySelector(
    "#exercise-progress"
);

const exerciseMascotMessage = document.querySelector(
    "#exercise-mascot-message"
);

const exerciseForm = document.querySelector(
    "#exercise-form"
);

const exerciseOptions = document.querySelector(
    "#exercise-options"
);

const exerciseResult = document.querySelector(
    "#exercise-result"
);

const exerciseResultTitle = document.querySelector(
    "#exercise-result-title"
);

const exerciseResultDescription =
    document.querySelector(
        "#exercise-result-description"
    );

const exerciseSubmit = document.querySelector(
    "#exercise-submit"
);

const exerciseReturn = document.querySelector(
    "#exercise-return"
);

// ==================== ESTADO ====================

const exerciseId = new URLSearchParams(
    window.location.search
).get("id");

let currentExercise = null;
let currentProgress = null;
let selectedOptionIndex = null;
let isSubmitting = false;

// ==================== CARREGAMENTO ====================

async function loadExercise() {
    showPageFeedback(
        "Carregando exercício..."
    );

    try {
        const token = getToken();

        const [
            exercise,
            progressList
        ] = await Promise.all([
            getStudentExercise(
                exerciseId,
                token
            ),
            getStudentProgress(token)
        ]);

        currentExercise = exercise;

        currentProgress =
            progressList.find(
                progress =>
                    progress.exerciseId === exercise.id
            ) ?? null;

        renderExercise();
    } catch (error) {
        if (
            error.status === 401 ||
            error.status === 403
        ) {
            signOut();
            return;
        }

        showPageFeedback(
            "Não foi possível carregar o exercício.",
            "error"
        );
    }
}

// ==================== EXIBIÇÃO ====================

function renderExercise() {
    configureCourseLinks();

    exerciseCourseTitle.textContent =
        currentExercise.courseTitle;

    exerciseTitle.textContent =
        currentExercise.title;

    exerciseDescription.textContent =
        currentExercise.description;

    exerciseSequence.textContent =
        `Exercício ${currentExercise.sequence}`;

    exerciseDifficulty.dataset.difficulty =
        currentExercise.difficulty;

    exerciseDifficulty.textContent =
        DIFFICULTY_LABELS[
        currentExercise.difficulty
        ] ?? currentExercise.difficulty;

    renderOptions(
        currentExercise.options,
        currentProgress?.completed === true
    );

    updateProgressInformation();

    if (currentProgress?.completed) {
        showCompletedState();
    } else {
        exerciseResult.hidden = true;
        exerciseSubmit.hidden = false;
        exerciseReturn.hidden = true;
    }

    pageFeedback.hidden = true;
    exerciseContent.hidden = false;
}

function renderOptions(options, disabled) {
    exerciseOptions.replaceChildren();

    for (const [index, option] of options.entries()) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        const letter = document.createElement("span");
        const text = document.createElement("span");
        const selector = document.createElement("span");

        label.className = "student-answer-option";
        label.dataset.optionIndex = String(index);
        label.dataset.disabled = String(disabled);

        input.type = "radio";
        input.name = "selectedOption";
        input.value = String(index);
        input.className = "student-answer-radio";
        input.disabled = disabled;

        input.addEventListener("change", () => {
            handleOptionSelection(index);
        });

        letter.className = "student-answer-letter";
        letter.textContent =
            OPTION_LETTERS[index] ??
            String(index + 1);

        text.className = "student-answer-text";
        text.textContent = option;

        selector.className =
            "student-answer-selector";

        selector.setAttribute(
            "aria-hidden",
            "true"
        );

        label.append(
            input,
            letter,
            text,
            selector
        );

        exerciseOptions.append(label);
    }
}

// ==================== SELEÇÃO ====================

function handleOptionSelection(index) {
    if (
        isSubmitting ||
        currentProgress?.completed
    ) {
        return;
    }

    selectedOptionIndex = index;

    clearOptionStates();

    exerciseResult.hidden = true;
    exerciseSubmit.disabled = false;
    exerciseSubmit.textContent =
        "Confirmar resposta";
}

// ==================== RESPOSTA ====================

async function handleAnswer(event) {
    event.preventDefault();

    if (
        isSubmitting ||
        selectedOptionIndex === null ||
        currentProgress?.completed
    ) {
        return;
    }

    setSubmitting(true);
    clearOptionStates();
    exerciseResult.hidden = true;

    try {
        const response = await answerStudentExercise(
            currentExercise.id,
            selectedOptionIndex,
            getToken()
        );

        currentProgress = response;

        updateProgressInformation();

        const selectedOption =
            exerciseOptions.querySelector(
                `[data-option-index="${selectedOptionIndex}"]`
            );

        if (response.correct) {
            selectedOption.dataset.state =
                "correct";

            showCorrectAnswer();
            lockExercise();
            return;
        }

        selectedOption.dataset.state =
            "incorrect";

        showIncorrectAnswer();
    } catch (error) {
        if (
            error.status === 401 ||
            error.status === 403
        ) {
            signOut();
            return;
        }

        showAnswerResult(
            "Não foi possível enviar a resposta",
            error.message ||
            "Tente novamente em alguns instantes.",
            "error"
        );
    } finally {
        setSubmitting(false);
    }
}

// ==================== ESTADOS DA RESPOSTA ====================

function showCorrectAnswer() {
    exerciseMascotMessage.textContent =
        "Muito bem! Você concluiu este exercício.";

    showAnswerResult(
        "Resposta correta!",
        "Parabéns! Seu progresso foi atualizado.",
        "success"
    );
}

function showIncorrectAnswer() {
    exerciseMascotMessage.textContent =
        "Quase! Observe as alternativas e tente novamente.";

    showAnswerResult(
        "Ainda não é essa.",
        "Escolha outra alternativa e tente novamente.",
        "error"
    );
}

function showCompletedState() {
    exerciseMascotMessage.textContent =
        "Você já concluiu este exercício. Muito bem!";

    showAnswerResult(
        "Exercício concluído!",
        "Este exercício já está marcado como concluído.",
        "success"
    );

    exerciseSubmit.hidden = true;
    exerciseReturn.hidden = false;
}

function lockExercise() {
    for (
        const input of
        exerciseOptions.querySelectorAll("input")
    ) {
        input.disabled = true;

        input.closest(
            ".student-answer-option"
        ).dataset.disabled = "true";
    }

    exerciseSubmit.hidden = true;
    exerciseReturn.hidden = false;
}

// ==================== RESULTADO ====================

function showAnswerResult(
    title,
    description,
    type
) {
    exerciseResult.dataset.type = type;
    exerciseResultTitle.textContent = title;
    exerciseResultDescription.textContent =
        description;

    exerciseResult.hidden = false;
}

function clearOptionStates() {
    for (
        const option of
        exerciseOptions.querySelectorAll(
            ".student-answer-option"
        )
    ) {
        delete option.dataset.state;
    }
}

// ==================== PROGRESSO ====================

function updateProgressInformation() {
    if (!currentProgress) {
        exerciseProgress.textContent =
            "Nenhuma tentativa realizada.";

        return;
    }

    const attemptsLabel =
        currentProgress.attempts === 1
            ? "1 tentativa realizada"
            : `${currentProgress.attempts} tentativas realizadas`;

    if (!currentProgress.lastAnsweredAt) {
        exerciseProgress.textContent =
            attemptsLabel;

        return;
    }

    const date = formatDate(
        currentProgress.lastAnsweredAt
    );

    exerciseProgress.textContent =
        `${attemptsLabel} • Última resposta em ${date}`;
}

// ==================== LINKS ====================

function configureCourseLinks() {
    const courseUrl = new URL(COURSE_URL.href);

    courseUrl.searchParams.set(
        "id",
        currentExercise.courseId
    );

    exerciseBack.href = courseUrl.href;
    exerciseReturn.href = courseUrl.href;
}

// ==================== ENVIO ====================

function setSubmitting(submitting) {
    isSubmitting = submitting;

    exerciseSubmit.disabled =
        submitting ||
        selectedOptionIndex === null;

    exerciseSubmit.textContent = submitting
        ? "Verificando..."
        : "Confirmar resposta";
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

// ==================== FEEDBACK DA PÁGINA ====================

function showPageFeedback(
    message,
    type = "loading"
) {
    exerciseContent.hidden = true;
    pageFeedback.hidden = false;
    pageFeedback.dataset.type = type;
    pageFeedback.textContent = message;
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

    if (!exerciseId) {
        showPageFeedback(
            "O exercício informado é inválido.",
            "error"
        );

        return;
    }

    exerciseForm.addEventListener(
        "submit",
        handleAnswer
    );

    await loadExercise();
}

initializePage();