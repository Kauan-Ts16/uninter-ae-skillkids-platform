// ==================== IMPORTAÇÕES ====================

import { getSession, getToken, signOut } from "../../auth.js";
import { renderAdminPanel } from "../../components/panel.js";
import { clearMessage, showMessage } from "../../components/toast.js";
import { getClassrooms, createClassroom, updateClassroom, updateClassroomTeacher, removeClassroomTeacher, activateClassroom, deactivateClassroom, deleteClassroom } from "../../services/classroom-service.js";
import { getUsers } from "../../services/user-service.js";

// ==================== CONFIGURAÇÕES ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== ELEMENTOS DA LISTAGEM ====================

const classroomsCount = document.querySelector("#classrooms-count");
const classroomsCreate = document.querySelector("#classrooms-create");
const classroomsReload = document.querySelector("#classrooms-reload");
const classroomsSearch = document.querySelector("#classrooms-search");
const classroomsTeacher = document.querySelector("#classrooms-teacher");
const classroomsStatus = document.querySelector("#classrooms-status");
const classroomsClear = document.querySelector("#classrooms-clear");
const classroomsFeedback = document.querySelector(
    "#classrooms-feedback"
);
const classroomsTableWrapper = document.querySelector(
    "#classrooms-table-wrapper"
);
const classroomsList = document.querySelector("#classrooms-list");

// ==================== ELEMENTOS DO MODAL DE CADASTRO ====================

const classroomDialog = document.querySelector("#classroom-dialog");
const classroomDialogClose = document.querySelector(
    "#classroom-dialog-close"
);
const classroomForm = document.querySelector("#classroom-form");
const classroomName = document.querySelector("#classroom-name");
const classroomTeacher = document.querySelector("#classroom-teacher");
const classroomTeacherHelp = document.querySelector(
    "#classroom-teacher-help"
);
const classroomCancel = document.querySelector("#classroom-cancel");
const classroomSubmit = document.querySelector("#classroom-submit");

// ==================== ELEMENTOS DO MODAL DE EDIÇÃO ====================

const editClassroomDialog = document.querySelector(
    "#edit-classroom-dialog"
);
const editClassroomClose = document.querySelector(
    "#edit-classroom-close"
);
const editClassroomForm = document.querySelector(
    "#edit-classroom-form"
);
const editClassroomName = document.querySelector(
    "#edit-classroom-name"
);
const editClassroomCancel = document.querySelector(
    "#edit-classroom-cancel"
);
const editClassroomSubmit = document.querySelector(
    "#edit-classroom-submit"
);

// ==================== ELEMENTOS DO MODAL DE PROFESSOR ====================

const teacherDialog = document.querySelector("#teacher-dialog");
const teacherDialogDescription = document.querySelector(
    "#teacher-dialog-description"
);
const teacherDialogClose = document.querySelector(
    "#teacher-dialog-close"
);
const teacherForm = document.querySelector("#teacher-form");
const manageTeacher = document.querySelector("#manage-teacher");
const manageTeacherHelp = document.querySelector(
    "#manage-teacher-help"
);
const teacherCancel = document.querySelector("#teacher-cancel");
const teacherSubmit = document.querySelector("#teacher-submit");

// ==================== ELEMENTOS DO MODAL DE STATUS ====================

const statusDialog = document.querySelector(
    "#classroom-status-dialog"
);
const statusDialogIcon = document.querySelector(
    "#classroom-status-icon"
);
const statusDialogTitle = document.querySelector(
    "#classroom-status-title"
);
const statusDialogDescription = document.querySelector(
    "#classroom-status-description"
);
const statusForm = document.querySelector(
    "#classroom-status-form"
);
const statusCancel = document.querySelector(
    "#classroom-status-cancel"
);
const statusConfirm = document.querySelector(
    "#classroom-status-confirm"
);

// ==================== ELEMENTOS DO MODAL DE EXCLUSÃO ====================

const deleteDialog = document.querySelector(
    "#classroom-delete-dialog"
);
const deleteDialogDescription = document.querySelector(
    "#classroom-delete-description"
);
const deleteForm = document.querySelector(
    "#classroom-delete-form"
);
const deleteCancel = document.querySelector(
    "#classroom-delete-cancel"
);
const deleteConfirm = document.querySelector(
    "#classroom-delete-confirm"
);

// ==================== ELEMENTOS DO MODAL DE AÇÕES ====================

const actionsDialog = document.querySelector(
    "#classroom-actions-dialog"
);
const actionsDialogDescription = document.querySelector(
    "#classroom-actions-description"
);
const actionsDialogClose = document.querySelector(
    "#classroom-actions-close"
);
const actionEdit = document.querySelector(
    "#classroom-action-edit"
);
const actionTeacher = document.querySelector(
    "#classroom-action-teacher"
);
const actionStatus = document.querySelector(
    "#classroom-action-status"
);
const actionStatusTitle = document.querySelector(
    "#classroom-action-status-title"
);
const actionStatusDescription = document.querySelector(
    "#classroom-action-status-description"
);
const actionDelete = document.querySelector(
    "#classroom-action-delete"
);

// ==================== ESTADO DA PÁGINA ====================

let allClassrooms = [];
let activeTeachers = [];

let isLoading = false;
let isLoadingTeachers = false;
let isSubmitting = false;

let hasLoadedClassrooms = false;
let hasLoadedTeachers = false;
let teacherLoadFailed = false;

let actionsClassroom = null;

let selectedClassroom = null;
let isUpdatingClassroom = false;

let teacherClassroom = null;
let isUpdatingTeacher = false;

let statusClassroom = null;
let isChangingStatus = false;

let deletingClassroom = null;
let isDeletingClassroom = false;

// ==================== CONTROLE DA LISTAGEM ====================

function setLoading(loading) {
    isLoading = loading;

    classroomsReload.disabled = loading;
    classroomsReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";

    const controls = [
        classroomsSearch,
        classroomsTeacher,
        classroomsStatus,
        classroomsClear
    ];

    for (const control of controls) {
        control.disabled = loading || !hasLoadedClassrooms;
    }

    classroomsCreate.disabled =
        loading || !hasLoadedClassrooms;
}

// ==================== CONTROLE DO FORMULÁRIO ====================

function setSubmitting(submitting) {
    isSubmitting = submitting;

    classroomName.disabled = submitting;
    classroomCancel.disabled = submitting;
    classroomDialogClose.disabled = submitting;
    classroomSubmit.disabled = submitting;

    classroomSubmit.textContent = submitting
        ? "Criando..."
        : "Criar turma";

    updateTeacherField();
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
    if (!hasLoadedClassrooms) {
        return;
    }

    const search = normalizeText(classroomsSearch.value);
    const teacher = classroomsTeacher.value;
    const status = classroomsStatus.value;

    const filteredClassrooms = allClassrooms.filter(classroom => {
        const matchesSearch =
            normalizeText(classroom.name).includes(search) ||
            normalizeText(classroom.joinCode).includes(search);

        const hasTeacher = Boolean(classroom.teacherId);

        const matchesTeacher =
            !teacher ||
            (teacher === "assigned" && hasTeacher) ||
            (teacher === "unassigned" && !hasTeacher);

        const matchesStatus =
            !status || String(classroom.active) === status;

        return (
            matchesSearch &&
            matchesTeacher &&
            matchesStatus
        );
    });

    renderClassrooms(filteredClassrooms);
}

function clearFilters() {
    classroomsSearch.value = "";
    classroomsTeacher.value = "";
    classroomsStatus.value = "";

    applyFilters();
    classroomsSearch.focus();
}

// ==================== CÉLULAS DA TABELA ====================

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";

    return cell;
}

// ==================== AÇÃO DA TABELA ====================

function createClassroomActionsCell(classroom) {
    const cell = document.createElement("td");
    const actions = document.createElement("div");
    const actionsButton = document.createElement("button");

    actions.className = "classroom-row-actions";

    actionsButton.type = "button";
    actionsButton.className = "classroom-action-button";
    actionsButton.textContent = "Ações";

    actionsButton.setAttribute(
        "aria-label",
        `Abrir ações de ${classroom.name}`
    );

    actionsButton.addEventListener("click", () => {
        openActionsDialog(classroom);
    });

    actions.append(actionsButton);
    cell.append(actions);

    return cell;
}

// ==================== EXIBIÇÃO DAS TURMAS ====================

function renderClassrooms(classrooms) {
    classroomsList.replaceChildren();

    for (const classroom of classrooms) {
        const row = document.createElement("tr");

        row.append(
            createCell(classroom.name),
            createCell(classroom.joinCode),
            createCell(classroom.teacherName ?? "Sem professor")
        );

        const status = document.createElement("span");
        status.className = "classroom-status";
        status.dataset.active = String(classroom.active);
        status.textContent = classroom.active
            ? "Ativa"
            : "Inativa";

        const statusCell = createCell("");
        statusCell.append(status);

        row.append(
            statusCell,
            createClassroomActionsCell(classroom)
        );

        classroomsList.append(row);
    }

    const label = allClassrooms.length === 1
        ? "turma"
        : "turmas";

    classroomsCount.textContent =
        `Exibindo ${classrooms.length} de ` +
        `${allClassrooms.length} ${label}`;

    classroomsTableWrapper.hidden = classrooms.length === 0;
    classroomsFeedback.hidden = classrooms.length > 0;

    classroomsFeedback.textContent = allClassrooms.length === 0
        ? "Nenhuma turma cadastrada."
        : "Nenhuma turma encontrada com os filtros selecionados.";
}

// ==================== CARREGAMENTO DAS TURMAS ====================

async function loadClassrooms() {
    if (isLoading) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    allClassrooms = [];
    hasLoadedClassrooms = false;

    clearMessage();
    setLoading(true);

    classroomsList.replaceChildren();
    classroomsCount.textContent = "";
    classroomsTableWrapper.hidden = true;
    classroomsFeedback.hidden = false;
    classroomsFeedback.textContent = "Carregando turmas...";

    try {
        allClassrooms = await getClassrooms(token);
        hasLoadedClassrooms = true;

        applyFilters();
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para consultar turmas."
            : error.message;

        classroomsFeedback.textContent =
            "Não foi possível carregar a lista. " +
            "Clique em Atualizar para tentar novamente.";

        showMessage(message, "error");
    } finally {
        setLoading(false);
    }
}

// ==================== PROFESSORES DOS FORMULÁRIOS ====================

function fillTeacherSelect(select) {
    select.replaceChildren();

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Sem professor";

    select.append(emptyOption);

    for (const teacher of activeTeachers) {
        const option = document.createElement("option");
        option.value = teacher.id;
        option.textContent = teacher.name;

        select.append(option);
    }
}

function renderTeacherOptions() {
    fillTeacherSelect(classroomTeacher);
    fillTeacherSelect(manageTeacher);
}

function updateTeacherField() {
    classroomTeacher.disabled =
        isLoadingTeachers || isSubmitting;

    if (isLoadingTeachers) {
        classroomTeacherHelp.textContent =
            "Carregando professores...";

        return;
    }

    if (teacherLoadFailed) {
        classroomTeacherHelp.textContent =
            "Não foi possível carregar os professores. " +
            "A turma pode ser criada sem professor.";

        return;
    }

    classroomTeacherHelp.textContent =
        activeTeachers.length === 0
            ? "Nenhum professor ativo disponível."
            : "O professor é opcional.";
}

function updateManageTeacherField() {
    const disabled =
        isLoadingTeachers ||
        isUpdatingTeacher ||
        teacherLoadFailed;

    manageTeacher.disabled = disabled;
    teacherSubmit.disabled = disabled;

    if (isLoadingTeachers) {
        manageTeacherHelp.textContent =
            "Carregando professores...";

        return;
    }

    if (teacherLoadFailed) {
        manageTeacherHelp.textContent =
            "Não foi possível carregar os professores.";

        return;
    }

    manageTeacherHelp.textContent =
        "Selecione “Sem professor” para remover o vínculo.";
}

async function loadTeachers() {
    if (hasLoadedTeachers || isLoadingTeachers) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    isLoadingTeachers = true;
    teacherLoadFailed = false;

    updateTeacherField();
    updateManageTeacherField();

    try {
        const users = await getUsers(token);

        activeTeachers = users.filter(user =>
            user.role === "TEACHER" && user.active
        );

        hasLoadedTeachers = true;
        renderTeacherOptions();
    } catch (error) {
        activeTeachers = [];
        teacherLoadFailed = true;

        renderTeacherOptions();

        if (error.status === 401) {
            signOut();
            return;
        }

        showMessage(error.message, "error");
    } finally {
        isLoadingTeachers = false;

        updateTeacherField();
        updateManageTeacherField();
    }
}

// ==================== CONTROLE DO MODAL DE CADASTRO ====================

async function openClassroomDialog() {
    classroomForm.reset();
    updateTeacherField();

    classroomDialog.showModal();
    document.body.classList.add("modal-open");

    classroomName.focus();

    await loadTeachers();
}

function closeClassroomDialog() {
    if (isSubmitting) {
        return;
    }

    classroomDialog.close();
}

function resetClassroomDialog() {
    document.body.classList.remove("modal-open");

    classroomForm.reset();
    updateTeacherField();
}

// ==================== CADASTRO DE TURMA ====================

async function handleCreateClassroom(event) {
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
        name: classroomName.value.trim(),
        teacherId: classroomTeacher.value || null
    };

    clearMessage();
    setSubmitting(true);

    try {
        const createdClassroom = await createClassroom(
            data,
            token
        );

        allClassrooms.push(createdClassroom);
        applyFilters();

        classroomDialog.close();

        showMessage(
            `Turma ${createdClassroom.name} criada com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para criar turmas."
            : error.message;

        showMessage(message, "error");
    } finally {
        setSubmitting(false);
    }
}

// ==================== CONTROLE DO MODAL DE AÇÕES ====================

function openActionsDialog(classroom) {
    actionsClassroom = classroom;

    actionsDialogDescription.textContent =
        `Escolha uma ação para ${classroom.name}.`;

    // Disponibilidade das ações
    actionEdit.disabled = !classroom.active;
    actionTeacher.disabled = !classroom.active;
    actionStatus.disabled = false;
    actionDelete.disabled = false;

    const activating = !classroom.active;

    actionStatus.dataset.status = activating
        ? "activate"
        : "deactivate";

    actionStatusTitle.textContent = activating
        ? "Ativar turma"
        : "Desativar turma";

    actionStatusDescription.textContent = activating
        ? "Disponibilizar a turma novamente"
        : "Indisponibilizar a turma";

    actionsDialog.showModal();
    document.body.classList.add("modal-open");

    actionsDialogClose.focus();
}

function closeActionsDialog() {
    actionsDialog.close();
}

function resetActionsDialog() {
    document.body.classList.remove("modal-open");

    actionsClassroom = null;

    actionEdit.disabled = false;
    actionTeacher.disabled = false;
    actionStatus.disabled = false;
    actionDelete.disabled = false;

    delete actionStatus.dataset.status;
}

function runSelectedClassroomAction(action) {
    if (!actionsClassroom) {
        return;
    }

    const classroom = actionsClassroom;

    actionsDialog.close();
    action(classroom);
}

// ==================== CONTROLE DO MODAL DE EDIÇÃO ====================

function setEditSubmitting(submitting) {
    isUpdatingClassroom = submitting;

    editClassroomName.disabled = submitting;
    editClassroomCancel.disabled = submitting;
    editClassroomClose.disabled = submitting;
    editClassroomSubmit.disabled = submitting;

    editClassroomSubmit.textContent = submitting
        ? "Salvando..."
        : "Salvar alterações";
}

function openEditClassroomDialog(classroom) {
    selectedClassroom = classroom;
    editClassroomName.value = classroom.name;

    editClassroomDialog.showModal();
    document.body.classList.add("modal-open");

    editClassroomName.focus();
}

function closeEditClassroomDialog() {
    if (isUpdatingClassroom) {
        return;
    }

    editClassroomDialog.close();
}

function resetEditClassroomDialog() {
    document.body.classList.remove("modal-open");

    editClassroomForm.reset();
    selectedClassroom = null;
}

// ==================== EDIÇÃO DE TURMA ====================

async function handleEditClassroom(event) {
    event.preventDefault();

    if (!selectedClassroom || isUpdatingClassroom) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const data = {
        name: editClassroomName.value.trim()
    };

    clearMessage();
    setEditSubmitting(true);

    try {
        const updatedClassroom = await updateClassroom(
            selectedClassroom.id,
            data,
            token
        );

        allClassrooms = allClassrooms.map(classroom =>
            classroom.id === updatedClassroom.id
                ? updatedClassroom
                : classroom
        );

        applyFilters();
        editClassroomDialog.close();

        showMessage(
            `Turma ${updatedClassroom.name} atualizada com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para editar turmas."
            : error.message;

        showMessage(message, "error");
    } finally {
        setEditSubmitting(false);
    }
}

// ==================== CONTROLE DO MODAL DE PROFESSOR ====================

function setTeacherSubmitting(submitting) {
    isUpdatingTeacher = submitting;

    teacherCancel.disabled = submitting;
    teacherDialogClose.disabled = submitting;

    teacherSubmit.textContent = submitting
        ? "Salvando..."
        : "Salvar vínculo";

    updateManageTeacherField();
}

async function openTeacherDialog(classroom) {
    teacherClassroom = classroom;

    teacherDialogDescription.textContent =
        `Gerencie o professor de ${classroom.name}.`;

    teacherDialog.showModal();
    document.body.classList.add("modal-open");

    await loadTeachers();

    if (
        !teacherDialog.open ||
        teacherClassroom?.id !== classroom.id
    ) {
        return;
    }

    manageTeacher.value = classroom.teacherId ?? "";
    manageTeacher.focus();
}

function closeTeacherDialog() {
    if (isUpdatingTeacher) {
        return;
    }

    teacherDialog.close();
}

function resetTeacherDialog() {
    document.body.classList.remove("modal-open");

    teacherForm.reset();
    teacherClassroom = null;

    teacherDialogDescription.textContent =
        "Selecione um professor para a turma.";

    updateManageTeacherField();
}

// ==================== ATUALIZAÇÃO DO PROFESSOR ====================

async function handleTeacherChange(event) {
    event.preventDefault();

    if (!teacherClassroom || isUpdatingTeacher) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const classroomId = teacherClassroom.id;
    const classroomName = teacherClassroom.name;
    const teacherId = manageTeacher.value;

    clearMessage();
    setTeacherSubmitting(true);

    try {
        let updatedClassroom;

        if (teacherId) {
            updatedClassroom = await updateClassroomTeacher(
                classroomId,
                teacherId,
                token
            );
        } else {
            await removeClassroomTeacher(
                classroomId,
                token
            );

            updatedClassroom = {
                ...teacherClassroom,
                teacherId: null,
                teacherName: null
            };
        }

        allClassrooms = allClassrooms.map(classroom =>
            classroom.id === updatedClassroom.id
                ? updatedClassroom
                : classroom
        );

        applyFilters();
        teacherDialog.close();

        showMessage(
            `Professor da turma ${classroomName} atualizado com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para alterar o professor."
            : error.message;

        showMessage(message, "error");
    } finally {
        setTeacherSubmitting(false);
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

function openStatusDialog(classroom) {
    statusClassroom = classroom;

    const action = classroom.active
        ? "deactivate"
        : "activate";

    const actionLabel = classroom.active
        ? "Desativar"
        : "Ativar";

    statusDialog.dataset.action = action;
    statusDialogIcon.textContent = classroom.active ? "!" : "✓";
    statusDialogTitle.textContent = `${actionLabel} turma?`;

    statusDialogDescription.textContent = classroom.active
        ? `${classroom.name} ficará indisponível.`
        : `${classroom.name} ficará disponível novamente.`;

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

    statusClassroom = null;
    statusDialogIcon.textContent = "";
    statusDialogTitle.textContent = "";
    statusDialogDescription.textContent = "";
    statusConfirm.textContent = "Confirmar";

    delete statusDialog.dataset.action;
}

// ==================== ALTERAÇÃO DE STATUS ====================

async function handleStatusChange(event) {
    event.preventDefault();

    if (!statusClassroom || isChangingStatus) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const classroomId = statusClassroom.id;
    const classroomName = statusClassroom.name;
    const activating = !statusClassroom.active;

    clearMessage();
    setStatusSubmitting(true);

    try {
        if (activating) {
            await activateClassroom(classroomId, token);
        } else {
            await deactivateClassroom(classroomId, token);
        }

        allClassrooms = allClassrooms.map(classroom =>
            classroom.id === classroomId
                ? { ...classroom, active: activating }
                : classroom
        );

        applyFilters();
        statusDialog.close();

        showMessage(
            `${classroomName} foi ` +
            `${activating ? "ativada" : "desativada"} com sucesso!`,
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
    isDeletingClassroom = submitting;

    deleteCancel.disabled = submitting;
    deleteConfirm.disabled = submitting;

    deleteConfirm.textContent = submitting
        ? "Excluindo..."
        : "Excluir";
}

function openDeleteDialog(classroom) {
    deletingClassroom = classroom;

    deleteDialogDescription.textContent =
        `Tem certeza que deseja excluir ${classroom.name}? ` +
        "Esta ação não poderá ser desfeita.";

    deleteDialog.showModal();
    document.body.classList.add("modal-open");

    deleteCancel.focus();
}

function closeDeleteDialog() {
    if (isDeletingClassroom) {
        return;
    }

    deleteDialog.close();
}

function resetDeleteDialog() {
    document.body.classList.remove("modal-open");

    deletingClassroom = null;

    deleteDialogDescription.textContent =
        "Esta ação não poderá ser desfeita.";

    setDeleteSubmitting(false);
}

// ==================== EXCLUSÃO DE TURMA ====================

async function handleDeleteClassroom(event) {
    event.preventDefault();

    if (!deletingClassroom || isDeletingClassroom) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const classroomId = deletingClassroom.id;
    const classroomName = deletingClassroom.name;

    clearMessage();
    setDeleteSubmitting(true);

    try {
        await deleteClassroom(classroomId, token);

        allClassrooms = allClassrooms.filter(classroom =>
            classroom.id !== classroomId
        );

        applyFilters();
        deleteDialog.close();

        showMessage(
            `Turma ${classroomName} excluída com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para excluir turmas."
            : error.message;

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
    classroomsReload.addEventListener("click", loadClassrooms);
    classroomsSearch.addEventListener("input", applyFilters);
    classroomsTeacher.addEventListener("change", applyFilters);
    classroomsStatus.addEventListener("change", applyFilters);
    classroomsClear.addEventListener("click", clearFilters);
    classroomsCreate.addEventListener("click", openClassroomDialog);

    // Eventos do modal de cadastro
    classroomForm.addEventListener(
        "submit",
        handleCreateClassroom
    );

    classroomDialogClose.addEventListener(
        "click",
        closeClassroomDialog
    );

    classroomCancel.addEventListener(
        "click",
        closeClassroomDialog
    );

    classroomDialog.addEventListener(
        "close",
        resetClassroomDialog
    );

    classroomDialog.addEventListener("cancel", event => {
        if (isSubmitting) {
            event.preventDefault();
        }
    });

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
        runSelectedClassroomAction(openEditClassroomDialog);
    });

    actionTeacher.addEventListener("click", () => {
        runSelectedClassroomAction(openTeacherDialog);
    });

    actionStatus.addEventListener("click", () => {
        runSelectedClassroomAction(openStatusDialog);
    });

    actionDelete.addEventListener("click", () => {
        runSelectedClassroomAction(openDeleteDialog);
    });

    // Eventos do modal de edição
    editClassroomForm.addEventListener(
        "submit",
        handleEditClassroom
    );

    editClassroomClose.addEventListener(
        "click",
        closeEditClassroomDialog
    );

    editClassroomCancel.addEventListener(
        "click",
        closeEditClassroomDialog
    );

    editClassroomDialog.addEventListener(
        "close",
        resetEditClassroomDialog
    );

    editClassroomDialog.addEventListener("cancel", event => {
        if (isUpdatingClassroom) {
            event.preventDefault();
        }
    });

    // Eventos do modal de professor
    teacherForm.addEventListener(
        "submit",
        handleTeacherChange
    );

    teacherDialogClose.addEventListener(
        "click",
        closeTeacherDialog
    );

    teacherCancel.addEventListener(
        "click",
        closeTeacherDialog
    );

    teacherDialog.addEventListener(
        "close",
        resetTeacherDialog
    );

    teacherDialog.addEventListener("cancel", event => {
        if (isUpdatingTeacher) {
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
        handleDeleteClassroom
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
        if (isDeletingClassroom) {
            event.preventDefault();
        }
    });

    // Consulta inicial
    await loadClassrooms();
}

initializePage();