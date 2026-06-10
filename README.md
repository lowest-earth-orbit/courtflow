# courtflow 🏸

Automatic sports court assignment app.
(This is just a Demo of a project that is a work in progress!)

## Concept

A small, simple helper app to make organising Badminton game nights just a little easier.

In theory - it would read player names from a csv or API call (or something similar) to load in the session, and admins can drag and drop players to courts or Auto Assign.

Although it's not fully functional yet - the main idea is that it prioritises players who haven't played together yet, against players they haven't played against yet to get the biggest spread. It also prioritises those that have been waiting longest to play or played the least amount of matches.

You can disable courts, or switch the configuration from singles to doubles as you like.

It will try to keep a history of matches played, and how long each match takes - to build an average match length. When a game exceeds the average match length, the timer goes orange to let you know that players might be ending the match soon if they haven't already. However I am thinking to replace this with a different method in future.

You can suggest a next match, and send that suggestion to any free court.

Players can be deleted and added, or coaches can be assigned - they do not automatically get assigned to matches but can be drag and dropped onto a court.

### Future Plans

* Court/Match Queue: At current there is no queing system to take advantage of the timer method, and queue up players who might be about to finish.
* Competition Mode: keep track of scores and leaderboards.
* Better UI/UX: Let's face it, it's winning no prizes at the moment for beautiful design... Improvements to the look, feel, usage and accessibilty of the app - including less clicks?
* Better Players: disable players, save player lists, add levels to help balance matches or set a challenge.
* 'Clear CourtFlow' button is non-functional at the moment.
* AI fixed-angle video to keep track of scores.
* Court Scaling: Default is 4 at the moment but some users may have less or more.

# QuickStart

1. Choose a session from the dropdown. At the moment this is hardcoded and fixed for demos, but ideally this would read actual sign up sheets/court availability/be time aware.
2. Select 'Start Session' - this will start the timer for how long players are waiting for a match.
3. Pick a court and pick a doubles or singles configuration
4. Auto Assign.
5. Click 'Start Game'  to start the match timer.
6. If you have made a mistake before starting the game you can simply drag and drop players in and out of the court - or if you've already started the timer, simply click 'Clear Court' to reset that court.
7. You can also click 'Disable/Enable Court' to disable courts or re-enable them for situations where you do not have all four courts available.
8. When a game is finished just click 'End Game' and it will go to the History panel.
9. If you want to suggest a next match, click the Suggest Match button - this only picks from the pool of available players at the moment though. You can send this matchmaking to a court via the buttons labelled 1-4.
10. At the end of the session - click End Session. Voila!

# The Rest

As mentioned, this is a currently in-development project and so is quite clunky and not optimal yet. Hopefully I will continue to make improvements.

If you wish to help contribute, please do feel free to, or if you have any ideas please feel free to open an Issue on GitHub.
