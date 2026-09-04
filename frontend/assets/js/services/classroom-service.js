// ==================== IMPORTAÇÕES ====================

import { apiRequest } from "../api.js";

// ==================== CONSULTA DE TURMAS ====================

export async function getActiveClassrooms(token) {
    const classrooms = await apiRequest("/classrooms/active", { token });

    if (!Array.isArray(classrooms)) {
        throw new Error("O servidor retornou uma lista de turmas inválida.");
    }

    return classrooms;
}