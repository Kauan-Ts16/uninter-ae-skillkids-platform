// ==================== IMPORTAÇÕES ====================

import { register } from "../services/auth-service.js";

import { showMessage, clearMessage } from "../components/toast.js";

// ==================== CONFIGURAÇÕES ====================

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// ==================== ELEMENTOS ====================

const registerForm = document.querySelector("#register-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const registerSubmit = document.querySelector("#register-submit");

// ==================== MENSAGENS ====================



// ==================== CARREGAMENTO ====================

function setLoading(loading) {
    registerSubmit.disabled = loading;

    registerSubmit.textContent = loading
        ? "Criando conta..."
        : "Criar minha conta";
}

// ==================== VALIDAÇÕES ====================

function validateRegister(data) {
    if (data.name.length < 3 || data.name.length > 100) {
        throw new Error("Informe um nome entre 3 e 100 caracteres.");
    }

    if (
        data.email.length < 6 ||
        data.email.length > 254 ||
        !EMAIL_REGEX.test(data.email)
    ) {
        throw new Error("Informe um e-mail válido.");
    }

    if (
        !data.password.trim() ||
        data.password.length < 6 ||
        data.password.length > 50
    ) {
        throw new Error(
            "Informe uma senha de 6 a 50 caracteres, não formada apenas por espaços."
        );
    }

    if (!["STUDENT", "TEACHER"].includes(data.role)) {
        throw new Error("Selecione Aluno ou Professor.");
    }
}

// ==================== ENVIO DO FORMULÁRIO ====================

async function handleRegister(event) {
    event.preventDefault();

    if (registerSubmit.disabled) {
        return;
    }

    clearMessage();

    const selectedRole = registerForm.querySelector(
        'input[name="role"]:checked'
    );

    const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        role: selectedRole?.value
    };

    try {
        validateRegister(data);
        setLoading(true);

        await register(data);

        registerForm.reset();

        showMessage(
            "Conta criada! Clique em Entrar.",
            "success"
        );
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        setLoading(false);
    }
}

// ==================== EVENTOS ====================

registerForm.addEventListener("submit", handleRegister);

// ==================== INICIALIZAÇÃO ====================

setLoading(false);