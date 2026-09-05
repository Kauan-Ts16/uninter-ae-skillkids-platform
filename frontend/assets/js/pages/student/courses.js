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

import { getActiveCourses } from "../../services/course-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================

const studentFirstName = document.querySelector(
    "#student-first-name"
);

const coursesCount = document.querySelector(
    "#student-courses-count"
);

const coursesReload = document.querySelector(
    "#student-courses-reload"
);

const coursesFeedback = document.querySelector(
    "#student-courses-feedback"
);

const coursesGrid = document.querySelector(
    "#student-courses-grid"
);

// ==================== ESTADO ====================

let isLoading = false;

// ==================== CARREGAMENTO ====================

function setLoading(loading) {
    isLoading = loading;

    coursesReload.disabled = loading;
    coursesReload.textContent = loading
        ? "Carregando..."
        : "Atualizar";
}

// ==================== EXIBIÇÃO DOS CURSOS ====================

function createCourseCard(course, index) {
    const card = document.createElement("article");
    card.className = "student-course-card";

    const number = document.createElement("span");
    number.className = "student-course-number";
    number.textContent = `Curso ${index + 1}`;

    const title = document.createElement("h3");
    title.textContent = course.title;

    const description = document.createElement("p");
    description.className = "student-course-description";
    description.textContent = course.description;

    const footer = document.createElement("div");
    footer.className = "student-course-footer";

    const status = document.createElement("span");
    status.className = "student-course-status";
    status.textContent = "Disponível";

    const action = document.createElement("button");
    action.type = "button";
    action.className = "student-course-action";
    action.textContent = "Ver exercícios";

    action.addEventListener("click", () => {
        const courseUrl = new URL(
            "../../../../student/course.html",
            import.meta.url
        );

        courseUrl.searchParams.set("id", course.id);

        window.location.href = courseUrl.href;
    });

    footer.append(status, action);

    card.append(
        number,
        title,
        description,
        footer
    );

    return card;
}

function renderCourses(courses) {
    coursesGrid.replaceChildren();

    const label = courses.length === 1
        ? "curso disponível"
        : "cursos disponíveis";

    coursesCount.textContent =
        `${courses.length} ${label}`;

    if (courses.length === 0) {
        coursesFeedback.textContent =
            "Nenhum curso está disponível no momento.";

        coursesFeedback.hidden = false;
        coursesGrid.hidden = true;
        return;
    }

    for (const [index, course] of courses.entries()) {
        coursesGrid.append(
            createCourseCard(course, index)
        );
    }

    coursesFeedback.hidden = true;
    coursesGrid.hidden = false;
}

// ==================== CONSULTA DOS CURSOS ====================

async function loadCourses() {
    if (isLoading) {
        return;
    }

    clearMessage();
    setLoading(true);

    coursesFeedback.textContent =
        "Carregando cursos...";

    coursesFeedback.hidden = false;
    coursesGrid.hidden = true;

    try {
        const courses = await getActiveCourses(
            getToken()
        );

        renderCourses(courses);
    } catch (error) {
        if (error.status === 401) {
            signOut();
            return;
        }

        coursesFeedback.textContent =
            "Não foi possível carregar os cursos.";

        showMessage(
            error.message ||
            "Não foi possível carregar os cursos.",
            "error"
        );
    } finally {
        setLoading(false);
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

    studentFirstName.textContent =
        session.user.name
            .trim()
            .split(/\s+/)[0];

    coursesReload.addEventListener(
        "click",
        loadCourses
    );

    await loadCourses();
}

initializePage();