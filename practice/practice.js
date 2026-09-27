/* Extra questions at the saved level. A correct answer earns one star
   when the star ledger accepts it. Practice still runs if stars are locked
   or the server is not ready. */
(function () {
  var app = document.getElementById("app");
  var data = window.LevelStore.load();
  var cfg = window.KIDS_CHAT || {};
  var botName = cfg.botName || "your guide";
  var botEmoji = cfg.botEmoji || "⭐";
  var subject = null;
  var level = 5;
  var current = null;
  var busy = false;
  var starNote = "";

  function savePractice() {
    data.practice[subject] = level;
    window.LevelStore.save(data);
  }

  function startLevel(id) {
    var saved = data.practice[id];
    if (saved == null && data.results[id]) saved = data.results[id].level;
    level = saved || 5;
    subject = id;
    starNote = "";
    nextQuestion();
  }

  function nextQuestion() {
    var avoid = {};
    current = window.QuestionBank.pick(subject, level, avoid, Math.random);
    busy = false;
    renderQuestion();
  }

  function renderHome() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "pick");
    var box = document.createElement("div");
    box.className = "mascot";
    box.innerHTML = "<div class='mascot-face'>" + botEmoji + "</div><p>" + botName +
      " has extra questions. A right answer can earn 1 star.</p>";
    app.appendChild(box);
    var grid = document.createElement("div");
    grid.className = "map-grid";
    window.QuestionBank.subjects.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "island";
      var at = data.practice[item.id] || (data.results[item.id] && data.results[item.id].level) || 5;
      button.innerHTML = "<span>" + item.emoji + "</span><span>" + item.title + "</span><span class='badge'>Level " + at + "</span>";
      button.addEventListener("click", function () { startLevel(item.id); });
      grid.appendChild(button);
    });
    app.appendChild(grid);
  }

  function renderQuestion() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "question");
    app.setAttribute("data-subject", subject);
    var meta = document.createElement("p");
    meta.className = "q-kicker";
    meta.textContent = "Level " + level + (starNote ? " · " + starNote : "");
    app.appendChild(meta);
    var card = document.createElement("div");
    card.className = "q-card";
    card.id = "q-card";
    app.appendChild(card);
    window.Ask.render(card, current, onChoice);
    var quit = document.createElement("button");
    quit.type = "button";
    quit.className = "quest-side";
    quit.textContent = "Pick another subject";
    quit.addEventListener("click", function () {
      savePractice();
      renderHome();
    });
    app.appendChild(quit);
  }

  function onChoice(choice) {
    if (busy) return;
    busy = true;
    var correct = choice === current.answer;
    window.Ask.lock(document.getElementById("q-card"), choice, current, correct);
    var qid = current.id;
    var askedLevel = level;
    if (correct) level = Math.min(10, level + 1);
    else level = Math.max(1, level - 1);
    savePractice();
    var go = document.createElement("button");
    go.type = "button";
    go.className = "q-next";
    go.textContent = "Next question";
    go.addEventListener("click", nextQuestion);
    function showNext() {
      app.appendChild(go);
    }
    if (!correct || !window.KidsStars) {
      starNote = correct ? "" : starNote;
      showNext();
      return;
    }
    window.KidsStars.earn({ subject: subject, level: askedLevel, qid: qid }).then(function (res) {
      if (res.ok) starNote = "1 star earned";
      else starNote = window.KidsStars.messageFor(res);
      var note = document.querySelector("[data-note]");
      if (note && starNote) note.textContent = note.textContent + " " + starNote;
      showNext();
    });
  }

  renderHome();
})();
