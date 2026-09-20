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
    getCurrentStudentClassroom,
    joinStudentClassroom,
    leaveStudentClassroom
} from "../../services/student-classroom-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================

const classroomReload = document.querySelector(
    "#student-classroom-reload"
);

const classroomFeedback = document.querySelector(
    "#student-classroom-feedback"
);

const classroomEmpty = document.querySelector(
    "#student-classroom-empty"
);

const classroomJoinForm = document.querySelector(
    "#student-classroom-join-form"
);

const classroomCode = document.querySelector(
    "#student-classroom-code"
);

const classroomJoin = document.querySelector(
    "#student-classroom-join"
);

const classroomCurrent = document.querySelector(
    "#student-classroom-current"
);

const classroomName = document.querySelector(
    "#student-classroom-name"
);

const classroomStatus = document.querySelector(
    "#student-classroom-status"
);

const classroomTeacher = document.querySelector(
    "#student-classroom-teacher"
);

const classroomJoinCode = document.querySelector(
    "#student-classroom-join-code"
);

const classroomInactiveWarning = document.querySelector(
    "#student-classroom-inactive-warning"
);

const classroomLeave = document.querySelector(
    "#student-classroom-leave"
);

const leaveDialog = document.querySelector(
    "#student-classroom-leave-dialog"
);

const leaveForm = document.querySelector(
    "#student-classroom-leave-form"
);

const leaveDescription = document.querySelector(
    "#student-classroom-leave-description"
);

const leaveCancel = document.querySelector(
    "#student-classroom-leave-cancel"
);

const leaveConfirm = document.querySelector(
    "#student-classroom-leave-confirm"
);

// ==================== ESTADO ====================

let currentClassroom = null;
let isLoading = false;
let isJoining = false;
let isLeaving = false;

// ==================== CONTROLES ====================

function setLoading(loading) {
    isLoading = loading;

    classroomReload.disabled = loading;

    classroomReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";
}

function setJoining(joining) {
    isJoining = joining;

    classroomCode.disabled = joining;
    classroomJoin.disabled = joining;

    classroomJoin.textContent = joining
        ? "Entrando..."
        : "Entrar na turma";
}

function setLeaving(leaving) {
    isLeaving = leaving;

    leaveCancel.disabled = leaving;
    leaveConfirm.disabled = leaving;

    leaveConfirm.textContent = leaving
        ? "Saindo..."
        : "Confirmar saída";
}

// ==================== CÓDIGO DA TURMA ====================

function normalizeJoinCode(value) {
    return String(value ?? "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 6);
}

function handleJoinCodeInput() {
    classroomCode.value = normalizeJoinCode(
        classroomCode.value
    );
}

// ==================== EXIBIÇÃO ====================

function hideClassroomStates() {
    classroomEmpty.hidden = true;
    classroomCurrent.hidden = true;
}

function renderWithoutClassroom() {
    currentClassroom = null;

    classroomJoinForm.reset();
    classroomFeedback.hidden = true;
    classroomCurrent.hidden = true;
    classroomEmpty.hidden = false;
}

function renderClassroom(classroom) {
    currentClassroom = classroom;

    classroomName.textContent = classroom.name;

    classroomTeacher.textContent =
        classroom.teacherName ||
        "Professor ainda não definido";

    classroomJoinCode.textContent = classroom.joinCode;

    classroomStatus.dataset.active = String(
        classroom.active
    );

    classroomStatus.textContent = classroom.active
        ? "Turma ativa"
        : "Turma inativa";

    classroomInactiveWarning.hidden = classroom.active;

    classroomFeedback.hidden = true;
    classroomEmpty.hidden = true;
    classroomCurrent.hidden = false;
}

function showLoadError() {
    hideClassroomStates();

    classroomFeedback.dataset.type = "error";

    classroomFeedback.textContent =
        "Não foi possível carregar os dados da turma.";

    classroomFeedback.hidden = false;
}

// ==================== CONSULTA ====================

async function loadClassroom() {
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
    hideClassroomStates();

    classroomFeedback.dataset.type = "loading";

    classroomFeedback.textContent =
        "Carregando dados da turma...";

    classroomFeedback.hidden = false;

    try {
        const classroom =
            await getCurrentStudentClassroom(token);

        renderClassroom(classroom);
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        if (error.status === 404) {
            renderWithoutClassroom();
            return;
        }

        showLoadError();

        const message = error.status === 403
            ? "Sua conta não tem permissão para consultar esta turma."
            : error.message ||
            "Não foi possível carregar os dados da turma.";

        showMessage(message, "error");
    } finally {
        setLoading(false);
    }
}

// ==================== ENTRADA NA TURMA ====================

async function handleJoinClassroom(event) {
    event.preventDefault();

    if (isJoining) {
        return;
    }

    const joinCode = normalizeJoinCode(
        classroomCode.value
    );

    classroomCode.value = joinCode;

    if (joinCode.length !== 6) {
        showMessage(
            "Informe um código de turma com 6 caracteres.",
            "error"
        );

        classroomCode.focus();
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    clearMessage();
    setJoining(true);

    try {
        const classroom = await joinStudentClassroom(
            joinCode,
            token
        );

        renderClassroom(classroom);

        showMessage(
            `Você entrou na turma ${classroom.name}.`,
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        const message = error.status === 404
            ? "Nenhuma turma ativa foi encontrada com esse código."
            : error.message ||
            "Não foi possível entrar na turma.";

        showMessage(message, "error");
    } finally {
        setJoining(false);
    }
}

// ==================== MODAL DE SAÍDA ====================

function openLeaveDialog() {
    if (!currentClassroom) {
        return;
    }

    leaveDescription.textContent =
        `Ao sair de ${currentClassroom.name}, você precisará ` +
        "do código para entrar novamente.";

    leaveDialog.showModal();
    document.body.classList.add("student-dialog-open");
    leaveCancel.focus();
}

function closeLeaveDialog() {
    if (isLeaving) {
        return;
    }

    leaveDialog.close();
}

function resetLeaveDialog() {
    document.body.classList.remove("student-dialog-open");
    setLeaving(false);
}

// ==================== SAÍDA DA TURMA ====================

async function handleLeaveClassroom(event) {
    event.preventDefault();

    if (isLeaving || !currentClassroom) {
        return;
    }

    const token = getToken();

    if (!token) {
        signOut();
        return;
    }

    clearMessage();
    setLeaving(true);

    try {
        await leaveStudentClassroom(token);

        leaveDialog.close();
        renderWithoutClassroom();

        showMessage(
            "Você saiu da turma.",
            "success"
        );
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        if (error.status === 404) {
            leaveDialog.close();
            renderWithoutClassroom();

            showMessage(
                "Você não está mais vinculado a uma turma.",
                "success"
            );

            return;
        }

        showMessage(
            error.message ||
            "Não foi possível sair da turma.",
            "error"
        );
    } finally {
        setLeaving(false);
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

    classroomReload.addEventListener(
        "click",
        loadClassroom
    );

    classroomCode.addEventListener(
        "input",
        handleJoinCodeInput
    );

    classroomJoinForm.addEventListener(
        "submit",
        handleJoinClassroom
    );

    classroomLeave.addEventListener(
        "click",
        openLeaveDialog
    );

    leaveCancel.addEventListener(
        "click",
        closeLeaveDialog
    );

    leaveForm.addEventListener(
        "submit",
        handleLeaveClassroom
    );

    leaveDialog.addEventListener(
        "close",
        resetLeaveDialog
    );

    await loadClassroom();
}

initializePage();