// ==================== IMPORTAÇÕES ====================

import { signOut } from "../auth.js";

// ==================== CAMINHOS ====================

const LOGO_URL = new URL(
    "../../images/skillkids-logo.png",
    import.meta.url
);

const COURSES_URL = new URL(
    "../../../student/courses.html",
    import.meta.url
);

const PROGRESS_URL = new URL(
    "../../../student/progress.html",
    import.meta.url
);

const CLASSROOM_URL = new URL(
    "../../../student/classroom.html",
    import.meta.url
);

const ACCOUNT_URL = new URL(
    "../../../student/account.html",
    import.meta.url
);

// ==================== PÁGINAS ====================

const COURSES_PAGES = new Set([
    "courses.html",
    "course.html",
    "exercise.html"
]);

// ==================== CONTROLE DOS EVENTOS ====================

let panelEventsController;

// ==================== PÁGINA ATUAL ====================

function getCurrentPage() {
    const pathname = window.location.pathname;

    return pathname.split("/").pop() || "courses.html";
}

function getCurrentPageAttribute(active) {
    return active
        ? 'aria-current="page"'
        : "";
}

// ==================== PAINEL DO ALUNO ====================

export function renderStudentPanel(user) {
    const header = document.querySelector("#student-header");

    if (!header) {
        return;
    }

    panelEventsController?.abort();
    panelEventsController = new AbortController();

    const { signal } = panelEventsController;

    const currentPage = getCurrentPage();

    const coursesActive = COURSES_PAGES.has(
        currentPage
    );

    const progressActive = currentPage ===
        "progress.html";

    const classroomActive = currentPage ===
        "classroom.html";

    header.innerHTML = `
        <div class="student-header-inner">
            <a
                class="student-brand"
                href="${COURSES_URL.href}"
                aria-label="SkillKids — Cursos"
            >
                <img src="${LOGO_URL.href}" alt="SkillKids">
            </a>

            <nav
                class="student-navigation"
                aria-label="Menu do aluno"
            >
                <a
                    class="student-navigation-link"
                    href="${COURSES_URL.href}"
                    ${getCurrentPageAttribute(coursesActive)}
                >
                    Cursos
                </a>

                <a
                    class="student-navigation-link"
                    href="${PROGRESS_URL.href}"
                    ${getCurrentPageAttribute(progressActive)}
                >
                    Meu progresso
                </a>

                <a
                    class="student-navigation-link"
                    href="${CLASSROOM_URL.href}"
                    ${getCurrentPageAttribute(classroomActive)}
                >
                    Minha turma
                </a>
            </nav>

            <div
                id="student-account"
                class="student-account"
            >
                <button
                    id="student-account-toggle"
                    class="student-account-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-controls="student-account-menu"
                >
                    <span
                        id="student-account-avatar"
                        class="student-account-avatar"
                        aria-hidden="true"
                    ></span>

                    <span class="student-account-label">
                        Minha conta
                    </span>

                    <svg
                        class="student-account-chevron"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="m7 10 5 5 5-5"></path>
                    </svg>
                </button>

                <div
                    id="student-account-menu"
                    class="student-account-menu"
                    hidden
                >
                    <button
                        id="student-account-manage"
                        class="student-account-menu-button"
                        type="button"
                    >
                        Gerenciar conta
                    </button>

                    <button
                        id="student-logout"
                        class="student-account-menu-button student-account-menu-button--logout"
                        type="button"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </div>
    `;

    const account = document.querySelector(
        "#student-account"
    );

    const accountToggle = document.querySelector(
        "#student-account-toggle"
    );

    const accountMenu = document.querySelector(
        "#student-account-menu"
    );

    const accountAvatar = document.querySelector(
        "#student-account-avatar"
    );

    const logoutButton = document.querySelector(
        "#student-logout"
    );

    const manageAccountButton = document.querySelector(
        "#student-account-manage"
    );

    const initial = user.name
        ?.trim()
        .charAt(0)
        .toUpperCase() || "A";

    accountAvatar.textContent = initial;

    function setAccountMenuOpen(open) {
        accountMenu.hidden = !open;

        accountToggle.setAttribute(
            "aria-expanded",
            String(open)
        );
    }

    accountToggle.addEventListener(
        "click",
        () => {
            const isOpen =
                accountToggle.getAttribute("aria-expanded") ===
                "true";

            setAccountMenuOpen(!isOpen);
        },
        { signal }
    );

    logoutButton.addEventListener(
        "click",
        signOut,
        { signal }
    );

    manageAccountButton.addEventListener(
        "click",
        () => {
            window.location.href = ACCOUNT_URL.href;
        },
        { signal }
    );

    document.addEventListener(
        "click",
        event => {
            if (!account.contains(event.target)) {
                setAccountMenuOpen(false);
            }
        },
        { signal }
    );

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                !accountMenu.hidden
            ) {
                setAccountMenuOpen(false);
                accountToggle.focus();
            }
        },
        { signal }
    );
}