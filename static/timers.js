const courtTimers = new Map();

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function startTimer(courtCard) {
    const timerDisplay = courtCard.querySelector(".timer-display");

    courtCard.dataset.startTime = Date.now();

    const timerId = setInterval(function () {
        const elapsedSeconds = Math.floor(
            (Date.now() - Number(courtCard.dataset.startTime)) / 1000
        );

        timerDisplay.textContent = formatTime(elapsedSeconds);

        const mode = getCourtMode(courtCard);
        const averageDuration = getLiveAverageDurationSeconds(
            mode,
            courtCard,
            elapsedSeconds
        );

        if (
            averageDuration &&
            elapsedSeconds >= averageDuration * 0.8
        ) {
            courtCard.classList.add("approaching-average");
        } else {
            courtCard.classList.remove("approaching-average");
        }


    }, 1000);

    courtTimers.set(courtCard, timerId);

    if (typeof saveCourtFlowState === "function") {
        saveCourtFlowState();
    }
}

function stopTimer(courtCard) {
    const timerId = courtTimers.get(courtCard);

    if (timerId) {
        clearInterval(timerId);
        courtTimers.delete(courtCard);
    }

    const startTime = Number(courtCard.dataset.startTime);

    if (!startTime) {
        return null;
    }

    const durationSeconds = Math.floor(
        (Date.now() - startTime) / 1000
    );

    courtCard.dataset.startTime = "";
    courtCard.dataset.expectedDuration = "";

    if (typeof saveCourtFlowState === "function") {
        saveCourtFlowState();
    }

    return durationSeconds;
}

function getLiveAverageDurationSeconds(mode, currentCourtCard, currentElapsedSeconds) {
    const completedMatches = getCompletedMatchesByMode(mode)
        .map(match => match.durationSeconds);

    const runningMatches = Array.from(
        document.querySelectorAll(".court-card.playing")
    )
        .filter(courtCard => getCourtMode(courtCard) === mode)
        .map(courtCard => {
            if (courtCard === currentCourtCard) {
                return currentElapsedSeconds;
            }

            const startTime = Number(courtCard.dataset.startTime);

            if (!startTime) return null;

            return Math.floor((Date.now() - startTime) / 1000);
        })
        .filter(duration => duration !== null);

    const durations = completedMatches.concat(runningMatches);

    if (durations.length === 0) return null;

    const total = durations.reduce((sum, duration) => sum + duration, 0);

    return Math.round(total / durations.length);
}