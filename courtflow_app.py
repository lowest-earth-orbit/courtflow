from flask import Flask, request, render_template
import pandas as pd

app = Flask(__name__)

# temp static place to put dynamic files?
SESSION_FILES = {
    "monday_league": "sessions/monday_league.csv",
    "tuesday_club": "sessions/tuesday_club.csv",
    "thursday_casual": "sessions/thursday_casual.csv"
}


@app.route("/play")
def play():
    session = request.args.get("session")
    players = []

    if session:
        csv_file = SESSION_FILES.get(session)

        if csv_file:
            df = pd.read_csv(csv_file, skipinitialspace=True)
            df.columns = df.columns.str.strip()

            attendees = df[df["status"].str.lower() == "confirmed"].copy()
            players = attendees[["name", "type"]].to_dict(orient="records")

    courts = [1, 2, 3, 4]

    return render_template(
        "court_flow_html.html",
        players=players,
        courts=courts,
        selected_session=session,
        sessions=SESSION_FILES.keys()
    )


if __name__ == "__main__":
    app.run(debug=True)
