// ==================== IMPORTAÇÕES ====================
import { signIn, getSession } from "../auth.js";
import { showMessage, clearMessage } from "../components/toast.js";

// ==================== CAMINHOS ====================
const ADMIN_URL = new URL(
    "../../../admin/users.html",
    import.meta.url
);

// ==================== ELEMENTOS ====================
const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginSubmit = document.querySelector("#login-submit");

// ==================== REDIRECIONAMENTO ====================
function redirectToPanel(user) {
    if (user.role !== "ADMIN") {
        return false;
    }

    window.location.replace(ADMIN_URL.href);

    return true;
}

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

        passwordInput.value = "";

        // Encaminhamento para a área do usuário
        if (redirectToPanel(user)) {
            return;
        }

        // Comportamento temporário para Professor e Aluno
        showMessage(
            `Login realizado com sucesso! Bem-vindo(a), ${user.name}.`,
            "success"
        );
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

if (session && !redirectToPanel(session.user)) {
    showMessage(
        `Você já está conectado como ${session.user.name}.`,
        "success"
    );
}