// ==================== IMPORTAÇÕES ====================

import { API_BASE_URL } from "./config.js";

// ==================== REQUISIÇÕES ====================

export async function apiRequest(
    endpoint,
    { method = "GET", body, token } = {}
) {
    const headers = {
        Accept: "application/json"
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Envio da requisição
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new Error(
            "Não foi possível conectar ao servidor. Tente novamente."
        );
    }

    // Leitura da resposta
    const contentType = response.headers.get("Content-Type");

    const data = response.status !== 204 &&
        contentType?.includes("application/json")
        ? await response.json()
        : null;

    // Tratamento de erro
    if (!response.ok) {
        const message = typeof data?.message === "string"
            ? data.message
            : "Não foi possível concluir a solicitação.";

        throw new Error(message);
    }

    return data;
}