const courtTimers = new Map();

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function startTimer(courtCard) {
    const timerDisplay = courtCard.querySelector(".timer-display");

    courtCard.dataset.startTime = Date.now();

    const mode = getCourtMode(courtCard);

    const averageDuration = getAverageDurationSeconds(mode);

    courtCard.dataset.expectedDuration =
        averageDuration || "";

    const timerId = setInterval(function () {
        const elapsedSeconds = Math.floor(
            (Date.now() - Number(courtCard.dataset.startTime)) / 1000
        );

        timerDisplay.textContent = formatTime(elapsedSeconds);

        const expectedDuration = Number(
            courtCard.dataset.expectedDuration
        );

        if (
            expectedDuration &&
            elapsedSeconds >= expectedDuration * 0.8
        ) {
            courtCard.classList.add("approaching-average");
        }
    }, 1000);

    courtTimers.set(courtCard, timerId);
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

    return durationSeconds;
}