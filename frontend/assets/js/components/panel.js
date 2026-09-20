// ==================== IMPORTAÇÕES ====================

import { signOut } from "../auth.js";

// ==================== CAMINHOS ====================

const LOGO_URL = new URL(
    "../../images/skillkids-logo.png",
    import.meta.url
);

const USERS_URL = new URL(
    "../../../admin/users.html",
    import.meta.url
);

const CLASSROOMS_URL = new URL(
    "../../../admin/classrooms.html",
    import.meta.url
);

const COURSES_URL = new URL(
    "../../../admin/courses.html",
    import.meta.url
);

const EXERCISES_URL = new URL(
    "../../../admin/exercises.html",
    import.meta.url
);

const ACCOUNT_URL = new URL(
    "../../../admin/account.html",
    import.meta.url
);

// ==================== ÍCONES ====================

const PANEL_ICONS = {
    users: `
        <svg
            class="panel-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    `,

    classrooms: `
        <svg
            class="panel-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect x="3" y="4" width="18" height="14" rx="2"></rect>
            <path d="M8 22l4-4 4 4"></path>
            <path d="M12 2v2"></path>
            <circle cx="9" cy="10" r="2"></circle>
            <path d="M6 15a3 3 0 0 1 6 0"></path>
            <path d="M15 9h3"></path>
            <path d="M15 13h3"></path>
        </svg>
    `,

    courses: `
        <svg
            class="panel-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 0 2 22V4.5z"></path>
            <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5A2.5 2.5 0 0 1 22 22V4.5z"></path>
        </svg>
    `,

    exercises: `
        <svg
            class="panel-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect x="5" y="3" width="14" height="18" rx="2"></rect>
            <path d="M9 7h6"></path>
            <path d="M9 11h6"></path>
            <path d="M9 15h4"></path>
        </svg>
    `,

    account: `
        <svg
            class="panel-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9"></circle>
            <circle cx="12" cy="9" r="3"></circle>
            <path d="M6.5 19a6 6 0 0 1 11 0"></path>
        </svg>
    `,

    logout: `
        <svg
            class="panel-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path d="M10 17l5-5-5-5"></path>
            <path d="M15 12H3"></path>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        </svg>
    `
};

// ==================== PÁGINA ATUAL ====================

function getCurrentPageAttribute(pageName) {
    return window.location.pathname.endsWith(`/${pageName}`)
        ? 'aria-current="page"'
        : "";
}

// ==================== PAINEL ADMINISTRATIVO ====================

export function renderAdminPanel(user) {
    const sidebar = document.querySelector("#panel-sidebar");
    const header = document.querySelector("#panel-header");

    const usersCurrent = getCurrentPageAttribute(
        "users.html"
    );
    const classroomsCurrent = getCurrentPageAttribute(
        "classrooms.html"
    );
    const coursesCurrent = getCurrentPageAttribute(
        "courses.html"
    );
    const exercisesCurrent = getCurrentPageAttribute(
        "exercises.html"
    );
    const accountCurrent = getCurrentPageAttribute(
        "account.html"
    );

    // Menu lateral
    sidebar.innerHTML = `
        <a
            class="panel-brand"
            href="${USERS_URL.href}"
            aria-label="SkillKids — Área administrativa"
        >
            <img src="${LOGO_URL.href}" alt="SkillKids">
        </a>

        <nav aria-label="Menu administrativo">
            <ul class="panel-menu">
                <li>
                    <a
                        class="panel-menu-link"
                        href="${USERS_URL.href}"
                        ${usersCurrent}
                    >
                        ${PANEL_ICONS.users}
                        <span class="panel-menu-text">
                            Usuários
                        </span>
                    </a>
                </li>

                <li>
                    <a
                        class="panel-menu-link"
                        href="${CLASSROOMS_URL.href}"
                        ${classroomsCurrent}
                    >
                        ${PANEL_ICONS.classrooms}
                        <span class="panel-menu-text">
                            Turmas
                        </span>
                    </a>
                </li>

                <li>
                    <a
                        class="panel-menu-link"
                        href="${COURSES_URL.href}"
                        ${coursesCurrent}
                    >
                        ${PANEL_ICONS.courses}
                        <span class="panel-menu-text">
                            Cursos
                        </span>
                    </a>
                </li>

                <li>
                    <a
                        class="panel-menu-link"
                        href="${EXERCISES_URL.href}"
                        ${exercisesCurrent}
                    >
                        ${PANEL_ICONS.exercises}
                        <span class="panel-menu-text">
                            Exercícios
                        </span>
                    </a>
                </li>
            </ul>
        </nav>

        <div class="panel-sidebar-bottom">
            <a
                class="panel-menu-link"
                href="${ACCOUNT_URL.href}"
                ${accountCurrent}>
                ${PANEL_ICONS.account}

                <span class="panel-menu-text">
                    Minha conta
                </span>
            </a>

            <div class="panel-sidebar-footer">
                <button
                    id="logout-button"
                    class="panel-menu-link panel-menu-link--logout"
                    type="button"
                >
                    ${PANEL_ICONS.logout}
                    <span class="panel-menu-text">
                        Sair
                    </span>
                </button>
            </div>
        </div>
    `;

    // Cabeçalho
    header.innerHTML = `
        <p class="panel-header-title">
            Área administrativa
        </p>

        <div class="panel-account">
            <span
                id="panel-user-name"
                class="panel-account-name"
            ></span>

            <span class="panel-account-role">
                Administrador
            </span>
        </div>
    `;

    document.querySelector("#panel-user-name").textContent =
        user.name;

    // Saída da conta
    document
        .querySelector("#logout-button")
        .addEventListener("click", signOut);
}