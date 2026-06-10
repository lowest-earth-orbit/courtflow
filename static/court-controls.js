// function assignPlayersToCourt(courtCard, selectedPlayers) {
//     const teamA = courtCard.querySelector(".team-a");
//     const teamB = courtCard.querySelector(".team-b");

//     selectedPlayers.forEach(player => {
//         player.dataset.status = "playing";
//         updatePlayerDisplay(player);
//     });

//     if (getCourtMode(courtCard) === "singles") {
//         teamA.appendChild(selectedPlayers[0]);
//         teamB.appendChild(selectedPlayers[1]);
//     } else {
//         const bestTeams = chooseBestDoublesTeams(selectedPlayers);

//         bestTeams[0].forEach(player => teamA.appendChild(player));
//         bestTeams[1].forEach(player => teamB.appendChild(player));
//     }

//     updateCourtReadyState(courtCard);
// }
function sendMatchToCourt(courtCard, suggestion) {
    if (!suggestion) return;

    courtCard.dataset.mode = suggestion.mode;

    const modeButtons = courtCard.querySelectorAll(".court-mode-btn");

    modeButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === suggestion.mode
        );
    });

    const teamA = courtCard.querySelector(".team-a");
    const teamB = courtCard.querySelector(".team-b");

    suggestion.teamA.forEach(player => {
        player.dataset.status = "playing";
        updatePlayerDisplay(player);
        teamA.appendChild(player);
    });

    suggestion.teamB.forEach(player => {
        player.dataset.status = "playing";
        updatePlayerDisplay(player);
        teamB.appendChild(player);
    });

    updateCourtReadyState(courtCard);
}

function resetCourt(courtCard, shouldLogMatch = false) {
    const dropzone = courtCard.querySelector(".court-dropzone");
    const startStopButton = courtCard.querySelector(".start-stop-btn");
    const timerDisplay = courtCard.querySelector(".timer-display");
    const players = getCourtPlayers(courtCard);

    if (shouldLogMatch) {
        const durationSeconds = stopTimer(courtCard);

        if (durationSeconds !== null) {
            logCompletedMatch(courtCard, durationSeconds);
        }
    } else {
        stopTimer(courtCard);
    }

    players.forEach(player => {
        player.dataset.status = "waiting";
        player.dataset.waitingSince = Date.now();
        updatePlayerDisplay(player);
        playerPool.appendChild(player);
    });

    courtCard.classList.remove("playing");
    courtCard.classList.remove("ready");
    courtCard.classList.remove("approaching-average");
    dropzone.classList.remove("full");
    
    startStopButton.textContent = "Start Game";

    if (timerDisplay) {
        timerDisplay.textContent = "00:00";
    }
}

initialisePlayerStats();

document.querySelectorAll(".court-card").forEach(courtCard => {
    courtCard.dataset.mode = "doubles";

    const startStopButton = courtCard.querySelector(".start-stop-btn");
    const assignButton = courtCard.querySelector(".assign-btn");
    const clearButton = courtCard.querySelector(".clear-btn");
    const disableButton = courtCard.querySelector(".disable-btn");
    const modeButtons = courtCard.querySelectorAll(".court-mode-btn");

    modeButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (courtCard.classList.contains("playing")) {
                alert("Can't change mode while a game is running");
                return;
            }

            if (getCourtPlayers(courtCard).length > 0) {
                alert("Clear the court before changing singles/doubles");
                return;
            }

            courtCard.dataset.mode = button.dataset.mode;

            modeButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            updateCourtReadyState(courtCard);
        });
    });

    startStopButton.addEventListener("click", function () {
        if (courtCard.classList.contains("disabled")) {
            alert("Court is disabled");
            return;
        }

        const players = getCourtPlayers(courtCard);

        if (!courtCard.classList.contains("playing")) {
            if (players.length !== maxPlayersPerCourt(courtCard)) {
                alert("Need the right number of players before starting the game");
                return;
            }

            courtCard.classList.remove("ready");
            courtCard.classList.add("playing");
            startStopButton.textContent = "Stop Game";
            startTimer(courtCard);
            return;
        }

        resetCourt(courtCard, true);
    });

    assignButton.addEventListener("click", function () {
        if (courtCard.classList.contains("disabled")) {
            alert("Court is disabled");
            return;
        }

        if (courtCard.classList.contains("playing")) {
            alert("Game is already running");
            return;
        }

        if (getCourtPlayers(courtCard).length > 0) {
            alert("Court already has players on it");
            return;
        }

        // const availablePlayers = Array.from(
        //     playerPool.querySelectorAll(".player")
        // ).filter(player => player.dataset.type !== "coach");

        // if (availablePlayers.length < maxPlayersPerCourt(courtCard)) {
        //     alert("Not enough players in the pool");
        //     return;
        // }

        // availablePlayers.sort(
        //     (a, b) => playerPriorityScore(a) - playerPriorityScore(b)
        // );

        // const selectedPlayers = availablePlayers.slice(
        //     0,
        //     maxPlayersPerCourt(courtCard)
        // );

        // assignPlayersToCourt(courtCard, selectedPlayers);
        const suggestion = buildMatchSuggestion(getCourtMode(courtCard));

        if (!suggestion) {
            alert("Not enough players in the pool");
            return;
        }

        sendMatchToCourt(courtCard, suggestion);
    });

    clearButton.addEventListener("click", function () {
        resetCourt(courtCard, false);
    });

    disableButton.addEventListener("click", function () {
        const isDisabled = courtCard.classList.toggle("disabled");

        resetCourt(courtCard, false);

        disableButton.textContent = isDisabled
            ? "Enable Court"
            : "Disable Court";
    });
});

updateAllPlayerDisplays();