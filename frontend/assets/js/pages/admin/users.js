// ==================== IMPORTAÇÕES ====================

import { getSession, getToken, signOut } from "../../auth.js";
import { renderAdminPanel } from "../../components/panel.js";
import { showMessage, clearMessage } from "../../components/toast.js";
import { getUsers, createUser, updateUser, changeUserPassword, updateUserClassroom, removeUserClassroom, activateUser, deactivateUser, deleteUser } from "../../services/user-service.js";
import { getActiveClassrooms } from "../../services/classroom-service.js";

// ==================== CONFIGURAÇÕES ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

const ROLE_LABELS = {
    ADMIN: "Administrador",
    TEACHER: "Professor",
    STUDENT: "Aluno"
};

// ==================== ELEMENTOS DA LISTAGEM ====================

const usersCount = document.querySelector("#users-count");
const usersCreate = document.querySelector("#users-create");
const usersReload = document.querySelector("#users-reload");
const usersSearch = document.querySelector("#users-search");
const usersRole = document.querySelector("#users-role");
const usersStatus = document.querySelector("#users-status");
const usersClear = document.querySelector("#users-clear");
const usersFeedback = document.querySelector("#users-feedback");
const usersTableWrapper = document.querySelector("#users-table-wrapper");
const usersList = document.querySelector("#users-list");

// ==================== ELEMENTOS DO MODAL ====================

const userDialog = document.querySelector("#user-dialog");
const userDialogClose = document.querySelector("#user-dialog-close");
const userForm = document.querySelector("#user-form");
const userName = document.querySelector("#user-name");
const userEmail = document.querySelector("#user-email");
const userPassword = document.querySelector("#user-password");
const userRole = document.querySelector("#user-role");
const userClassroom = document.querySelector("#user-classroom");
const userClassroomHelp = document.querySelector("#user-classroom-help");
const userCancel = document.querySelector("#user-cancel");
const userSubmit = document.querySelector("#user-submit");

// ==================== ELEMENTOS DO MODAL DE EDIÇÃO ====================

const editUserDialog = document.querySelector("#edit-user-dialog");
const editUserClose = document.querySelector("#edit-user-close");
const editUserForm = document.querySelector("#edit-user-form");
const editUserName = document.querySelector("#edit-user-name");
const editUserEmail = document.querySelector("#edit-user-email");
const editUserCancel = document.querySelector("#edit-user-cancel");
const editUserSubmit = document.querySelector("#edit-user-submit");

// ==================== ELEMENTOS DO MODAL DE SENHA ====================

const passwordDialog = document.querySelector("#password-dialog");
const passwordDialogDescription = document.querySelector(
    "#password-dialog-description"
);
const passwordDialogClose = document.querySelector(
    "#password-dialog-close"
);
const passwordForm = document.querySelector("#password-form");
const newPassword = document.querySelector("#new-password");
const passwordCancel = document.querySelector("#password-cancel");
const passwordSubmit = document.querySelector("#password-submit");

// ==================== ELEMENTOS DO MODAL DE TURMA ====================

const classroomDialog = document.querySelector("#classroom-dialog");
const classroomDialogDescription = document.querySelector(
    "#classroom-dialog-description"
);
const classroomDialogClose = document.querySelector(
    "#classroom-dialog-close"
);
const classroomForm = document.querySelector("#classroom-form");
const manageClassroom = document.querySelector("#manage-classroom");
const classroomCancel = document.querySelector("#classroom-cancel");
const classroomSubmit = document.querySelector("#classroom-submit");

// ==================== ELEMENTOS DO MODAL DE STATUS ====================

const statusDialog = document.querySelector("#status-dialog");
const statusDialogIcon = document.querySelector(
    "#status-dialog-icon"
);
const statusDialogTitle = document.querySelector(
    "#status-dialog-title"
);
const statusDialogDescription = document.querySelector(
    "#status-dialog-description"
);
// Modal de exclusão
const deleteDialog = document.querySelector("#delete-dialog");
const deleteForm = document.querySelector("#delete-form");
const deleteDialogDescription = document.querySelector(
    "#delete-dialog-description"
);
const deleteCancel = document.querySelector("#delete-cancel");
const deleteConfirm = document.querySelector("#delete-confirm");
const statusForm = document.querySelector("#status-form");
const statusCancel = document.querySelector("#status-cancel");
const statusConfirm = document.querySelector("#status-confirm");

// ==================== ELEMENTOS DO MODAL DE AÇÕES ====================

const actionsDialog = document.querySelector("#actions-dialog");
const actionsDialogDescription = document.querySelector(
    "#actions-dialog-description"
);
const actionsDialogClose = document.querySelector(
    "#actions-dialog-close"
);
const actionEdit = document.querySelector("#action-edit");
const actionPassword = document.querySelector("#action-password");
const actionClassroom = document.querySelector("#action-classroom");
const actionStatus = document.querySelector("#action-status");
const actionStatusTitle = document.querySelector(
    "#action-status-title"
);
const actionStatusDescription = document.querySelector(
    "#action-status-description"
);
const actionDelete = document.querySelector("#action-delete");

// ==================== ESTADO DA PÁGINA ====================

let allUsers = [];
let activeClassrooms = [];

let isLoading = false;
let isLoadingClassrooms = false;
let isSubmitting = false;

let hasLoadedUsers = false;
let hasLoadedClassrooms = false;
let classroomLoadFailed = false;

let selectedUser = null;
let isUpdatingUser = false;

let passwordUser = null;
let isChangingPassword = false;

let classroomUser = null;
let isUpdatingClassroom = false;

let currentUserId = null;
let statusUser = null;
let isChangingStatus = false;

let actionsUser = null;

let deletingUser = null;
let isDeletingUser = false;

// ==================== CONTROLE DA LISTAGEM ====================

function setLoading(loading) {
    isLoading = loading;

    usersReload.disabled = loading;
    usersReload.textContent = loading ? "Carregando..." : "Atualizar";

    usersCreate.disabled = loading || !hasLoadedUsers;

    const controls = [
        usersSearch,
        usersRole,
        usersStatus,
        usersClear
    ];

    for (const control of controls) {
        control.disabled = loading || !hasLoadedUsers;
    }
}

// ==================== CONTROLE DO FORMULÁRIO ====================

function setSubmitting(submitting) {
    isSubmitting = submitting;

    const controls = [
        userName,
        userEmail,
        userPassword,
        userRole,
        userCancel
    ];

    for (const control of controls) {
        control.disabled = submitting;
    }

    userDialogClose.disabled = submitting;
    userSubmit.disabled = submitting;

    userSubmit.textContent = submitting
        ? "Criando..."
        : "Criar usuário";

    updateClassroomField();
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
    if (!hasLoadedUsers) {
        return;
    }

    const search = normalizeText(usersSearch.value);
    const role = usersRole.value;
    const status = usersStatus.value;

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch =
            normalizeText(user.name).includes(search) ||
            normalizeText(user.email).includes(search);

        const matchesRole = !role || user.role === role;

        const matchesStatus =
            !status || String(user.active) === status;

        return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers(filteredUsers);
}

function clearFilters() {
    usersSearch.value = "";
    usersRole.value = "";
    usersStatus.value = "";

    applyFilters();
    usersSearch.focus();
}

// ==================== CÉLULAS DA TABELA ====================

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";

    return cell;
}

// ==================== AÇÃO DA TABELA ====================

function createUserActionsCell(user) {
    const cell = document.createElement("td");
    const actions = document.createElement("div");
    const actionsButton = document.createElement("button");

    actions.className = "user-row-actions";

    actionsButton.type = "button";
    actionsButton.className = "user-action-button";
    actionsButton.textContent = "Ações";

    actionsButton.setAttribute(
        "aria-label",
        `Abrir ações de ${user.name}`
    );

    actionsButton.addEventListener("click", () => {
        openActionsDialog(user);
    });

    actions.append(actionsButton);
    cell.append(actions);

    return cell;
}

// ==================== EXIBIÇÃO DOS USUÁRIOS ====================

function renderUsers(users) {
    usersList.replaceChildren();

    for (const user of users) {
        const row = document.createElement("tr");

        const role = ROLE_LABELS[user.role] ?? user.role;

        const classroom = user.role === "STUDENT"
            ? user.classroomName ?? "Sem turma"
            : "Não se aplica";

        row.append(
            createCell(user.name),
            createCell(user.email),
            createCell(role),
            createCell(classroom)
        );

        const status = document.createElement("span");
        status.className = "user-status";
        status.dataset.active = String(user.active);
        status.textContent = user.active ? "Ativo" : "Inativo";

        const statusCell = createCell("");
        statusCell.append(status);
        row.append(statusCell, createUserActionsCell(user));

        usersList.append(row);
    }

    const label = allUsers.length === 1 ? "usuário" : "usuários";

    usersCount.textContent =
        `Exibindo ${users.length} de ${allUsers.length} ${label}`;

    usersTableWrapper.hidden = users.length === 0;
    usersFeedback.hidden = users.length > 0;

    usersFeedback.textContent = allUsers.length === 0
        ? "Nenhum usuário cadastrado."
        : "Nenhum usuário encontrado com os filtros selecionados.";
}

// ==================== CARREGAMENTO DOS USUÁRIOS ====================

async function loadUsers() {
    if (isLoading) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    allUsers = [];
    hasLoadedUsers = false;

    clearMessage();
    setLoading(true);

    usersList.replaceChildren();
    usersCount.textContent = "";
    usersTableWrapper.hidden = true;
    usersFeedback.hidden = false;
    usersFeedback.textContent = "Carregando usuários...";

    try {
        allUsers = await getUsers(token);
        hasLoadedUsers = true;

        applyFilters();
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para consultar usuários."
            : error.message;

        usersFeedback.textContent =
            "Não foi possível carregar a lista. Clique em Atualizar para tentar novamente.";

        showMessage(message, "error");
    } finally {
        setLoading(false);
    }
}

// ==================== TURMAS DO FORMULÁRIO ====================

function fillClassroomSelect(select) {
    select.replaceChildren();

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Sem turma";

    select.append(emptyOption);

    for (const classroom of activeClassrooms) {
        const option = document.createElement("option");
        option.value = classroom.id;
        option.textContent = classroom.name;

        select.append(option);
    }
}

function renderClassroomOptions() {
    fillClassroomSelect(userClassroom);
    fillClassroomSelect(manageClassroom);
}

function updateClassroomField() {
    const isStudent = userRole.value === "STUDENT";

    userClassroom.disabled =
        !isStudent ||
        isLoadingClassrooms ||
        isSubmitting;

    if (!isStudent) {
        userClassroomHelp.textContent =
            "Disponível somente para alunos.";

        return;
    }

    if (isLoadingClassrooms) {
        userClassroomHelp.textContent = "Carregando turmas...";
        return;
    }

    if (classroomLoadFailed) {
        userClassroomHelp.textContent =
            "Não foi possível carregar as turmas. O aluno pode ser criado sem turma.";

        return;
    }

    userClassroomHelp.textContent = activeClassrooms.length === 0
        ? "Nenhuma turma ativa disponível."
        : "A turma é opcional.";
}

async function loadClassrooms() {
    if (hasLoadedClassrooms || isLoadingClassrooms) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    isLoadingClassrooms = true;
    classroomLoadFailed = false;
    updateClassroomField();
    updateManageClassroomField();

    try {
        activeClassrooms = await getActiveClassrooms(token);
        hasLoadedClassrooms = true;

        renderClassroomOptions();
    } catch (error) {
        activeClassrooms = [];
        classroomLoadFailed = true;

        renderClassroomOptions();

        if (error.status === 401) {
            signOut();
            return;
        }

        showMessage(error.message, "error");
    } finally {
        isLoadingClassrooms = false;
        updateClassroomField();
        updateManageClassroomField();
    }
}

// ==================== CONTROLE DO MODAL ====================

async function openUserDialog() {
    userForm.reset();
    updateClassroomField();

    userDialog.showModal();
    document.body.classList.add("modal-open");

    userName.focus();

    await loadClassrooms();
}

function closeUserDialog() {
    if (isSubmitting) {
        return;
    }

    userDialog.close();
}

function resetUserDialog() {
    document.body.classList.remove("modal-open");

    userForm.reset();
    updateClassroomField();
}

// ==================== CADASTRO DE USUÁRIO ====================

async function handleCreateUser(event) {
    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    const data = {
        name: userName.value.trim(),
        email: userEmail.value.trim(),
        password: userPassword.value,
        role: userRole.value,
        classroomId:
            userRole.value === "STUDENT" && userClassroom.value
                ? userClassroom.value
                : null
    };

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    clearMessage();
    setSubmitting(true);

    try {
        const createdUser = await createUser(data, token);

        allUsers.push(createdUser);
        applyFilters();

        userDialog.close();

        showMessage(
            `Usuário ${createdUser.name} criado com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para criar usuários."
            : error.message;

        showMessage(message, "error");
    } finally {
        setSubmitting(false);
    }
}

// ==================== CONTROLE DO MODAL DE EDIÇÃO ====================

function setEditUserSubmitting(submitting) {
    isUpdatingUser = submitting;

    editUserName.disabled = submitting;
    editUserEmail.disabled = submitting;
    editUserCancel.disabled = submitting;
    editUserClose.disabled = submitting;
    editUserSubmit.disabled = submitting;

    editUserSubmit.textContent = submitting
        ? "Salvando..."
        : "Salvar alterações";
}

function openEditUserDialog(user) {
    selectedUser = user;

    editUserName.value = user.name;
    editUserEmail.value = user.email;

    editUserDialog.showModal();
    document.body.classList.add("modal-open");

    editUserName.focus();
}

function closeEditUserDialog() {
    if (isUpdatingUser) {
        return;
    }

    editUserDialog.close();
}

function resetEditUserDialog() {
    document.body.classList.remove("modal-open");

    editUserForm.reset();
    selectedUser = null;
}

// ==================== EDIÇÃO DE USUÁRIO ====================

async function handleEditUser(event) {
    event.preventDefault();

    if (!selectedUser || isUpdatingUser) {
        return;
    }

    const data = {
        name: editUserName.value.trim(),
        email: editUserEmail.value.trim()
    };

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    clearMessage();
    setEditUserSubmitting(true);

    try {
        const updatedUser = await updateUser(
            selectedUser.id,
            data,
            token
        );

        allUsers = allUsers.map(user =>
            user.id === updatedUser.id ? updatedUser : user
        );

        applyFilters();
        editUserDialog.close();

        showMessage(
            `Usuário ${updatedUser.name} atualizado com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para editar usuários."
            : error.message;

        showMessage(message, "error");
    } finally {
        setEditUserSubmitting(false);
    }
}

// ==================== CONTROLE DO MODAL DE SENHA ====================

function setPasswordSubmitting(submitting) {
    isChangingPassword = submitting;

    newPassword.disabled = submitting;
    passwordCancel.disabled = submitting;
    passwordDialogClose.disabled = submitting;
    passwordSubmit.disabled = submitting;

    passwordSubmit.textContent = submitting
        ? "Alterando..."
        : "Alterar senha";
}

function openPasswordDialog(user) {
    passwordUser = user;

    passwordDialogDescription.textContent =
        `Informe a nova senha de ${user.name}.`;

    passwordDialog.showModal();
    document.body.classList.add("modal-open");

    newPassword.focus();
}

function closePasswordDialog() {
    if (isChangingPassword) {
        return;
    }

    passwordDialog.close();
}

function resetPasswordDialog() {
    document.body.classList.remove("modal-open");

    passwordForm.reset();
    passwordUser = null;

    passwordDialogDescription.textContent =
        "Informe a nova senha do usuário.";
}

// ==================== ALTERAÇÃO DE SENHA ====================

async function handlePasswordChange(event) {
    event.preventDefault();

    if (!passwordUser || isChangingPassword) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const userName = passwordUser.name;
    const password = newPassword.value;

    clearMessage();
    setPasswordSubmitting(true);

    try {
        await changeUserPassword(
            passwordUser.id,
            password,
            token
        );

        passwordDialog.close();

        showMessage(
            `Senha de ${userName} alterada com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para alterar senhas."
            : error.message;

        showMessage(message, "error");
    } finally {
        setPasswordSubmitting(false);
    }
}

// ==================== CONTROLE DO MODAL DE TURMA ====================

function updateManageClassroomField() {
    manageClassroom.disabled =
        isLoadingClassrooms || isUpdatingClassroom;

    classroomSubmit.disabled =
        isLoadingClassrooms || isUpdatingClassroom;
}

function setClassroomSubmitting(submitting) {
    isUpdatingClassroom = submitting;

    classroomCancel.disabled = submitting;
    classroomDialogClose.disabled = submitting;

    classroomSubmit.textContent = submitting
        ? "Salvando..."
        : "Salvar vínculo";

    updateManageClassroomField();
}

function addCurrentClassroomOption(user) {
    if (!user.classroomId) {
        return;
    }

    const hasCurrentClassroom = Array.from(
        manageClassroom.options
    ).some(option => option.value === user.classroomId);

    if (hasCurrentClassroom) {
        return;
    }

    const option = document.createElement("option");
    option.value = user.classroomId;
    option.textContent =
        `${user.classroomName ?? "Turma atual"} (inativa)`;
    option.disabled = true;

    manageClassroom.append(option);
}

async function openClassroomDialog(user) {
    classroomUser = user;

    classroomDialogDescription.textContent =
        `Gerencie a turma de ${user.name}.`;

    classroomDialog.showModal();
    document.body.classList.add("modal-open");

    await loadClassrooms();

    if (
        !classroomDialog.open ||
        classroomUser?.id !== user.id
    ) {
        return;
    }

    addCurrentClassroomOption(user);
    manageClassroom.value = user.classroomId ?? "";
    manageClassroom.focus();
}

function closeClassroomDialog() {
    if (isUpdatingClassroom) {
        return;
    }

    classroomDialog.close();
}

function resetClassroomDialog() {
    document.body.classList.remove("modal-open");

    classroomForm.reset();
    classroomUser = null;

    classroomDialogDescription.textContent =
        "Selecione uma turma para o aluno.";
}

// ==================== ATUALIZAÇÃO DA TURMA ====================

async function handleClassroomChange(event) {
    event.preventDefault();

    if (!classroomUser || isUpdatingClassroom) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const userName = classroomUser.name;
    const classroomId = manageClassroom.value;

    clearMessage();
    setClassroomSubmitting(true);

    try {
        let updatedUser;

        if (classroomId) {
            updatedUser = await updateUserClassroom(
                classroomUser.id,
                classroomId,
                token
            );
        } else {
            await removeUserClassroom(
                classroomUser.id,
                token
            );

            updatedUser = {
                ...classroomUser,
                classroomId: null,
                classroomName: null
            };
        }

        allUsers = allUsers.map(user =>
            user.id === updatedUser.id ? updatedUser : user
        );

        applyFilters();
        classroomDialog.close();

        showMessage(
            `Turma de ${userName} atualizada com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para alterar a turma."
            : error.message;

        showMessage(message, "error");
    } finally {
        setClassroomSubmitting(false);
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

function openStatusDialog(user) {
    statusUser = user;

    const action = user.active ? "deactivate" : "activate";
    const actionLabel = user.active ? "Desativar" : "Ativar";

    statusDialog.dataset.action = action;
    statusDialogIcon.textContent = user.active ? "!" : "✓";
    statusDialogTitle.textContent = `${actionLabel} usuário?`;

    statusDialogDescription.textContent = user.active
        ? `${user.name} perderá o acesso à plataforma.`
        : `${user.name} poderá acessar a plataforma novamente.`;

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

    statusUser = null;
    statusDialogIcon.textContent = "";
    statusDialogTitle.textContent = "";
    statusDialogDescription.textContent = "";
    statusConfirm.textContent = "Confirmar";

    delete statusDialog.dataset.action;
}

// ==================== CONTROLE DO MODAL DE AÇÕES ====================

function openActionsDialog(user) {
    actionsUser = user;

    actionsDialogDescription.textContent =
        `Escolha uma ação para ${user.name}.`;

    // Ações de usuários inativos
    actionEdit.disabled = !user.active;
    actionPassword.disabled = !user.active;

    // Turma somente para aluno
    actionClassroom.hidden = user.role !== "STUDENT";
    actionClassroom.disabled = !user.active;

    // Ativar ou desativar
    const activating = !user.active;
    const isCurrentUser = user.id === currentUserId;

    actionDelete.disabled = isCurrentUser;

    actionStatus.dataset.status = activating
        ? "activate"
        : "deactivate";

    actionStatusTitle.textContent = activating
        ? "Ativar usuário"
        : "Desativar usuário";

    actionStatusDescription.textContent = activating
        ? "Permitir o acesso à plataforma"
        : "Bloquear o acesso à plataforma";

    actionStatus.disabled = isCurrentUser && user.active;

    if (actionStatus.disabled) {
        actionStatusDescription.textContent =
            "Você não pode desativar sua própria conta";
    }

    actionsDialog.showModal();
    document.body.classList.add("modal-open");

    actionsDialogClose.focus();
}

function closeActionsDialog() {
    actionsDialog.close();
}

function resetActionsDialog() {
    document.body.classList.remove("modal-open");

    actionsUser = null;

    actionEdit.disabled = false;
    actionPassword.disabled = false;
    actionClassroom.disabled = false;
    actionClassroom.hidden = true;
    actionStatus.disabled = false;
    actionDelete.disabled = false;

    delete actionStatus.dataset.status;
}

function runSelectedUserAction(action) {
    if (!actionsUser) {
        return;
    }

    const user = actionsUser;

    actionsDialog.close();
    action(user);
}

// ==================== ALTERAÇÃO DE STATUS ====================

async function handleStatusChange(event) {
    event.preventDefault();

    if (!statusUser || isChangingStatus) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const userId = statusUser.id;
    const userName = statusUser.name;
    const activating = !statusUser.active;

    // Impede a desativação da própria conta
    if (!activating && userId === currentUserId) {
        statusDialog.close();

        showMessage(
            "Você não pode desativar sua própria conta.",
            "error"
        );

        return;
    }

    clearMessage();
    setStatusSubmitting(true);

    try {
        if (activating) {
            await activateUser(userId, token);
        } else {
            await deactivateUser(userId, token);
        }

        allUsers = allUsers.map(user =>
            user.id === userId
                ? { ...user, active: activating }
                : user
        );

        applyFilters();
        statusDialog.close();

        showMessage(
            `${userName} foi ${activating ? "ativado" : "desativado"} com sucesso!`,
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
    isDeletingUser = submitting;

    deleteCancel.disabled = submitting;
    deleteConfirm.disabled = submitting;

    deleteConfirm.textContent = submitting
        ? "Excluindo..."
        : "Excluir";
}

function openDeleteDialog(user) {
    if (user.id === currentUserId) {
        showMessage(
            "Você não pode excluir sua própria conta.",
            "error"
        );

        return;
    }

    deletingUser = user;

    deleteDialogDescription.textContent =
        `Tem certeza que deseja excluir ${user.name}? ` +
        "Esta ação não poderá ser desfeita.";

    deleteDialog.showModal();
    document.body.classList.add("modal-open");

    deleteCancel.focus();
}

function closeDeleteDialog() {
    if (isDeletingUser) {
        return;
    }

    deleteDialog.close();
}

function resetDeleteDialog() {
    document.body.classList.remove("modal-open");

    deletingUser = null;

    deleteDialogDescription.textContent =
        "Esta ação não poderá ser desfeita.";

    setDeleteSubmitting(false);
}

// ==================== EXCLUSÃO DE USUÁRIO ====================

async function handleDeleteUser(event) {
    event.preventDefault();

    if (!deletingUser || isDeletingUser) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    const userId = deletingUser.id;
    const userName = deletingUser.name;

    if (userId === currentUserId) {
        deleteDialog.close();

        showMessage(
            "Você não pode excluir sua própria conta.",
            "error"
        );

        return;
    }

    clearMessage();
    setDeleteSubmitting(true);

    try {
        await deleteUser(userId, token);

        allUsers = allUsers.filter(user => user.id !== userId);

        applyFilters();
        deleteDialog.close();

        showMessage(
            `Usuário ${userName} excluído com sucesso!`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 403
            ? "Sua conta não tem permissão para excluir usuários."
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

    // Usuário autenticado
    currentUserId = session.user.id;

    // Montagem do painel
    renderAdminPanel(session.user);

    // Eventos da listagem
    usersReload.addEventListener("click", loadUsers);
    usersSearch.addEventListener("input", applyFilters);
    usersRole.addEventListener("change", applyFilters);
    usersStatus.addEventListener("change", applyFilters);
    usersClear.addEventListener("click", clearFilters);
    usersCreate.addEventListener("click", openUserDialog);

    // Eventos do modal de ações
    actionsDialogClose.addEventListener("click", closeActionsDialog);
    actionsDialog.addEventListener("close", resetActionsDialog);

    actionEdit.addEventListener("click", () => {
        runSelectedUserAction(openEditUserDialog);
    });

    actionPassword.addEventListener("click", () => {
        runSelectedUserAction(openPasswordDialog);
    });

    actionClassroom.addEventListener("click", () => {
        runSelectedUserAction(openClassroomDialog);
    });

    actionStatus.addEventListener("click", () => {
        runSelectedUserAction(openStatusDialog);
    });

    actionDelete.addEventListener("click", () => {
        runSelectedUserAction(openDeleteDialog);
    });

    // Eventos do modal de cadastro
    userRole.addEventListener("change", updateClassroomField);
    userForm.addEventListener("submit", handleCreateUser);
    userDialogClose.addEventListener("click", closeUserDialog);
    userCancel.addEventListener("click", closeUserDialog);
    userDialog.addEventListener("close", resetUserDialog);

    userDialog.addEventListener("cancel", event => {
        if (isSubmitting) {
            event.preventDefault();
        }
    });

    // Eventos do modal de edição
    editUserForm.addEventListener("submit", handleEditUser);
    editUserClose.addEventListener("click", closeEditUserDialog);
    editUserCancel.addEventListener("click", closeEditUserDialog);
    editUserDialog.addEventListener("close", resetEditUserDialog);

    editUserDialog.addEventListener("cancel", event => {
        if (isUpdatingUser) {
            event.preventDefault();
        }
    });

    // Eventos do modal de senha
    passwordForm.addEventListener("submit", handlePasswordChange);
    passwordDialogClose.addEventListener("click", closePasswordDialog);
    passwordCancel.addEventListener("click", closePasswordDialog);
    passwordDialog.addEventListener("close", resetPasswordDialog);

    passwordDialog.addEventListener("cancel", event => {
        if (isChangingPassword) {
            event.preventDefault();
        }
    });

    // Eventos do modal de turma
    classroomForm.addEventListener("submit", handleClassroomChange);
    classroomDialogClose.addEventListener("click", closeClassroomDialog);
    classroomCancel.addEventListener("click", closeClassroomDialog);
    classroomDialog.addEventListener("close", resetClassroomDialog);

    classroomDialog.addEventListener("cancel", event => {
        if (isUpdatingClassroom) {
            event.preventDefault();
        }
    });

    // Eventos do modal de status
    statusForm.addEventListener("submit", handleStatusChange);
    statusCancel.addEventListener("click", closeStatusDialog);
    statusDialog.addEventListener("close", resetStatusDialog);

    statusDialog.addEventListener("cancel", event => {
        if (isChangingStatus) {
            event.preventDefault();
        }
    });

    // Eventos do modal de exclusão
    deleteForm.addEventListener("submit", handleDeleteUser);
    deleteCancel.addEventListener("click", closeDeleteDialog);
    deleteDialog.addEventListener("close", resetDeleteDialog);

    deleteDialog.addEventListener("cancel", event => {
        if (isDeletingUser) {
            event.preventDefault();
        }
    });

    // Consulta inicial
    await loadUsers();
}

initializePage();