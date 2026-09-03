// ==================== IMPORTAÇÕES ====================

import { signIn, getSession } from "../auth.js";

import { showMessage, clearMessage } from "../components/toast.js";

// ==================== ELEMENTOS ====================

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginSubmit = document.querySelector("#login-submit");

// ==================== MENSAGENS ====================



// ==================== CARREGAMENTO ====================

function setLoading(loading) {
    loginSubmit.disabled = loading;
    loginSubmit.textContent = loading ? "Entrando..." : "Entrar";
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
        const user = await signIn(email, password);

        showMessage(
            `Login realizado com sucesso! Bem-vindo(a), ${user.name}.`,
            "success"
        );

        passwordInput.value = "";
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        setLoading(false);
    }
}

// ==================== EVENTOS ====================

loginForm.addEventListener("submit", handleLogin);

// ==================== INICIALIZAÇÃO ====================

setLoading(false);

const session = getSession();

if (session) {
    showMessage(
        `Você já está conectado como ${session.user.name}.`,
        "success"
    );
}