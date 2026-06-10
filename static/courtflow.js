let draggedPlayer = null;

// const courtTimers = new Map();
const matchHistory = [];
const partnerCounts = new Map();

// const playerPool = document.getElementById("player-pool");
// const sessionSelect = document.getElementById("session-select");

// let sessionStarted = false;
// let sessionEnded = false;
// let sessionStartTime = null;
// let playerDisplayInterval = null;

// const startSessionButton = document.getElementById("start-session-btn");
// const endSessionButton = document.getElementById("end-session-btn");

// if (startSessionButton) {
//     startSessionButton.addEventListener("click", function () {
//         sessionStarted = true;
//         sessionEnded = false;
//         sessionStartTime = Date.now();

//         document.querySelectorAll(".player").forEach(player => {
//             if (player.dataset.status === "waiting") {
//                 player.dataset.waitingSince = sessionStartTime;
//                 updatePlayerDisplay(player);
//             }
//         });

//         startSessionButton.disabled = true;
//         endSessionButton.disabled = false;

//         playerDisplayInterval = setInterval(updateAllPlayerDisplays, 1000);
//         updateAllPlayerDisplays();
//     });
// }

// if (endSessionButton) {
//     endSessionButton.addEventListener("click", function () {
//         sessionStarted = false;
//         sessionEnded = true;

//         if (playerDisplayInterval) {
//             clearInterval(playerDisplayInterval);
//             playerDisplayInterval = null;
//         }

//         document.querySelectorAll(".court-card.playing").forEach(courtCard => {
//             resetCourt(courtCard, true);
//         });

//         startSessionButton.disabled = false;
//         endSessionButton.disabled = true;
//         startSessionButton.textContent = "Start Session";
//     });
// }

// if (sessionSelect) {
//     sessionSelect.addEventListener("change", function () {
//         const session = sessionSelect.value;

//         if (!session) {
//             window.location.href = "/play";
//             return;
//         }

//         window.location.href = `/play?session=${session}`;
//     });
// }

function clearSuggestedMatch() {
    currentSuggestion = null;

    const panel = document.getElementById("suggested-match");

    if (panel) {
        panel.innerHTML = `<p>No suggestion yet</p>`;
    }
}

function sendSuggestionToCourt(courtNumber) {
    if (!currentSuggestion) return;

    const courtCards = Array.from(document.querySelectorAll(".court-card"));
    const courtCard = courtCards[courtNumber - 1];

    if (!courtCard) return;

    if (courtCard.classList.contains("disabled")) {
        alert("Court is disabled");
        return;
    }

    if (courtCard.classList.contains("playing")) {
        alert("Game is already running on that court");
        return;
    }

    if (getCourtPlayers(courtCard).length > 0) {
        alert("Court already has players on it");
        return;
    }

    courtCard.dataset.mode = currentSuggestion.mode;

    const modeButtons = courtCard.querySelectorAll(".court-mode-btn");

    modeButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === currentSuggestion.mode
        );
    });

    const teamA = courtCard.querySelector(".team-a");
    const teamB = courtCard.querySelector(".team-b");

    currentSuggestion.teamA.forEach(player => {
        player.dataset.status = "playing";
        updatePlayerDisplay(player);
        teamA.appendChild(player);
    });

    currentSuggestion.teamB.forEach(player => {
        player.dataset.status = "playing";
        updatePlayerDisplay(player);
        teamB.appendChild(player);
    });

    updateCourtReadyState(courtCard);
    clearSuggestedMatch();
}

// function getPlayerName(player) {
//     return player.dataset.name || player.textContent.trim();
// }

function getPairKey(playerA, playerB) {
    return [getPlayerName(playerA), getPlayerName(playerB)].sort().join(" + ");
}

let currentSuggestion = null;

function suggestNextMatch(mode) {
    const neededPlayers = mode === "singles" ? 2 : 4;

    const availablePlayers = Array.from(
        playerPool.querySelectorAll(".player")
    ).filter(player => player.dataset.type !== "coach");

    if (availablePlayers.length < neededPlayers) {
        return null;
    }

    availablePlayers.sort((a, b) => playerPriorityScore(a) - playerPriorityScore(b));

    // Take a small "best candidate pool", then shuffle within it
    const candidatePool = availablePlayers.slice(0, Math.min(availablePlayers.length, neededPlayers + 4));

    candidatePool.sort(() => Math.random() - 0.5);

    const selectedPlayers = candidatePool.slice(0, neededPlayers);

    if (mode === "singles") {
        return {
            mode: "singles",
            teamA: [selectedPlayers[0]],
            teamB: [selectedPlayers[1]]
        };
    }

    const bestTeams = chooseBestDoublesTeams(selectedPlayers);

    return {
        mode: "doubles",
        teamA: bestTeams[0],
        teamB: bestTeams[1]
    };
}

function updateSuggestedMatchPanel(suggestion) {
    const panel = document.getElementById("suggested-match");

    if (!panel) return;

    currentSuggestion = suggestion;

    if (!suggestion) {
        panel.innerHTML = `<p>Not enough players available</p>`;
        return;
    }

    panel.innerHTML = `
        <div class="suggestion-card">
            <button class="close-suggestion-btn">×</button>

            <strong>${suggestion.mode}</strong>
            <br>
            ${suggestion.teamA.map(getPlayerName).join(" + ")}
            <br>
            vs
            <br>
            ${suggestion.teamB.map(getPlayerName).join(" + ")}

            <div class="send-buttons">
                <button class="send-to-court-btn" data-court="1">1</button>
                <button class="send-to-court-btn" data-court="2">2</button>
                <button class="send-to-court-btn" data-court="3">3</button>
                <button class="send-to-court-btn" data-court="4">4</button>
            </div>
        </div>
    `;
}

function getPartnerCount(playerA, playerB) {
    return partnerCounts.get(getPairKey(playerA, playerB)) || 0;
}

function recordPartnerPair(playerA, playerB) {
    const key = getPairKey(playerA, playerB);
    partnerCounts.set(key, getPartnerCount(playerA, playerB) + 1);
}

// function initialisePlayerStats() {
//     document.querySelectorAll(".player").forEach(player => {
//         player.dataset.matchesPlayed = player.dataset.matchesPlayed || "0";

//         if (!player.dataset.waitingSince) {
//             player.dataset.waitingSince = Date.now();
//         }
//     });
// }

// function updatePlayerDisplay(player) {
//     const matchesStat = player.querySelector(".matches-stat");
//     const waitingStat = player.querySelector(".waiting-stat");

//     const matchesPlayed = Number(player.dataset.matchesPlayed || 0);
//     const status = player.dataset.status;

//     matchesStat.textContent = `G: ${matchesPlayed}`;

//     if (!sessionStarted) {
//         waitingStat.textContent = "00:00";
//         return;
//     }

//     if (status === "waiting") {
//         const waitingSince = Number(player.dataset.waitingSince || sessionStartTime);
//         const waitingSeconds = Math.floor((Date.now() - waitingSince) / 1000);

//         const mins = Math.floor(waitingSeconds / 60);
//         const secs = waitingSeconds % 60;

//         waitingStat.textContent =
//             `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
//     } else {
//         waitingStat.textContent = "W: -";
//     }
// }

function getCourtMode(courtCard) {
    return courtCard.dataset.mode || "doubles";
}

function maxPlayersPerSide(courtCard) {
    return getCourtMode(courtCard) === "singles" ? 1 : 2;
}

function maxPlayersPerCourt(courtCard) {
    return maxPlayersPerSide(courtCard) * 2;
}

function getCourtPlayers(courtCard) {
    return courtCard.querySelectorAll(".player");
}

function updateMatchHistoryPanel() {
    const panel = document.getElementById("match-history-panel");

    if (!panel) return;

    if (matchHistory.length === 0) {
        panel.innerHTML = `<p class="empty-history">No matches yet</p>`;
        return;
    }

    panel.innerHTML = "";

    matchHistory.slice().reverse().forEach((match, index) => {
        const item = document.createElement("div");
        item.classList.add("match-history-item");

        item.innerHTML = `
            <strong>${match.mode}</strong> — ${formatTime(match.durationSeconds)}
            <br>
            ${match.teamA.join(" + ")}
            <br>
            vs
            <br>
            ${match.teamB.join(" + ")}
        `;

        panel.appendChild(item);
    });
}

// function formatTime(seconds) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
// }

// function startTimer(courtCard) {
//     const timerDisplay = courtCard.querySelector(".timer-display");

//     courtCard.dataset.startTime = Date.now();

//     const timerId = setInterval(function () {
//         const elapsedSeconds = Math.floor(
//             (Date.now() - Number(courtCard.dataset.startTime)) / 1000
//         );

//         timerDisplay.textContent = formatTime(elapsedSeconds);
//     }, 1000);

//     courtTimers.set(courtCard, timerId);
// }

// function stopTimer(courtCard) {
//     const timerId = courtTimers.get(courtCard);

//     if (timerId) {
//         clearInterval(timerId);
//         courtTimers.delete(courtCard);
//     }

//     const startTime = Number(courtCard.dataset.startTime);

//     if (!startTime) {
//         return null;
//     }

//     const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

//     courtCard.dataset.startTime = "";

//     return durationSeconds;
// }

function logCompletedMatch(courtCard, durationSeconds) {
    const teamA = Array.from(courtCard.querySelector(".team-a").querySelectorAll(".player"));
    const teamB = Array.from(courtCard.querySelector(".team-b").querySelectorAll(".player"));

    const matchRecord = {
        mode: getCourtMode(courtCard),
        durationSeconds: durationSeconds,
        endedAt: new Date().toISOString(),
        teamA: teamA.map(getPlayerName),
        teamB: teamB.map(getPlayerName)
    };

    matchHistory.push(matchRecord);
    updateMatchHistoryPanel();

    [...teamA, ...teamB].forEach(player => {
        const currentMatches = Number(player.dataset.matchesPlayed || 0);
        player.dataset.matchesPlayed = currentMatches + 1;
    });

    if (teamA.length === 2) {
        recordPartnerPair(teamA[0], teamA[1]);
    }

    if (teamB.length === 2) {
        recordPartnerPair(teamB[0], teamB[1]);
    }

    console.log("Match history:", matchHistory);
    console.log("Partner counts:", partnerCounts);
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
    dropzone.classList.remove("full");

    startStopButton.textContent = "Start Game";

    if (timerDisplay) {
        timerDisplay.textContent = "00:00";
    }
}

function updateCourtReadyState(courtCard) {
    const players = getCourtPlayers(courtCard);
    const dropzone = courtCard.querySelector(".court-dropzone");

    if (players.length === maxPlayersPerCourt(courtCard)) {
        courtCard.classList.add("ready");
        dropzone.classList.add("full");
    } else {
        courtCard.classList.remove("ready");
        dropzone.classList.remove("full");
    }
}

// function playerPriorityScore(player) {
//     const matchesPlayed = Number(player.dataset.matchesPlayed || 0);
//     const waitingSince = Number(player.dataset.waitingSince || Date.now());
//     const waitingSeconds = (Date.now() - waitingSince) / 1000;

//     return matchesPlayed * 1000 - waitingSeconds;
// }

function chooseBestDoublesTeams(selectedPlayers) {
    const [a, b, c, d] = selectedPlayers;

    const options = [
        [[a, b], [c, d]],
        [[a, c], [b, d]],
        [[a, d], [b, c]]
    ];

    options.sort((optionA, optionB) => {
        const scoreA =
            getPartnerCount(optionA[0][0], optionA[0][1]) +
            getPartnerCount(optionA[1][0], optionA[1][1]);

        const scoreB =
            getPartnerCount(optionB[0][0], optionB[0][1]) +
            getPartnerCount(optionB[1][0], optionB[1][1]);

        return scoreA - scoreB;
    });

    return options[0];
}

function assignPlayersToCourt(courtCard, selectedPlayers) {
    const teamA = courtCard.querySelector(".team-a");
    const teamB = courtCard.querySelector(".team-b");

    selectedPlayers.forEach(player => {
        player.dataset.status = "playing";
        updatePlayerDisplay(player);
    });

    if (getCourtMode(courtCard) === "singles") {
        teamA.appendChild(selectedPlayers[0]);
        teamB.appendChild(selectedPlayers[1]);
    } else {
        const bestTeams = chooseBestDoublesTeams(selectedPlayers);

        bestTeams[0].forEach(player => teamA.appendChild(player));
        bestTeams[1].forEach(player => teamB.appendChild(player));
    }

    updateCourtReadyState(courtCard);
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

        const availablePlayers = Array.from(
            playerPool.querySelectorAll(".player")
        ).filter(player => player.dataset.type !== "coach");

        if (availablePlayers.length < maxPlayersPerCourt(courtCard)) {
            alert("Not enough players in the pool");
            return;
        }

        availablePlayers.sort((a, b) => playerPriorityScore(a) - playerPriorityScore(b));

        const selectedPlayers = availablePlayers.slice(0, maxPlayersPerCourt(courtCard));

        assignPlayersToCourt(courtCard, selectedPlayers);
    });

    clearButton.addEventListener("click", function () {
        resetCourt(courtCard, false);
    });

    disableButton.addEventListener("click", function () {
        const isDisabled = courtCard.classList.toggle("disabled");

        resetCourt(courtCard, false);

        disableButton.textContent = isDisabled ? "Enable Court" : "Disable Court";
    });
});

document.querySelectorAll(".player").forEach(player => {
    player.addEventListener("dragstart", function () {
        draggedPlayer = player;
    });
});

document.querySelectorAll(".court-half").forEach(half => {
    half.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    half.addEventListener("drop", function () {
        if (!draggedPlayer) return;

        const courtCard = half.closest(".court-card");

        if (courtCard.classList.contains("disabled")) {
            alert("Court is disabled");
            return;
        }

        if (courtCard.classList.contains("playing")) {
            alert("Can't add players while game is running");
            return;
        }

        const playersOnSide = half.querySelectorAll(".player");

        if (playersOnSide.length >= maxPlayersPerSide(courtCard)) {
            alert("That side is full");
            return;
        }

        half.appendChild(draggedPlayer);
        draggedPlayer.dataset.status = "playing";
        updatePlayerDisplay(draggedPlayer);

        updateCourtReadyState(courtCard);

        draggedPlayer = null;
    });
});

playerPool.addEventListener("dragover", function (event) {
    event.preventDefault();
});

playerPool.addEventListener("drop", function () {
    if (!draggedPlayer) return;

    const oldCourt = draggedPlayer.closest(".court-card");

    if (oldCourt && oldCourt.classList.contains("playing")) {
        alert("Can't remove a player while the game is running");
        return;
    }

    playerPool.appendChild(draggedPlayer);
    draggedPlayer.dataset.status = "waiting";
    draggedPlayer.dataset.waitingSince = Date.now();
    updatePlayerDisplay(draggedPlayer);

    if (oldCourt) {
        updateCourtReadyState(oldCourt);
    }

    draggedPlayer = null;

});

// function updateAllPlayerDisplays() {
// document.querySelectorAll(".player").forEach(player => {
//     updatePlayerDisplay(player);
// });
// }

// setInterval(updateAllPlayerDisplays, 1000);
// updateAllPlayerDisplays();

const suggestButton = document.getElementById("suggest-match-btn");
const suggestMode = document.getElementById("suggest-mode");

if (suggestButton && suggestMode) {
    suggestButton.addEventListener("click", function () {
        const suggestion = suggestNextMatch(suggestMode.value);
        updateSuggestedMatchPanel(suggestion);
    });
}

const suggestedMatchPanel = document.getElementById("suggested-match");

if (suggestedMatchPanel) {
    suggestedMatchPanel.addEventListener("click", function (event) {
        if (event.target.classList.contains("close-suggestion-btn")) {
            clearSuggestedMatch();
        }

        if (event.target.classList.contains("send-to-court-btn")) {
            const courtNumber = Number(event.target.dataset.court);
            sendSuggestionToCourt(courtNumber);
        }
    });
}