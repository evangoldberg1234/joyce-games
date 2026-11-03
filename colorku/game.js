/* colorku. Tap a cell, then a colored ball.
   Balls stand in for the digits. The engine keeps the numbers. */
(function () {
  var BALLS = [
    { id: 1, name: "Red" },
    { id: 2, name: "Orange" },
    { id: 3, name: "Yellow" },
    { id: 4, name: "Green" },
    { id: 5, name: "Blue" },
    { id: 6, name: "Navy" },
    { id: 7, name: "Purple" },
    { id: 8, name: "Pink" },
    { id: 9, name: "Aqua" }
  ];

  var SIZES = [
    { size: 4, label: "4×4", name: "Little" },
    { size: 6, label: "6×6", name: "Bigger" },
    { size: 9, label: "9×9", name: "Giant" }
  ];

  var app = document.getElementById("app");
  var howtoBtn = document.getElementById("howto-btn");

  var size = 4;
  var boxRows = 2;
  var boxCols = 2;
  var givens = [];
  var cells = [];
  var selected = null;
  var message = "";
  var howtoOpen = false;
  var justSolved = false;
  var hideWin = false;
  var levelEnding = false;
  var dealing = false;

  function childName() {
    var settings = window.KIDS_SETTINGS;
    if (settings && settings.childName) return settings.childName;
    if (window.KIDS_CHAT && window.KIDS_CHAT.kidName) return window.KIDS_CHAT.kidName;
    return "friend";
  }

  function childKey() {
    var settings = window.KIDS_SETTINGS;
    if (settings && settings.childKey) return settings.childKey;
    return "joyce";
  }

  function tone(key, fallback, vars) {
    if (window.JoyceStyle && typeof window.JoyceStyle.t === "function") {
      return window.JoyceStyle.t(key, fallback, vars);
    }
    return fallback;
  }

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      /* Private browsing can block storage. The puzzle still plays. */
    }
  }

  function boardKey() {
    return "jw-marble-" + childKey();
  }

  function howtoKey() {
    return "jw-marble-howto-" + childKey();
  }

  function ballById(id) {
    var i;
    for (i = 0; i < BALLS.length; i++) {
      if (BALLS[i].id === id) return BALLS[i];
    }
    return null;
  }

  function makeBall(id) {
    var ball = document.createElement("span");
    ball.className = "ball b" + id;
    ball.setAttribute("aria-hidden", "true");
    return ball;
  }

  function breakLevel() {
    if (size === 9) return 8;
    if (size === 6) return 5;
    return 3;
  }

  function afterLevel(won, next) {
    if (levelEnding) return;
    levelEnding = true;
    justSolved = false;
    hideWin = false;
    var level = breakLevel();
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

  function isDirty() {
    var i;
    for (i = 0; i < cells.length; i++) {
      if (!givens[i] && cells[i]) return true;
    }
    return false;
  }

  function save() {
    safeSet(boardKey(), JSON.stringify({
      size: size,
      givens: givens,
      cells: cells
    }));
  }

  function load() {
    var raw = safeGet(boardKey());
    if (!raw || !window.MarbleEngine) return null;
    try {
      var data = JSON.parse(raw);
      var info = MarbleEngine.spec(data.size);
      if (!info) return null;
      var total = info.n * info.n;
      if (!data.givens || !data.cells || data.givens.length !== total || data.cells.length !== total) return null;
      var i;
      for (i = 0; i < total; i++) {
        var given = data.givens[i] | 0;
        var value = data.cells[i] | 0;
        if (given < 0 || given > info.n || value < 0 || value > info.n) return null;
        if (given && value !== given) return null;
      }
      if (Object.keys(MarbleEngine.conflicts(data.givens, data.size)).length) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function applyBoard(givensIn, cellsIn, nextSize, rows, cols) {
    size = nextSize;
    boxRows = rows;
    boxCols = cols;
    givens = givensIn.slice();
    cells = cellsIn.slice();
    selected = null;
    hideWin = false;
    var state = MarbleEngine.assess(cells, size);
    justSolved = !!state.solved;
    message = justSolved
      ? tone("marble.win", "You did it!")
      : tone("marble.start", "Tap an empty box. Then tap a ball.");
  }

  function finishDeal(nextSize) {
    var made = MarbleEngine.generate(nextSize);
    applyBoard(made.givens, made.givens, made.size, made.boxRows, made.boxCols);
    justSolved = false;
    dealing = false;
    message = tone("marble.start", "Tap an empty box. Then tap a ball.");
    save();
    render();
  }

  function deal(nextSize) {
    dealing = true;
    justSolved = false;
    hideWin = false;
    selected = null;
    if (nextSize >= 9) {
      message = tone("marble.mixing", "Mixing the balls…");
      render();
      window.setTimeout(function () {
        finishDeal(nextSize);
      }, 40);
      return;
    }
    finishDeal(nextSize);
  }

  function requestDeal(nextSize) {
    if (dealing || levelEnding) return;
    if (justSolved) {
      afterLevel(true, function () {
        deal(nextSize);
      });
      return;
    }
    if (isDirty()) {
      afterLevel(false, function () {
        deal(nextSize);
      });
      return;
    }
    deal(nextSize);
  }

  function place(ballId) {
    if (dealing || justSolved) return;
    if (selected == null) {
      message = tone("marble.first", "Tap a box first.");
      render();
      return;
    }
    if (givens[selected]) {
      message = tone("marble.starter", "That box is a starter. Pick an empty one.");
      render();
      return;
    }
    cells[selected] = ballId;
    var state = MarbleEngine.assess(cells, size);
    if (state.solved) {
      justSolved = true;
      message = tone("marble.win", "You did it!");
    } else if (state.bad[selected]) {
      message = tone("marble.clash", "That color is already in the row, column, or box.");
    } else if (Object.keys(state.bad).length) {
      message = tone("marble.pink", "A pink box needs a different ball.");
    } else {
      message = tone("marble.nice", "Nice.");
    }
    save();
    render();
  }

  function erase() {
    if (dealing || justSolved || selected == null) {
      if (!justSolved && selected == null) message = tone("marble.first", "Tap a box first.");
      render();
      return;
    }
    if (givens[selected]) {
      message = tone("marble.starter", "That box is a starter. Pick an empty one.");
      render();
      return;
    }
    cells[selected] = 0;
    var state = MarbleEngine.assess(cells, size);
    message = Object.keys(state.bad).length
      ? tone("marble.pink", "A pink box needs a different ball.")
      : tone("marble.now", "Now tap a ball.");
    save();
    render();
  }

  function renderPlay() {
    var state = MarbleEngine.assess(cells, size);
    var layout = document.createElement("div");
    layout.className = "play-layout";

    var line = document.createElement("div");
    line.className = "level-line";
    var sizes = document.createElement("div");
    sizes.className = "sizes";
    sizes.setAttribute("role", "group");
    sizes.setAttribute("aria-label", "Board size");
    SIZES.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "size-btn";
      button.setAttribute("aria-pressed", item.size === size ? "true" : "false");
      button.textContent = item.label;
      var small = document.createElement("small");
      small.textContent = item.name;
      button.appendChild(small);
      button.addEventListener("click", function () {
        if (item.size === size && !justSolved && !isDirty()) return;
        requestDeal(item.size);
      });
      sizes.appendChild(button);
    });
    line.appendChild(sizes);

    var legend = document.createElement("p");
    legend.className = "legend";
    legend.textContent = tone("marble.legend", "Each color once in every row, column, and bold box.");

    var card = document.createElement("div");
    card.className = "board-card";
    var board = document.createElement("div");
    board.className = "board";
    board.style.setProperty("--n", String(size));
    board.setAttribute("role", "grid");
    board.setAttribute("aria-label", tone("marble.board", "Marble board"));

    var r;
    var c;
    for (r = 0; r < size; r++) {
      for (c = 0; c < size; c++) {
        var index = r * size + c;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cell";
        button.setAttribute("role", "gridcell");
        button.setAttribute("data-index", String(index));
        var boxCol = Math.floor(c / boxCols);
        var boxRow = Math.floor(r / boxRows);
        if ((boxRow + boxCol) % 2 === 1) button.classList.add("shade");
        if (c === 0) button.classList.add("edge-l");
        if (r === 0) button.classList.add("edge-t");
        if (c === size - 1) button.classList.add("edge-r");
        if (r === size - 1) button.classList.add("edge-b");
        if ((c + 1) % boxCols === 0 && c !== size - 1) button.classList.add("thick-r");
        if ((r + 1) % boxRows === 0 && r !== size - 1) button.classList.add("thick-b");
        if (givens[index]) button.classList.add("given");
        if (selected === index) button.classList.add("selected");
        if (state.bad[index]) button.classList.add("bad");
        var value = cells[index] | 0;
        var color = ballById(value);
        if (value && color) {
          button.appendChild(makeBall(value));
          button.setAttribute("data-ball", String(value));
        }
        var label = "Row " + (r + 1) + ", column " + (c + 1);
        if (color) label += ", " + color.name + " ball";
        else label += ", empty";
        if (givens[index]) label += ", starter";
        button.setAttribute("aria-label", label);
        (function (cellIndex) {
          button.addEventListener("click", function () {
            if (dealing || justSolved) return;
            selected = cellIndex;
            message = givens[cellIndex]
              ? tone("marble.starter", "That box is a starter. Pick an empty one.")
              : tone("marble.now", "Now tap a ball.");
            render();
          });
        })(index);
        board.appendChild(button);
      }
    }
    card.appendChild(board);

    var status = document.createElement("p");
    status.className = "status" + (Object.keys(state.bad).length ? " warn" : "");
    status.setAttribute("aria-live", "polite");
    status.textContent = message;

    var controls = document.createElement("div");
    controls.className = "controls";
    var palette = document.createElement("div");
    palette.className = "palette";
    palette.setAttribute("role", "group");
    palette.setAttribute("aria-label", "Balls");
    var b;
    for (b = 0; b < size; b++) {
      var ball = BALLS[b];
      var key = document.createElement("button");
      key.type = "button";
      key.className = "ball-btn";
      key.setAttribute("data-ball", String(ball.id));
      key.setAttribute("aria-label", ball.name + " ball");
      if (selected != null && cells[selected] === ball.id) {
        key.classList.add("picked");
        key.setAttribute("aria-pressed", "true");
      }
      key.appendChild(makeBall(ball.id));
      (function (id) {
        key.addEventListener("click", function () {
          place(id);
        });
      })(ball.id);
      palette.appendChild(key);
    }

    var actions = document.createElement("div");
    actions.className = "actions";
    var eraseBtn = document.createElement("button");
    eraseBtn.type = "button";
    eraseBtn.className = "action erase";
    eraseBtn.textContent = tone("marble.erase", "Erase");
    eraseBtn.addEventListener("click", erase);
    var freshBtn = document.createElement("button");
    freshBtn.type = "button";
    freshBtn.id = "new-puzzle";
    freshBtn.className = "action fresh";
    freshBtn.textContent = tone("marble.new", "New puzzle");
    freshBtn.addEventListener("click", function () {
      requestDeal(size);
    });
    actions.appendChild(eraseBtn);
    actions.appendChild(freshBtn);
    controls.appendChild(palette);
    controls.appendChild(actions);

    var side = document.createElement("div");
    side.className = "side";
    side.appendChild(status);
    side.appendChild(controls);

    layout.appendChild(line);
    layout.appendChild(legend);
    layout.appendChild(card);
    layout.appendChild(side);
    app.appendChild(layout);

    if (selected != null && board.children[selected] && board.children[selected].scrollIntoView) {
      board.children[selected].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function renderHowto() {
    var overlay = document.createElement("div");
    overlay.className = "overlay";
    var sheet = document.createElement("div");
    sheet.className = "sheet";
    var body = document.createElement("div");
    body.className = "sheet-body";
    var title = document.createElement("h2");
    title.textContent = tone("chrome.howto", "Instructions");
    var lead = document.createElement("p");
    lead.textContent = tone("marble.howtoLead", "Hi {name}. These glossy balls follow Sudoku rules.");
    var list = document.createElement("ol");
    var steps = window.JoyceStyle && window.JoyceStyle.list ? window.JoyceStyle.list("marble.steps") : [];
    if (!steps.length) {
      steps = [
        "Tap an empty box.",
        "Tap a shiny ball to put it there.",
        "Each color goes once in every row, every column, and every bold box.",
        "A pink box means that color is already in that line or box.",
        "Blue boxes are starters. They stay put.",
        "Tap New puzzle when you want a new board."
      ];
    }
    steps.forEach(function (line) {
      var item = document.createElement("li");
      item.textContent = line;
      list.appendChild(item);
    });
    var example = document.createElement("div");
    example.className = "example";
    example.setAttribute("aria-hidden", "true");
    [1, 2, 4, 5].forEach(function (id) {
      example.appendChild(makeBall(id));
    });
    body.appendChild(title);
    body.appendChild(lead);
    body.appendChild(list);
    body.appendChild(example);
    var go = document.createElement("button");
    go.type = "button";
    go.className = "big-btn";
    go.textContent = tone("marble.go", "Let's play");
    go.addEventListener("click", function () {
      safeSet(howtoKey(), "yes");
      howtoOpen = false;
      render();
    });
    sheet.appendChild(body);
    sheet.appendChild(go);
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function renderCelebration() {
    var overlay = document.createElement("div");
    overlay.className = "overlay";
    var sheet = document.createElement("div");
    sheet.className = "sheet yay";
    var party = document.createElement("div");
    party.className = "party-balls";
    party.setAttribute("aria-hidden", "true");
    var i;
    for (i = 1; i <= size; i++) {
      party.appendChild(makeBall(i));
    }
    var title = document.createElement("h2");
    title.textContent = tone("marble.win", "You did it!");
    var text = document.createElement("p");
    text.textContent = tone("marble.happy", "Every ball is in the right place.");
    var again = document.createElement("button");
    again.type = "button";
    again.className = "big-btn";
    again.textContent = tone("marble.again", "New puzzle");
    again.addEventListener("click", function () {
      requestDeal(size);
    });
    var see = document.createElement("button");
    see.type = "button";
    see.className = "big-btn quiet";
    see.textContent = tone("marble.see", "See the board");
    see.addEventListener("click", function () {
      hideWin = true;
      render();
    });
    sheet.appendChild(party);
    sheet.appendChild(title);
    sheet.appendChild(text);
    sheet.appendChild(again);
    sheet.appendChild(see);
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function render() {
    if (!app) return;
    app.innerHTML = "";
    if (!window.MarbleEngine) {
      var missing = document.createElement("p");
      missing.className = "status warn";
      missing.textContent = "The marble tray did not load.";
      app.appendChild(missing);
      return;
    }
    renderPlay();
    if (howtoOpen) renderHowto();
    else if (justSolved && !hideWin) renderCelebration();
    if (window.JoyceStyle && typeof window.JoyceStyle.apply === "function") {
      window.JoyceStyle.apply(app);
    }
  }

  try {
    if (!safeGet(howtoKey())) howtoOpen = true;
  } catch (err) {
    howtoOpen = true;
  }

  if (howtoBtn) {
    howtoBtn.addEventListener("click", function () {
      howtoOpen = true;
      render();
    });
  }

  var saved = load();
  if (saved) {
    var info = MarbleEngine.spec(saved.size);
    applyBoard(saved.givens, saved.cells, saved.size, info.br, info.bc);
  } else if (window.MarbleEngine) {
    var made = MarbleEngine.generate(4);
    applyBoard(made.givens, made.givens, made.size, made.boxRows, made.boxCols);
    justSolved = false;
    message = tone("marble.start", "Tap an empty box. Then tap a ball.");
    save();
  }

  window.addEventListener("jw-style-change", render);
  render();
})();
