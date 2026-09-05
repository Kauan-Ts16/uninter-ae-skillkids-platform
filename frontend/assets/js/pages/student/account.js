// ==================== IMPORTAÇÕES ====================

import {
    getSession,
    getToken,
    signOut,
    updateSessionUser
} from "../../auth.js";

import { renderStudentPanel } from "../../components/student-panel.js";

import {
    clearMessage,
    showMessage
} from "../../components/toast.js";

import {
    changeAccountPassword,
    getAccount,
    updateAccount
} from "../../services/auth-service.js";

// ==================== CAMINHOS ====================

const LOGIN_URL = new URL(
    "../../../../index.html",
    import.meta.url
);

// ==================== CONFIGURAÇÕES ====================

const ROLE_LABELS = {
    ADMIN: "Administrador",
    TEACHER: "Professor",
    STUDENT: "Aluno"
};

// ==================== ELEMENTOS ====================

const accountFeedback = document.querySelector(
    "#account-feedback"
);

const accountContent = document.querySelector(
    "#account-content"
);

const accountForm = document.querySelector(
    "#account-form"
);

const accountName = document.querySelector(
    "#account-name"
);

const accountEmail = document.querySelector(
    "#account-email"
);

const accountRole = document.querySelector(
    "#account-role"
);

const accountSubmit = document.querySelector(
    "#account-submit"
);

const passwordForm = document.querySelector(
    "#account-password-form"
);

const accountPassword = document.querySelector(
    "#account-password"
);

const accountPasswordConfirmation = document.querySelector(
    "#account-password-confirmation"
);

const passwordSubmit = document.querySelector(
    "#account-password-submit"
);

// ==================== ESTADO ====================

let accountUser = null;

let isLoading = false;
let isUpdatingAccount = false;
let isChangingPassword = false;

// ==================== CONTROLE DOS FORMULÁRIOS ====================

function updateControls() {
    const unavailable =
        isLoading ||
        isUpdatingAccount ||
        isChangingPassword ||
        !accountUser;

    accountName.disabled = unavailable;
    accountEmail.disabled = unavailable;
    accountSubmit.disabled = unavailable;

    accountPassword.disabled = unavailable;
    accountPasswordConfirmation.disabled = unavailable;
    passwordSubmit.disabled = unavailable;
}

function setLoading(loading) {
    isLoading = loading;
    updateControls();
}

function setUpdatingAccount(updating) {
    isUpdatingAccount = updating;

    accountSubmit.textContent = updating
        ? "Salvando..."
        : "Salvar alterações";

    updateControls();
}

function setChangingPassword(changing) {
    isChangingPassword = changing;

    passwordSubmit.textContent = changing
        ? "Alterando..."
        : "Alterar senha";

    updateControls();
}

// ==================== EXIBIÇÃO DOS DADOS ====================

function renderAccount(user) {
    accountName.value = user.name ?? "";
    accountEmail.value = user.email ?? "";

    accountRole.textContent =
        ROLE_LABELS[user.role] ??
        user.role ??
        "Não informado";

    accountFeedback.hidden = true;
    accountContent.hidden = false;
}

// ==================== ERROS ====================

function handleRequestError(error, fallbackMessage) {
    if (error.status === 401) {
        signOut();
        return;
    }

    showMessage(
        error.message || fallbackMessage,
        "error"
    );
}

// ==================== CONSULTA DA CONTA ====================

async function loadAccount() {
    if (isLoading) {
        return;
    }

    clearMessage();

    accountUser = null;
    accountContent.hidden = true;
    accountFeedback.hidden = false;
    accountFeedback.textContent =
        "Carregando dados da conta...";

    setLoading(true);

    try {
        accountUser = await getAccount(getToken());

        renderAccount(accountUser);
    } catch (error) {
        accountFeedback.textContent =
            "Não foi possível carregar os dados da conta.";

        handleRequestError(
            error,
            "Não foi possível carregar os dados da conta."
        );
    } finally {
        setLoading(false);
    }
}

// ==================== ATUALIZAÇÃO DA CONTA ====================

async function handleAccountSubmit(event) {
    event.preventDefault();

    if (isUpdatingAccount || !accountUser) {
        return;
    }

    const data = {
        name: accountName.value.trim(),
        email: accountEmail.value.trim()
    };

    clearMessage();
    setUpdatingAccount(true);

    try {
        accountUser = await updateAccount(
            data,
            getToken()
        );

        renderAccount(accountUser);

        const sessionUser = updateSessionUser(
            accountUser
        );

        renderStudentPanel(
            sessionUser ?? accountUser
        );

        showMessage(
            "Dados da conta atualizados com sucesso."
        );
    } catch (error) {
        handleRequestError(
            error,
            "Não foi possível atualizar os dados da conta."
        );
    } finally {
        setUpdatingAccount(false);
    }
}

// ==================== ALTERAÇÃO DE SENHA ====================

async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (isChangingPassword || !accountUser) {
        return;
    }

    const password = accountPassword.value;
    const confirmation =
        accountPasswordConfirmation.value;

    if (password !== confirmation) {
        accountPasswordConfirmation.setCustomValidity(
            "As senhas não coincidem."
        );

        accountPasswordConfirmation.reportValidity();
        return;
    }

    clearMessage();
    setChangingPassword(true);

    try {
        await changeAccountPassword(
            password,
            getToken()
        );

        passwordForm.reset();

        showMessage(
            "Senha alterada com sucesso."
        );
    } catch (error) {
        handleRequestError(
            error,
            "Não foi possível alterar a senha."
        );
    } finally {
        setChangingPassword(false);
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

    accountForm.addEventListener(
        "submit",
        handleAccountSubmit
    );

    passwordForm.addEventListener(
        "submit",
        handlePasswordSubmit
    );

    accountPasswordConfirmation.addEventListener(
        "input",
        () => {
            accountPasswordConfirmation.setCustomValidity("");
        }
    );

    await loadAccount();
}

initializePage();