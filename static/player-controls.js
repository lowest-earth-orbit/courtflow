const addPlayerButton = document.getElementById("add-player-btn");
const newPlayerNameInput = document.getElementById("new-player-name");
const newPlayerTypeSelect = document.getElementById("new-player-type");

if (addPlayerButton) {
    addPlayerButton.addEventListener("click", function () {
        const name = newPlayerNameInput.value.trim();
        const type = newPlayerTypeSelect.value;

        if (!name) {
            alert("Enter a player name");
            return;
        }

        const newPlayer = createPlayerCard(name, type);
        playerPool.appendChild(newPlayer);

        newPlayerNameInput.value = "";
        updateAllPlayerDisplays();
    });
}

document.addEventListener("click", function (event) {
    if (!event.target.classList.contains("remove-player-btn")) {
        return;
    }

    const player = event.target.closest(".player");

    if (player) {
        removePlayer(player);
    }
});