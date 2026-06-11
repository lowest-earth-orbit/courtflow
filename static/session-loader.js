const SESSION_FILES = {
    monday_league: "static/sessions/monday_league.csv",
    tuesday_club: "static/sessions/tuesday_club.csv",
    thursday_casual: "static/sessions/thursday_casual.csv"
};

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);

    const headers = lines[0]
        .split(",")
        .map(header => header.trim());

    return lines.slice(1).map(line => {
        const values = line
            .split(",")
            .map(value => value.trim());

        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index];
        });

        return row;
    });
}

async function loadSession(sessionName) {
    const csvPath = SESSION_FILES[sessionName];

    if (!csvPath) {
        alert("Unknown session");
        return;
    }

    const response = await fetch(csvPath);

    if (!response.ok) {
        alert("Could not load session CSV");
        return;
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    playerPool.innerHTML = "";

    rows
        .filter(row => row.status && row.status.toLowerCase() === "confirmed")
        .forEach(row => {
            const player = createPlayerCard(row.name, row.type || "player");
            playerPool.appendChild(player);
        });

    initialisePlayerStats();
    updateAllPlayerDisplays();
    
    if (typeof saveCourtFlowState === "function") {
        saveCourtFlowState();
    }
}

const sessionSelect = document.getElementById("session-select");

if (sessionSelect) {
    sessionSelect.addEventListener("change", function () {
        const sessionName = sessionSelect.value;

        if (!sessionName) {
            playerPool.innerHTML = "";
            saveCourtFlowState();
            return;
        }

        loadSession(sessionName);
    });
}