// Ice Cream Scoop: water-animal Sudoku with crossword clues,
// then a cosmetic ice cream maker. Profiles and the scoop board
// stay on this iPad.
(function () {
  var STORE_KEY = "joyce-ice-cream-scoop";
  var HOWTO_KEY = "joyce-scoop-howto";
  var MAX_PROFILES = 4;
  var MAX_SCOOPS = 3;
  var MAX_TOPS = 3;
  var MAX_CREATIONS = 6;

  var AVATARS = ["🍦", "🐬", "🦀", "🐠", "🐧", "🐙", "🐳", "🐢"];

  var POINTS = { Easy: 10, Medium: 20, Harder: 30 };

  var FLAVORS = [
    { id: "vanilla", name: "Vanilla", color: "#fff3c4" },
    { id: "chocolate", name: "Chocolate", color: "#7a4528" },
    { id: "strawberry", name: "Strawberry", color: "#ff7aa2" },
    { id: "blueberry", name: "Blueberry", color: "#6a7dff" },
    { id: "mint", name: "Mint", color: "#7ddea0" },
    { id: "ocean", name: "Ocean", color: "#3ec6e0" }
  ];

  var CONES = [
    { id: "waffle", name: "Waffle" },
    { id: "cup", name: "Cup" },
    { id: "boat", name: "Boat" }
  ];

  var TOPPINGS = [
    { id: "cherry", name: "Cherry", emoji: "🍒", need: 0 },
    { id: "sprinkles", name: "Sprinkles", emoji: "🌈", need: 0 },
    { id: "whip", name: "Whip", emoji: "🤍", need: 0 },
    { id: "fish", name: "Gummy fish", emoji: "🐟", need: 1 },
    { id: "star", name: "Starfish", emoji: "🌟", need: 2 },
    { id: "seaweed", name: "Sea candy", emoji: "🌿", need: 3 },
    { id: "pearl", name: "Pearl", emoji: "💎", need: 4 },
    { id: "gold", name: "Gold shell", emoji: "🐚", need: 6 }
  ];

  var TOP_EMOJI = {
    cherry: "🍒",
    whip: "🤍",
    fish: "🐟",
    star: "🌟",
    seaweed: "🌿",
    pearl: "💎",
    gold: "🐚"
  };

  var app = document.getElementById("app");
  var howtoBtn = document.getElementById("howto-btn");
  var scorePill = document.getElementById("score-pill");

  var store = loadStore();
  var screen = active() ? "harbor" : "profiles";
  var howtoOpen = false;
  var pendingRemove = null;
  var formName = "";
  var formAvatar = "🍦";
  var formNote = "";
  var makerNote = "";

  var levelIndex = 0;
  var cells = [];
  var selected = null;
  var message = "Tap a box. Then tap a letter or a number.";
  var justSolved = false;
  var lastAward = null;
  var levelEnding = false;
  var hintFlash = null;
  var hintTimer = 0;

  try {
    if (!localStorage.getItem(HOWTO_KEY)) howtoOpen = true;
  } catch (err) {
    howtoOpen = true;
  }

  howtoBtn.addEventListener("click", function () {
    howtoOpen = true;
    render();
  });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function puzzle() {
    return PUZZLES[levelIndex];
  }

  function pointsFor(item) {
    return POINTS[item.difficulty] || 10;
  }

  function emptyStore() {
    return { activeId: null, profiles: [] };
  }

  function freshDraft() {
    return { cone: "waffle", scoops: ["strawberry"], toppings: ["cherry"] };
  }

  function normalizeProfile(profile) {
    profile.name = cleanName(profile.name) || "Swimmer";
    if (AVATARS.indexOf(profile.avatar) === -1) profile.avatar = "🍦";
    profile.points = Math.max(0, Math.round(Number(profile.points) || 0));
    profile.solved = Array.isArray(profile.solved) ? profile.solved.filter(function (id) {
      return typeof id === "string";
    }) : [];
    profile.creations = Array.isArray(profile.creations) ? profile.creations.slice(0, MAX_CREATIONS) : [];
    profile.progress = profile.progress && typeof profile.progress === "object" ? profile.progress : {};
    if (!profile.draft || typeof profile.draft !== "object") profile.draft = freshDraft();
    if (CONES.every(function (cone) { return cone.id !== profile.draft.cone; })) {
      profile.draft.cone = "waffle";
    }
    profile.draft.scoops = Array.isArray(profile.draft.scoops) ? profile.draft.scoops.slice(0, MAX_SCOOPS) : [];
    profile.draft.toppings = Array.isArray(profile.draft.toppings) ? profile.draft.toppings.slice(0, MAX_TOPS) : [];
    return profile;
  }

  function loadStore() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!raw || !Array.isArray(raw.profiles)) return emptyStore();
      raw.profiles = raw.profiles.filter(function (profile) {
        return profile && profile.id && typeof profile.name === "string";
      }).slice(0, MAX_PROFILES);
      raw.profiles.forEach(normalizeProfile);
      if (!raw.profiles.some(function (profile) { return profile.id === raw.activeId; })) {
        raw.activeId = raw.profiles.length ? raw.profiles[0].id : null;
      }
      return raw;
    } catch (err) {
      return emptyStore();
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (err) {
      /* Private browsing can block storage. The game still plays. */
    }
  }

  function active() {
    for (var i = 0; i < store.profiles.length; i++) {
      if (store.profiles[i].id === store.activeId) return store.profiles[i];
    }
    return null;
  }

  function cleanName(raw) {
    return String(raw || "").replace(/\s+/g, " ").replace(/[<>]/g, "").trim().slice(0, 12);
  }

  function wavesCleared(profile) {
    return profile ? profile.solved.length : 0;
  }

  function toppingUnlocked(profile, topping) {
    return wavesCleared(profile) >= topping.need;
  }

  function flavorById(id) {
    for (var i = 0; i < FLAVORS.length; i++) {
      if (FLAVORS[i].id === id) return FLAVORS[i];
    }
    return FLAVORS[0];
  }

  function waveWord(n) {
    return n === 1 ? "1 wave" : n + " waves";
  }

  function letterOrderOk(values, word) {
    var letters = {};
    for (var i = 0; i < word.length; i++) letters[word.charAt(i)] = true;

    function can(pos, wordIndex) {
      if (pos === values.length) return wordIndex === word.length;
      var cell = values[pos];
      if (!cell) {
        if (can(pos + 1, wordIndex)) return true;
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
      for (i = 0; i < current.size; i++) list.push(clue.index * current.size + i);
    } else {
      for (i = 0; i < current.size; i++) list.push(i * current.size + clue.index);
    }
    return list;
  }

  function onClue(current, index) {
    var size = current.size;
    var row = Math.floor(index / size);
    var col = index % size;
    for (var i = 0; i < current.clues.length; i++) {
      var clue = current.clues[i];
      if (clue.dir === "row" && clue.index === row) return true;
      if (clue.dir === "col" && clue.index === col) return true;
    }
    return false;
  }

  function conflicts(current, grid) {
    var bad = {};
    var size = current.size;

    function markDuplicates(indexes) {
      var groups = {};
      indexes.forEach(function (index) {
        var value = grid[index];
        if (!value) return;
        if (!groups[value]) groups[value] = [];
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
      for (c = 0; c < size; c++) row.push(r * size + c);
      markDuplicates(row);
    }
    for (c = 0; c < size; c++) {
      var col = [];
      for (r = 0; r < size; r++) col.push(r * size + c);
      markDuplicates(col);
    }
    var br;
    var bc;
    for (br = 0; br < size; br += current.boxRows) {
      for (bc = 0; bc < size; bc += current.boxCols) {
        var box = [];
        for (r = br; r < br + current.boxRows; r++) {
          for (c = bc; c < bc + current.boxCols; c++) box.push(r * size + c);
        }
        markDuplicates(box);
      }
    }

    var orderBroken = false;
    current.clues.forEach(function (clue) {
      var indexes = clueIndexes(current, clue);
      var values = indexes.map(function (index) { return grid[index] || ""; });
      if (!letterOrderOk(values, current.word)) {
        orderBroken = true;
        indexes.forEach(function (index) {
          var value = grid[index];
          if (value && current.word.indexOf(value) !== -1) bad[index] = bad[index] || "order";
        });
      }
    });

    return { bad: bad, orderBroken: orderBroken };
  }

  function isSolved(current, grid) {
    for (var i = 0; i < current.solution.length; i++) {
      if (grid[i] !== current.solution[i]) return false;
    }
    return true;
  }

  function isGiven(current, index) {
    return current.givens[index] !== "";
  }

  function optionsFor(current, grid, index) {
    var size = current.size;
    var r = Math.floor(index / size);
    var c = index % size;
    var used = {};
    var i;
    for (i = 0; i < size; i++) {
      if (grid[r * size + i]) used[grid[r * size + i]] = true;
      if (grid[i * size + c]) used[grid[i * size + c]] = true;
    }
    var r0 = Math.floor(r / current.boxRows) * current.boxRows;
    var c0 = Math.floor(c / current.boxCols) * current.boxCols;
    var rr;
    var cc;
    for (rr = r0; rr < r0 + current.boxRows; rr++) {
      for (cc = c0; cc < c0 + current.boxCols; cc++) {
        if (grid[rr * size + cc]) used[grid[rr * size + cc]] = true;
      }
    }
    var opts = [];
    current.symbols.forEach(function (symbol) {
      if (used[symbol]) return;
      grid[index] = symbol;
      var ok = true;
      current.clues.forEach(function (clue) {
        if (!ok) return;
        var onLine = (clue.dir === "row" && clue.index === r) || (clue.dir === "col" && clue.index === c);
        if (!onLine) return;
        var indexes = clueIndexes(current, clue);
        var values = indexes.map(function (cellIndex) { return grid[cellIndex] || ""; });
        if (!letterOrderOk(values, current.word)) ok = false;
      });
      grid[index] = "";
      if (ok) opts.push(symbol);
    });
    return opts;
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
    for (i = 0; i < empties.length; i++) {
      if (onClue(current, empties[i])) return empties[i];
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
    message = "Watch the glowing box!";
    render();
    hintTimer = window.setTimeout(function () {
      if (!hintFlash || hintFlash.index !== index) return;
      hintFlash = null;
      message = "That box can be " + symbol + ".";
      render();
    }, 1300);
  }

  function grant(current) {
    var profile = active();
    var replay = profile.solved.indexOf(current.id) !== -1;
    var unlocked = [];
    if (!replay) {
      var before = profile.solved.length;
      profile.solved.push(current.id);
      profile.points += pointsFor(current);
      TOPPINGS.forEach(function (topping) {
        if (topping.need > before && topping.need <= profile.solved.length) unlocked.push(topping);
      });
    }
    delete profile.progress[current.id];
    saveStore();
    return { pts: replay ? 0 : pointsFor(current), replay: replay, unlocked: unlocked };
  }

  function saveProgress(current) {
    var profile = active();
    if (!profile) return;
    if (isSolved(current, cells)) delete profile.progress[current.id];
    else profile.progress[current.id] = cells.slice();
    saveStore();
  }

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

  function launchLevel(index) {
    levelIndex = index;
    var current = puzzle();
    var profile = active();
    var saved = profile && profile.progress[current.id];
    if (Array.isArray(saved) && saved.length === current.solution.length) {
      cells = saved.map(function (value) { return typeof value === "string" ? value : ""; });
      current.givens.forEach(function (given, i) {
        if (given) cells[i] = given;
      });
      cells.forEach(function (value, i) {
        if (value && current.symbols.indexOf(value) === -1) cells[i] = current.givens[i] || "";
      });
    } else {
      cells = current.givens.slice();
    }
    selected = null;
    justSolved = false;
    lastAward = null;
    clearFlash();
    if (isSolved(current, cells)) {
      justSolved = true;
      lastAward = grant(current);
      message = "";
    } else {
      message = "Tap a box. Then tap a letter or a number.";
    }
    screen = "play";
    render();
  }

  function enterSymbol(symbol) {
    var current = puzzle();
    if (justSolved || isSolved(current, cells)) return;
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
    if (hasBad && result.orderBroken) message = "Read the letters in order. They spell " + current.word + ".";
    else if (hasBad) message = "Two boxes match. Try a new one.";
    else if (symbol === current.solution[selected]) message = "Nice!";
    else message = "Keep going!";
    afterMove(current);
  }

  function erase() {
    var current = puzzle();
    if (justSolved || isSolved(current, cells)) return;
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
      lastAward = grant(current);
      burst();
    } else {
      saveProgress(current);
    }
    render();
  }

  function resetLevel() {
    var current = puzzle();
    cells = current.givens.slice();
    selected = null;
    justSolved = false;
    lastAward = null;
    clearFlash();
    message = "All clear. You can try again!";
    saveProgress(current);
    render();
  }

  function burst() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var layer = document.createElement("div");
    layer.className = "confetti";
    var emojis = ["🍦", "🌊", "🐬", "🦀", "🐠", "🍒", "⭐", "🐳", "🎉", "🐚"];
    for (var i = 0; i < 22; i++) {
      var bit = document.createElement("span");
      bit.textContent = emojis[i % emojis.length];
      bit.style.left = Math.random() * 100 + "%";
      bit.style.animationDelay = Math.random() * 0.35 + "s";
      bit.style.fontSize = 26 + Math.random() * 22 + "px";
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 1800);
  }

  function pillClass(difficulty) {
    return "pill " + difficulty.toLowerCase();
  }

  function makeButton(label, className, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function paintScore() {
    var profile = active();
    if (!profile || screen === "profiles") {
      scorePill.hidden = true;
      return;
    }
    scorePill.hidden = false;
    scorePill.textContent = profile.points + " scoops";
    scorePill.setAttribute("aria-label", profile.name + " has " + profile.points + " scoops");
  }

  function renderProfiles() {
    var intro = el("p", "screen-intro", "Who is playing?");
    var sub = el("p", "subline", "Pick a swimmer. This iPad can keep " + MAX_PROFILES + ".");
    app.appendChild(intro);
    app.appendChild(sub);

    if (store.profiles.length) {
      var list = el("div", "profile-list");
      store.profiles.forEach(function (profile) {
        var card = el("div", "profile-card");
        var main = document.createElement("button");
        main.type = "button";
        main.className = "profile-main" + (profile.id === store.activeId ? " is-on" : "");
        main.appendChild(el("span", "profile-emoji", profile.avatar));
        main.appendChild(el("span", "profile-name", profile.name));
        var meta = profile.points + " scoops · " + waveWord(wavesCleared(profile));
        if (profile.id === store.activeId) meta = "Playing · " + meta;
        main.appendChild(el("span", "profile-meta", meta));
        main.addEventListener("click", function () {
          store.activeId = profile.id;
          saveStore();
          screen = "harbor";
          render();
        });
        var remove = makeButton("Remove", "remove-btn", function () {
          pendingRemove = profile.id;
          render();
        });
        card.appendChild(main);
        card.appendChild(remove);
        list.appendChild(card);
      });
      app.appendChild(list);
    }

    var panel = el("div", "panel");
    if (store.profiles.length >= MAX_PROFILES) {
      panel.appendChild(el("h2", null, "The boat is full"));
      panel.appendChild(el("p", "form-note", "Remove a swimmer if you want a new one."));
    } else {
      panel.appendChild(el("h2", null, store.profiles.length ? "New swimmer" : "Make your swimmer"));
      var avatars = el("div", "avatars");
      AVATARS.forEach(function (avatar) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "avatar-btn" + (formAvatar === avatar ? " is-on" : "");
        button.textContent = avatar;
        button.setAttribute("aria-label", "Avatar " + avatar);
        button.setAttribute("aria-pressed", formAvatar === avatar ? "true" : "false");
        button.addEventListener("click", function () {
          formAvatar = avatar;
          render();
        });
        avatars.appendChild(button);
      });
      var input = document.createElement("input");
      input.className = "name-input";
      input.maxLength = 12;
      input.placeholder = "Type your name";
      input.autocomplete = "off";
      input.enterKeyHint = "done";
      input.value = formName;
      input.setAttribute("aria-label", "Your name");
      input.addEventListener("input", function () {
        formName = input.value;
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") createProfile();
      });
      var note = el("p", "form-note", formNote);
      var go = makeButton("Let's splash!", "big-btn sun", createProfile);
      panel.appendChild(avatars);
      panel.appendChild(input);
      panel.appendChild(note);
      panel.appendChild(go);
    }
    app.appendChild(panel);

    if (active()) {
      var backWrap = el("div", "stack-top");
      backWrap.appendChild(makeButton("Back", "big-btn ghost", function () {
        screen = "harbor";
        render();
      }));
      app.appendChild(backWrap);
    }
  }

  function createProfile() {
    var name = cleanName(formName);
    if (!name) {
      formNote = "Type a name first.";
      render();
      return;
    }
    var taken = store.profiles.some(function (profile) {
      return profile.name.toLowerCase() === name.toLowerCase();
    });
    if (taken) {
      formNote = "That name is already swimming. Pick another.";
      render();
      return;
    }
    if (store.profiles.length >= MAX_PROFILES) return;
    var profile = normalizeProfile({
      id: "p" + Date.now().toString(36),
      name: name,
      avatar: formAvatar,
      points: 0,
      solved: [],
      creations: [],
      progress: {},
      draft: freshDraft()
    });
    store.profiles.push(profile);
    store.activeId = profile.id;
    saveStore();
    formName = "";
    formNote = "";
    formAvatar = "🍦";
    screen = "harbor";
    render();
  }

  function renderRemove() {
    var profile = null;
    store.profiles.forEach(function (item) {
      if (item.id === pendingRemove) profile = item;
    });
    if (!profile) {
      pendingRemove = null;
      return;
    }
    var overlay = el("div", "overlay");
    var sheet = el("div", "sheet");
    sheet.appendChild(el("h2", null, "Remove " + profile.name + "?"));
    sheet.appendChild(el("p", null, "Their scoops and ice creams on this iPad go away."));
    sheet.appendChild(makeButton("Keep " + profile.name, "big-btn sun", function () {
      pendingRemove = null;
      render();
    }));
    sheet.appendChild(makeButton("Remove", "big-btn ghost", function () {
      store.profiles = store.profiles.filter(function (item) { return item.id !== profile.id; });
      if (store.activeId === profile.id) {
        store.activeId = store.profiles.length ? store.profiles[0].id : null;
      }
      pendingRemove = null;
      saveStore();
      if (!active()) screen = "profiles";
      render();
    }));
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function renderHarbor() {
    var profile = active();
    var card = el("div", "hello-card");
    card.appendChild(el("div", "hello-avatar", profile.avatar));
    card.appendChild(el("h2", null, "Hi, " + profile.name + "!"));
    card.appendChild(el("p", null, profile.points + " scoops · " + waveWord(wavesCleared(profile)) + " cleared"));
    var menu = el("div", "menu");
    menu.appendChild(makeButton("Play waves", "menu-btn play", function () {
      screen = "levels";
      render();
    }));
    menu.appendChild(makeButton("Make ice cream", "menu-btn maker", function () {
      makerNote = "";
      screen = "maker";
      render();
    }));
    menu.appendChild(makeButton("Scoop board", "menu-btn board", function () {
      screen = "board";
      render();
    }));
    menu.appendChild(makeButton("Switch swimmer", "menu-btn", function () {
      screen = "profiles";
      render();
    }));
    app.appendChild(card);
    app.appendChild(menu);
    app.appendChild(el("p", "parade-note", "🌊 🐬 🍦 🦀 🐠"));
  }

  function renderLevels() {
    var profile = active();
    app.appendChild(el("p", "screen-intro", "Pick a wave"));
    app.appendChild(el("p", "subline", waveWord(wavesCleared(profile)) + " cleared · " + profile.points + " scoops"));
    var grid = el("div", "levels");
    PUZZLES.forEach(function (item, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "level-card";
      button.addEventListener("click", function () { launchLevel(index); });
      button.appendChild(el("span", "level-emoji", item.emoji));
      button.appendChild(el("span", "level-title", item.title));
      button.appendChild(el("span", "level-wave", "Wave " + (index + 1)));
      var pill = el("span", pillClass(item.difficulty), item.difficulty);
      button.appendChild(pill);
      var done = profile.solved.indexOf(item.id) !== -1;
      button.appendChild(el("span", "reward", done ? "Cleared" : "Earns " + pointsFor(item) + " scoops"));
      if (done) {
        var star = el("span", "star", "⭐");
        star.setAttribute("aria-label", "Cleared");
        button.appendChild(star);
      }
      grid.appendChild(button);
    });
    app.appendChild(grid);
    var backWrap = el("div", "stack-top");
    backWrap.appendChild(makeButton("Back", "big-btn ghost", function () {
      screen = "harbor";
      render();
    }));
    app.appendChild(backWrap);
  }

  function renderPlay() {
    var current = puzzle();
    var result = conflicts(current, cells);
    var layout = el("div", "play-layout");

    var line = el("div", "level-line");
    line.appendChild(el("span", "big-emoji", current.emoji));
    var heading = document.createElement("h2");
    heading.textContent = current.title;
    line.appendChild(heading);
    line.appendChild(el("span", pillClass(current.difficulty), current.difficulty));

    var clueCard = el("div", "clue-card");
    clueCard.appendChild(el("p", "clue-word", current.emoji + " " + current.word));
    clueCard.appendChild(el("p", "clue-say", current.say));
    var strips = el("div", "strips");
    current.clues.forEach(function (clue) {
      var strip = el("div", "strip");
      strip.appendChild(el("span", "strip-label", clue.dir === "row" ? "Across" : "Down"));
      var boxes = el("div", "strip-cells");
      clueIndexes(current, clue).forEach(function (index) {
        var value = cells[index] || "";
        var mini = el("span", "mini-cell" + (value && current.word.indexOf(value) === -1 ? " num" : "") + (result.bad[index] ? " bad" : ""));
        mini.textContent = value;
        boxes.appendChild(mini);
      });
      strip.appendChild(boxes);
      strips.appendChild(strip);
    });
    clueCard.appendChild(strips);

    var legend = el("p", "legend", "Use each one time in every row, column, and bold box. Mint boxes spell the word.");
    var chips = el("div", "chips");
    current.symbols.forEach(function (symbol) {
      chips.appendChild(el("span", "chip" + (current.word.indexOf(symbol) === -1 ? " num" : ""), symbol));
    });

    var card = el("div", "board-card");
    var board = el("div", "board");
    board.style.setProperty("--n", String(current.size));
    board.setAttribute("role", "grid");
    board.setAttribute("aria-label", current.title + " puzzle");
    if (current.size <= 4) board.classList.add("cozy");
    else board.classList.add("wide");

    function addGutter(clue, className) {
      var gutter = el("div", "gutter " + className);
      if (clue) {
        gutter.appendChild(el("span", "clue-emoji", current.emoji));
        gutter.appendChild(el("span", "clue-spell", current.word));
        gutter.appendChild(el("span", "clue-dir", clue.dir === "row" ? "across" : "down"));
      }
      board.appendChild(gutter);
    }

    addGutter(null, "corner");
    var c;
    var r;
    for (c = 0; c < current.size; c++) {
      var colClue = null;
      current.clues.forEach(function (clue) {
        if (clue.dir === "col" && clue.index === c) colClue = clue;
      });
      addGutter(colClue, "col-clue");
    }
    for (r = 0; r < current.size; r++) {
      var rowClue = null;
      current.clues.forEach(function (clue) {
        if (clue.dir === "row" && clue.index === r) rowClue = clue;
      });
      addGutter(rowClue, "row-clue");
      for (c = 0; c < current.size; c++) {
        var index = r * current.size + c;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cell";
        var boxCol = Math.floor(c / current.boxCols);
        var boxRow = Math.floor(r / current.boxRows);
        if ((boxRow + boxCol) % 2 === 1) button.classList.add("shade");
        if (onClue(current, index)) button.classList.add("on-clue");
        if (c === 0) button.classList.add("edge-l");
        if (r === 0) button.classList.add("edge-t");
        if (c === current.size - 1) button.classList.add("edge-r");
        if (r === current.size - 1) button.classList.add("edge-b");
        if ((c + 1) % current.boxCols === 0 && c !== current.size - 1) button.classList.add("thick-r");
        if ((r + 1) % current.boxRows === 0 && r !== current.size - 1) button.classList.add("thick-b");
        var shown = cells[index];
        if (!shown && hintFlash && hintFlash.index === index) {
          shown = hintFlash.symbol;
          button.classList.add("flash");
        }
        if (shown) {
          button.textContent = shown;
          if (current.word.indexOf(shown) === -1) button.classList.add("num");
        }
        if (isGiven(current, index)) button.classList.add("given");
        if (selected === index) button.classList.add("selected");
        if (result.bad[index] && !isGiven(current, index)) button.classList.add("bad");
        button.setAttribute("aria-label", "Row " + (r + 1) + ", column " + (c + 1) + (cells[index] ? ", " + cells[index] : ", empty"));
        (function (cellIndex) {
          button.addEventListener("click", function () {
            if (justSolved) return;
            selected = cellIndex;
            message = isGiven(current, cellIndex) ? "That box is a starter. Pick an empty one." : "Now tap a letter or a number.";
            render();
          });
        })(index);
        board.appendChild(button);
      }
    }
    card.appendChild(board);

    var status = el("p", "status" + (Object.keys(result.bad).length ? " warn" : ""), message);
    status.setAttribute("aria-live", "polite");

    var controls = el("div", "controls");
    var keypad = el("div", "keypad");
    keypad.setAttribute("role", "group");
    keypad.setAttribute("aria-label", "Letters and numbers");
    current.symbols.forEach(function (symbol) {
      var key = makeButton(symbol, "key" + (current.word.indexOf(symbol) === -1 ? " num" : ""), function () {
        enterSymbol(symbol);
      });
      keypad.appendChild(key);
    });
    keypad.appendChild(makeButton("Erase", "key erase", erase));

    var actions = el("div", "actions");
    actions.appendChild(makeButton("Hint", "action hint", function () {
      var now = puzzle();
      if (justSolved || isSolved(now, cells)) return;
      var index = hintIndex(now);
      if (index == null) {
        message = "Erase a pink box and try a new one.";
        render();
        return;
      }
      showFlash(index, now.solution[index]);
    }));
    actions.appendChild(makeButton("Start over", "action reset", function () {
      var now = puzzle();
      if (justSolved || isSolved(now, cells)) {
        resetLevel();
        return;
      }
      afterLevel(false, function () { resetLevel(); });
    }));
    actions.appendChild(makeButton("Waves", "action back", function () {
      screen = "levels";
      justSolved = false;
      clearFlash();
      render();
    }));
    controls.appendChild(keypad);
    controls.appendChild(actions);

    var side = el("div", "side");
    side.appendChild(status);
    side.appendChild(controls);

    layout.appendChild(line);
    layout.appendChild(clueCard);
    layout.appendChild(legend);
    layout.appendChild(chips);
    layout.appendChild(card);
    layout.appendChild(side);
    app.appendChild(layout);
  }

  function renderCelebration() {
    var current = puzzle();
    var award = lastAward || { pts: 0, replay: true, unlocked: [] };
    var overlay = el("div", "overlay");
    var sheet = el("div", "sheet yay");
    sheet.appendChild(el("div", "party", current.emoji + " 🎉"));
    sheet.appendChild(el("h2", null, "You did it!"));
    var text = el("p");
    if (award.replay) {
      text.textContent = "The " + current.title.toLowerCase() + " is happy you came back.";
    } else {
      text.textContent = "You earned " + award.pts + " scoops! You have " + active().points + " scoops.";
    }
    sheet.appendChild(text);
    if (award.unlocked && award.unlocked.length) {
      var names = award.unlocked.map(function (topping) { return topping.name; }).join(" and ");
      sheet.appendChild(el("p", null, "New topping: " + names + "!"));
    }
    var last = levelIndex === PUZZLES.length - 1;
    sheet.appendChild(makeButton(last ? "All waves" : "Next wave", "big-btn sun", function () {
      afterLevel(true, function () {
        if (last) {
          screen = "levels";
          justSolved = false;
          render();
        } else {
          launchLevel(levelIndex + 1);
        }
      });
    }));
    sheet.appendChild(makeButton("Make ice cream", "big-btn pink", function () {
      var unlocked = award.unlocked || [];
      afterLevel(true, function () {
        makerNote = unlocked.length ? "New topping unlocked: " + unlocked.map(function (topping) { return topping.name; }).join(" and ") + "!" : "";
        screen = "maker";
        justSolved = false;
        render();
      });
    }));
    sheet.appendChild(makeButton("Play again", "big-btn ghost", function () {
      afterLevel(true, function () { resetLevel(); });
    }));
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function drawTreat(host, creation, compact) {
    var treat = el("div", "treat");
    var tops = el("div", "treat-tops");
    (creation.toppings || []).forEach(function (id) {
      if (TOP_EMOJI[id]) tops.textContent += TOP_EMOJI[id];
    });
    treat.appendChild(tops);
    var scoops = creation.scoops || [];
    for (var i = scoops.length - 1; i >= 0; i--) {
      var ball = el("div", "ball");
      var flavor = flavorById(scoops[i]);
      ball.style.backgroundColor = flavor.color;
      if (i === scoops.length - 1 && (creation.toppings || []).indexOf("sprinkles") !== -1) {
        ball.classList.add("sprinkled");
      }
      treat.appendChild(ball);
    }
    treat.appendChild(el("div", "base " + (creation.cone || "waffle")));
    host.appendChild(treat);
    if (!compact && !scoops.length) host.appendChild(el("p", "empty-cone", "Add a scoop!"));
  }

  function renderMaker() {
    var profile = active();
    var draft = profile.draft;
    app.appendChild(el("p", "screen-intro", "Make an ice cream"));
    var layout = el("div", "maker-layout");
    var stage = el("div", "stage-card");
    drawTreat(stage, draft, false);
    layout.appendChild(stage);

    var controls = el("div", "panel");
    if (makerNote) {
      var note = el("p", "status good", makerNote);
      note.setAttribute("aria-live", "polite");
      controls.appendChild(note);
    }

    controls.appendChild(el("h2", "block-title", "Cone"));
    var cones = el("div", "choices cones");
    CONES.forEach(function (cone) {
      var button = makeButton(cone.name, "choice" + (draft.cone === cone.id ? " is-on" : ""), function () {
        draft.cone = cone.id;
        saveStore();
        render();
      });
      button.setAttribute("aria-pressed", draft.cone === cone.id ? "true" : "false");
      cones.appendChild(button);
    });
    controls.appendChild(cones);

    var scoopTitle = el("h2", "block-title", "Scoops");
    scoopTitle.style.marginTop = "12px";
    controls.appendChild(scoopTitle);
    controls.appendChild(el("p", "profile-meta", draft.scoops.length + " of " + MAX_SCOOPS + ". The first scoop sits on the cone."));
    var flavors = el("div", "choices flavors");
    FLAVORS.forEach(function (flavor) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      var swatch = el("span", "swatch");
      swatch.style.background = flavor.color;
      button.appendChild(swatch);
      button.appendChild(el("span", null, flavor.name));
      button.addEventListener("click", function () {
        if (draft.scoops.length >= MAX_SCOOPS) {
          makerNote = "Three scoops is a tall cone!";
          render();
          return;
        }
        draft.scoops.push(flavor.id);
        makerNote = flavor.name + " is on the cone.";
        saveStore();
        render();
      });
      flavors.appendChild(button);
    });
    controls.appendChild(flavors);
    if (draft.scoops.length) {
      controls.appendChild(makeButton("Take off top scoop", "big-btn ghost", function () {
        draft.scoops.pop();
        makerNote = "The top scoop is gone.";
        saveStore();
        render();
      }));
    }

    var topTitle = el("h2", "block-title", "Toppings");
    topTitle.style.marginTop = "12px";
    controls.appendChild(topTitle);
    var tops = el("div", "choices tops");
    TOPPINGS.forEach(function (topping) {
      var open = toppingUnlocked(profile, topping);
      var on = draft.toppings.indexOf(topping.id) !== -1;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "choice" + (on ? " is-on" : "") + (open ? "" : " locked");
      var label = el("span", null, topping.emoji + " " + topping.name);
      button.appendChild(label);
      if (!open) button.appendChild(el("span", "need", "Solve " + waveWord(topping.need)));
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.addEventListener("click", function () {
        if (!open) {
          makerNote = "Solve " + waveWord(topping.need) + " to unlock " + topping.name + ".";
          render();
          return;
        }
        if (!draft.scoops.length) {
          makerNote = "Add a scoop first.";
          render();
          return;
        }
        var at = draft.toppings.indexOf(topping.id);
        if (at !== -1) {
          draft.toppings.splice(at, 1);
          makerNote = topping.name + " came off.";
        } else if (draft.toppings.length >= MAX_TOPS) {
          makerNote = "Three toppings is plenty!";
        } else {
          draft.toppings.push(topping.id);
          makerNote = topping.name + " looks tasty.";
        }
        saveStore();
        render();
      });
      tops.appendChild(button);
    });
    controls.appendChild(tops);
    controls.appendChild(makeButton("Save this ice cream", "big-btn pink", function () {
      if (!draft.scoops.length) {
        makerNote = "Add a scoop first.";
        render();
        return;
      }
      if (profile.creations.length >= MAX_CREATIONS) {
        makerNote = "Your box is full. Toss one to save a new scoop.";
        render();
        return;
      }
      profile.creations.push({
        id: "c" + Date.now().toString(36),
        cone: draft.cone,
        scoops: draft.scoops.slice(),
        toppings: draft.toppings.slice()
      });
      makerNote = "Saved on " + profile.name + "'s profile!";
      saveStore();
      render();
    }));
    layout.appendChild(controls);
    app.appendChild(layout);

    var gallery = el("div", "panel");
    gallery.appendChild(el("h2", null, profile.name + "'s ice creams"));
    if (!profile.creations.length) {
      gallery.appendChild(el("p", "profile-meta", "No ice cream yet. Build one and tap save."));
    } else {
      var row = el("div", "gallery");
      profile.creations.forEach(function (creation) {
        var card = el("div", "gallery-card");
        var view = document.createElement("button");
        view.type = "button";
        view.className = "treat-btn";
        drawTreat(view, creation, true);
        view.appendChild(el("span", "profile-meta", coneName(creation.cone)));
        view.addEventListener("click", function () {
          profile.draft = {
            cone: creation.cone,
            scoops: creation.scoops.slice(),
            toppings: creation.toppings.slice()
          };
          makerNote = "Loaded! Change it, or save a copy.";
          saveStore();
          render();
        });
        var toss = makeButton("Toss", "toss", function () {
          profile.creations = profile.creations.filter(function (item) { return item.id !== creation.id; });
          makerNote = "Tossed.";
          saveStore();
          render();
        });
        card.appendChild(view);
        card.appendChild(toss);
        row.appendChild(card);
      });
      gallery.appendChild(row);
    }
    app.appendChild(gallery);

    var backWrap = el("div", "stack-top");
    backWrap.appendChild(makeButton("Back", "big-btn ghost", function () {
      screen = "harbor";
      render();
    }));
    app.appendChild(backWrap);
  }

  function coneName(id) {
    for (var i = 0; i < CONES.length; i++) {
      if (CONES[i].id === id) return CONES[i].name;
    }
    return "Cone";
  }

  function renderBoard() {
    var me = active();
    app.appendChild(el("p", "screen-intro", "Scoop board"));
    app.appendChild(el("p", "subline", "Who has the most scoops on this iPad?"));
    var ranked = store.profiles.slice().sort(function (a, b) {
      if (b.points !== a.points) return b.points - a.points;
      if (b.solved.length !== a.solved.length) return b.solved.length - a.solved.length;
      return a.name.localeCompare(b.name);
    });
    var list = el("div", "rank-list");
    var medals = ["🥇", "🥈", "🥉"];
    ranked.forEach(function (profile, index) {
      var row = el("div", "rank-row" + (profile.id === me.id ? " me" : ""));
      row.appendChild(el("div", "rank-place", medals[index] || String(index + 1)));
      row.appendChild(el("div", "rank-avatar", profile.avatar));
      var who = el("div");
      who.appendChild(el("div", "rank-name", profile.name));
      var ice = profile.creations.length === 1 ? "1 ice cream" : profile.creations.length + " ice creams";
      who.appendChild(el("div", "rank-meta", waveWord(wavesCleared(profile)) + " · " + ice));
      row.appendChild(who);
      row.appendChild(el("div", "rank-points", profile.points + " scoops"));
      list.appendChild(row);
    });
    app.appendChild(list);
    if (store.profiles.length < 2) {
      app.appendChild(el("p", "subline", "Add another swimmer if you want a race."));
    }
    var backWrap = el("div", "stack-top");
    backWrap.appendChild(makeButton("Back", "big-btn ghost", function () {
      screen = "harbor";
      render();
    }));
    app.appendChild(backWrap);
  }

  function renderHowto() {
    var overlay = el("div", "overlay");
    var sheet = el("div", "sheet");
    var who = active();
    var name = who ? who.name : "friend";
    sheet.appendChild(el("h2", null, "How to play"));
    sheet.appendChild(el("p", null, "Hi " + name + "! This is a crossword and a Sudoku, at the ocean."));
    var list = document.createElement("ol");
    [
      "Pick a swimmer. That profile keeps your scoops and ice creams on this iPad.",
      "Tap an empty box. Then tap a letter or a number.",
      "Every row, every column, and every bold box uses each letter and number one time.",
      "Mint boxes are the clue. Read the letters in order. They spell the word. A number can sit in the word.",
      "Finish a wave to earn scoops. Then build an ice cream and save it.",
      "The scoop board shows who has the most scoops on this iPad."
    ].forEach(function (line) {
      list.appendChild(el("li", null, line));
    });
    sheet.appendChild(list);
    var example = el("div", "example");
    example.appendChild(el("div", null, "🍦 ICE across"));
    var row = el("div", "example-row");
    row.appendChild(el("div", "example-cell", "I"));
    row.appendChild(el("div", "example-cell num", "1"));
    row.appendChild(el("div", "example-cell", "C"));
    row.appendChild(el("div", "example-cell", "E"));
    example.appendChild(row);
    example.appendChild(el("p", null, "Say I, C, E. That spells ICE! The number sits in the word."));
    sheet.appendChild(example);
    sheet.appendChild(el("p", null, "Pink boxes mean try a new one. Hint shows one box. It does not fill it in."));
    sheet.appendChild(makeButton("Let's splash!", "big-btn sun sticky-go", function () {
      try { localStorage.setItem(HOWTO_KEY, "yes"); } catch (err) { /* still closes */ }
      howtoOpen = false;
      render();
    }));
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function render() {
    app.innerHTML = "";
    paintScore();
    if (!active() && screen !== "profiles") screen = "profiles";
    if (screen === "profiles") renderProfiles();
    else if (screen === "harbor") renderHarbor();
    else if (screen === "levels") renderLevels();
    else if (screen === "play") renderPlay();
    else if (screen === "maker") renderMaker();
    else if (screen === "board") renderBoard();
    if (pendingRemove) renderRemove();
    else if (howtoOpen && screen !== "profiles") renderHowto();
    else if (screen === "play" && justSolved) renderCelebration();
  }

  render();
})();
