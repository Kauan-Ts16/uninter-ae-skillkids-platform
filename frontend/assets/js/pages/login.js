// ==================== IMPORTAÇÕES ====================

import {
    signIn,
    getSession
} from "../auth.js";

import {
    showMessage,
    clearMessage
} from "../components/toast.js";

// ==================== CAMINHOS ====================

const ADMIN_URL = new URL(
    "../../../admin/users.html",
    import.meta.url
);

const TEACHER_URL = new URL(
    "../../../teacher/classrooms.html",
    import.meta.url
);

const STUDENT_URL = new URL(
    "../../../student/courses.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginSubmit = document.querySelector("#login-submit");

// ==================== REDIRECIONAMENTO ====================

function redirectToPanel(user) {
    const panelUrls = {
        ADMIN: ADMIN_URL,
        TEACHER: TEACHER_URL,
        STUDENT: STUDENT_URL
    };

    const panelUrl = panelUrls[user.role];

    if (!panelUrl) {
        return false;
    }

    window.location.replace(panelUrl.href);

    return true;
}

// ==================== CARREGAMENTO ====================

function setLoading(loading) {
    loginSubmit.disabled = loading;

    loginSubmit.textContent = loading
        ? "Entrando..."
        : "Entrar";
}

// ==================== ENVIO DO FORMULÁRIO ====================

async function handleLogin(event) {
    event.preventDefault();

    if (loginSubmit.disabled) {
        return;
    }

    clearMessage();
    setLoading(true);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const user = await signIn(
            email,
            password
        );

        passwordInput.value = "";

        if (redirectToPanel(user)) {
            return;
        }

        showMessage(
            "Não foi possível identificar o painel do usuário.",
            "error"
        );
    } catch (error) {
        showMessage(
            error.message,
            "error"
        );
    } finally {
        setLoading(false);
    }
}

// ==================== EVENTOS ====================

loginForm.addEventListener(
    "submit",
    handleLogin
);

// ==================== INICIALIZAÇÃO ====================

setLoading(false);

const session = getSession();

if (
    session &&
    !redirectToPanel(session.user)
) {
    showMessage(
        `Você já está conectado como ${session.user.name}.`,
        "success"
    );
}