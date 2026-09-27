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

  function allowed(game) {
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (!feats) return true;
    if (String(game.href || "").indexOf("books/") === 0 && !feats.bookClub) return false;
    if (String(game.href || "").indexOf("homework/") === 0 && !feats.homework) return false;
    return true;
  }

  games.forEach(function (game) {
    if (!allowed(game)) return;
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

    var aboutText = game.about || "Tap to play.";
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (feats && !feats.stars && String(game.href || "").indexOf("practice/") === 0) {
      aboutText = "Extra questions at your level.";
    }

    const about = document.createElement("span");
    about.className = "game-about";
    about.textContent = aboutText;

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
