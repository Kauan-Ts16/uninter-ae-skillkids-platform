// ==================== IMPORTAÇÕES ====================

import { getSession, getToken, signOut } from "../../auth.js";
import { renderAdminPanel } from "../../components/panel.js";
import { clearMessage, showMessage } from "../../components/toast.js";
import { getCourses, createCourse, updateCourse, activateCourse, deactivateCourse, deleteCourse } from "../../services/course-service.js";

// ==================== CONFIGURAÇÕES ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== ELEMENTOS DA LISTAGEM ====================

const coursesCount = document.querySelector("#courses-count");
const coursesCreate = document.querySelector("#courses-create");
const coursesReload = document.querySelector("#courses-reload");
const coursesSearch = document.querySelector("#courses-search");
const coursesStatus = document.querySelector("#courses-status");
const coursesClear = document.querySelector("#courses-clear");
const coursesFeedback = document.querySelector(
    "#courses-feedback"
);
const coursesTableWrapper = document.querySelector(
    "#courses-table-wrapper"
);
const coursesList = document.querySelector("#courses-list");

// ==================== ELEMENTOS DO MODAL DE CADASTRO ====================

const courseDialog = document.querySelector("#course-dialog");
const courseDialogClose = document.querySelector(
    "#course-dialog-close"
);
const courseForm = document.querySelector("#course-form");
const courseTitle = document.querySelector("#course-title");
const courseDescription = document.querySelector(
    "#course-description"
);
const courseCancel = document.querySelector("#course-cancel");
const courseSubmit = document.querySelector("#course-submit");

// ==================== ELEMENTOS DO MODAL DE EDIÇÃO ====================

const editCourseDialog = document.querySelector(
    "#edit-course-dialog"
);
const editCourseClose = document.querySelector(
    "#edit-course-close"
);
const editCourseForm = document.querySelector(
    "#edit-course-form"
);
const editCourseTitle = document.querySelector(
    "#edit-course-title"
);
const editCourseDescription = document.querySelector(
    "#edit-course-description"
);
const editCourseCancel = document.querySelector(
    "#edit-course-cancel"
);
const editCourseSubmit = document.querySelector(
    "#edit-course-submit"
);

// ==================== ELEMENTOS DO MODAL DE STATUS ====================

const statusDialog = document.querySelector(
    "#course-status-dialog"
);
const statusDialogIcon = document.querySelector(
    "#course-status-icon"
);
const statusDialogTitle = document.querySelector(
    "#course-status-title"
);
const statusDialogDescription = document.querySelector(
    "#course-status-description"
);
const statusForm = document.querySelector(
    "#course-status-form"
);
const statusCancel = document.querySelector(
    "#course-status-cancel"
);
const statusConfirm = document.querySelector(
    "#course-status-confirm"
);

// ==================== ELEMENTOS DO MODAL DE EXCLUSÃO ====================

const deleteDialog = document.querySelector(
    "#course-delete-dialog"
);
const deleteDialogDescription = document.querySelector(
    "#course-delete-description"
);
const deleteForm = document.querySelector(
    "#course-delete-form"
);
const deleteCancel = document.querySelector(
    "#course-delete-cancel"
);
const deleteConfirm = document.querySelector(
    "#course-delete-confirm"
);

// ==================== ELEMENTOS DO MODAL DE AÇÕES ====================

const actionsDialog = document.querySelector(
    "#course-actions-dialog"
);
const actionsDialogDescription = document.querySelector(
    "#course-actions-description"
);
const actionsDialogClose = document.querySelector(
    "#course-actions-close"
);
const actionEdit = document.querySelector(
    "#course-action-edit"
);
const actionStatus = document.querySelector(
    "#course-action-status"
);
const actionStatusTitle = document.querySelector(
    "#course-action-status-title"
);
const actionStatusDescription = document.querySelector(
    "#course-action-status-description"
);
const actionDelete = document.querySelector(
    "#course-action-delete"
);

// ==================== ESTADO DA PÁGINA ====================

let allCourses = [];
let isLoading = false;
let isSubmitting = false;
let hasLoadedCourses = false;

let actionsCourse = null;

let selectedCourse = null;
let isUpdatingCourse = false;

let statusCourse = null;
let isChangingStatus = false;

let deletingCourse = null;
let isDeletingCourse = false;

// ==================== CONTROLE DA LISTAGEM ====================

function setLoading(loading) {
    isLoading = loading;

    coursesReload.disabled = loading;
    coursesReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";

    const controls = [
        coursesSearch,
        coursesStatus,
        coursesClear
    ];

    for (const control of controls) {
        control.disabled = loading || !hasLoadedCourses;
    }

    coursesCreate.disabled =
        loading || !hasLoadedCourses;
}

// ==================== CONTROLE DO FORMULÁRIO DE CADASTRO ====================

function setSubmitting(submitting) {
    isSubmitting = submitting;

    courseTitle.disabled = submitting;
    courseDescription.disabled = submitting;
    courseCancel.disabled = submitting;
    courseDialogClose.disabled = submitting;
    courseSubmit.disabled = submitting;

    courseSubmit.textContent = submitting
        ? "Criando..."
        : "Criar curso";
}

// ==================== NORMALIZAÇÃO DA BUSCA ====================

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// ==================== FILTROS ====================

function applyFilters() {
    if (!hasLoadedCourses) {
        return;
    }

    const search = normalizeText(coursesSearch.value);
    const status = coursesStatus.value;

    const filteredCourses = allCourses.filter(course => {
        const matchesSearch =
            normalizeText(course.title).includes(search) ||
            normalizeText(course.description).includes(search);

        const matchesStatus =
            !status || String(course.active) === status;

        return matchesSearch && matchesStatus;
    });

    renderCourses(filteredCourses);
}

function clearFilters() {
    coursesSearch.value = "";
    coursesStatus.value = "";

    applyFilters();
    coursesSearch.focus();
}

// ==================== CÉLULAS DA TABELA ====================

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";

    return cell;
}

function createDescriptionCell(description) {
    const cell = document.createElement("td");
    const content = document.createElement("span");

    content.className = "course-description";
    content.textContent = description ?? "—";

    if (description) {
        content.title = description;
    }

    cell.append(content);

    return cell;
}

// ==================== AÇÃO DA TABELA ====================

function createCourseActionsCell(course) {
    const cell = document.createElement("td");
    const actions = document.createElement("div");
    const actionsButton = document.createElement("button");

    actions.className = "course-row-actions";

    actionsButton.type = "button";
    actionsButton.className = "course-action-button";
    actionsButton.textContent = "Ações";
    actionsButton.addEventListener("click", () => {
        openActionsDialog(course);
    });

    actionsButton.setAttribute(
        "aria-label",
        `Ações de ${course.title}`
    );

    actions.append(actionsButton);
    cell.append(actions);

    return cell;
}

// ==================== EXIBIÇÃO DOS CURSOS ====================

function renderCourses(courses) {
    coursesList.replaceChildren();

    for (const course of courses) {
        const row = document.createElement("tr");

        row.append(
            createCell(course.title),
            createDescriptionCell(course.description)
        );

        const status = document.createElement("span");
        status.className = "course-status";
        status.dataset.active = String(course.active);
        status.textContent = course.active
            ? "Ativo"
            : "Inativo";

        const statusCell = createCell("");
        statusCell.append(status);

        row.append(
            statusCell,
            createCourseActionsCell(course)
        );

        coursesList.append(row);
    }

    const label = allCourses.length === 1
        ? "curso"
        : "cursos";

    coursesCount.textContent =
        `Exibindo ${courses.length} de ` +
        `${allCourses.length} ${label}`;

    coursesTableWrapper.hidden = courses.length === 0;
    coursesFeedback.hidden = courses.length > 0;

    coursesFeedback.textContent = allCourses.length === 0
        ? "Nenhum curso cadastrado."
        : "Nenhum curso encontrado com os filtros selecionados.";
}

// ==================== CARREGAMENTO DOS CURSOS ====================

async function loadCourses() {
    if (isLoading) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    allCourses = [];
    hasLoadedCourses = false;

    clearMessage();
    setLoading(true);

    coursesList.replaceChildren();
    coursesCount.textContent = "";
    coursesTableWrapper.hidden = true;
    coursesFeedback.hidden = false;
    coursesFeedback.textContent = "Carregando cursos...";

    try {
        allCourses = await getCourses(token);
        hasLoadedCourses = true;

        applyFilters();
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para consultar cursos."
            : error.message;

        coursesFeedback.textContent =
            "Não foi possível carregar a lista. " +
            "Clique em Atualizar para tentar novamente.";

        showMessage(message, "error");
    } finally {
        setLoading(false);
    }
}

// ==================== CONTROLE DO MODAL DE CADASTRO ====================

function openCourseDialog() {
    courseForm.reset();

    courseDialog.showModal();
    document.body.classList.add("modal-open");

    courseTitle.focus();
}

function closeCourseDialog() {
    if (isSubmitting) {
        return;
    }

    courseDialog.close();
}

function resetCourseDialog() {
    document.body.classList.remove("modal-open");
    courseForm.reset();
}

// ==================== CADASTRO DE CURSO ====================

async function handleCreateCourse(event) {
    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const data = {
        title: courseTitle.value.trim(),
        description: courseDescription.value.trim()
    };

    clearMessage();
    setSubmitting(true);

    try {
        const createdCourse = await createCourse(
            data,
            token
        );

        allCourses.push(createdCourse);
        applyFilters();

        courseDialog.close();

        showMessage(
            `Curso ${createdCourse.title} criado com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para criar cursos."
            : error.message;

        showMessage(message, "error");
    } finally {
        setSubmitting(false);
    }
}

// ==================== CONTROLE DO MODAL DE AÇÕES ====================

function openActionsDialog(course) {
    actionsCourse = course;

    actionsDialogDescription.textContent =
        `Escolha uma ação para ${course.title}.`;

    // Disponibilidade das ações
    actionEdit.disabled = !course.active;
    actionStatus.disabled = false;
    actionDelete.disabled = false;

    const activating = !course.active;

    actionStatus.dataset.status = activating
        ? "activate"
        : "deactivate";

    actionStatusTitle.textContent = activating
        ? "Ativar curso"
        : "Desativar curso";

    actionStatusDescription.textContent = activating
        ? "Disponibilizar o curso novamente"
        : "Indisponibilizar o curso";

    actionsDialog.showModal();
    document.body.classList.add("modal-open");

    actionsDialogClose.focus();
}

function closeActionsDialog() {
    actionsDialog.close();
}

function resetActionsDialog() {
    document.body.classList.remove("modal-open");

    actionsCourse = null;

    actionEdit.disabled = false;
    actionStatus.disabled = false;
    actionDelete.disabled = false;

    delete actionStatus.dataset.status;
}

function runSelectedCourseAction(action) {
    if (!actionsCourse) {
        return;
    }

    const course = actionsCourse;

    actionsDialog.close();
    action(course);
}

// ==================== CONTROLE DO MODAL DE EDIÇÃO ====================

function setEditSubmitting(submitting) {
    isUpdatingCourse = submitting;

    editCourseTitle.disabled = submitting;
    editCourseDescription.disabled = submitting;
    editCourseCancel.disabled = submitting;
    editCourseClose.disabled = submitting;
    editCourseSubmit.disabled = submitting;

    editCourseSubmit.textContent = submitting
        ? "Salvando..."
        : "Salvar alterações";
}

function openEditCourseDialog(course) {
    selectedCourse = course;

    editCourseTitle.value = course.title;
    editCourseDescription.value = course.description;

    editCourseDialog.showModal();
    document.body.classList.add("modal-open");

    editCourseTitle.focus();
}

function closeEditCourseDialog() {
    if (isUpdatingCourse) {
        return;
    }

    editCourseDialog.close();
}

function resetEditCourseDialog() {
    document.body.classList.remove("modal-open");

    editCourseForm.reset();
    selectedCourse = null;
}

// ==================== EDIÇÃO DE CURSO ====================

async function handleEditCourse(event) {
    event.preventDefault();

    if (!selectedCourse || isUpdatingCourse) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const data = {
        title: editCourseTitle.value.trim(),
        description: editCourseDescription.value.trim()
    };

    clearMessage();
    setEditSubmitting(true);

    try {
        const updatedCourse = await updateCourse(
            selectedCourse.id,
            data,
            token
        );

        allCourses = allCourses.map(course =>
            course.id === updatedCourse.id
                ? updatedCourse
                : course
        );

        applyFilters();
        editCourseDialog.close();

        showMessage(
            `Curso ${updatedCourse.title} atualizado com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para editar cursos."
            : error.message;

        showMessage(message, "error");
    } finally {
        setEditSubmitting(false);
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

function openStatusDialog(course) {
    statusCourse = course;

    const action = course.active
        ? "deactivate"
        : "activate";

    const actionLabel = course.active
        ? "Desativar"
        : "Ativar";

    statusDialog.dataset.action = action;
    statusDialogIcon.textContent = course.active ? "!" : "✓";
    statusDialogTitle.textContent = `${actionLabel} curso?`;

    statusDialogDescription.textContent = course.active
        ? `${course.title} ficará indisponível.`
        : `${course.title} ficará disponível novamente.`;

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

    statusCourse = null;
    statusDialogIcon.textContent = "";
    statusDialogTitle.textContent = "";
    statusDialogDescription.textContent = "";
    statusConfirm.textContent = "Confirmar";

    delete statusDialog.dataset.action;
}

// ==================== ALTERAÇÃO DE STATUS ====================

async function handleStatusChange(event) {
    event.preventDefault();

    if (!statusCourse || isChangingStatus) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const courseId = statusCourse.id;
    const courseTitle = statusCourse.title;
    const activating = !statusCourse.active;

    clearMessage();
    setStatusSubmitting(true);

    try {
        if (activating) {
            await activateCourse(courseId, token);
        } else {
            await deactivateCourse(courseId, token);
        }

        allCourses = allCourses.map(course =>
            course.id === courseId
                ? { ...course, active: activating }
                : course
        );

        applyFilters();
        statusDialog.close();

        showMessage(
            `Curso ${courseTitle} foi ` +
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

// ==================== CONTROLE DO MODAL DE EXCLUSÃO ====================

function setDeleteSubmitting(submitting) {
    isDeletingCourse = submitting;

    deleteCancel.disabled = submitting;
    deleteConfirm.disabled = submitting;

    deleteConfirm.textContent = submitting
        ? "Excluindo..."
        : "Excluir";
}

function openDeleteDialog(course) {
    deletingCourse = course;

    deleteDialogDescription.textContent =
        `Tem certeza que deseja excluir ${course.title}? ` +
        "Esta ação não poderá ser desfeita.";

    deleteDialog.showModal();
    document.body.classList.add("modal-open");

    deleteCancel.focus();
}

function closeDeleteDialog() {
    if (isDeletingCourse) {
        return;
    }

    deleteDialog.close();
}

function resetDeleteDialog() {
    document.body.classList.remove("modal-open");

    deletingCourse = null;

    deleteDialogDescription.textContent =
        "Esta ação não poderá ser desfeita.";

    setDeleteSubmitting(false);
}

// ==================== EXCLUSÃO DE CURSO ====================

async function handleDeleteCourse(event) {
    event.preventDefault();

    if (!deletingCourse || isDeletingCourse) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const courseId = deletingCourse.id;
    const courseTitle = deletingCourse.title;

    clearMessage();
    setDeleteSubmitting(true);

    try {
        await deleteCourse(courseId, token);

        allCourses = allCourses.filter(course =>
            course.id !== courseId
        );

        applyFilters();
        deleteDialog.close();

        showMessage(
            `Curso ${courseTitle} excluído com sucesso!`,
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
                "Sua conta não tem permissão para excluir cursos.";
        }

        if (error.status === 409) {
            message =
                "O curso não pode ser excluído porque possui " +
                "exercícios vinculados.";
        }

        showMessage(message, "error");
    } finally {
        setDeleteSubmitting(false);
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
    coursesReload.addEventListener("click", loadCourses);
    coursesSearch.addEventListener("input", applyFilters);
    coursesStatus.addEventListener("change", applyFilters);
    coursesClear.addEventListener("click", clearFilters);
    coursesCreate.addEventListener("click", openCourseDialog);

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
        runSelectedCourseAction(openEditCourseDialog);
    });

    actionStatus.addEventListener("click", () => {
        runSelectedCourseAction(openStatusDialog);
    });

    actionDelete.addEventListener("click", () => {
        runSelectedCourseAction(openDeleteDialog);
    });

    // Eventos do modal de cadastro
    courseForm.addEventListener(
        "submit",
        handleCreateCourse
    );

    courseDialogClose.addEventListener(
        "click",
        closeCourseDialog
    );

    courseCancel.addEventListener(
        "click",
        closeCourseDialog
    );

    courseDialog.addEventListener(
        "close",
        resetCourseDialog
    );

    courseDialog.addEventListener("cancel", event => {
        if (isSubmitting) {
            event.preventDefault();
        }
    });

    // Eventos do modal de edição
    editCourseForm.addEventListener(
        "submit",
        handleEditCourse
    );

    editCourseClose.addEventListener(
        "click",
        closeEditCourseDialog
    );

    editCourseCancel.addEventListener(
        "click",
        closeEditCourseDialog
    );

    editCourseDialog.addEventListener(
        "close",
        resetEditCourseDialog
    );

    editCourseDialog.addEventListener("cancel", event => {
        if (isUpdatingCourse) {
            event.preventDefault();
        }
    });

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
        handleDeleteCourse
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
        if (isDeletingCourse) {
            event.preventDefault();
        }
    });

    // Consulta inicial
    await loadCourses();
}

initializePage();