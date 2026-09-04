// ==================== IMPORTAÇÕES ====================

import { getSession, getToken, signOut } from "../../auth.js";
import { renderAdminPanel } from "../../components/panel.js";
import { clearMessage, showMessage } from "../../components/toast.js";
import { getActiveCourses } from "../../services/course-service.js";
import { createExercise, getExercises, updateExercise, updateExerciseOptions, activateExercise, deactivateExercise, deleteExercise } from "../../services/exercise-service.js";

// ==================== CONFIGURAÇÕES ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

const DIFFICULTY_LABELS = {
    EASY: "Fácil",
    MEDIUM: "Média",
    HARD: "Difícil"
};

// ==================== ELEMENTOS DA LISTAGEM ====================

const exercisesCount = document.querySelector("#exercises-count");
const exercisesCreate = document.querySelector("#exercises-create");
const exercisesReload = document.querySelector("#exercises-reload");
const exercisesSearch = document.querySelector("#exercises-search");
const exercisesCourse = document.querySelector("#exercises-course");
const exercisesDifficulty = document.querySelector(
    "#exercises-difficulty"
);
const exercisesStatus = document.querySelector(
    "#exercises-status"
);
const exercisesClear = document.querySelector("#exercises-clear");
const exercisesFeedback = document.querySelector(
    "#exercises-feedback"
);
const exercisesTableWrapper = document.querySelector(
    "#exercises-table-wrapper"
);
const exercisesList = document.querySelector("#exercises-list");

// ==================== ELEMENTOS DO MODAL DE CADASTRO ====================

const exerciseDialog = document.querySelector("#exercise-dialog");
const exerciseDialogClose = document.querySelector(
    "#exercise-dialog-close"
);
const exerciseForm = document.querySelector("#exercise-form");
const exerciseTitle = document.querySelector("#exercise-title");
const exerciseDescription = document.querySelector(
    "#exercise-description"
);
const exerciseDifficulty = document.querySelector(
    "#exercise-difficulty"
);
const exerciseCourse = document.querySelector("#exercise-course");
const exerciseCourseHelp = document.querySelector(
    "#exercise-course-help"
);
const exerciseOptionInputs = document.querySelectorAll(
    ".exercise-option-input"
);
const exerciseCorrectOption = document.querySelector(
    "#exercise-correct-option"
);
const exerciseCancel = document.querySelector("#exercise-cancel");
const exerciseSubmit = document.querySelector("#exercise-submit");

// ==================== ELEMENTOS DO MODAL DE EDIÇÃO ====================

const editExerciseDialog = document.querySelector(
    "#edit-exercise-dialog"
);
const editExerciseClose = document.querySelector(
    "#edit-exercise-dialog-close"
);
const editExerciseForm = document.querySelector(
    "#edit-exercise-form"
);
const editExerciseTitle = document.querySelector(
    "#edit-exercise-title"
);
const editExerciseDifficulty = document.querySelector(
    "#edit-exercise-difficulty"
);
const editExerciseDescription = document.querySelector(
    "#edit-exercise-description"
);
const editExerciseCancel = document.querySelector(
    "#edit-exercise-cancel"
);
const editExerciseSubmit = document.querySelector(
    "#edit-exercise-submit"
);

// ==================== ELEMENTOS DO MODAL DE ALTERNATIVAS ====================

const optionsDialog = document.querySelector(
    "#exercise-options-dialog"
);
const optionsDialogClose = document.querySelector(
    "#exercise-options-dialog-close"
);
const optionsForm = document.querySelector(
    "#exercise-options-form"
);
const optionsInputs = document.querySelectorAll(
    ".edit-exercise-option-input"
);
const optionsCorrectOption = document.querySelector(
    "#edit-exercise-correct-option"
);
const optionsCancel = document.querySelector(
    "#exercise-options-cancel"
);
const optionsSubmit = document.querySelector(
    "#exercise-options-submit"
);

// ==================== ELEMENTOS DO MODAL DE STATUS ====================

const statusDialog = document.querySelector(
    "#exercise-status-dialog"
);
const statusDialogIcon = document.querySelector(
    "#exercise-status-icon"
);
const statusDialogTitle = document.querySelector(
    "#exercise-status-title"
);
const statusDialogDescription = document.querySelector(
    "#exercise-status-description"
);
const statusForm = document.querySelector(
    "#exercise-status-form"
);
const statusCancel = document.querySelector(
    "#exercise-status-cancel"
);
const statusConfirm = document.querySelector(
    "#exercise-status-confirm"
);

// ==================== ELEMENTOS DO MODAL DE EXCLUSÃO ====================

const deleteDialog = document.querySelector(
    "#exercise-delete-dialog"
);
const deleteDialogDescription = document.querySelector(
    "#exercise-delete-description"
);
const deleteForm = document.querySelector(
    "#exercise-delete-form"
);
const deleteCancel = document.querySelector(
    "#exercise-delete-cancel"
);
const deleteConfirm = document.querySelector(
    "#exercise-delete-confirm"
);

// ==================== ELEMENTOS DO MODAL DE AÇÕES ====================

const actionsDialog = document.querySelector(
    "#exercise-actions-dialog"
);
const actionsDialogDescription = document.querySelector(
    "#exercise-actions-description"
);
const actionsDialogClose = document.querySelector(
    "#exercise-actions-close"
);
const actionEdit = document.querySelector(
    "#exercise-action-edit"
);
const actionOptions = document.querySelector(
    "#exercise-action-options"
);
const actionStatus = document.querySelector(
    "#exercise-action-status"
);
const actionStatusTitle = document.querySelector(
    "#exercise-action-status-title"
);
const actionStatusDescription = document.querySelector(
    "#exercise-action-status-description"
);
const actionDelete = document.querySelector(
    "#exercise-action-delete"
);

// ==================== ESTADO DA PÁGINA ====================

let allExercises = [];
let activeCourses = [];

let isLoading = false;
let isLoadingCourses = false;
let isSubmitting = false;

let hasLoadedExercises = false;
let hasLoadedActiveCourses = false;
let courseLoadFailed = false;

let actionsExercise = null;

let selectedExercise = null;
let isUpdatingExercise = false;

let optionsExercise = null;
let isUpdatingOptions = false;

let statusExercise = null;
let isChangingStatus = false;

let deletingExercise = null;
let isDeletingExercise = false;

// ==================== CONTROLE DA LISTAGEM ====================

function setLoading(loading) {
    isLoading = loading;

    exercisesReload.disabled = loading;
    exercisesReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";

    const controls = [
        exercisesSearch,
        exercisesCourse,
        exercisesDifficulty,
        exercisesStatus,
        exercisesClear
    ];

    for (const control of controls) {
        control.disabled = loading || !hasLoadedExercises;
    }

    exercisesCreate.disabled =
        loading || !hasLoadedExercises;
}

// ==================== CONTROLE DO FORMULÁRIO DE CADASTRO ====================

function updateCorrectOptionField() {
    const selectOptions = exerciseCorrectOption.options;

    for (let index = 1; index < selectOptions.length; index++) {
        const input = exerciseOptionInputs[index - 1];

        selectOptions[index].disabled =
            !input.value.trim();
    }

    const selectedOption =
        selectOptions[exerciseCorrectOption.selectedIndex];

    if (selectedOption?.disabled) {
        exerciseCorrectOption.value = "";
    }

    exerciseCorrectOption.disabled = isSubmitting;
}

function updateCourseField() {
    const noActiveCourses =
        hasLoadedActiveCourses &&
        activeCourses.length === 0;

    exerciseCourse.disabled =
        isLoadingCourses ||
        isSubmitting ||
        courseLoadFailed ||
        noActiveCourses;

    exerciseSubmit.disabled =
        isSubmitting ||
        isLoadingCourses ||
        !hasLoadedActiveCourses ||
        courseLoadFailed ||
        noActiveCourses;

    if (isLoadingCourses) {
        exerciseCourseHelp.textContent =
            "Carregando cursos ativos...";

        return;
    }

    if (courseLoadFailed) {
        exerciseCourseHelp.textContent =
            "Não foi possível carregar os cursos.";

        return;
    }

    if (noActiveCourses) {
        exerciseCourseHelp.textContent =
            "Nenhum curso ativo disponível.";

        return;
    }

    exerciseCourseHelp.textContent =
        "Somente cursos ativos são exibidos.";
}

function setSubmitting(submitting) {
    isSubmitting = submitting;

    exerciseTitle.disabled = submitting;
    exerciseDescription.disabled = submitting;
    exerciseDifficulty.disabled = submitting;
    exerciseCancel.disabled = submitting;
    exerciseDialogClose.disabled = submitting;

    for (const input of exerciseOptionInputs) {
        input.disabled = submitting;
    }

    exerciseSubmit.textContent = submitting
        ? "Criando..."
        : "Criar exercício";

    updateCourseField();
    updateCorrectOptionField();
}


// ==================== NORMALIZAÇÃO DA BUSCA ====================

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// ==================== CURSOS DO FILTRO ====================

function renderCourseFilterOptions() {
    const selectedCourseId = exercisesCourse.value;
    const courses = new Map();

    for (const exercise of allExercises) {
        if (exercise.courseId && exercise.courseTitle) {
            courses.set(
                exercise.courseId,
                exercise.courseTitle
            );
        }
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Todos os cursos";

    exercisesCourse.replaceChildren(defaultOption);

    const sortedCourses = [...courses.entries()]
        .sort((first, second) =>
            first[1].localeCompare(second[1], "pt-BR")
        );

    for (const [courseId, courseTitle] of sortedCourses) {
        const option = document.createElement("option");

        option.value = courseId;
        option.textContent = courseTitle;

        exercisesCourse.append(option);
    }

    exercisesCourse.value = courses.has(selectedCourseId)
        ? selectedCourseId
        : "";
}

// ==================== CURSOS DO FORMULÁRIO ====================

function renderActiveCourseOptions() {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecione um curso";

    exerciseCourse.replaceChildren(defaultOption);

    const sortedCourses = [...activeCourses]
        .sort((first, second) =>
            first.title.localeCompare(second.title, "pt-BR")
        );

    for (const course of sortedCourses) {
        const option = document.createElement("option");

        option.value = course.id;
        option.textContent = course.title;

        exerciseCourse.append(option);
    }
}

async function loadActiveCourses() {
    if (hasLoadedActiveCourses || isLoadingCourses) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    isLoadingCourses = true;
    courseLoadFailed = false;

    updateCourseField();

    try {
        activeCourses = await getActiveCourses(token);
        hasLoadedActiveCourses = true;

        renderActiveCourseOptions();
    } catch (error) {
        activeCourses = [];
        courseLoadFailed = true;

        renderActiveCourseOptions();

        if (error.status === 401) {
            signOut();
            return;
        }

        showMessage(error.message, "error");
    } finally {
        isLoadingCourses = false;
        updateCourseField();
    }
}

// ==================== FILTROS ====================

function applyFilters() {
    if (!hasLoadedExercises) {
        return;
    }

    const search = normalizeText(exercisesSearch.value);
    const courseId = exercisesCourse.value;
    const difficulty = exercisesDifficulty.value;
    const status = exercisesStatus.value;

    const filteredExercises = allExercises
        .filter(exercise => {
            const matchesSearch =
                normalizeText(exercise.title).includes(search) ||
                normalizeText(exercise.description).includes(search);

            const matchesCourse =
                !courseId || exercise.courseId === courseId;

            const matchesDifficulty =
                !difficulty ||
                exercise.difficulty === difficulty;

            const matchesStatus =
                !status ||
                String(exercise.active) === status;

            return (
                matchesSearch &&
                matchesCourse &&
                matchesDifficulty &&
                matchesStatus
            );
        })
        .sort((first, second) => {
            const courseComparison =
                first.courseTitle.localeCompare(
                    second.courseTitle,
                    "pt-BR"
                );

            if (courseComparison !== 0) {
                return courseComparison;
            }

            return first.sequence - second.sequence;
        });

    renderExercises(filteredExercises);
}

function clearFilters() {
    exercisesSearch.value = "";
    exercisesCourse.value = "";
    exercisesDifficulty.value = "";
    exercisesStatus.value = "";

    applyFilters();
    exercisesSearch.focus();
}

// ==================== CÉLULAS DA TABELA ====================

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";

    return cell;
}

function createSequenceCell(sequence) {
    const cell = document.createElement("td");
    const content = document.createElement("span");

    content.className = "exercise-sequence";
    content.textContent = sequence == null
        ? "—"
        : `#${sequence}`;

    cell.append(content);

    return cell;
}

// ==================== AÇÃO DA TABELA ====================

function createExerciseActionsCell(exercise) {
    const cell = document.createElement("td");
    const container = document.createElement("div");
    const button = document.createElement("button");

    container.className = "exercise-actions-cell";

    button.className = "exercise-action-button";
    button.type = "button";
    button.textContent = "Ações";

    button.setAttribute(
        "aria-label",
        `Abrir ações do exercício ${exercise.title}`
    );

    button.addEventListener("click", () => {
        openActionsDialog(exercise);
    });

    container.append(button);
    cell.append(container);

    return cell;
}

// ==================== EXIBIÇÃO DOS EXERCÍCIOS ====================

function renderExercises(exercises) {
    exercisesList.replaceChildren();

    for (const exercise of exercises) {
        const row = document.createElement("tr");

        row.append(
            createSequenceCell(exercise.sequence),
            createCell(exercise.title),
            createCell(exercise.courseTitle)
        );

        const difficulty = document.createElement("span");
        difficulty.className = "exercise-difficulty";
        difficulty.dataset.difficulty = exercise.difficulty;
        difficulty.textContent =
            DIFFICULTY_LABELS[exercise.difficulty] ??
            exercise.difficulty;

        const difficultyCell = createCell("");
        difficultyCell.append(difficulty);

        const status = document.createElement("span");
        status.className = "exercise-status";
        status.dataset.active = String(exercise.active);
        status.textContent = exercise.active
            ? "Ativo"
            : "Inativo";

        const statusCell = createCell("");
        statusCell.append(status);

        row.append(
            difficultyCell,
            statusCell,
            createExerciseActionsCell(exercise)
        );

        exercisesList.append(row);
    }

    const label = allExercises.length === 1
        ? "exercício"
        : "exercícios";

    exercisesCount.textContent =
        `Exibindo ${exercises.length} de ` +
        `${allExercises.length} ${label}`;

    exercisesTableWrapper.hidden = exercises.length === 0;
    exercisesFeedback.hidden = exercises.length > 0;

    exercisesFeedback.textContent = allExercises.length === 0
        ? "Nenhum exercício cadastrado."
        : "Nenhum exercício encontrado com os filtros selecionados.";
}

// ==================== CARREGAMENTO DOS EXERCÍCIOS ====================

async function loadExercises() {
    if (isLoading) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    allExercises = [];
    hasLoadedExercises = false;

    clearMessage();
    setLoading(true);

    exercisesList.replaceChildren();
    exercisesCount.textContent = "";
    exercisesTableWrapper.hidden = true;
    exercisesFeedback.hidden = false;
    exercisesFeedback.textContent =
        "Carregando exercícios...";

    try {
        allExercises = await getExercises(token);
        hasLoadedExercises = true;

        renderCourseFilterOptions();
        applyFilters();
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para consultar exercícios."
            : error.message;

        exercisesFeedback.textContent =
            "Não foi possível carregar a lista. " +
            "Clique em Atualizar para tentar novamente.";

        showMessage(message, "error");
    } finally {
        setLoading(false);
    }
}

// ==================== CONTROLE DO MODAL DE CADASTRO ====================

async function openExerciseDialog() {
    exerciseForm.reset();

    updateCourseField();
    updateCorrectOptionField();

    exerciseDialog.showModal();
    document.body.classList.add("modal-open");

    exerciseTitle.focus();

    await loadActiveCourses();
}

function closeExerciseDialog() {
    if (isSubmitting) {
        return;
    }

    exerciseDialog.close();
}

function resetExerciseDialog() {
    document.body.classList.remove("modal-open");

    exerciseForm.reset();
    updateCourseField();
    updateCorrectOptionField();
}

// ==================== CADASTRO DE EXERCÍCIO ====================

async function handleCreateExercise(event) {
    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    const optionValues = [...exerciseOptionInputs]
        .map(input => input.value.trim());

    if (!optionValues[0] || !optionValues[1]) {
        showMessage(
            "Informe pelo menos duas alternativas.",
            "error"
        );

        const emptyRequiredInput = !optionValues[0]
            ? exerciseOptionInputs[0]
            : exerciseOptionInputs[1];

        emptyRequiredInput.focus();
        return;
    }

    if (!optionValues[2] && optionValues[3]) {
        showMessage(
            "Preencha a alternativa 3 antes da alternativa 4.",
            "error"
        );

        exerciseOptionInputs[2].focus();
        return;
    }

    const options = optionValues.filter(Boolean);
    const selectedCorrectOption =
        exerciseCorrectOption.value;

    if (selectedCorrectOption === "") {
        showMessage(
            "Selecione a resposta correta.",
            "error"
        );

        exerciseCorrectOption.focus();
        return;
    }

    const correctOptionIndex =
        Number(selectedCorrectOption);

    if (correctOptionIndex >= options.length) {
        showMessage(
            "Selecione uma alternativa preenchida.",
            "error"
        );

        exerciseCorrectOption.value = "";
        exerciseCorrectOption.focus();
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const data = {
        title: exerciseTitle.value.trim(),
        description: exerciseDescription.value.trim(),
        difficulty: exerciseDifficulty.value,
        options,
        correctOptionIndex,
        courseId: exerciseCourse.value
    };

    clearMessage();
    setSubmitting(true);

    try {
        const createdExercise = await createExercise(
            data,
            token
        );

        allExercises.push(createdExercise);

        renderCourseFilterOptions();
        applyFilters();

        exerciseDialog.close();

        showMessage(
            `Exercício ${createdExercise.title} criado com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para criar exercícios."
            : error.message;

        showMessage(message, "error");
    } finally {
        setSubmitting(false);
    }
}

// ==================== MODAL DE AÇÕES ====================

function openActionsDialog(exercise) {
    actionsExercise = exercise;

    actionsDialogDescription.textContent =
        `Escolha uma ação para ${exercise.title}.`;

    // Disponibilidade das ações
    actionEdit.disabled = !exercise.active;
    actionOptions.disabled = !exercise.active;
    actionStatus.disabled = false;
    actionDelete.disabled = false;

    const activating = !exercise.active;

    actionStatus.dataset.status = activating
        ? "activate"
        : "deactivate";

    actionStatusTitle.textContent = activating
        ? "Ativar exercício"
        : "Desativar exercício";

    actionStatusDescription.textContent = activating
        ? "Disponibilizar o exercício novamente"
        : "Indisponibilizar o exercício";

    actionsDialog.showModal();
    document.body.classList.add("modal-open");

    actionsDialogClose.focus();
}

function closeActionsDialog() {
    if (actionsDialog.open) {
        actionsDialog.close();
    }
}

function resetActionsDialog() {
    document.body.classList.remove("modal-open");

    actionsExercise = null;

    actionEdit.disabled = false;
    actionOptions.disabled = false;
    actionStatus.disabled = false;
    actionDelete.disabled = false;

    delete actionStatus.dataset.status;
}

function runSelectedExerciseAction(action) {
    if (!actionsExercise) {
        return;
    }

    const exercise = actionsExercise;

    actionsDialog.close();
    action(exercise);
}

// ==================== CONTROLE DO MODAL DE EDIÇÃO ====================

function setEditSubmitting(submitting) {
    isUpdatingExercise = submitting;

    editExerciseTitle.disabled = submitting;
    editExerciseDifficulty.disabled = submitting;
    editExerciseDescription.disabled = submitting;
    editExerciseCancel.disabled = submitting;
    editExerciseClose.disabled = submitting;
    editExerciseSubmit.disabled = submitting;

    editExerciseSubmit.textContent = submitting
        ? "Salvando..."
        : "Salvar alterações";
}

function openEditExerciseDialog(exercise) {
    selectedExercise = exercise;

    editExerciseTitle.value = exercise.title;
    editExerciseDifficulty.value = exercise.difficulty;
    editExerciseDescription.value = exercise.description;

    editExerciseDialog.showModal();
    document.body.classList.add("modal-open");

    editExerciseTitle.focus();
}

function closeEditExerciseDialog() {
    if (isUpdatingExercise) {
        return;
    }

    editExerciseDialog.close();
}

function resetEditExerciseDialog() {
    document.body.classList.remove("modal-open");

    editExerciseForm.reset();
    selectedExercise = null;
}

// ==================== EDIÇÃO DO EXERCÍCIO ====================

async function handleEditExercise(event) {
    event.preventDefault();

    if (!selectedExercise || isUpdatingExercise) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const data = {
        title: editExerciseTitle.value.trim(),
        description: editExerciseDescription.value.trim(),
        difficulty: editExerciseDifficulty.value
    };

    clearMessage();
    setEditSubmitting(true);

    try {
        const updatedExercise = await updateExercise(
            selectedExercise.id,
            data,
            token
        );

        allExercises = allExercises.map(exercise =>
            exercise.id === updatedExercise.id
                ? updatedExercise
                : exercise
        );

        applyFilters();
        editExerciseDialog.close();

        showMessage(
            `Exercício ${updatedExercise.title} atualizado com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para editar exercícios."
            : error.message;

        showMessage(message, "error");
    } finally {
        setEditSubmitting(false);
    }
}

// ==================== CONTROLE DAS ALTERNATIVAS ====================

function updateOptionsCorrectOptionField() {
    const selectedValue = optionsCorrectOption.value;

    for (const option of optionsCorrectOption.options) {
        if (option.value === "") {
            continue;
        }

        const input = optionsInputs[Number(option.value)];

        option.disabled =
            !input || !input.value.trim();
    }

    if (selectedValue === "") {
        return;
    }

    const selectedOption = Array
        .from(optionsCorrectOption.options)
        .find(option => option.value === selectedValue);

    if (!selectedOption || selectedOption.disabled) {
        optionsCorrectOption.value = "";
    }
}

function setOptionsSubmitting(submitting) {
    isUpdatingOptions = submitting;

    for (const input of optionsInputs) {
        input.disabled = submitting;
    }

    optionsCorrectOption.disabled = submitting;
    optionsCancel.disabled = submitting;
    optionsDialogClose.disabled = submitting;
    optionsSubmit.disabled = submitting;

    optionsSubmit.textContent = submitting
        ? "Salvando..."
        : "Salvar alternativas";
}

function openOptionsDialog(exercise) {
    optionsExercise = exercise;

    for (let index = 0; index < optionsInputs.length; index++) {
        optionsInputs[index].value =
            exercise.options[index] ?? "";
    }

    optionsCorrectOption.value =
        String(exercise.correctOptionIndex);

    updateOptionsCorrectOptionField();

    optionsDialog.showModal();
    document.body.classList.add("modal-open");

    optionsInputs[0].focus();
}

function closeOptionsDialog() {
    if (isUpdatingOptions) {
        return;
    }

    optionsDialog.close();
}

function resetOptionsDialog() {
    document.body.classList.remove("modal-open");

    optionsForm.reset();
    optionsExercise = null;

    updateOptionsCorrectOptionField();
}

// ==================== EDIÇÃO DAS ALTERNATIVAS ====================

async function handleOptionsChange(event) {
    event.preventDefault();

    if (!optionsExercise || isUpdatingOptions) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const optionValues = Array.from(
        optionsInputs,
        input => input.value.trim()
    );

    if (!optionValues[0] || !optionValues[1]) {
        showMessage(
            "Informe pelo menos duas alternativas.",
            "error"
        );
        return;
    }

    if (!optionValues[2] && optionValues[3]) {
        showMessage(
            "Preencha a alternativa 3 antes da alternativa 4.",
            "error"
        );
        return;
    }

    const options = optionValues.filter(Boolean);

    const normalizedOptions = options.map(normalizeText);

    if (
        new Set(normalizedOptions).size !==
        normalizedOptions.length
    ) {
        showMessage(
            "As alternativas não podem ser iguais.",
            "error"
        );
        return;
    }

    if (optionsCorrectOption.value === "") {
        showMessage(
            "Selecione a resposta correta.",
            "error"
        );
        return;
    }

    const correctOptionIndex = Number(
        optionsCorrectOption.value
    );

    if (
        !Number.isInteger(correctOptionIndex) ||
        correctOptionIndex < 0 ||
        correctOptionIndex >= options.length
    ) {
        showMessage(
            "Selecione uma resposta correta válida.",
            "error"
        );
        return;
    }

    const data = {
        options,
        correctOptionIndex
    };

    clearMessage();
    setOptionsSubmitting(true);

    try {
        const updatedExercise = await updateExerciseOptions(
            optionsExercise.id,
            data,
            token
        );

        allExercises = allExercises.map(exercise =>
            exercise.id === updatedExercise.id
                ? updatedExercise
                : exercise
        );

        applyFilters();
        optionsDialog.close();

        showMessage(
            `Alternativas de ${updatedExercise.title} atualizadas com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        let message = error.message;

        if (error.status === 403) {
            message =
                "Sua conta não tem permissão para editar alternativas.";
        }

        if (error.status === 409) {
            message =
                "As alternativas não podem ser alteradas porque " +
                "já existem progressos registrados.";
        }

        showMessage(message, "error");
    } finally {
        setOptionsSubmitting(false);
    }
}

// ==================== CONTROLE DO MODAL DE STATUS ====================

function setStatusSubmitting(submitting) {
    isChangingStatus = submitting;

    statusCancel.disabled = submitting;
    statusConfirm.disabled = submitting;

    if (submitting) {
        statusConfirm.textContent = "Processando...";
        return;
    }

    statusConfirm.textContent =
        statusDialog.dataset.action === "activate"
            ? "Ativar"
            : "Desativar";
}

function openStatusDialog(exercise) {
    statusExercise = exercise;

    const action = exercise.active
        ? "deactivate"
        : "activate";

    const actionLabel = exercise.active
        ? "Desativar"
        : "Ativar";

    statusDialog.dataset.action = action;

    statusDialogIcon.textContent = exercise.active
        ? "!"
        : "✓";

    statusDialogTitle.textContent =
        `${actionLabel} exercício?`;

    statusDialogDescription.textContent = exercise.active
        ? `${exercise.title} ficará indisponível.`
        : `${exercise.title} ficará disponível novamente.`;

    statusConfirm.textContent = actionLabel;

    statusDialog.showModal();
    document.body.classList.add("modal-open");

    statusCancel.focus();
}

function closeStatusDialog() {
    if (isChangingStatus) {
        return;
    }

    statusDialog.close();
}

function resetStatusDialog() {
    document.body.classList.remove("modal-open");

    statusExercise = null;
    statusDialogIcon.textContent = "";
    statusDialogTitle.textContent = "";
    statusDialogDescription.textContent = "";
    statusConfirm.textContent = "Confirmar";

    delete statusDialog.dataset.action;
}

// ==================== CONTROLE DO MODAL DE EXCLUSÃO ====================

function setDeleteSubmitting(submitting) {
    isDeletingExercise = submitting;

    deleteCancel.disabled = submitting;
    deleteConfirm.disabled = submitting;

    deleteConfirm.textContent = submitting
        ? "Excluindo..."
        : "Excluir";
}

function openDeleteDialog(exercise) {
    deletingExercise = exercise;

    deleteDialogDescription.textContent =
        `Tem certeza que deseja excluir ${exercise.title}? ` +
        "Esta ação não poderá ser desfeita.";

    deleteDialog.showModal();
    document.body.classList.add("modal-open");

    deleteCancel.focus();
}

function closeDeleteDialog() {
    if (isDeletingExercise) {
        return;
    }

    deleteDialog.close();
}

function resetDeleteDialog() {
    document.body.classList.remove("modal-open");

    deletingExercise = null;

    deleteDialogDescription.textContent =
        "Esta ação não poderá ser desfeita.";

    setDeleteSubmitting(false);
}

// ==================== EXCLUSÃO DO EXERCÍCIO ====================

async function handleDeleteExercise(event) {
    event.preventDefault();

    if (!deletingExercise || isDeletingExercise) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const exerciseId = deletingExercise.id;
    const exerciseTitle = deletingExercise.title;
    const courseId = deletingExercise.courseId;
    const deletedSequence = deletingExercise.sequence;

    clearMessage();
    setDeleteSubmitting(true);

    try {
        await deleteExercise(exerciseId, token);

        allExercises = allExercises
            .filter(exercise => exercise.id !== exerciseId)
            .map(exercise => {
                const needsSequenceUpdate =
                    exercise.courseId === courseId &&
                    exercise.sequence > deletedSequence;

                return needsSequenceUpdate
                    ? {
                        ...exercise,
                        sequence: exercise.sequence - 1
                    }
                    : exercise;
            });

        applyFilters();
        deleteDialog.close();

        showMessage(
            `Exercício ${exerciseTitle} excluído com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        let message = error.message;

        if (error.status === 403) {
            message =
                "Sua conta não tem permissão para excluir exercícios.";
        }

        if (error.status === 409) {
            message =
                "O exercício não pode ser excluído porque possui " +
                "progressos registrados.";
        }

        showMessage(message, "error");
    } finally {
        setDeleteSubmitting(false);
    }
}

// ==================== ALTERAÇÃO DE STATUS ====================

async function handleStatusChange(event) {
    event.preventDefault();

    if (!statusExercise || isChangingStatus) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const exerciseId = statusExercise.id;
    const exerciseTitle = statusExercise.title;
    const activating = !statusExercise.active;

    clearMessage();
    setStatusSubmitting(true);

    try {
        if (activating) {
            await activateExercise(exerciseId, token);
        } else {
            await deactivateExercise(exerciseId, token);
        }

        allExercises = allExercises.map(exercise =>
            exercise.id === exerciseId
                ? { ...exercise, active: activating }
                : exercise
        );

        applyFilters();
        statusDialog.close();

        showMessage(
            `Exercício ${exerciseTitle} foi ` +
            `${activating ? "ativado" : "desativado"} com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para alterar o status."
            : error.message;

        showMessage(message, "error");
    } finally {
        setStatusSubmitting(false);
    }
}

// ==================== INICIALIZAÇÃO ====================

async function initializePage() {
    const session = getSession();

    if (!session || session.user.role !== "ADMIN") {
        window.location.replace(LOGIN_URL.href);
        return;
    }

    // Montagem do painel
    renderAdminPanel(session.user);

    // Eventos da listagem
    exercisesReload.addEventListener(
        "click",
        loadExercises
    );

    exercisesSearch.addEventListener(
        "input",
        applyFilters
    );

    exercisesCourse.addEventListener(
        "change",
        applyFilters
    );

    exercisesDifficulty.addEventListener(
        "change",
        applyFilters
    );

    exercisesStatus.addEventListener(
        "change",
        applyFilters
    );

    exercisesClear.addEventListener(
        "click",
        clearFilters
    );

    exercisesCreate.addEventListener(
        "click",
        openExerciseDialog
    );

    // Eventos do modal de ações
    actionsDialogClose.addEventListener(
        "click",
        closeActionsDialog
    );

    actionsDialog.addEventListener(
        "close",
        resetActionsDialog
    );

    actionEdit.addEventListener("click", () => {
        runSelectedExerciseAction(
            openEditExerciseDialog
        );
    });

    actionOptions.addEventListener("click", () => {
        runSelectedExerciseAction(
            openOptionsDialog
        );
    });

    actionStatus.addEventListener("click", () => {
        runSelectedExerciseAction(
            openStatusDialog
        );
    });

    actionDelete.addEventListener("click", () => {
        runSelectedExerciseAction(
            openDeleteDialog
        );
    });

    // Eventos do modal de cadastro
    exerciseForm.addEventListener(
        "submit",
        handleCreateExercise
    );

    exerciseDialogClose.addEventListener(
        "click",
        closeExerciseDialog
    );

    exerciseCancel.addEventListener(
        "click",
        closeExerciseDialog
    );

    exerciseDialog.addEventListener(
        "close",
        resetExerciseDialog
    );

    exerciseDialog.addEventListener("cancel", event => {
        if (isSubmitting) {
            event.preventDefault();
        }
    });

    for (const input of exerciseOptionInputs) {
        input.addEventListener(
            "input",
            updateCorrectOptionField
        );
    }

    // Eventos do modal de edição
    editExerciseForm.addEventListener(
        "submit",
        handleEditExercise
    );

    editExerciseClose.addEventListener(
        "click",
        closeEditExerciseDialog
    );

    editExerciseCancel.addEventListener(
        "click",
        closeEditExerciseDialog
    );

    editExerciseDialog.addEventListener(
        "close",
        resetEditExerciseDialog
    );

    editExerciseDialog.addEventListener(
        "cancel",
        event => {
            if (isUpdatingExercise) {
                event.preventDefault();
            }
        }
    );

    // Eventos do modal de alternativas
    optionsForm.addEventListener(
        "submit",
        handleOptionsChange
    );

    optionsDialogClose.addEventListener(
        "click",
        closeOptionsDialog
    );

    optionsCancel.addEventListener(
        "click",
        closeOptionsDialog
    );

    optionsDialog.addEventListener(
        "close",
        resetOptionsDialog
    );

    optionsDialog.addEventListener(
        "cancel",
        event => {
            if (isUpdatingOptions) {
                event.preventDefault();
            }
        }
    );

    for (const input of optionsInputs) {
        input.addEventListener(
            "input",
            updateOptionsCorrectOptionField
        );
    }

    // Eventos do modal de status
    statusForm.addEventListener(
        "submit",
        handleStatusChange
    );

    statusCancel.addEventListener(
        "click",
        closeStatusDialog
    );

    statusDialog.addEventListener(
        "close",
        resetStatusDialog
    );

    statusDialog.addEventListener("cancel", event => {
        if (isChangingStatus) {
            event.preventDefault();
        }
    });

    // Eventos do modal de exclusão
    deleteForm.addEventListener(
        "submit",
        handleDeleteExercise
    );

    deleteCancel.addEventListener(
        "click",
        closeDeleteDialog
    );

    deleteDialog.addEventListener(
        "close",
        resetDeleteDialog
    );

    deleteDialog.addEventListener("cancel", event => {
        if (isDeletingExercise) {
            event.preventDefault();
        }
    });

    // Consulta inicial
    await loadExercises();
}

initializePage();