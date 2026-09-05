// ==================== IMPORTAÇÕES ====================

import { signOut } from "../auth.js";

// ==================== CAMINHOS ====================

const LOGO_URL = new URL(
    "../../images/skillkids-logo.png",
    import.meta.url
);

const CLASSROOMS_URL = new URL(
    "../../../teacher/classrooms.html",
    import.meta.url
);

// ==================== PÁGINAS ====================

const CLASSROOM_PAGES = new Set([
    "classrooms.html",
    "classroom.html"
]);

// ==================== CONTROLE DOS EVENTOS ====================

let panelEventsController;

// ==================== PÁGINA ATUAL ====================

function getCurrentPage() {
    const pathname = window.location.pathname;

    return pathname.split("/").pop() || "classrooms.html";
}

function getCurrentPageAttribute(active) {
    return active
        ? 'aria-current="page"'
        : "";
}

// ==================== PAINEL DO PROFESSOR ====================

export function renderTeacherPanel(user) {
    const header = document.querySelector("#teacher-header");

    if (!header) {
        return;
    }

    panelEventsController?.abort();
    panelEventsController = new AbortController();

    const { signal } = panelEventsController;

    const currentPage = getCurrentPage();
    const classroomsActive = CLASSROOM_PAGES.has(currentPage);

    header.innerHTML = `
        <div class="teacher-header-inner">
            <a
                class="teacher-brand"
                href="${CLASSROOMS_URL.href}"
                aria-label="SkillKids — Minhas turmas"
            >
                <img src="${LOGO_URL.href}" alt="SkillKids">
            </a>

            <nav
                class="teacher-navigation"
                aria-label="Menu do professor"
            >
                <a
                    class="teacher-navigation-link"
                    href="${CLASSROOMS_URL.href}"
                    ${getCurrentPageAttribute(classroomsActive)}
                >
                    Minhas turmas
                </a>

                <button
                    class="teacher-navigation-link"
                    type="button"
                    disabled
                >
                    Acompanhamento
                </button>

                <button
                    class="teacher-navigation-link"
                    type="button"
                    disabled
                >
                    Conteúdos
                </button>
            </nav>

            <div
                id="teacher-account"
                class="teacher-account"
            >
                <button
                    id="teacher-account-toggle"
                    class="teacher-account-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-controls="teacher-account-menu"
                >
                    <span
                        id="teacher-account-avatar"
                        class="teacher-account-avatar"
                        aria-hidden="true"
                    ></span>

                    <span class="teacher-account-label">
                        Minha conta
                    </span>

                    <svg
                        class="teacher-account-chevron"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="m7 10 5 5 5-5"></path>
                    </svg>
                </button>

                <div
                    id="teacher-account-menu"
                    class="teacher-account-menu"
                    hidden
                >
                    <button
                        class="teacher-account-menu-button"
                        type="button"
                        disabled
                    >
                        Gerenciar conta
                    </button>

                    <button
                        id="teacher-logout"
                        class="teacher-account-menu-button teacher-account-menu-button--logout"
                        type="button"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </div>
    `;

    const account = document.querySelector(
        "#teacher-account"
    );

    const accountToggle = document.querySelector(
        "#teacher-account-toggle"
    );

    const accountMenu = document.querySelector(
        "#teacher-account-menu"
    );

    const accountAvatar = document.querySelector(
        "#teacher-account-avatar"
    );

    const logoutButton = document.querySelector(
        "#teacher-logout"
    );

    const initial = user.name
        ?.trim()
        .charAt(0)
        .toUpperCase() || "P";

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