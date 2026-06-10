const partnerCounts = new Map();
let currentSuggestion = null;
const opponentCounts = new Map();

function getOpponentKey(playerA, playerB) {
    return [getPlayerName(playerA), getPlayerName(playerB)].sort().join(" vs ");
}

function getOpponentCount(playerA, playerB) {
    return opponentCounts.get(getOpponentKey(playerA, playerB)) || 0;
}

function recordOpponentPair(playerA, playerB) {
    const key = getOpponentKey(playerA, playerB);
    opponentCounts.set(key, getOpponentCount(playerA, playerB) + 1);
}

function getTeamOpponentScore(teamA, teamB) {
    let score = 0;

    teamA.forEach(playerA => {
        teamB.forEach(playerB => {
            score += getOpponentCount(playerA, playerB);
        });
    });

    return score;
}

function getPairKey(playerA, playerB) {
    return [getPlayerName(playerA), getPlayerName(playerB)].sort().join(" + ");
}

function getPartnerCount(playerA, playerB) {
    return partnerCounts.get(getPairKey(playerA, playerB)) || 0;
}

function recordPartnerPair(playerA, playerB) {
    const key = getPairKey(playerA, playerB);
    partnerCounts.set(key, getPartnerCount(playerA, playerB) + 1);
}

function chooseBestDoublesTeams(selectedPlayers) {
    const [a, b, c, d] = selectedPlayers;

    const options = [
        [[a, b], [c, d]],
        [[a, c], [b, d]],
        [[a, d], [b, c]]
    ];

    options.sort((optionA, optionB) => {
        const partnerScoreA =
            getPartnerCount(optionA[0][0], optionA[0][1]) +
            getPartnerCount(optionA[1][0], optionA[1][1]);

        const partnerScoreB =
            getPartnerCount(optionB[0][0], optionB[0][1]) +
            getPartnerCount(optionB[1][0], optionB[1][1]);

        const opponentScoreA = getTeamOpponentScore(optionA[0], optionA[1]);
        const opponentScoreB = getTeamOpponentScore(optionB[0], optionB[1]);

        return (partnerScoreA * 10 + opponentScoreA) -
               (partnerScoreB * 10 + opponentScoreB);
    });

    return options[0];
}

function buildMatchSuggestion(mode) {
    const neededPlayers = mode === "singles" ? 2 : 4;

    const availablePlayers = Array.from(
        playerPool.querySelectorAll(".player")
    ).filter(player => player.dataset.type !== "coach");

    if (availablePlayers.length < neededPlayers) {
        return null;
    }

    availablePlayers.sort((a, b) => playerPriorityScore(a) - playerPriorityScore(b));

    const candidatePool = availablePlayers.slice(
        0,
        Math.min(availablePlayers.length, neededPlayers + 4)
    );

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

function suggestNextMatch(mode) {
    return buildMatchSuggestion(mode);
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

function clearSuggestedMatch() {
    currentSuggestion = null;

    const panel = document.getElementById("suggested-match");

    if (panel) {
        panel.innerHTML = `<p>No suggestion yet</p>`;
    }
}