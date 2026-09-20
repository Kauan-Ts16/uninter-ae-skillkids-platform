// ==================== CONFIGURAÇÕES ====================

const DURATION = 5000;
const EXIT_DURATION = 200;

// ==================== ELEMENTOS E CONTROLE ====================

const container = document.querySelector("#toast-container");

let dismissTimer;

// ==================== LIMPEZA ====================

export function clearMessage() {
    clearTimeout(dismissTimer);
    container.replaceChildren();
}

// ==================== FECHAMENTO ====================

function hideToast() {
    clearTimeout(dismissTimer);

    const toast = container.firstElementChild;

    if (!toast) {
        return;
    }

    toast.classList.add("is-leaving");

    setTimeout(() => {
        toast.remove();
    }, EXIT_DURATION);
}

// ==================== EXIBIÇÃO ====================

export function showMessage(message, type = "success") {
    clearMessage();

    // Estrutura
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.dataset.type = type === "error" ? "error" : "success";

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.textContent = toast.dataset.type === "error" ? "!" : "✓";
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("p");
    text.className = "toast-message";
    text.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "toast-close";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Fechar notificação");

    // Controle do tempo
    function pauseTimer() {
        clearTimeout(dismissTimer);
    }

    function resumeTimer() {
        if (!toast.isConnected || toast.classList.contains("is-leaving")) {
            return;
        }

        pauseTimer();

        if (
            toast.matches(":hover") ||
            toast.contains(document.activeElement)
        ) {
            return;
        }

        dismissTimer = setTimeout(hideToast, DURATION);
    }

    // Eventos
    closeButton.addEventListener("click", hideToast);

    toast.addEventListener("mouseenter", pauseTimer);
    toast.addEventListener("mouseleave", resumeTimer);
    toast.addEventListener("focusin", pauseTimer);
    toast.addEventListener("focusout", resumeTimer);

    // Montagem
    toast.append(icon, text, closeButton);
    container.append(toast);

    resumeTimer();
}