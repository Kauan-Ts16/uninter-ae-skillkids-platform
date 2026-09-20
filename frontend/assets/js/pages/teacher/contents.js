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
    getTeacherCourses
} from "../../services/teacher-content-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

const CONTENT_URL = new URL(
    "../../../../teacher/content.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================

const contentsCount = document.querySelector(
    "#teacher-contents-count"
);

const contentsReload = document.querySelector(
    "#teacher-contents-reload"
);

const contentsFeedback = document.querySelector(
    "#teacher-contents-feedback"
);

const contentsGrid = document.querySelector(
    "#teacher-contents-grid"
);

// ==================== ESTADO ====================

let isLoading = false;

// ==================== CARREGAMENTO ====================

function setLoading(loading) {
    isLoading = loading;

    contentsReload.disabled = loading;
    contentsReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";
}

// ==================== CARTÃO DO CURSO ====================

function createCourseCard(course, index) {
    const card = document.createElement("article");
    card.className = "teacher-content-card";

    const header = document.createElement("header");
    header.className = "teacher-content-card-header";

    const number = document.createElement("span");
    number.className = "teacher-content-number";
    number.textContent = `Curso ${index + 1}`;

    const status = document.createElement("span");
    status.className = "teacher-content-status";
    status.textContent = "Disponível";

    header.append(number, status);

    const title = document.createElement("h3");
    title.textContent = course.title;

    const description = document.createElement("p");
    description.className = "teacher-content-description";
    description.textContent = course.description;

    const footer = document.createElement("footer");
    footer.className = "teacher-content-card-footer";

    const message = document.createElement("span");
    message.textContent = "Visualização do professor";

    const action = document.createElement("button");
    action.type = "button";
    action.className = "teacher-content-action";
    action.textContent = "Ver exercícios";

    action.addEventListener("click", () => {
        const contentUrl = new URL(
            CONTENT_URL.href
        );

        contentUrl.searchParams.set("id", course.id);

        window.location.href = contentUrl.href;
    });

    footer.append(message, action);

    card.append(
        header,
        title,
        description,
        footer
    );

    return card;
}

// ==================== EXIBIÇÃO ====================

function renderCourses(courses) {
    contentsGrid.replaceChildren();

    const label = courses.length === 1
        ? "curso disponível"
        : "cursos disponíveis";

    contentsCount.textContent =
        `${courses.length} ${label}`;

    if (courses.length === 0) {
        contentsFeedback.textContent =
            "Nenhum curso está disponível no momento.";

        contentsFeedback.hidden = false;
        contentsGrid.hidden = true;
        return;
    }

    for (const [index, course] of courses.entries()) {
        contentsGrid.append(
            createCourseCard(course, index)
        );
    }

    contentsFeedback.hidden = true;
    contentsGrid.hidden = false;
}

// ==================== ERROS ====================

function handleRequestError(error) {
    if (error.status === 401) {
        signOut();
        return;
    }

    contentsFeedback.textContent =
        "Não foi possível carregar os conteúdos.";

    contentsFeedback.hidden = false;
    contentsGrid.hidden = true;

    const message = error.status === 403
        ? "Sua conta não tem permissão para consultar os conteúdos."
        : error.message ||
        "Não foi possível carregar os conteúdos.";

    showMessage(message, "error");
}

// ==================== CONSULTA ====================

async function loadCourses() {
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

    contentsFeedback.textContent =
        "Carregando conteúdos...";

    contentsFeedback.hidden = false;
    contentsGrid.hidden = true;

    try {
        const courses = await getTeacherCourses(token);

        renderCourses(courses);
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

    contentsReload.addEventListener(
        "click",
        loadCourses
    );

    await loadCourses();
}

initializePage();