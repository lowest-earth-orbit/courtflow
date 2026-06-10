let draggedPlayer = null;

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