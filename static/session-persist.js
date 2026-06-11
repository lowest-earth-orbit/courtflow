const COURTFLOW_STORAGE_KEY = "courtflow-active-session";

function getElementHTML(id) {
    const element = document.getElementById(id);
    return element ? element.innerHTML : "";
}

function setElementHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html || "";
    }
}

function saveCourtFlowState() {
    const state = {
        savedAt: Date.now(),
        selectedSession: document.getElementById("session-select")?.value || "",
        playerPoolHTML: getElementHTML("player-pool"),
        courtsHTML: getElementHTML("courts"),
        matchHistory: typeof matchHistory !== "undefined" ? matchHistory : [],
        partnerCounts: typeof partnerCounts !== "undefined" ? partnerCounts : {},
        opponentCounts: typeof opponentCounts !== "undefined" ? opponentCounts : {}
    };

    localStorage.setItem(COURTFLOW_STORAGE_KEY, JSON.stringify(state));
}

function restoreCourtFlowState() {
    const rawState = localStorage.getItem(COURTFLOW_STORAGE_KEY);

    if (!rawState) return;

    const state = JSON.parse(rawState);

    if (state.selectedSession) {
        const sessionSelect = document.getElementById("session-select");
        if (sessionSelect) {
            sessionSelect.value = state.selectedSession;
        }
    }

    setElementHTML("player-pool", state.playerPoolHTML);
    setElementHTML("courts", state.courtsHTML);

    if (typeof matchHistory !== "undefined") {
        matchHistory.length = 0;
        matchHistory.push(...(state.matchHistory || []));
    }

    if (typeof partnerCounts !== "undefined") {
        Object.assign(partnerCounts, state.partnerCounts || {});
    }

    if (typeof opponentCounts !== "undefined") {
        Object.assign(opponentCounts, state.opponentCounts || {});
    }

    restoreRunningTimers();

    if (typeof updateAllPlayerDisplays === "function") {
        updateAllPlayerDisplays();
    }
}

function restoreRunningTimers() {
    document.querySelectorAll(".court-card.playing").forEach(courtCard => {
        if (courtCard.dataset.startTime) {
            startTimerFromExistingStartTime(courtCard);
        }
    });
}

function startTimerFromExistingStartTime(courtCard) {
    const timerDisplay = courtCard.querySelector(".timer-display");

    const timerId = setInterval(function () {
        const elapsedSeconds = Math.floor(
            (Date.now() - Number(courtCard.dataset.startTime)) / 1000
        );

        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsedSeconds);
        }

        const mode = getCourtMode(courtCard);
        const averageDuration = getLiveAverageDurationSeconds(
            mode,
            courtCard,
            elapsedSeconds
        );

        if (averageDuration && elapsedSeconds >= averageDuration * 0.8) {
            courtCard.classList.add("approaching-average");
        } else {
            courtCard.classList.remove("approaching-average");
        }
    }, 1000);

    courtTimers.set(courtCard, timerId);
}

function clearCourtFlow() {
    if (!confirm("Clear CourtFlow and remove the saved session?")) {
        return;
    }

    localStorage.removeItem(COURTFLOW_STORAGE_KEY);

    courtTimers.forEach(timerId => clearInterval(timerId));
    courtTimers.clear();

    const playerPool = document.getElementById("player-pool");
    if (playerPool) playerPool.innerHTML = "";

    document.querySelectorAll(".court-card").forEach(courtCard => {
        courtCard.classList.remove("playing", "approaching-average");
        courtCard.dataset.startTime = "";
        courtCard.dataset.expectedDuration = "";

        const timerDisplay = courtCard.querySelector(".timer-display");
        if (timerDisplay) timerDisplay.textContent = "00:00";

        const playersArea = courtCard.querySelector(".court-players");
        if (playersArea) playersArea.innerHTML = "";
    });

    if (typeof matchHistory !== "undefined") {
        matchHistory.length = 0;
    }

    if (typeof partnerCounts !== "undefined") {
        Object.keys(partnerCounts).forEach(key => delete partnerCounts[key]);
    }

    if (typeof opponentCounts !== "undefined") {
        Object.keys(opponentCounts).forEach(key => delete opponentCounts[key]);
    }

    const sessionSelect = document.getElementById("session-select");
    if (sessionSelect) sessionSelect.value = "";

    if (typeof updateAllPlayerDisplays === "function") {
        updateAllPlayerDisplays();
    }
}

document.addEventListener("DOMContentLoaded", function () {
    restoreCourtFlowState();

    const clearButton =
        document.getElementById("clear-courtflow")
        // document.getElementById("clear-courtflow-button") ||
        // document.getElementById("clear-all-btn");

    if (clearButton) {
        clearButton.addEventListener("click", clearCourtFlow);
    }

    document.addEventListener("click", function () {
        setTimeout(saveCourtFlowState, 100);
    });

    document.addEventListener("change", function () {
        setTimeout(saveCourtFlowState, 100);
    });

    document.addEventListener("drop", function () {
        setTimeout(saveCourtFlowState, 100);
    });
});