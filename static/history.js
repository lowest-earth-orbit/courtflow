const matchHistory = [];

function getCompletedMatchesByMode(mode) {
    return matchHistory.filter(match => match.mode === mode);
}

function getAverageDurationSeconds(mode) {
    const matches = getCompletedMatchesByMode(mode);

    if (matches.length === 0) {
        return null;
    }

    const totalSeconds = matches.reduce((total, match) => {
        return total + match.durationSeconds;
    }, 0);

    return Math.round(totalSeconds / matches.length);
}

function updateMatchHistoryPanel() {
    const panel = document.getElementById("match-history-panel");

    if (!panel) return;

    if (matchHistory.length === 0) {
        panel.innerHTML = `<p class="empty-history">No matches yet</p>`;
        return;
    }

    const averageDoubles = getAverageDurationSeconds("doubles");
    const averageSingles = getAverageDurationSeconds("singles");

    panel.innerHTML = `
        <div class="match-average-card">
            <strong>Averages</strong>
            <br>
            Doubles: ${averageDoubles ? formatTime(averageDoubles) : ""}
            <br>
            Singles: ${averageSingles ? formatTime(averageSingles) : ""}
        </div>
    `;

    matchHistory.slice().reverse().forEach(match => {
        const item = document.createElement("div");
        item.classList.add("match-history-item");

        item.innerHTML = `
<strong>${match.mode}</strong> - ${formatTime(match.durationSeconds)}            <br>
            ${match.teamA.join(" + ")}
            <br>
            vs
            <br>
            ${match.teamB.join(" + ")}
        `;

        panel.appendChild(item);
    });
}

function logCompletedMatch(courtCard, durationSeconds) {
    const teamA = Array.from(
        courtCard.querySelector(".team-a").querySelectorAll(".player")
    );

    const teamB = Array.from(
        courtCard.querySelector(".team-b").querySelectorAll(".player")
    );

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
        updatePlayerDisplay(player);
    });

    if (teamA.length === 2) {
        recordPartnerPair(teamA[0], teamA[1]);
    }

    if (teamB.length === 2) {
        recordPartnerPair(teamB[0], teamB[1]);
    }

    teamA.forEach(playerA => {
        teamB.forEach(playerB => {
            recordOpponentPair(playerA, playerB);
        });
    });

    console.log("Match history:", matchHistory);
    console.log("Partner counts:", partnerCounts);
    console.log("Opponent counts:", opponentCounts);
}