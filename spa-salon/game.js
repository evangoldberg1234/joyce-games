/* Spa Salon
   Style one guest at a time. Hair is tried on the mannequin, then put on the guest.
   Makeup, skincare, and nails go straight on the guest.
   The 40 / 20 / 5 / 0 result is style points kept in this game.
   It is not sent to the star server. The star bar only shows the real balance. */
(function () {
  var LOOKS = window.SPA_LOOKS;
  var STORE_KEY = "joyce-spa-salon";
  var HOWTO_KEY = "joyce-spa-howto";

  var app = document.getElementById("app");
  var howtoBtn = document.getElementById("howto-btn");
  var stylePill = document.getElementById("style-pill");

  var store = loadStore();
  var screen = "lobby";
  var howtoOpen = false;
  var guestId = null;
  var tab = "hair";
  var tryHair = null;
  var look = blankLook();
  var note = "";
  var retrying = false;
  var report = null;
  var levelEnding = false;

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

  function blankLook() {
    return { hair: null, makeup: null, skin: null, nails: null };
  }

  function loadStore() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || "");
      if (!raw || typeof raw !== "object") return { best: {}, looks: {} };
      if (!raw.best || typeof raw.best !== "object") raw.best = {};
      if (!raw.looks || typeof raw.looks !== "object") raw.looks = {};
      return raw;
    } catch (err) {
      return { best: {}, looks: {} };
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (err) {
      /* Private mode can block storage. The visit still plays. */
    }
  }

  function guestById(id) {
    var i;
    for (i = 0; i < LOOKS.guests.length; i++) {
      if (LOOKS.guests[i].id === id) return LOOKS.guests[i];
    }
    return LOOKS.guests[0];
  }

  function currentGuest() {
    return guestById(guestId);
  }

  function bestFor(id) {
    var n = store.best[id];
    return typeof n === "number" ? n : null;
  }

  function totalPoints() {
    var sum = 0;
    var i;
    for (i = 0; i < LOOKS.guests.length; i++) {
      var n = bestFor(LOOKS.guests[i].id);
      if (n) sum += n;
    }
    return sum;
  }

  function readyCount() {
    var count = 0;
    var i;
    for (i = 0; i < LOOKS.guests.length; i++) {
      var n = bestFor(LOOKS.guests[i].id);
      if (n != null && n >= 20) count += 1;
    }
    return count;
  }

  function makeButton(label, className, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function paintStyle() {
    var total = totalPoints();
    stylePill.hidden = false;
    stylePill.textContent = total + " style points";
    stylePill.setAttribute("aria-label", total + " spa style points");
  }

  function openGuest(id, isRetry) {
    guestId = id;
    tab = "hair";
    tryHair = null;
    look = blankLook();
    retrying = !!isRetry;
    report = null;
    var guest = guestById(id);
    note = isRetry
      ? guest.name + " is ready for another try. Match the look list."
      : "Tap a hair style. It shows up on the mannequin.";
    screen = "salon";
  }

  function nextGuestAfter(id) {
    var start = 0;
    var i;
    for (i = 0; i < LOOKS.guests.length; i++) {
      if (LOOKS.guests[i].id === id) start = i;
    }
    for (i = 1; i <= LOOKS.guests.length; i++) {
      var guest = LOOKS.guests[(start + i) % LOOKS.guests.length];
      var best = bestFor(guest.id);
      if (best == null || best < 20) return guest;
    }
    return null;
  }

  function missingParts(guest) {
    var missing = [];
    if (!look.hair) missing.push("hair on " + guest.name);
    if (!look.makeup) missing.push("makeup");
    if (!look.skin) missing.push("skincare");
    if (!look.nails) missing.push("nails");
    return missing;
  }

  function copyLook() {
    return { hair: look.hair, makeup: look.makeup, skin: look.skin, nails: look.nails };
  }

  function finishLook() {
    var guest = currentGuest();
    var missing = missingParts(guest);
    if (missing.length) {
      note = "Still need " + missing.join(" and ") + ".";
      render();
      return;
    }
    var band = LOOKS.scoreLook(guest.target, copyLook());
    var prev = bestFor(guest.id);
    var improved = prev == null || band.points > prev;
    if (improved) {
      store.best[guest.id] = band.points;
      store.looks[guest.id] = copyLook();
      saveStore();
    }
    report = {
      guestId: guest.id,
      points: band.points,
      label: band.label,
      won: band.won,
      matches: band.matches,
      rows: band.rows,
      look: copyLook(),
      improved: improved,
      best: bestFor(guest.id)
    };
    screen = "score";
    note = "";
    if (band.points === 40) burst();
    render();
  }

  function afterScore() {
    if (levelEnding || !report) return;
    levelEnding = true;
    var won = report.won;
    var level = guestById(report.guestId).level;
    var finishedId = report.guestId;
    function go() {
      levelEnding = false;
      if (won) {
        var next = nextGuestAfter(finishedId);
        if (next) openGuest(next.id, false);
        else screen = "party";
      } else {
        openGuest(finishedId, true);
      }
      render();
    }
    if (!window.JoyceBrainBreaks || !JoyceBrainBreaks.levelEnd) {
      go();
      return;
    }
    JoyceBrainBreaks.levelEnd({ won: !!won, level: level }).then(go, go);
  }

  function burst() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var layer = document.createElement("div");
    layer.className = "confetti";
    var emojis = ["💅", "💇", "💖", "🌸", "⭐", "✨", "🎀", "🫧"];
    var i;
    for (i = 0; i < 18; i++) {
      var bit = document.createElement("span");
      bit.textContent = emojis[i % emojis.length];
      bit.style.left = (i * 17) % 100 + "%";
      bit.style.animationDelay = (i % 5) * 0.08 + "s";
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 1600);
  }

  function addHairPieces(doll, style) {
    var hair = el("div", "hair hair-" + (style || "none"));
    if (style === "bun") {
      hair.appendChild(el("span", "cap"));
      hair.appendChild(el("span", "ball"));
      hair.appendChild(el("span", "crown"));
    } else if (style === "spikes") {
      hair.appendChild(el("span", "spike"));
      hair.appendChild(el("span", "spike"));
      hair.appendChild(el("span", "spike"));
      hair.appendChild(el("span", "spike"));
      hair.appendChild(el("span", "spike"));
      hair.appendChild(el("span", "cap"));
    } else if (style === "waves") {
      hair.appendChild(el("span", "flow"));
      hair.appendChild(el("span", "bangs"));
    } else if (style === "curls") {
      var c;
      for (c = 0; c < 7; c++) hair.appendChild(el("span", "curl"));
    } else if (style === "braids") {
      var left = el("span", "braid left");
      left.appendChild(el("span", "band"));
      var right = el("span", "braid right");
      right.appendChild(el("span", "band"));
      hair.appendChild(el("span", "cap"));
      hair.appendChild(left);
      hair.appendChild(right);
    } else if (style === "bob") {
      hair.appendChild(el("span", "bob"));
      hair.appendChild(el("span", "bangs"));
    } else if (style === "plain") {
      hair.appendChild(el("span", "cap"));
    }
    doll.appendChild(hair);
  }

  function addFace(head) {
    var eyeL = el("span", "eye left");
    eyeL.appendChild(el("i"));
    var eyeR = el("span", "eye right");
    eyeR.appendChild(el("i"));
    head.appendChild(eyeL);
    head.appendChild(eyeR);
    head.appendChild(el("span", "blush left"));
    head.appendChild(el("span", "blush right"));
    head.appendChild(el("span", "mouth"));
    head.appendChild(el("span", "mask"));
    head.appendChild(el("span", "cuke left"));
    head.appendChild(el("span", "cuke right"));
    head.appendChild(el("span", "drop drop-a"));
    head.appendChild(el("span", "drop drop-b"));
    head.appendChild(el("span", "drop drop-c"));
    head.appendChild(el("span", "spark"));
    head.appendChild(el("span", "spark two"));
    head.appendChild(el("span", "star-paint", "⭐"));
  }

  function addHands(robe, skin) {
    ["left", "right"].forEach(function (side) {
      var hand = el("span", "hand " + side);
      var n;
      for (n = 0; n < 4; n++) hand.appendChild(el("i"));
      robe.appendChild(hand);
    });
    robe.style.setProperty("--skin", skin);
  }

  function mountDoll(parent, spec) {
    var guest = spec.guest;
    var hairId = spec.hairId;
    var makeupId = spec.makeupId || "none";
    var skinId = spec.skinId || "none";
    var nailId = spec.nailId;
    var hair = hairId ? LOOKS.find("hair", hairId) : null;
    var makeup = LOOKS.find("makeup", makeupId);
    var skin = LOOKS.find("skin", skinId);
    var nails = nailId ? LOOKS.find("nails", nailId) : null;
    var doll = el("div", "doll " + spec.kind);
    doll.setAttribute("data-hair", hairId || (spec.kind === "guest" ? "plain" : "none"));
    doll.setAttribute("data-makeup", spec.kind === "guest" ? makeupId : "none");
    doll.setAttribute("data-skin", spec.kind === "guest" ? skinId : "none");
    doll.style.setProperty("--skin", spec.kind === "mannequin" ? "#f6e6d6" : guest.skin);
    doll.style.setProperty("--hair", hair ? hair.color : guest.hairColor);
    doll.style.setProperty("--outfit", guest.outfit);
    doll.style.setProperty("--blush", makeup ? makeup.blush : "transparent");
    doll.style.setProperty("--lip", makeup ? makeup.lip : "#e7a090");
    doll.style.setProperty("--nail", nails ? nails.color : "#f3d2c8");
    doll.style.setProperty("--mask", skin ? skin.mask : "transparent");
    addHairPieces(doll, hairId || (spec.kind === "guest" ? "plain" : "none"));
    var head = el("div", "head");
    addFace(head);
    doll.appendChild(head);
    if (spec.kind === "guest") {
      var robe = el("div", "robe");
      robe.appendChild(el("span", "sash"));
      addHands(robe, guest.skin);
      doll.appendChild(robe);
    } else {
      doll.appendChild(el("span", "neck"));
      doll.appendChild(el("span", "pole"));
      doll.appendChild(el("span", "base"));
    }
    parent.appendChild(doll);
  }

  function renderLobby() {
    app.appendChild(el("p", "kicker", "A huge spa just for you"));
    app.appendChild(el("h1", null, "Spa Salon"));
    app.appendChild(el("p", "subline", "Try hair on the mannequin, then style the guest. Style points stay in this game."));
    var progress = el("p", "progress", readyCount() + " of " + LOOKS.guests.length + " guests look ready · " + totalPoints() + " style points");
    app.appendChild(progress);

    var grid = el("div", "guest-grid");
    LOOKS.guests.forEach(function (guest) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "guest-card";
      card.id = "guest-" + guest.id;
      var best = bestFor(guest.id);
      var saved = store.looks[guest.id];
      var preview = el("div", "preview");
      mountDoll(preview, {
        kind: "guest",
        guest: guest,
        hairId: saved ? saved.hair : null,
        makeupId: saved ? saved.makeup : null,
        skinId: saved ? saved.skin : null,
        nailId: saved ? saved.nails : null
      });
      card.appendChild(preview);
      card.appendChild(el("span", "guest-name", guest.name));
      card.appendChild(el("span", "guest-wish", guest.wish));
      card.appendChild(el("span", "guest-best", best == null ? "Not styled yet" : "Best " + best + " style points"));
      if (best != null && best >= 20) card.appendChild(el("span", "ready-pill", "Ready"));
      card.addEventListener("click", function () {
        openGuest(guest.id, best != null && best < 20);
        render();
      });
      grid.appendChild(card);
    });
    app.appendChild(grid);
    if (readyCount() === LOOKS.guests.length) {
      app.appendChild(makeButton("See the sparkling salon", "big-btn sun", function () {
        screen = "party";
        render();
      }));
    }
  }

  function renderSalon() {
    var guest = currentGuest();
    var salon = el("section", "salon");
    salon.setAttribute("data-screen", "salon");

    var wish = el("div", "wish");
    wish.appendChild(el("p", "kicker", "Guest " + guest.level + " · " + guest.name));
    wish.appendChild(el("h2", null, guest.wish));
    wish.appendChild(el("p", "wish-line", guest.line));
    var chips = el("ul", "wish-list");
    LOOKS.cats.forEach(function (cat) {
      var item = LOOKS.find(cat.id, guest.target[cat.id]);
      var li = el("li", null, cat.emoji + " " + (item ? item.name : ""));
      chips.appendChild(li);
    });
    wish.appendChild(chips);
    if (retrying) wish.appendChild(el("p", "retry-note", "New try. Match every part of the list."));
    salon.appendChild(wish);

    var stage = el("div", "stage");
    var person = el("figure", "spot");
    var personDoll = el("div", "doll-wrap");
    mountDoll(personDoll, {
      kind: "guest",
      guest: guest,
      hairId: look.hair,
      makeupId: look.makeup,
      skinId: look.skin,
      nailId: look.nails
    });
    person.appendChild(personDoll);
    var personCap = el("figcaption");
    personCap.appendChild(el("strong", null, guest.name));
    var hairOn = look.hair ? LOOKS.find("hair", look.hair) : null;
    personCap.appendChild(el("span", null, hairOn ? hairOn.name : "Waiting for hair"));
    person.appendChild(personCap);
    stage.appendChild(person);

    var stand = el("figure", "spot mannequin-spot");
    var mannequinDoll = el("div", "doll-wrap");
    mountDoll(mannequinDoll, {
      kind: "mannequin",
      guest: guest,
      hairId: tryHair
    });
    stand.appendChild(mannequinDoll);
    var manCap = el("figcaption");
    manCap.appendChild(el("strong", null, "Mannequin"));
    var tried = tryHair ? LOOKS.find("hair", tryHair) : null;
    manCap.appendChild(el("span", null, tried ? tried.name : "Try hair here"));
    stand.appendChild(manCap);
    stage.appendChild(stand);
    salon.appendChild(stage);

    var tools = el("div", "tools");
    var tabs = el("div", "tabs");
    LOOKS.cats.forEach(function (cat) {
      var button = document.createElement("button");
      button.type = "button";
      button.id = "tab-" + cat.id;
      button.className = "tab" + (tab === cat.id ? " is-on" : "");
      button.setAttribute("aria-pressed", tab === cat.id ? "true" : "false");
      button.textContent = cat.emoji + " " + cat.label;
      button.addEventListener("click", function () {
        tab = cat.id;
        if (cat.id === "hair") note = tryHair ? "Put this hair on " + guest.name + " when you like it." : "Tap a hair style for the mannequin.";
        else note = "Tap one. It goes right on " + guest.name + ".";
        render();
      });
      tabs.appendChild(button);
    });
    tools.appendChild(tabs);

    var choices = el("div", "choices");
    var list = LOOKS[tab];
    list.forEach(function (item) {
      var on = tab === "hair" ? tryHair === item.id : look[tab] === item.id;
      var button = document.createElement("button");
      button.type = "button";
      button.id = "opt-" + item.id;
      button.className = "choice" + (on ? " is-on" : "");
      button.setAttribute("aria-pressed", on ? "true" : "false");
      var swatch = el("span", "swatch");
      swatch.style.background = item.swatch;
      button.appendChild(swatch);
      button.appendChild(el("span", "choice-name", item.emoji + " " + item.name));
      button.addEventListener("click", function () {
        if (tab === "hair") {
          tryHair = item.id;
          note = item.name + " is on the mannequin. Put it on " + guest.name + " when it looks right.";
        } else {
          look[tab] = item.id;
          note = item.name + " is on " + guest.name + ".";
        }
        render();
      });
      choices.appendChild(button);
    });
    tools.appendChild(choices);
    var live = el("p", "note");
    live.setAttribute("aria-live", "polite");
    live.textContent = note;
    tools.appendChild(live);
    salon.appendChild(tools);
    app.appendChild(salon);

    var dock = el("div", "dock");
    dock.appendChild(makeButton("Guests", "big-btn ghost", function () {
      screen = "lobby";
      render();
    }));
    var apply = makeButton(
      tryHair ? "Put this hair on " + guest.name : "Pick hair on the mannequin",
      "big-btn",
      function () {
        if (!tryHair) {
          tab = "hair";
          note = "Tap a hair style. It shows up on the mannequin.";
          render();
          return;
        }
        look.hair = tryHair;
        var picked = LOOKS.find("hair", tryHair);
        note = guest.name + " has " + (picked ? picked.name : "that hair") + ".";
        render();
      }
    );
    apply.id = "apply-hair";
    dock.appendChild(apply);
    var done = makeButton("All done", "big-btn sun" + (missingParts(guest).length ? "" : " ready"), finishLook);
    done.id = "all-done";
    dock.appendChild(done);
    document.body.appendChild(dock);
  }

  function renderScore() {
    var guest = guestById(report.guestId);
    var panel = el("section", "score-card");
    panel.setAttribute("data-screen", "score");
    panel.appendChild(el("p", "kicker", guest.name + " · " + guest.wish));
    var title = el("h1", "score-title", report.label);
    title.id = "score-title";
    panel.appendChild(title);
    var points = el("p", "score-points", report.points + " style points");
    points.id = "score-points";
    panel.appendChild(points);
    panel.appendChild(el("p", "score-note", scoreBlurb(guest)));
    var frame = el("div", "score-doll");
    mountDoll(frame, {
      kind: "guest",
      guest: guest,
      hairId: report.look.hair,
      makeupId: report.look.makeup,
      skinId: report.look.skin,
      nailId: report.look.nails
    });
    panel.appendChild(frame);
    var list = el("ul", "match-list");
    report.rows.forEach(function (row) {
      var li = el("li", row.hit ? "hit" : "miss");
      li.textContent = row.hit
        ? "Yes · " + row.wantedName
        : "Wanted " + row.wantedName + ". You picked " + row.gotName + ".";
      list.appendChild(li);
    });
    panel.appendChild(list);
    if (report.improved) panel.appendChild(el("p", "best-note", "New best for " + guest.name + "."));
    panel.appendChild(el("p", "ledger-note", "Style points stay in Spa Salon. Your star bar does not change."));
    app.appendChild(panel);
    var nextLabel = "Try again";
    if (report.won) nextLabel = nextGuestAfter(guest.id) ? "Next guest" : "See the salon";
    var go = makeButton(nextLabel, "big-btn sun", function () {
      go.disabled = true;
      afterScore();
    });
    go.id = "continue-btn";
    var dock = el("div", "dock");
    dock.appendChild(go);
    document.body.appendChild(dock);
  }

  function scoreBlurb(guest) {
    if (report.points === 40) return "Every part matches. " + guest.name + " looks ready!";
    if (report.points === 20) return "So close. Three parts match the list.";
    if (report.points === 5) return "Two parts match. A Brain Break, then you can try again.";
    return "That look missed the list. A Brain Break, then you can try again.";
  }

  function renderParty() {
    var panel = el("section", "score-card");
    panel.appendChild(el("p", "kicker", "The spa is glowing"));
    panel.appendChild(el("h1", null, "Every guest looks ready"));
    panel.appendChild(el("p", "score-points", totalPoints() + " style points"));
    panel.appendChild(el("p", "score-note", "You matched a look for each guest. Style points stay in this game."));
    var row = el("div", "party-row");
    LOOKS.guests.forEach(function (guest) {
      var cell = el("div", "party-guest");
      var saved = store.looks[guest.id] || {};
      var frame = el("div", "preview");
      mountDoll(frame, {
        kind: "guest",
        guest: guest,
        hairId: saved.hair,
        makeupId: saved.makeup,
        skinId: saved.skin,
        nailId: saved.nails
      });
      cell.appendChild(frame);
      cell.appendChild(el("p", "guest-name", guest.name));
      cell.appendChild(el("p", "guest-best", (bestFor(guest.id) || 0) + " style points"));
      row.appendChild(cell);
    });
    panel.appendChild(row);
    app.appendChild(panel);
    var dock = el("div", "dock");
    dock.appendChild(makeButton("Style someone again", "big-btn sun", function () {
      screen = "lobby";
      render();
    }));
    document.body.appendChild(dock);
  }

  function closeHowto() {
    howtoOpen = false;
    try {
      localStorage.setItem(HOWTO_KEY, "1");
    } catch (err) {
      /* The help can open again from the button. */
    }
    render();
  }

  function renderHowto() {
    var overlay = el("div", "overlay");
    var sheet = el("div", "sheet howto-sheet");
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "howto-title");
    var title = el("h2", null, "How to play");
    title.id = "howto-title";
    sheet.appendChild(title);
    sheet.appendChild(el("p", "howto-lead", "Welcome to Spa Salon. Each guest wants one look."));
    /* Above the steps so the start control is on screen before any scrolling. */
    sheet.appendChild(makeButton("Let's play", "big-btn sun howto-go", closeHowto));
    var steps = el("div", "howto-steps");
    var list = document.createElement("ol");
    [
      "Read the look list. It tells you the hair, makeup, skincare, and nails.",
      "Tap a hair style. It goes on the mannequin head first.",
      "Tap Put this hair on the guest when you want them to wear it.",
      "Pick makeup, skincare, and nail polish. Those go right on the guest.",
      "Tap All done. The spa checks the list.",
      "Looks amazing is 40 style points. Looks okay is 20. Looks kinda bad is 5. Looks horrible is 0.",
      "Style points stay in this game. The star bar is your real stars."
    ].forEach(function (line) {
      list.appendChild(el("li", null, line));
    });
    steps.appendChild(list);
    sheet.appendChild(steps);
    var foot = el("div", "howto-foot");
    foot.appendChild(makeButton("Let's play", "big-btn sun howto-go", closeHowto));
    sheet.appendChild(foot);
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function clearDock() {
    var old = document.querySelector(".dock");
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function render() {
    clearDock();
    app.innerHTML = "";
    paintStyle();
    if (!LOOKS) {
      app.appendChild(el("p", "subline", "The spa looks are missing."));
      return;
    }
    if (screen === "salon") renderSalon();
    else if (screen === "score") renderScore();
    else if (screen === "party") renderParty();
    else renderLobby();
    if (howtoOpen && screen !== "score") renderHowto();
  }

  render();
})();
