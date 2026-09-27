// Animal Puzzle: Sudoku rules with crossword animal clues.
// Letters and numbers share the grid. On a clue line, the letters
// spell the animal in order. Numbers sit in the other boxes.
(function () {
  var SOLVED_KEY = "joyce-animal-solved";
  var PROGRESS_KEY = "joyce-animal-progress";
  var HOWTO_KEY = "joyce-animal-howto";

  var app = document.getElementById("app");
  var howtoBtn = document.getElementById("howto-btn");

  var screen = "pick";
  var howtoOpen = false;
  var levelIndex = 0;
  var cells = [];
  var selected = null;
  var message = "Tap a box. Then tap a letter or a number.";
  var justSolved = false;
  var levelEnding = false;
  var hintFlash = null;
  var hintTimer = 0;
  var hintBusy = false;

  function afterLevel(won, next) {
    if (levelEnding) return;
    levelEnding = true;
    justSolved = false;
    var level = levelIndex + 1;
    function go() {
      levelEnding = false;
      next();
    }
    if (!window.JoyceBrainBreaks || !JoyceBrainBreaks.levelEnd) {
      go();
      return;
    }
    JoyceBrainBreaks.levelEnd({ won: !!won, level: level }).then(go, go);
  }

  try {
    if (!localStorage.getItem(HOWTO_KEY)) {
      howtoOpen = true;
    }
  } catch (err) {
    howtoOpen = true;
  }

  howtoBtn.addEventListener("click", function () {
    howtoOpen = true;
    render();
  });

  function puzzle() {
    return PUZZLES[levelIndex];
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      /* Private browsing can block storage. The game still plays. */
    }
  }

  function loadSolved() {
    try {
      var raw = JSON.parse(localStorage.getItem(SOLVED_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (err) {
      return [];
    }
  }

  function markSolved(id) {
    var done = loadSolved();
    if (done.indexOf(id) === -1) {
      done.push(id);
      safeSet(SOLVED_KEY, JSON.stringify(done));
    }
  }

  function loadProgress(id) {
    try {
      var all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      var saved = all[id];
      return Array.isArray(saved) ? saved : null;
    } catch (err) {
      return null;
    }
  }

  function saveProgress() {
    var current = puzzle();
    var all = {};
    try {
      all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    } catch (err) {
      all = {};
    }
    if (isSolved(current, cells)) {
      delete all[current.id];
    } else {
      all[current.id] = cells.slice();
    }
    safeSet(PROGRESS_KEY, JSON.stringify(all));
  }

  function isGiven(current, index) {
    return current.givens[index] !== "";
  }

  function letterOrderOk(values, word) {
    var letters = {};
    for (var i = 0; i < word.length; i++) {
      letters[word.charAt(i)] = true;
    }

    function can(pos, wordIndex) {
      if (pos === values.length) {
        return wordIndex === word.length;
      }
      var cell = values[pos];
      if (!cell) {
        if (can(pos + 1, wordIndex)) {
          return true;
        }
        return wordIndex < word.length && can(pos + 1, wordIndex + 1);
      }
      if (letters[cell]) {
        if (wordIndex < word.length && cell === word.charAt(wordIndex)) {
          return can(pos + 1, wordIndex + 1);
        }
        return false;
      }
      return can(pos + 1, wordIndex);
    }

    return can(0, 0);
  }

  function clueIndexes(current, clue) {
    var list = [];
    var i;
    if (clue.dir === "row") {
      for (i = 0; i < current.size; i++) {
        list.push(clue.index * current.size + i);
      }
    } else {
      for (i = 0; i < current.size; i++) {
        list.push(i * current.size + clue.index);
      }
    }
    return list;
  }

  function lineValues(current, indexList, grid) {
    return indexList.map(function (index) {
      return grid[index] || "";
    });
  }

  function conflicts(current, grid) {
    var bad = {};
    var size = current.size;

    function markDuplicates(indexes) {
      var groups = {};
      indexes.forEach(function (index) {
        var value = grid[index];
        if (!value) {
          return;
        }
        if (!groups[value]) {
          groups[value] = [];
        }
        groups[value].push(index);
      });
      Object.keys(groups).forEach(function (value) {
        if (groups[value].length > 1) {
          groups[value].forEach(function (index) {
            bad[index] = "match";
          });
        }
      });
    }

    var r;
    var c;
    for (r = 0; r < size; r++) {
      var row = [];
      for (c = 0; c < size; c++) {
        row.push(r * size + c);
      }
      markDuplicates(row);
    }
    for (c = 0; c < size; c++) {
      var col = [];
      for (r = 0; r < size; r++) {
        col.push(r * size + c);
      }
      markDuplicates(col);
    }
    var br;
    var bc;
    for (br = 0; br < size; br += current.boxRows) {
      for (bc = 0; bc < size; bc += current.boxCols) {
        var box = [];
        for (r = br; r < br + current.boxRows; r++) {
          for (c = bc; c < bc + current.boxCols; c++) {
            box.push(r * size + c);
          }
        }
        markDuplicates(box);
      }
    }

    var orderBroken = false;
    current.clues.forEach(function (clue) {
      var indexes = clueIndexes(current, clue);
      var values = lineValues(current, indexes, grid);
      if (!letterOrderOk(values, current.word)) {
        orderBroken = true;
        indexes.forEach(function (index) {
          var value = grid[index];
          if (value && current.word.indexOf(value) !== -1) {
            bad[index] = bad[index] || "order";
          }
        });
      }
    });

    return { bad: bad, orderBroken: orderBroken };
  }

  function isSolved(current, grid) {
    for (var i = 0; i < current.solution.length; i++) {
      if (grid[i] !== current.solution[i]) {
        return false;
      }
    }
    return true;
  }

  function optionsFor(current, grid, index) {
    var size = current.size;
    var r = Math.floor(index / size);
    var c = index % size;
    var used = {};
    var i;
    for (i = 0; i < size; i++) {
      if (grid[r * size + i]) {
        used[grid[r * size + i]] = true;
      }
      if (grid[i * size + c]) {
        used[grid[i * size + c]] = true;
      }
    }
    var r0 = Math.floor(r / current.boxRows) * current.boxRows;
    var c0 = Math.floor(c / current.boxCols) * current.boxCols;
    var rr;
    var cc;
    for (rr = r0; rr < r0 + current.boxRows; rr++) {
      for (cc = c0; cc < c0 + current.boxCols; cc++) {
        if (grid[rr * size + cc]) {
          used[grid[rr * size + cc]] = true;
        }
      }
    }
    var opts = [];
    current.symbols.forEach(function (symbol) {
      if (used[symbol]) {
        return;
      }
      grid[index] = symbol;
      var ok = true;
      current.clues.forEach(function (clue) {
        if (!ok) {
          return;
        }
        var onLine =
          (clue.dir === "row" && clue.index === r) ||
          (clue.dir === "col" && clue.index === c);
        if (!onLine) {
          return;
        }
        var indexes = clueIndexes(current, clue);
        if (!letterOrderOk(lineValues(current, indexes, grid), current.word)) {
          ok = false;
        }
      });
      grid[index] = "";
      if (ok) {
        opts.push(symbol);
      }
    });
    return opts;
  }

  function startLevel(index) {
    launchLevel(index);
  }

  function launchLevel(index) {
    levelIndex = index;
    var current = puzzle();
    var saved = loadProgress(current.id);
    if (saved && saved.length === current.solution.length) {
      cells = saved.slice();
    } else {
      cells = current.givens.slice();
    }
    selected = null;
    justSolved = false;
    clearFlash();
    message = isSolved(current, cells)
      ? "You already solved this one!"
      : "Tap a box. Then tap a letter or a number.";
    screen = "play";
    render();
  }

  function enterSymbol(symbol) {
    var current = puzzle();
    if (justSolved || isSolved(current, cells)) {
      return;
    }
    if (selected === null) {
      message = "Tap a box first.";
      render();
      return;
    }
    if (isGiven(current, selected)) {
      message = "That box is a starter. Pick an empty one.";
      render();
      return;
    }
    cells[selected] = symbol;
    var result = conflicts(current, cells);
    var hasBad = Object.keys(result.bad).length > 0;
    if (hasBad && result.orderBroken) {
      message = "Read the letters in order. They spell " + current.word + ".";
    } else if (hasBad) {
      message = "Two boxes match. Try a new one.";
    } else if (symbol === current.solution[selected]) {
      message = "Nice!";
    } else {
      message = "Keep going!";
    }
    afterMove(current);
  }

  function erase() {
    var current = puzzle();
    if (justSolved || isSolved(current, cells)) {
      return;
    }
    if (selected === null) {
      message = "Tap a box first.";
      render();
      return;
    }
    if (isGiven(current, selected)) {
      message = "That box is a starter. Pick an empty one.";
      render();
      return;
    }
    cells[selected] = "";
    message = "That box is empty now.";
    afterMove(current);
  }

  function afterMove(current) {
    if (isSolved(current, cells)) {
      justSolved = true;
      message = "";
      markSolved(current.id);
      burst();
    }
    saveProgress();
    render();
  }

  function hintIndex(current) {
    var empties = [];
    var i;
    for (i = 0; i < cells.length; i++) {
      if (!cells[i]) empties.push(i);
    }
    if (!empties.length) return null;
    for (i = 0; i < empties.length; i++) {
      if (optionsFor(current, cells, empties[i]).length === 1) return empties[i];
    }
    var onClue = {};
    current.clues.forEach(function (clue) {
      clueIndexes(current, clue).forEach(function (index) {
        onClue[index] = true;
      });
    });
    for (i = 0; i < empties.length; i++) {
      if (onClue[empties[i]]) return empties[i];
    }
    return empties[0];
  }

  function clearFlash() {
    window.clearTimeout(hintTimer);
    hintFlash = null;
  }

  function showFlash(index, symbol) {
    clearFlash();
    hintFlash = { index: index, symbol: symbol };
    var left = window.KidsStars ? KidsStars.lastBalance() : null;
    message = "Watch the glowing box!" + (left == null ? "" : " Stars left: " + left + ".");
    render();
    hintTimer = window.setTimeout(function () {
      if (!hintFlash || hintFlash.index !== index) return;
      hintFlash = null;
      message = "That box can be " + symbol + ".";
      render();
    }, 1300);
  }

  function starsOn() {
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (feats) return !!feats.stars;
    var cfg = window.KIDS_CHAT || {};
    return !!String(cfg.functionsUrl || "") && cfg.stars !== false;
  }

  function hintCost() {
    var prices = window.KIDS_SETTINGS && window.KIDS_SETTINGS.starPrices;
    if (prices && typeof prices.animalPuzzleHint === "number") return prices.animalPuzzleHint;
    if (window.KidsStars && typeof KidsStars.HINT_COST === "number") return KidsStars.HINT_COST;
    return 5;
  }

  function hintLabel() {
    if (!starsOn()) return "Hint";
    return "Hint (" + hintCost() + " stars)";
  }

  function childName() {
    return (window.KIDS_CHAT && window.KIDS_CHAT.kidName) || "friend";
  }

  function hint() {
    var current = puzzle();
    if (hintBusy || justSolved || isSolved(current, cells)) return;
    if (hintIndex(current) == null) return;
    if (!starsOn()) {
      var freeIndex = hintIndex(current);
      if (freeIndex == null) return;
      showFlash(freeIndex, current.solution[freeIndex]);
      return;
    }
    if (!window.KidsStars) {
      message = "Stars are waking up...";
      render();
      return;
    }
    hintBusy = true;
    message = "Checking stars...";
    render();
    window.KidsStars.spend({ reason: "hint", item: "animal-puzzle" }).then(function (res) {
      hintBusy = false;
      if (res.ok) {
        var index = hintIndex(puzzle());
        if (index == null) return;
        showFlash(index, puzzle().solution[index]);
        return;
      }
      message = window.KidsStars.messageFor(res);
      render();
    });
  }

  function resetLevel() {
    var current = puzzle();
    cells = current.givens.slice();
    selected = null;
    justSolved = false;
    clearFlash();
    message = "All clear. You can try again!";
    saveProgress();
    render();
  }

  function burst() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    var layer = document.createElement("div");
    layer.className = "confetti";
    var emojis = ["🐱", "🐶", "🦊", "🦉", "🐻", "🐸", "⭐", "🎉", "💙", "🌟"];
    for (var i = 0; i < 22; i++) {
      var bit = document.createElement("span");
      bit.textContent = emojis[i % emojis.length];
      bit.style.left = Math.random() * 100 + "%";
      bit.style.animationDelay = Math.random() * 0.35 + "s";
      bit.style.fontSize = 26 + Math.random() * 22 + "px";
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    setTimeout(function () {
      layer.remove();
    }, 1800);
  }

  function pillClass(difficulty) {
    return "pill " + difficulty.toLowerCase();
  }

  function renderPicker() {
    var solved = loadSolved();
    var intro = document.createElement("p");
    intro.className = "picker-intro";
    intro.textContent = "Hi " + childName() + "! Pick an animal.";
    app.appendChild(intro);

    var grid = document.createElement("div");
    grid.className = "levels";
    PUZZLES.forEach(function (item, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "level-card";
      button.addEventListener("click", function () {
        startLevel(index);
      });

      var emoji = document.createElement("span");
      emoji.className = "level-emoji";
      emoji.textContent = item.emoji;

      var title = document.createElement("span");
      title.className = "level-title";
      title.textContent = item.title;

      var pill = document.createElement("span");
      pill.className = pillClass(item.difficulty);
      pill.textContent = item.difficulty;

      button.appendChild(emoji);
      button.appendChild(title);
      button.appendChild(pill);
      if (solved.indexOf(item.id) !== -1) {
        var star = document.createElement("span");
        star.className = "star";
        star.textContent = "⭐";
        star.setAttribute("aria-label", "Solved");
        button.appendChild(star);
      }
      grid.appendChild(button);
    });
    app.appendChild(grid);
  }

  function renderPlay() {
    var current = puzzle();
    var result = conflicts(current, cells);
    var layout = document.createElement("div");
    layout.className = "play-layout";

    var line = document.createElement("div");
    line.className = "level-line";
    var emoji = document.createElement("span");
    emoji.className = "big-emoji";
    emoji.textContent = current.emoji;
    var heading = document.createElement("h2");
    heading.textContent = current.title;
    var pill = document.createElement("span");
    pill.className = pillClass(current.difficulty);
    pill.textContent = current.difficulty;
    line.appendChild(emoji);
    line.appendChild(heading);
    line.appendChild(pill);

    var legend = document.createElement("p");
    legend.className = "legend";
    legend.textContent = "Use each one time in every row, column, and bold box.";

    var chips = document.createElement("div");
    chips.className = "chips";
    current.symbols.forEach(function (symbol) {
      var chip = document.createElement("span");
      chip.className = "chip" + (current.word.indexOf(symbol) === -1 ? " num" : "");
      chip.textContent = symbol;
      chips.appendChild(chip);
    });

    var card = document.createElement("div");
    card.className = "board-card";
    var board = document.createElement("div");
    board.className = "board";
    board.style.setProperty("--n", String(current.size));
    board.setAttribute("role", "grid");
    board.setAttribute("aria-label", current.title + " puzzle");

    function addGutter(clue, className) {
      var gutter = document.createElement("div");
      gutter.className = "gutter " + className;
      if (clue) {
        gutter.innerHTML =
          '<span class="clue-emoji">' + current.emoji + "</span>" +
          '<span class="clue-word">' + current.word + "</span>" +
          '<span class="clue-dir">' + (clue.dir === "row" ? "across" : "down") + "</span>";
      }
      board.appendChild(gutter);
    }

    addGutter(null, "corner");
    var c;
    var r;
    for (c = 0; c < current.size; c++) {
      var colClue = null;
      current.clues.forEach(function (clue) {
        if (clue.dir === "col" && clue.index === c) {
          colClue = clue;
        }
      });
      addGutter(colClue, "col-clue");
    }

    for (r = 0; r < current.size; r++) {
      var rowClue = null;
      current.clues.forEach(function (clue) {
        if (clue.dir === "row" && clue.index === r) {
          rowClue = clue;
        }
      });
      addGutter(rowClue, "row-clue");
      for (c = 0; c < current.size; c++) {
        var index = r * current.size + c;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cell";
        var boxCol = Math.floor(c / current.boxCols);
        var boxRow = Math.floor(r / current.boxRows);
        if ((boxRow + boxCol) % 2 === 1) {
          button.classList.add("shade");
        }
        if (c === 0) button.classList.add("edge-l");
        if (r === 0) button.classList.add("edge-t");
        if (c === current.size - 1) button.classList.add("edge-r");
        if (r === current.size - 1) button.classList.add("edge-b");
        if ((c + 1) % current.boxCols === 0 && c !== current.size - 1) {
          button.classList.add("thick-r");
        }
        if ((r + 1) % current.boxRows === 0 && r !== current.size - 1) {
          button.classList.add("thick-b");
        }
        if (cells[index]) {
          button.textContent = cells[index];
          if (current.word.indexOf(cells[index]) === -1) {
            button.classList.add("num");
          }
        } else if (hintFlash && hintFlash.index === index) {
          button.textContent = hintFlash.symbol;
          button.classList.add("flash");
          if (current.word.indexOf(hintFlash.symbol) === -1) {
            button.classList.add("num");
          }
        }
        if (isGiven(current, index)) {
          button.classList.add("given");
        }
        if (selected === index) {
          button.classList.add("selected");
        }
        if (result.bad[index] && !isGiven(current, index)) {
          button.classList.add("bad");
        }
        button.setAttribute(
          "aria-label",
          "Row " + (r + 1) + ", column " + (c + 1) + (cells[index] ? ", " + cells[index] : ", empty")
        );
        (function (cellIndex) {
          button.addEventListener("click", function () {
            if (justSolved) {
              return;
            }
            selected = cellIndex;
            if (isGiven(current, cellIndex)) {
              message = "That box is a starter. Pick an empty one.";
            } else {
              message = "Now tap a letter or a number.";
            }
            render();
          });
        })(index);
        board.appendChild(button);
      }
    }
    card.appendChild(board);
    if (current.size <= 4) {
      board.classList.add("cozy");
    }

    var status = document.createElement("p");
    status.className = "status" + (Object.keys(result.bad).length ? " warn" : "");
    status.setAttribute("aria-live", "polite");
    status.textContent = message;

    var controls = document.createElement("div");
    controls.className = "controls";
    var keypad = document.createElement("div");
    keypad.className = "keypad";
    keypad.setAttribute("role", "group");
    keypad.setAttribute("aria-label", "Letters and numbers");
    current.symbols.forEach(function (symbol) {
      var key = document.createElement("button");
      key.type = "button";
      key.className = "key" + (current.word.indexOf(symbol) === -1 ? " num" : "");
      key.textContent = symbol;
      key.addEventListener("click", function () {
        enterSymbol(symbol);
      });
      keypad.appendChild(key);
    });
    var eraseBtn = document.createElement("button");
    eraseBtn.type = "button";
    eraseBtn.className = "key erase";
    eraseBtn.textContent = "Erase";
    eraseBtn.addEventListener("click", erase);
    keypad.appendChild(eraseBtn);

    var actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(makeAction(hintLabel(), "hint", hint));
    actions.appendChild(makeAction("Reset", "reset", function () {
      var current = puzzle();
      if (justSolved || isSolved(current, cells)) {
        resetLevel();
        return;
      }
      afterLevel(false, function () {
        resetLevel();
      });
    }));
    actions.appendChild(makeAction("Animals", "animals", function () {
      screen = "pick";
      justSolved = false;
      render();
    }));
    controls.appendChild(keypad);
    controls.appendChild(actions);

    var side = document.createElement("div");
    side.className = "side";
    side.appendChild(status);
    side.appendChild(controls);

    layout.appendChild(line);
    layout.appendChild(legend);
    layout.appendChild(chips);
    layout.appendChild(card);
    layout.appendChild(side);
    app.appendChild(layout);
  }

  function makeAction(label, className, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "action " + className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderHowto() {
    var overlay = document.createElement("div");
    overlay.className = "overlay";
    var sheet = document.createElement("div");
    sheet.className = "sheet";
    sheet.innerHTML =
      "<h2>How to play</h2>" +
      "<p>Hi " + childName().replace(/[&<>]/g, "") + "! This is a crossword and a Sudoku.</p>" +
      "<ol>" +
      "<li>Tap an empty box.</li>" +
      "<li>Tap a letter or a number.</li>" +
      "<li>Every row, every column, and every bold box uses each letter and number one time.</li>" +
      "<li>The animal clue shows the word. The letters in that line spell the word, in order. A number can sit in the line too.</li>" +
      "</ol>" +
      '<div class="example">' +
      '<div><span class="clue-emoji">🐱</span> <strong>CAT</strong> across</div>' +
      '<div class="example-row">' +
      '<div class="example-cell">C</div>' +
      '<div class="example-cell num">1</div>' +
      '<div class="example-cell">A</div>' +
      '<div class="example-cell">T</div>' +
      "</div>" +
      "<p>Say C, A, T. That spells CAT! The number sits in the word.</p>" +
      "</div>" +
      "<p>Pink boxes mean try a new one. Hint fills one box for you.</p>";
    var go = document.createElement("button");
    go.type = "button";
    go.className = "big-btn";
    go.textContent = "Let's play!";
    go.addEventListener("click", function () {
      safeSet(HOWTO_KEY, "yes");
      howtoOpen = false;
      render();
    });
    sheet.appendChild(go);
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function renderCelebration() {
    var current = puzzle();
    var overlay = document.createElement("div");
    overlay.className = "overlay";
    var sheet = document.createElement("div");
    sheet.className = "sheet yay";
    var party = document.createElement("div");
    party.className = "party";
    party.textContent = current.emoji + " 🎉";
    var title = document.createElement("h2");
    title.textContent = "You did it!";
    var text = document.createElement("p");
    text.textContent = "The " + current.title.toLowerCase() + " is so happy.";
    var next = document.createElement("button");
    next.type = "button";
    next.className = "big-btn";
    var last = levelIndex === PUZZLES.length - 1;
    next.textContent = last ? "All animals" : "Next animal";
    next.addEventListener("click", function () {
      afterLevel(true, function () {
        if (last) {
          screen = "pick";
          render();
        } else {
          launchLevel(levelIndex + 1);
        }
      });
    });
    var again = document.createElement("button");
    again.type = "button";
    again.className = "big-btn";
    again.style.background = "#fff";
    again.style.color = "#16356b";
    again.textContent = "Play again";
    again.addEventListener("click", function () {
      afterLevel(true, function () {
        resetLevel();
      });
    });
    sheet.appendChild(party);
    sheet.appendChild(title);
    sheet.appendChild(text);
    sheet.appendChild(next);
    sheet.appendChild(again);
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function render() {
    app.innerHTML = "";
    if (screen === "pick") {
      renderPicker();
    } else {
      renderPlay();
    }
    if (howtoOpen) {
      renderHowto();
    } else if (justSolved) {
      renderCelebration();
    }
  }

  render();
})();
