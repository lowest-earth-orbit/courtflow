// function sendSuggestionToCourt(courtNumber) {
//     if (!currentSuggestion) return;

//     const courtCards = Array.from(document.querySelectorAll(".court-card"));
//     const courtCard = courtCards[courtNumber - 1];

//     if (!courtCard) return;

//     if (courtCard.classList.contains("disabled")) {
//         alert("Court is disabled");
//         return;
//     }

//     if (courtCard.classList.contains("playing")) {
//         alert("Game is already running on that court");
//         return;
//     }

//     if (getCourtPlayers(courtCard).length > 0) {
//         alert("Court already has players on it");
//         return;
//     }

//     courtCard.dataset.mode = currentSuggestion.mode;

//     const modeButtons = courtCard.querySelectorAll(".court-mode-btn");

//     modeButtons.forEach(button => {
//         button.classList.toggle(
//             "active",
//             button.dataset.mode === currentSuggestion.mode
//         );
//     });

//     const teamA = courtCard.querySelector(".team-a");
//     const teamB = courtCard.querySelector(".team-b");

//     currentSuggestion.teamA.forEach(player => {
//         player.dataset.status = "playing";
//         updatePlayerDisplay(player);
//         teamA.appendChild(player);
//     });

//     currentSuggestion.teamB.forEach(player => {
//         player.dataset.status = "playing";
//         updatePlayerDisplay(player);
//         teamB.appendChild(player);
//     });

//     updateCourtReadyState(courtCard);
//     clearSuggestedMatch();
// }
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

    sendMatchToCourt(courtCard, currentSuggestion);
    clearSuggestedMatch();
}

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