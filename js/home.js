// Draws the game cards on Joyce's Web from the JOYCE_GAMES list.
(function () {
  const list = document.getElementById("game-list");
  const games = (typeof JOYCE_GAMES !== "undefined" && JOYCE_GAMES) || [];

  if (!games.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "New games are coming soon.";
    list.appendChild(empty);
    return;
  }

  games.forEach(function (game) {
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = game.href;
    card.style.setProperty("--accent", game.accent || "#ffe14a");

    const emoji = document.createElement("span");
    emoji.className = "game-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = game.emoji || "🎮";

    const title = document.createElement("span");
    title.className = "game-title";
    title.textContent = game.title;

    const about = document.createElement("span");
    about.className = "game-about";
    about.textContent = game.about || "Tap to play.";

    const play = document.createElement("span");
    play.className = "play-pill";
    play.textContent = "Play";

    card.appendChild(emoji);
    card.appendChild(title);
    card.appendChild(about);
    card.appendChild(play);
    list.appendChild(card);
  });
})();
