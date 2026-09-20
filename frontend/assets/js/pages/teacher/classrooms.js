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
    createTeacherClassroom,
    getTeacherClassrooms
} from "../../services/teacher-classroom-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

const CLASSROOM_URL = new URL(
    "../../../../teacher/classroom.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================

const teacherFirstName = document.querySelector(
    "#teacher-first-name"
);

const classroomsCount = document.querySelector(
    "#teacher-classrooms-count"
);

const classroomsReload = document.querySelector(
    "#teacher-classrooms-reload"
);

const createToggle = document.querySelector(
    "#teacher-classroom-create-toggle"
);

const createSection = document.querySelector(
    "#teacher-classroom-create"
);

const createForm = document.querySelector(
    "#teacher-classroom-create-form"
);

const classroomName = document.querySelector(
    "#teacher-classroom-name"
);

const createCancel = document.querySelector(
    "#teacher-classroom-create-cancel"
);

const createSubmit = document.querySelector(
    "#teacher-classroom-create-submit"
);

const classroomsFeedback = document.querySelector(
    "#teacher-classrooms-feedback"
);

const classroomsGrid = document.querySelector(
    "#teacher-classrooms-grid"
);

// ==================== ESTADO ====================

let isLoading = false;
let isCreating = false;

// ==================== CONTROLES ====================

function updateControls() {
    const unavailable = isLoading || isCreating;

    classroomsReload.disabled = unavailable;
    createToggle.disabled = unavailable;
    classroomName.disabled = unavailable;
    createCancel.disabled = unavailable;
    createSubmit.disabled = unavailable;
}

function setLoading(loading) {
    isLoading = loading;

    classroomsReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";

    updateControls();
}

function setCreating(creating) {
    isCreating = creating;

    createSubmit.textContent = creating
        ? "Criando..."
        : "Criar turma";

    updateControls();
}

function setCreateSectionOpen(open) {
    createSection.hidden = !open;

    createToggle.textContent = open
        ? "Fechar formulário"
        : "Nova turma";

    if (open) {
        classroomName.focus();
        return;
    }

    createForm.reset();
}

// ==================== CARTÃO DA TURMA ====================

function createClassroomCard(classroom, index) {
    const card = document.createElement("article");
    card.className = "teacher-classroom-card";

    const header = document.createElement("div");
    header.className = "teacher-classroom-card-header";

    const number = document.createElement("span");
    number.className = "teacher-classroom-number";
    number.textContent = `Turma ${index + 1}`;

    const status = document.createElement("span");
    status.className = "teacher-classroom-card-status";
    status.textContent = "Ativa";

    header.append(number, status);

    const title = document.createElement("h3");
    title.textContent = classroom.name;

    const description = document.createElement("p");
    description.className = "teacher-classroom-description";
    description.textContent =
        "Acompanhe os alunos e gerencie os participantes desta turma.";

    const codeContainer = document.createElement("div");
    codeContainer.className = "teacher-classroom-code";

    const codeLabel = document.createElement("span");
    codeLabel.textContent = "Código de entrada";

    const code = document.createElement("strong");
    code.textContent = classroom.joinCode;

    codeContainer.append(codeLabel, code);

    const footer = document.createElement("footer");
    footer.className = "teacher-classroom-card-footer";

    const teacher = document.createElement("span");
    teacher.className = "teacher-classroom-teacher";
    teacher.textContent = classroom.teacherName ||
        "Professor não informado";

    const action = document.createElement("button");
    action.type = "button";
    action.className = "teacher-classroom-action";
    action.textContent = "Ver turma";

    action.addEventListener("click", () => {
        const classroomUrl = new URL(CLASSROOM_URL.href);

        classroomUrl.searchParams.set("id", classroom.id);

        window.location.href = classroomUrl.href;
    });

    footer.append(teacher, action);

    card.append(
        header,
        title,
        description,
        codeContainer,
        footer
    );

    return card;
}

// ==================== EXIBIÇÃO DAS TURMAS ====================

function renderClassrooms(classrooms) {
    classroomsGrid.replaceChildren();

    const label = classrooms.length === 1
        ? "turma cadastrada"
        : "turmas cadastradas";

    classroomsCount.textContent =
        `${classrooms.length} ${label}`;

    if (classrooms.length === 0) {
        classroomsFeedback.textContent =
            "Você ainda não possui turmas cadastradas.";

        classroomsFeedback.hidden = false;
        classroomsGrid.hidden = true;
        return;
    }

    for (const [index, classroom] of classrooms.entries()) {
        classroomsGrid.append(
            createClassroomCard(classroom, index)
        );
    }

    classroomsFeedback.hidden = true;
    classroomsGrid.hidden = false;
}

// ==================== ERROS ====================

function handleRequestError(error, fallbackMessage) {
    if (error.status === 401) {
        signOut();
        return;
    }

    showMessage(
        error.message || fallbackMessage,
        "error"
    );
}

// ==================== CONSULTA DAS TURMAS ====================

async function loadClassrooms() {
    if (isLoading) {
        return;
    }

    clearMessage();
    setLoading(true);

    classroomsFeedback.textContent =
        "Carregando turmas...";

    classroomsFeedback.hidden = false;
    classroomsGrid.hidden = true;

    try {
        const classrooms = await getTeacherClassrooms(
            getToken()
        );

        renderClassrooms(classrooms);
    } catch (error) {
        classroomsFeedback.textContent =
            "Não foi possível carregar suas turmas.";

        handleRequestError(
            error,
            "Não foi possível carregar suas turmas."
        );
    } finally {
        setLoading(false);
    }
}

// ==================== CRIAÇÃO DA TURMA ====================

async function handleCreateSubmit(event) {
    event.preventDefault();

    if (isCreating || isLoading) {
        return;
    }

    const name = classroomName.value.trim();

    classroomName.value = name;

    if (!createForm.reportValidity()) {
        return;
    }

    clearMessage();
    setCreating(true);

    try {
        await createTeacherClassroom(
            name,
            getToken()
        );

        setCreateSectionOpen(false);

        await loadClassrooms();

        showMessage(
            "Turma criada com sucesso."
        );
    } catch (error) {
        handleRequestError(
            error,
            "Não foi possível criar a turma."
        );
    } finally {
        setCreating(false);
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

    teacherFirstName.textContent = session.user.name
        ?.trim()
        .split(/\s+/)[0] || "Professor";

    classroomsReload.addEventListener(
        "click",
        loadClassrooms
    );

    createToggle.addEventListener(
        "click",
        () => {
            setCreateSectionOpen(createSection.hidden);
        }
    );

    createCancel.addEventListener(
        "click",
        () => {
            setCreateSectionOpen(false);
        }
    );

    createForm.addEventListener(
        "submit",
        handleCreateSubmit
    );

    await loadClassrooms();
}

initializePage();