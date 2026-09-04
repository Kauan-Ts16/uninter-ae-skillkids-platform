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

// ==================== PAINEL ADMINISTRATIVO ====================
export function renderAdminPanel(user) {
    const sidebar = document.querySelector("#panel-sidebar");
    const header = document.querySelector("#panel-header");

    // Menu lateral
    sidebar.innerHTML = `
        <a
            class="panel-brand"
            href="${USERS_URL.href}"
            aria-label="SkillKids — Usuários"
        >
            <img src="${LOGO_URL.href}" alt="SkillKids">
        </a>

        <nav aria-label="Menu administrativo">
            <ul class="panel-menu">
                <li>
                    <a
                        class="panel-menu-link"
                        href="${USERS_URL.href}"
                        aria-current="page"
                    >
                        Usuários
                    </a>
                </li>

                <li>
                    <button class="panel-menu-link" type="button" disabled>
                        Turmas
                    </button>
                </li>

                <li>
                    <button class="panel-menu-link" type="button" disabled>
                        Cursos
                    </button>
                </li>

                <li>
                    <button class="panel-menu-link" type="button" disabled>
                        Exercícios
                    </button>
                </li>

                <li>
                    <button class="panel-menu-link" type="button" disabled>
                        Minha conta
                    </button>
                </li>
            </ul>
        </nav>

        <div class="panel-sidebar-footer">
            <button
                id="logout-button"
                class="panel-menu-link panel-menu-link--logout"
                type="button"
            >
                Sair
            </button>
        </div>
    `;

    // Cabeçalho
    header.innerHTML = `
        <p class="panel-header-title">Área administrativa</p>

        <div class="panel-account">
            <span id="panel-user-name" class="panel-account-name"></span>
            <span class="panel-account-role">Administrador</span>
        </div>
    `;

    document.querySelector("#panel-user-name").textContent = user.name;

    // Saída da conta
    document.querySelector("#logout-button")
        .addEventListener("click", signOut);
}