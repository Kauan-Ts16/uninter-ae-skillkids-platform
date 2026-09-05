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
    getTeacherProgressOverview
} from "../../services/teacher-progress-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

const STUDENT_PROGRESS_URL = new URL(
    "../../../../teacher/student-progress.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================

const classroomsTotal = document.querySelector(
    "#teacher-progress-classrooms-total"
);

const studentsTotal = document.querySelector(
    "#teacher-progress-students-total"
);

const progressDescription = document.querySelector(
    "#teacher-progress-description"
);

const progressReload = document.querySelector(
    "#teacher-progress-reload"
);

const progressFeedback = document.querySelector(
    "#teacher-progress-feedback"
);

const classroomsContainer = document.querySelector(
    "#teacher-progress-classrooms"
);

// ==================== ESTADO ====================

let isLoading = false;

// ==================== FORMATAÇÃO ====================

function formatDate(value) {
    if (!value) {
        return "Nenhuma atividade";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Nenhuma atividade";
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

function getLastActivity(progress) {
    return progress.reduce(
        (latest, item) => {
            if (!item.lastAnsweredAt) {
                return latest;
            }

            const current = new Date(
                item.lastAnsweredAt
            );

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
}

// ==================== CONTROLES ====================

function setLoading(loading) {
    isLoading = loading;

    progressReload.disabled = loading;
    progressReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";
}

// ==================== CARTÃO DO ALUNO ====================

function createStudentCard(
    student,
    classroomId,
    totalExercises
) {
    const progress = student.progress;

    const completed = progress.filter(
        item => item.completed
    ).length;

    const inProgress = progress.filter(
        item => !item.completed
    ).length;

    const attempts = progress.reduce(
        (total, item) =>
            total + Number(item.attempts ?? 0),
        0
    );

    const percentage = calculatePercentage(
        completed,
        totalExercises
    );

    const lastActivity = getLastActivity(
        progress
    );

    const card = document.createElement("article");
    card.className = "teacher-progress-student-card";

    const header = document.createElement("header");
    header.className = "teacher-progress-student-header";

    const avatar = document.createElement("span");
    avatar.className = "teacher-progress-student-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = student.name
        ?.trim()
        .charAt(0)
        .toUpperCase() || "A";

    const identity = document.createElement("div");
    identity.className =
        "teacher-progress-student-identity";

    const name = document.createElement("h3");
    name.textContent = student.name;

    const email = document.createElement("p");
    email.textContent = student.email;

    identity.append(name, email);

    const status = document.createElement("span");
    status.className = "teacher-progress-student-status";
    status.dataset.status = student.active
        ? "active"
        : "inactive";
    status.textContent = student.active
        ? "Ativo"
        : "Inativo";

    header.append(
        avatar,
        identity,
        status
    );

    const progressHeading = document.createElement("div");
    progressHeading.className =
        "teacher-progress-student-progress-heading";

    const progressLabel = document.createElement("span");
    progressLabel.textContent =
        `${completed} de ${totalExercises} concluídos`;

    const percentageElement =
        document.createElement("strong");

    percentageElement.textContent =
        `${percentage}%`;

    progressHeading.append(
        progressLabel,
        percentageElement
    );

    const track = document.createElement("div");
    track.className = "teacher-progress-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute(
        "aria-label",
        `Progresso de ${student.name}`
    );
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute(
        "aria-valuenow",
        String(percentage)
    );

    const bar = document.createElement("div");
    bar.className = "teacher-progress-bar";
    bar.style.width = `${percentage}%`;

    track.append(bar);

    const indicators = document.createElement("div");
    indicators.className =
        "teacher-progress-student-indicators";

    const inProgressIndicator =
        document.createElement("span");

    inProgressIndicator.textContent = inProgress === 1
        ? "1 em andamento"
        : `${inProgress} em andamento`;

    const attemptsIndicator =
        document.createElement("span");

    attemptsIndicator.textContent = attempts === 1
        ? "1 tentativa"
        : `${attempts} tentativas`;

    const activityIndicator =
        document.createElement("span");

    activityIndicator.textContent =
        `Última atividade: ${formatDate(lastActivity)}`;

    indicators.append(
        inProgressIndicator,
        attemptsIndicator,
        activityIndicator
    );

    const footer = document.createElement("footer");
    footer.className =
        "teacher-progress-student-footer";

    const action = document.createElement("button");
    action.type = "button";
    action.className =
        "teacher-progress-student-action";
    action.textContent = "Ver progresso";

    action.addEventListener("click", () => {
        const progressUrl = new URL(
            STUDENT_PROGRESS_URL.href
        );

        progressUrl.searchParams.set(
            "studentId",
            student.id
        );

        progressUrl.searchParams.set(
            "classroomId",
            classroomId
        );

        window.location.href = progressUrl.href;
    });

    footer.append(action);

    card.append(
        header,
        progressHeading,
        track,
        indicators,
        footer
    );

    return card;
}

// ==================== CARTÃO DA TURMA ====================

function createClassroomCard(
    classroom,
    totalExercises
) {
    const card = document.createElement("article");
    card.className =
        "teacher-progress-classroom-card";

    const header = document.createElement("header");
    header.className =
        "teacher-progress-classroom-header";

    const heading = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = classroom.name;

    const studentsLabel =
        classroom.students.length === 1
            ? "1 aluno"
            : `${classroom.students.length} alunos`;

    const count = document.createElement("p");
    count.textContent = studentsLabel;

    heading.append(title, count);

    const code = document.createElement("span");
    code.className =
        "teacher-progress-classroom-code";
    code.textContent = classroom.joinCode;

    header.append(heading, code);
    card.append(header);

    if (classroom.students.length === 0) {
        const empty = document.createElement("p");
        empty.className =
            "teacher-progress-classroom-empty";

        empty.textContent =
            "Esta turma ainda não possui alunos para acompanhar.";

        card.append(empty);
        return card;
    }

    const studentsList = document.createElement("div");
    studentsList.className =
        "teacher-progress-students-list";

    for (const student of classroom.students) {
        studentsList.append(
            createStudentCard(
                student,
                classroom.id,
                totalExercises
            )
        );
    }

    card.append(studentsList);

    return card;
}

// ==================== EXIBIÇÃO ====================

function renderProgressOverview(data) {
    classroomsContainer.replaceChildren();

    const classroomCount =
        data.classrooms.length;

    const studentCount = data.classrooms.reduce(
        (total, classroom) =>
            total + classroom.students.length,
        0
    );

    classroomsTotal.textContent =
        String(classroomCount);

    studentsTotal.textContent =
        String(studentCount);

    const classroomLabel = classroomCount === 1
        ? "1 turma"
        : `${classroomCount} turmas`;

    const studentLabel = studentCount === 1
        ? "1 aluno"
        : `${studentCount} alunos`;

    progressDescription.textContent =
        `${classroomLabel} e ${studentLabel} disponíveis para acompanhamento.`;

    if (classroomCount === 0) {
        progressFeedback.textContent =
            "Você ainda não possui turmas para acompanhar.";

        progressFeedback.hidden = false;
        classroomsContainer.hidden = true;
        return;
    }

    for (const classroom of data.classrooms) {
        classroomsContainer.append(
            createClassroomCard(
                classroom,
                data.totalExercises
            )
        );
    }

    progressFeedback.hidden = true;
    classroomsContainer.hidden = false;
}

// ==================== ERROS ====================

function handleRequestError(error) {
    if (error.status === 401) {
        signOut();
        return;
    }

    progressFeedback.textContent =
        "Não foi possível carregar o acompanhamento.";

    progressFeedback.hidden = false;
    classroomsContainer.hidden = true;

    const message = error.status === 403
        ? "Sua conta não tem permissão para consultar este acompanhamento."
        : error.message ||
        "Não foi possível carregar o acompanhamento.";

    showMessage(message, "error");
}

// ==================== CONSULTA ====================

async function loadProgressOverview() {
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

    progressFeedback.textContent =
        "Carregando acompanhamento...";

    progressFeedback.hidden = false;
    classroomsContainer.hidden = true;

    try {
        const data = await getTeacherProgressOverview(
            token
        );

        renderProgressOverview(data);
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

    progressReload.addEventListener(
        "click",
        loadProgressOverview
    );

    await loadProgressOverview();
}

initializePage();