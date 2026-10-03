// Draws the game cards on Joyce's Web from the JOYCE_GAMES list.
(function () {
  const list = document.getElementById("game-list");
  const games = (typeof JOYCE_GAMES !== "undefined" && JOYCE_GAMES) || [];

  function tone(key, fallback, vars) {
    if (window.JoyceStyle && typeof window.JoyceStyle.t === "function") {
      return window.JoyceStyle.t(key, fallback, vars);
    }
    return fallback;
  }

  var ABOUT_KEY = {
    "level-test/index.html": "game.treasure",
    "practice/index.html": "game.practice",
    "books/index.html": "game.books",
    "homework/index.html": "game.homework",
    "animal-puzzle/index.html": "game.animals",
    "ice-cream-scoop/index.html": "game.icecream",
    "spa-salon/index.html": "game.spa"
  };

  function draw() {
    list.innerHTML = "";
    if (!games.length) {
      const empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = tone("home.empty", "New games are in preparation.");
      list.appendChild(empty);
      return;
    }
    paint(games);
  }

  function paint(games) {
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

    var aboutKey = ABOUT_KEY[game.href] || "";
    var aboutText = tone(aboutKey, game.about || "Open this.");
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (feats && !feats.stars && String(game.href || "").indexOf("practice/") === 0) {
      aboutText = tone("game.practice.free", "Further questions at your measured level.");
    }

    const about = document.createElement("span");
    about.className = "game-about";
    about.textContent = aboutText;

    const play = document.createElement("span");
    play.className = "play-pill";
    play.textContent = tone("home.play", "Enter");

    card.appendChild(emoji);
    card.appendChild(title);
    card.appendChild(about);
    card.appendChild(play);
    list.appendChild(card);
  });
  }

  draw();
  window.addEventListener("jw-style-change", draw);
})();
