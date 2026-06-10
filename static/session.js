let sessionStarted = false;
let sessionEnded = false;
let sessionStartTime = null;
let playerDisplayInterval = null;

// const sessionSelect = document.getElementById("session-select");
const startSessionButton = document.getElementById("start-session-btn");
const endSessionButton = document.getElementById("end-session-btn");

// if (sessionSelect) {
//     sessionSelect.addEventListener("change", function () {
//         const session = sessionSelect.value;

//         if (!session) {
//             window.location.href = "/play";
//             return;
//         }

//         // window.location.href = `/play?session=${session}`;
//     });
// }

if (startSessionButton) {
    startSessionButton.addEventListener("click", function () {
        sessionStarted = true;
        sessionEnded = false;
        sessionStartTime = Date.now();

        document.querySelectorAll(".player").forEach(player => {
            if (player.dataset.status === "waiting") {
                player.dataset.waitingSince = sessionStartTime;
                updatePlayerDisplay(player);
            }
        });

        startSessionButton.disabled = true;
        endSessionButton.disabled = false;

        playerDisplayInterval = setInterval(updateAllPlayerDisplays, 1000);
        updateAllPlayerDisplays();
    });
}

if (endSessionButton) {
    endSessionButton.addEventListener("click", function () {
        sessionStarted = false;
        sessionEnded = true;

        if (playerDisplayInterval) {
            clearInterval(playerDisplayInterval);
            playerDisplayInterval = null;
        }

        document.querySelectorAll(".court-card.playing").forEach(courtCard => {
            resetCourt(courtCard, true);
        });

        startSessionButton.disabled = false;
        endSessionButton.disabled = true;
        startSessionButton.textContent = "Start Session";
    });
}