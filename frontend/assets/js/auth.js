// ==================== IMPORTAÇÕES ====================

import { login, getAccount } from "./services/auth-service.js";

// ==================== CONFIGURAÇÕES ====================

const SESSION_KEY = "skillkids-session";

const LOGIN_URL = new URL(
    "../../index.html",
    import.meta.url
);

// ==================== LIMPEZA DA SESSÃO ====================

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

// ==================== ENTRADA ====================

export async function signIn(email, password) {
    clearSession();

    const startedAt = Date.now();
    const authentication = await login(email, password);

    const user = await getAccount(
        authentication.accessToken
    );

    // A API informa a duração em segundos
    const expiresAt =
        startedAt +
        authentication.expiresIn * 1000;

    if (
        !Number.isFinite(expiresAt) ||
        expiresAt <= Date.now()
    ) {
        throw new Error(
            "A sessão expirou. Entre novamente."
        );
    }

    const session = {
        accessToken: authentication.accessToken,
        expiresAt,
        user: {
            id: user.id,
            name: user.name,
            role: user.role
        }
    };

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

    return session.user;
}

// ==================== CONSULTA DA SESSÃO ====================

export function getSession() {
    const storedSession =
        sessionStorage.getItem(SESSION_KEY);

    if (!storedSession) {
        return null;
    }

    let session;

    try {
        session = JSON.parse(storedSession);
    } catch {
        clearSession();
        return null;
    }

    if (
        !session?.accessToken ||
        !session?.user?.id ||
        !Number.isFinite(session.expiresAt) ||
        Date.now() >= session.expiresAt
    ) {
        clearSession();
        return null;
    }

    return session;
}

// ==================== ATUALIZAÇÃO DA SESSÃO ====================

export function updateSessionUser(user) {
    const session = getSession();

    if (!session) {
        return null;
    }

    session.user = {
        id: user.id ?? session.user.id,
        name: user.name ?? session.user.name,
        role: user.role ?? session.user.role
    };

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

    return session.user;
}

// ==================== TOKEN ====================

export function getToken() {
    return getSession()?.accessToken ?? null;
}

// ==================== SAÍDA ====================

export function signOut() {
    clearSession();
    window.location.replace(LOGIN_URL.href);
}