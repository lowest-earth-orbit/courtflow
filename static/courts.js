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