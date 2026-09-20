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
    addStudentToTeacherClassroom,
    getAvailableStudents,
    getTeacherClassroom,
    getTeacherClassroomStudents,
    removeStudentFromTeacherClassroom
} from "../../services/teacher-classroom-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== PARÂMETROS ====================

const pageParameters = new URLSearchParams(
    window.location.search
);

const classroomId = pageParameters.get("id");

// ==================== ELEMENTOS ====================

const classroomFeedback = document.querySelector(
    "#teacher-classroom-feedback"
);

const classroomContent = document.querySelector(
    "#teacher-classroom-content"
);

const classroomName = document.querySelector(
    "#teacher-classroom-name"
);

const classroomCode = document.querySelector(
    "#teacher-classroom-code"
);

const classroomStatus = document.querySelector(
    "#teacher-classroom-status"
);

const studentsCount = document.querySelector(
    "#teacher-students-count"
);

const studentsReload = document.querySelector(
    "#teacher-students-reload"
);

const studentAddToggle = document.querySelector(
    "#teacher-student-add-toggle"
);

const studentAddSection = document.querySelector(
    "#teacher-student-add"
);

const studentAddForm = document.querySelector(
    "#teacher-student-add-form"
);

const studentSelect = document.querySelector(
    "#teacher-student-select"
);

const studentAddCancel = document.querySelector(
    "#teacher-student-add-cancel"
);

const studentAddSubmit = document.querySelector(
    "#teacher-student-add-submit"
);

const studentsFeedback = document.querySelector(
    "#teacher-students-feedback"
);

const studentsList = document.querySelector(
    "#teacher-students-list"
);

const removeDialog = document.querySelector(
    "#teacher-student-remove-dialog"
);

const removeForm = document.querySelector(
    "#teacher-student-remove-form"
);

const removeName = document.querySelector(
    "#teacher-student-remove-name"
);

const removeCancel = document.querySelector(
    "#teacher-student-remove-cancel"
);

const removeConfirm = document.querySelector(
    "#teacher-student-remove-confirm"
);

// ==================== ESTADO ====================

let classroom = null;
let availableStudents = [];
let selectedStudent = null;

let isLoading = false;
let isLoadingAvailableStudents = false;
let isAddingStudent = false;
let isRemovingStudent = false;

// ==================== CONTROLES ====================

function updateControls() {
    const unavailable =
        isLoading ||
        isAddingStudent ||
        isRemovingStudent ||
        !classroom;

    studentsReload.disabled = unavailable;
    studentAddToggle.disabled = unavailable;

    studentSelect.disabled =
        unavailable ||
        isLoadingAvailableStudents ||
        availableStudents.length === 0;

    studentAddCancel.disabled =
        isAddingStudent ||
        isRemovingStudent;

    studentAddSubmit.disabled =
        unavailable ||
        isLoadingAvailableStudents ||
        availableStudents.length === 0;

    for (const button of studentsList.querySelectorAll(
        ".teacher-student-remove"
    )) {
        button.disabled = unavailable;
    }
}

function setLoading(loading) {
    isLoading = loading;

    studentsReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";

    updateControls();
}

function setLoadingAvailableStudents(loading) {
    isLoadingAvailableStudents = loading;
    updateControls();
}

function setAddingStudent(adding) {
    isAddingStudent = adding;

    studentAddSubmit.textContent = adding
        ? "Adicionando..."
        : "Adicionar";

    updateControls();
}

function setRemovingStudent(removing) {
    isRemovingStudent = removing;

    removeConfirm.textContent = removing
        ? "Removendo..."
        : "Remover aluno";

    removeConfirm.disabled = removing;
    removeCancel.disabled = removing;

    updateControls();
}

function setStudentAddSectionOpen(open) {
    studentAddSection.hidden = !open;

    studentAddToggle.textContent = open
        ? "Fechar seleção"
        : "Adicionar aluno";

    if (!open) {
        studentAddForm.reset();
        return;
    }

    studentSelect.focus();
}

// ==================== DADOS DA TURMA ====================

function renderClassroom(data) {
    classroomName.textContent = data.name;
    classroomCode.textContent = data.joinCode;

    classroomStatus.textContent = data.active
        ? "Turma ativa"
        : "Turma inativa";

    classroomStatus.dataset.status = data.active
        ? "active"
        : "inactive";
}

// ==================== CARTÃO DO ALUNO ====================

function createStudentCard(student) {
    const card = document.createElement("article");
    card.className = "teacher-student-card";

    const avatar = document.createElement("span");
    avatar.className = "teacher-student-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = student.name
        ?.trim()
        .charAt(0)
        .toUpperCase() || "A";

    const content = document.createElement("div");
    content.className = "teacher-student-content";

    const title = document.createElement("h3");
    title.textContent = student.name;

    const email = document.createElement("p");
    email.textContent = student.email;

    content.append(title, email);

    const status = document.createElement("span");
    status.className = "teacher-student-status";
    status.dataset.status = student.active
        ? "active"
        : "inactive";
    status.textContent = student.active
        ? "Ativo"
        : "Inativo";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className =
        "teacher-student-remove teacher-danger-button";
    removeButton.textContent = "Remover";

    removeButton.addEventListener("click", () => {
        openRemoveDialog(student);
    });

    card.append(
        avatar,
        content,
        status,
        removeButton
    );

    return card;
}

// ==================== EXIBIÇÃO DOS ALUNOS ====================

function renderStudents(students) {
    studentsList.replaceChildren();

    const label = students.length === 1
        ? "aluno na turma"
        : "alunos na turma";

    studentsCount.textContent =
        `${students.length} ${label}`;

    if (students.length === 0) {
        studentsFeedback.textContent =
            "Esta turma ainda não possui alunos.";

        studentsFeedback.hidden = false;
        studentsList.hidden = true;
        return;
    }

    for (const student of students) {
        studentsList.append(
            createStudentCard(student)
        );
    }

    studentsFeedback.hidden = true;
    studentsList.hidden = false;

    updateControls();
}

// ==================== ALUNOS DISPONÍVEIS ====================

function renderAvailableStudents(students) {
    studentSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";

    if (students.length === 0) {
        placeholder.textContent =
            "Nenhum aluno disponível";

        studentSelect.append(placeholder);
        updateControls();
        return;
    }

    placeholder.textContent = "Selecione um aluno";
    studentSelect.append(placeholder);

    for (const student of students) {
        const option = document.createElement("option");
        option.value = student.id;
        option.textContent = `${student.name} — ${student.email}`;

        studentSelect.append(option);
    }

    updateControls();
}

async function loadAvailableStudents() {
    if (isLoadingAvailableStudents) {
        return;
    }

    availableStudents = [];

    studentSelect.replaceChildren();

    const loadingOption = document.createElement("option");
    loadingOption.value = "";
    loadingOption.textContent = "Carregando alunos...";
    studentSelect.append(loadingOption);

    setLoadingAvailableStudents(true);

    try {
        availableStudents = await getAvailableStudents(
            getToken()
        );

        renderAvailableStudents(availableStudents);
    } catch (error) {
        loadingOption.textContent =
            "Não foi possível carregar os alunos";

        handleRequestError(
            error,
            "Não foi possível carregar os alunos disponíveis."
        );
    } finally {
        setLoadingAvailableStudents(false);

        if (
            !studentAddSection.hidden &&
            availableStudents.length > 0
        ) {
            studentSelect.focus();
        }
    }
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

// ==================== CONSULTA DA TURMA ====================

async function loadClassroomData(showMainFeedback = true) {
    if (isLoading || !classroomId) {
        return;
    }

    clearMessage();
    setLoading(true);

    if (showMainFeedback) {
        classroom = null;
        classroomContent.hidden = true;
        classroomFeedback.hidden = false;
        classroomFeedback.textContent =
            "Carregando dados da turma...";
    }

    studentsFeedback.hidden = false;
    studentsFeedback.textContent =
        "Carregando alunos...";
    studentsList.hidden = true;

    try {
        const [classroomData, students] = await Promise.all([
            getTeacherClassroom(
                classroomId,
                getToken()
            ),
            getTeacherClassroomStudents(
                classroomId,
                getToken()
            )
        ]);

        classroom = classroomData;

        renderClassroom(classroomData);
        renderStudents(students);

        classroomFeedback.hidden = true;
        classroomContent.hidden = false;
    } catch (error) {
        studentsFeedback.textContent =
            "Não foi possível carregar os alunos da turma.";

        if (showMainFeedback) {
            classroomFeedback.textContent =
                "Não foi possível carregar os dados da turma.";
        }

        handleRequestError(
            error,
            "Não foi possível carregar os dados da turma."
        );
    } finally {
        setLoading(false);
    }
}

// ==================== INCLUSÃO DO ALUNO ====================

async function handleStudentAddSubmit(event) {
    event.preventDefault();

    if (
        isAddingStudent ||
        !classroom ||
        !studentSelect.value
    ) {
        return;
    }

    clearMessage();
    setAddingStudent(true);

    try {
        await addStudentToTeacherClassroom(
            classroom.id,
            studentSelect.value,
            getToken()
        );

        availableStudents = [];
        setStudentAddSectionOpen(false);

        await loadClassroomData(false);

        showMessage(
            "Aluno adicionado à turma com sucesso."
        );
    } catch (error) {
        handleRequestError(
            error,
            "Não foi possível adicionar o aluno."
        );
    } finally {
        setAddingStudent(false);
    }
}

// ==================== REMOÇÃO DO ALUNO ====================

function openRemoveDialog(student) {
    selectedStudent = student;
    removeName.textContent = student.name;
    removeDialog.showModal();
    removeCancel.focus();
}

function closeRemoveDialog() {
    if (removeDialog.open) {
        removeDialog.close();
    }

    selectedStudent = null;
}

async function handleStudentRemoveSubmit(event) {
    event.preventDefault();

    if (
        isRemovingStudent ||
        !classroom ||
        !selectedStudent
    ) {
        return;
    }

    clearMessage();
    setRemovingStudent(true);

    try {
        await removeStudentFromTeacherClassroom(
            classroom.id,
            selectedStudent.id,
            getToken()
        );

        closeRemoveDialog();

        await loadClassroomData(false);

        showMessage(
            "Aluno removido da turma com sucesso."
        );
    } catch (error) {
        handleRequestError(
            error,
            "Não foi possível remover o aluno."
        );
    } finally {
        setRemovingStudent(false);
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

    if (!classroomId) {
        classroomFeedback.textContent =
            "A turma informada é inválida.";
        return;
    }

    studentsReload.addEventListener(
        "click",
        () => loadClassroomData(false)
    );

    studentAddToggle.addEventListener(
        "click",
        async () => {
            const open = studentAddSection.hidden;

            setStudentAddSectionOpen(open);

            if (open) {
                await loadAvailableStudents();
            }
        }
    );

    studentAddCancel.addEventListener(
        "click",
        () => {
            setStudentAddSectionOpen(false);
        }
    );

    studentAddForm.addEventListener(
        "submit",
        handleStudentAddSubmit
    );

    removeCancel.addEventListener(
        "click",
        closeRemoveDialog
    );

    removeForm.addEventListener(
        "submit",
        handleStudentRemoveSubmit
    );

    removeDialog.addEventListener(
        "cancel",
        event => {
            if (isRemovingStudent) {
                event.preventDefault();
                return;
            }

            selectedStudent = null;
        }
    );

    await loadClassroomData();
}

initializePage();