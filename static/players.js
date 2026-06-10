const playerPool = document.getElementById("player-pool");

function getPlayerName(player) {
    return player.dataset.name || player.textContent.trim();
}

function initialisePlayerStats() {
    document.querySelectorAll(".player").forEach(player => {
        player.dataset.matchesPlayed = player.dataset.matchesPlayed || "0";

        if (!player.dataset.waitingSince) {
            player.dataset.waitingSince = Date.now();
        }
    });
}

function updatePlayerDisplay(player) {
    const matchesStat = player.querySelector(".matches-stat");
    const waitingStat = player.querySelector(".waiting-stat");

    const matchesPlayed = Number(player.dataset.matchesPlayed || 0);
    const status = player.dataset.status;

    matchesStat.textContent = `G: ${matchesPlayed}`;

    if (!sessionStarted) {
        waitingStat.textContent = "00:00";
        return;
    }

    if (status === "waiting") {
        const waitingSince = Number(player.dataset.waitingSince || sessionStartTime);
        const waitingSeconds = Math.floor((Date.now() - waitingSince) / 1000);

        const mins = Math.floor(waitingSeconds / 60);
        const secs = waitingSeconds % 60;

        waitingStat.textContent =
            `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    } else {
        waitingStat.textContent = "W: -";
    }
}

function updateAllPlayerDisplays() {
    document.querySelectorAll(".player").forEach(player => {
        updatePlayerDisplay(player);
    });
}

function playerPriorityScore(player) {
    const matchesPlayed = Number(player.dataset.matchesPlayed || 0);
    const waitingSince = Number(player.dataset.waitingSince || Date.now());
    const waitingSeconds = (Date.now() - waitingSince) / 1000;

    return matchesPlayed * 1000 - waitingSeconds;
}

function makePlayerLabel(fullName) {
    const bits = fullName.trim().split(/\s+/);

    if (bits.length === 1) {
        return bits[0];
    }

    return `${bits[0]} ${bits[bits.length - 1].slice(0, 2)}`;
}

function createPlayerCard(name, type = "player") {
    const player = document.createElement("div");

    player.classList.add("player");

    if (type === "coach") {
        player.classList.add("coach");
    }

    player.draggable = true;
    player.dataset.status = "waiting";
    player.dataset.type = type;
    player.dataset.name = name;
    player.dataset.matchesPlayed = "0";
    player.dataset.waitingSince = sessionStarted ? Date.now() : "";

    player.innerHTML = `
        <div class="player-label">${makePlayerLabel(name)}</div>
        ${type === "coach" ? `<div class="coach-label">coach</div>` : ""}
        <div class="player-stats">
            <div class="player-stat matches-stat">G: 0</div>
            <div class="player-stat waiting-stat">00:00</div>
            <button class="remove-player-btn" title="Remove player">x</button>
        </div>
    `;

    player.addEventListener("dragstart", function () {
        draggedPlayer = player;
    });

    updatePlayerDisplay(player);

    return player;
}

function removePlayer(player) {
    const courtCard = player.closest(".court-card");

    if (courtCard && courtCard.classList.contains("playing")) {
        alert("Can't remove a player while they're in a running game");
        return;
    }

    if (courtCard) {
        player.remove();
        updateCourtReadyState(courtCard);
        return;
    }

    player.remove();
}