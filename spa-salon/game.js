/* Huge Spa Salon. Each customer is a level: hair, makeup, skincare, and nails.
   Spa sparkles are scored in this game only. Site stars stay on the star bar. */
(function () {
  var STORE_KEY = "joyce-spa-salon";
  var HAIR_STEPS = { hairStyle: 1, hairColor: 1, accessory: 1 };

  var app = document.getElementById("app");
  var howtoBtn = document.getElementById("howto-btn");
  var scorePill = document.getElementById("score-pill");
  if (!app || !window.SPA_DATA) return;

  var store = loadStore();
  var screen = "lobby";
  var customerId = null;
  var look = null;
  var station = "hair";
  var target = "mannequin";
  var note = "";
  var howtoOpen = !store.seenHowto;
  var confirmReset = false;
  var levelEnding = false;
  var lastResult = null;

  if (howtoBtn) {
    howtoBtn.addEventListener("click", function () {
      howtoOpen = true;
      confirmReset = false;
      render();
    });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function childName() {
    if (window.KIDS_CHAT && window.KIDS_CHAT.kidName) return window.KIDS_CHAT.kidName;
    if (window.KIDS_SETTINGS && window.KIDS_SETTINGS.childName) return window.KIDS_SETTINGS.childName;
    return "friend";
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function emptyStore() {
    return { seenHowto: false, best: {}, looks: {} };
  }

  function sumSparkles(best) {
    var total = 0;
    Object.keys(best).forEach(function (id) {
      total += best[id].points;
    });
    return total;
  }

  function normalizeLook(raw) {
    var lookRow = SPA_DATA.freshLook();
    if (!raw || typeof raw !== "object") return lookRow;
    SPA_DATA.STEPS.forEach(function (step) {
      if (typeof raw[step] === "string" && SPA_DATA.option(step, raw[step])) lookRow[step] = raw[step];
    });
    if (raw.mannequin && typeof raw.mannequin === "object") {
      ["hairStyle", "hairColor", "accessory"].forEach(function (step) {
        if (typeof raw.mannequin[step] === "string" && SPA_DATA.option(step, raw.mannequin[step])) {
          lookRow.mannequin[step] = raw.mannequin[step];
        }
      });
    }
    if (raw.given && typeof raw.given === "object") {
      var given = { hairStyle: "", hairColor: "", accessory: "" };
      var ok = true;
      ["hairStyle", "hairColor", "accessory"].forEach(function (step) {
        var value = raw.given[step];
        if (value && !SPA_DATA.option(step, value)) ok = false;
        given[step] = typeof value === "string" ? value : "";
      });
      if (ok && given.hairStyle && given.hairColor) lookRow.given = given;
    }
    return lookRow;
  }

  function loadStore() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      var next = emptyStore();
      if (!raw || typeof raw !== "object") return next;
      next.seenHowto = !!raw.seenHowto;
      SPA_DATA.customers.forEach(function (customer) {
        var row = raw.best && raw.best[customer.id];
        var points;
        if (!row) return;
        points = Number(row.points);
        if (points !== 0 && points !== 5 && points !== 20 && points !== 40) return;
        next.best[customer.id] = { points: points, label: SPA_DATA.labelFor(points) };
        if (raw.looks && raw.looks[customer.id]) {
          next.looks[customer.id] = normalizeLook(raw.looks[customer.id]);
        }
      });
      SPA_DATA.customers.forEach(function (customer) {
        if (next.looks[customer.id] || !raw.looks) return;
        if (raw.looks[customer.id]) next.looks[customer.id] = normalizeLook(raw.looks[customer.id]);
      });
      return next;
    } catch (err) {
      return emptyStore();
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        seenHowto: !!store.seenHowto,
        best: store.best,
        looks: store.looks
      }));
    } catch (err) {
      /* Private browsing can block storage. The game still plays. */
    }
  }

  function sparkles() {
    return sumSparkles(store.best);
  }

  function customerById(id) {
    var i;
    for (i = 0; i < SPA_DATA.customers.length; i++) {
      if (SPA_DATA.customers[i].id === id) return SPA_DATA.customers[i];
    }
    return null;
  }

  function customerIndex(id) {
    var i;
    for (i = 0; i < SPA_DATA.customers.length; i++) {
      if (SPA_DATA.customers[i].id === id) return i;
    }
    return -1;
  }

  function current() {
    return customerById(customerId);
  }

  function isOpen(index) {
    var prev;
    if (index <= 0) return true;
    prev = SPA_DATA.customers[index - 1];
    return !!(prev && store.best[prev.id]);
  }

  function saveLook() {
    if (!customerId || !look) return;
    store.looks[customerId] = clone(look);
    saveStore();
  }

  function stationsFor(customer) {
    var groups = [
      { id: "hair", label: "Hair", steps: ["hairStyle", "hairColor", "accessory"] },
      { id: "makeup", label: "Makeup", steps: ["makeup", "eyes", "cheeks", "lips"] },
      { id: "skin", label: "Skin", steps: ["skincare"] },
      { id: "nails", label: "Nails", steps: ["nails", "nailArt"] }
    ];
    return groups.map(function (group) {
      return {
        id: group.id,
        label: group.label,
        steps: group.steps.filter(function (step) {
          return customer.steps.indexOf(step) !== -1;
        })
      };
    }).filter(function (group) {
      return group.steps.length > 0;
    });
  }

  function filledCount(customer, lookRow) {
    var n = 0;
    customer.steps.forEach(function (step) {
      if (lookRow && lookRow[step]) n += 1;
    });
    return n;
  }

  function stationReady(group, lookRow) {
    var i;
    for (i = 0; i < group.steps.length; i++) {
      if (!lookRow[group.steps[i]]) return false;
    }
    return true;
  }

  function hairTarget() {
    return station === "hair" && target === "mannequin";
  }

  function valueFor(step) {
    if (hairTarget() && HAIR_STEPS[step]) return (look.mannequin && look.mannequin[step]) || "";
    return (look && look[step]) || "";
  }

  function mannequinReady(customer, lookRow) {
    var mannequin = lookRow.mannequin || {};
    if (!mannequin.hairStyle || !mannequin.hairColor) return false;
    if (customer.steps.indexOf("accessory") !== -1 && !mannequin.accessory) return false;
    return true;
  }

  function wearingGiven(lookRow) {
    var given = lookRow && lookRow.given;
    var customer = current();
    if (!given || !customer) return false;
    if (given.hairStyle !== lookRow.hairStyle || given.hairColor !== lookRow.hairColor) return false;
    if (customer.steps.indexOf("accessory") !== -1 && given.accessory !== lookRow.accessory) return false;
    return true;
  }

  function setChoice(step, id) {
    if (!look) return;
    if (hairTarget() && HAIR_STEPS[step]) look.mannequin[step] = id;
    else look[step] = id;
    note = "";
    saveLook();
    render();
  }

  function giveHair() {
    var customer = current();
    var mannequin;
    var needsClip;
    if (!customer || !look) return;
    mannequin = look.mannequin || {};
    needsClip = customer.steps.indexOf("accessory") !== -1;
    if (!mannequin.hairStyle || !mannequin.hairColor || (needsClip && !mannequin.accessory)) {
      note = needsClip
        ? "Pick a style, a color, and a clip on the mannequin first."
        : "Pick a style and a color on the mannequin first.";
      render();
      return;
    }
    look.hairStyle = mannequin.hairStyle;
    look.hairColor = mannequin.hairColor;
    if (needsClip) look.accessory = mannequin.accessory;
    look.given = {
      hairStyle: mannequin.hairStyle,
      hairColor: mannequin.hairColor,
      accessory: needsClip ? mannequin.accessory : ""
    };
    target = "customer";
    note = customer.name + " is wearing the mannequin hair.";
    saveLook();
    render();
  }

  function recordBest(customer, result) {
    var prev = store.best[customer.id];
    var prevPts = prev ? prev.points : -1;
    if (result.points >= prevPts) {
      store.best[customer.id] = { points: result.points, label: result.label };
    }
    saveLook();
  }

  function finishLook() {
    var customer = current();
    if (!customer || !look || levelEnding) return;
    lastResult = SPA_DATA.score(look, customer);
    recordBest(customer, lastResult);
    note = "";
    confirmReset = false;
    screen = "score";
    render();
  }

  function afterLevel(won, next) {
    var customer;
    var level;
    if (levelEnding) return;
    levelEnding = true;
    customer = current();
    level = customer ? customer.level : 1;
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

  function retryFresh() {
    var customer = current();
    if (!customer) {
      screen = "lobby";
      render();
      return;
    }
    look = SPA_DATA.freshLook();
    store.looks[customer.id] = clone(look);
    saveStore();
    station = "hair";
    target = "mannequin";
    note = "A fresh start. Try the mannequin first.";
    lastResult = null;
    screen = "salon";
    render();
  }

  function goNext() {
    var index = customerIndex(customerId);
    var next = SPA_DATA.customers[index + 1];
    lastResult = null;
    if (!next) {
      screen = "lobby";
      customerId = null;
      look = null;
      note = "";
      render();
      return;
    }
    openCustomer(next.id);
  }

  function openCustomer(id) {
    var customer = customerById(id);
    if (!customer) return;
    customerId = id;
    look = store.looks[id] ? normalizeLook(store.looks[id]) : SPA_DATA.freshLook();
    store.looks[id] = clone(look);
    station = "hair";
    target = "mannequin";
    note = "Try a hairstyle on the mannequin, then give it to " + customer.name + ".";
    lastResult = null;
    confirmReset = false;
    screen = "salon";
    saveStore();
    render();
  }

  function paintPill() {
    var total;
    if (!scorePill) return;
    total = sparkles();
    scorePill.hidden = false;
    scorePill.textContent = "✦ " + total;
    scorePill.setAttribute("aria-label", total === 1 ? "1 spa sparkle" : total + " spa sparkles");
  }

  function addDoll(parent, customer, mannequin) {
    var model = SPA_DATA.paint(look, customer, mannequin);
    var doll = el("div", "doll style-" + model.style + (model.finish ? " finish-" + model.finish : "") + (model.nailArt ? " art-" + model.nailArt : "") + (mannequin ? " mannequin" : ""));
    var head;
    var hand;
    var i;
    doll.style.setProperty("--hair", model.hair);
    doll.style.setProperty("--skin", model.skin);
    doll.style.setProperty("--cape", model.cape);
    doll.style.setProperty("--eyes", model.eyes);
    doll.style.setProperty("--cheeks", model.cheeks);
    doll.style.setProperty("--lips", model.lips);
    doll.style.setProperty("--nails", model.nails);
    doll.style.setProperty("--mask", model.mask);

    ["cap", "bang"].forEach(function (name) {
      doll.appendChild(el("div", "hair " + name));
    });
    ["left", "right"].forEach(function (side) {
      doll.appendChild(el("div", "hair puff " + side));
      doll.appendChild(el("div", "hair braid " + side));
      doll.appendChild(el("div", "hair wave " + side));
    });
    doll.appendChild(el("div", "hair pony"));
    doll.appendChild(el("div", "hair tail"));
    doll.appendChild(el("div", "hair bun"));

    head = el("div", "head");
    head.appendChild(el("div", "veil"));
    head.appendChild(el("div", "shine"));
    ["left", "right"].forEach(function (side) {
      var eye = el("span", "eye " + side);
      eye.appendChild(el("i", "lid"));
      eye.appendChild(el("i", "pupil"));
      eye.appendChild(el("i", "glint"));
      head.appendChild(eye);
      head.appendChild(el("span", "blush " + side));
    });
    head.appendChild(el("span", "nose"));
    head.appendChild(el("span", "mouth"));
    for (i = 0; i < 5; i++) head.appendChild(el("i", "spark spark-" + (i + 1)));
    doll.appendChild(head);
    doll.appendChild(el("div", "neck"));
    if (model.showClip && model.clip) doll.appendChild(el("div", "clip", model.clip));
    doll.appendChild(el("div", "cape"));
    hand = el("div", "hand");
    for (i = 0; i < 4; i++) hand.appendChild(el("span", "finger"));
    doll.appendChild(hand);
    doll.setAttribute("aria-hidden", "true");
    parent.appendChild(doll);
  }

  function addFigure(parent, customer, mannequin) {
    var figure = el("div", "figure" + (mannequin ? " kind-mannequin" : " kind-customer"));
    var box = el("div", "doll-box");
    var hot = mannequin ? hairTarget() : !hairTarget();
    if (hot) figure.className += " hot";
    addDoll(box, customer, mannequin);
    if (mannequin) {
      var stand = el("div", "stand");
      stand.appendChild(el("div", "pole"));
      stand.appendChild(el("div", "base"));
      box.appendChild(stand);
    }
    figure.appendChild(box);
    figure.appendChild(el("p", "figure-name", mannequin ? "Mannequin" : customer.name));
    if (mannequin && mannequinReady(customer, look)) {
      figure.appendChild(el("p", "figure-note", "Ready to give"));
    } else if (!mannequin && wearingGiven(look)) {
      figure.appendChild(el("p", "figure-note", "Mannequin hair"));
    }
    parent.appendChild(figure);
  }

  function choiceButton(step, opt, customer) {
    var button = el("button", "choice");
    var swatch = el("span", "swatch");
    var picked = valueFor(step) === opt.id;
    button.type = "button";
    if (picked) button.className += " picked";
    button.setAttribute("aria-pressed", picked ? "true" : "false");
    if (opt.color) swatch.style.background = opt.color;
    else if (opt.lips) swatch.style.background = opt.lips;
    else if (opt.eyes) swatch.style.background = opt.eyes;
    else if (step === "hairStyle") swatch.style.background = "#f6c945";
    else swatch.style.background = "#ffe4f4";
    if (opt.mark) {
      swatch.textContent = opt.mark;
      swatch.className += " swatch-mark";
    }
    button.appendChild(swatch);
    button.appendChild(el("span", "choice-name", opt.name));
    if (SPA_DATA.loves(opt, customer)) button.appendChild(el("span", "love", "Loves"));
    button.addEventListener("click", function () {
      setChoice(step, opt.id);
    });
    return button;
  }

  function renderLikes(parent, customer) {
    var row = el("div", "likes");
    row.appendChild(el("span", "likes-label", customer.name + " loves"));
    customer.likes.forEach(function (id) {
      var info = SPA_DATA.likeInfo(id);
      var chip = el("span", "like-chip");
      var dot = el("span", "like-dot");
      dot.style.background = info.color;
      chip.appendChild(dot);
      chip.appendChild(document.createTextNode(info.name));
      row.appendChild(chip);
    });
    parent.appendChild(row);
  }

  function renderLobby() {
    var intro = el("div", "hello-card");
    var grid = el("div", "levels");
    intro.appendChild(el("p", "hello-kicker", "Welcome to the salon"));
    intro.appendChild(el("h2", null, "Hi, " + childName() + "!"));
    intro.appendChild(el("p", null, "Pick a customer. Do their hair, makeup, skincare, and nails."));
    intro.appendChild(el("p", "spark-line", sparkles() + " spa sparkles"));
    intro.appendChild(el("p", "fine", "Spa sparkles stay in this salon. Site stars are separate."));
    app.appendChild(intro);

    SPA_DATA.customers.forEach(function (customer, index) {
      var open = isOpen(index);
      var card = el(open ? "button" : "div", "level-card" + (open ? "" : " locked"));
      var best = store.best[customer.id];
      if (open) card.type = "button";
      card.appendChild(el("span", "level-emoji", customer.emoji));
      card.appendChild(el("span", "level-kicker", "Level " + customer.level));
      card.appendChild(el("span", "level-name", customer.name));
      card.appendChild(el("span", "level-wish", customer.wish));
      card.appendChild(el("span", "level-steps", customer.steps.length + " steps"));
      if (best) card.appendChild(el("span", "level-best", best.label + " · " + best.points));
      else if (!open) card.appendChild(el("span", "level-best", "Finish " + SPA_DATA.customers[index - 1].name + " first"));
      else card.appendChild(el("span", "level-best", "Ready to style"));
      if (open) {
        card.addEventListener("click", function () {
          openCustomer(customer.id);
        });
      }
      grid.appendChild(card);
    });
    app.appendChild(grid);
  }

  function renderSalon() {
    var customer = current();
    var layout;
    var stage;
    var people;
    var tools;
    var stations;
    var stepLine;
    var done;
    if (!customer || !look) {
      screen = "lobby";
      renderLobby();
      return;
    }

    layout = el("div", "salon");
    stage = el("section", "panel stage");
    stage.appendChild(el("h2", "stage-title", customer.emoji + " " + customer.name));
    stage.appendChild(el("p", "stage-wish", customer.blurb));
    renderLikes(stage, customer);
    people = el("div", "stage-people");
    addFigure(people, customer, false);
    addFigure(people, customer, true);
    stage.appendChild(people);

    tools = el("section", "panel tools");
    stations = el("div", "stations");
    stationsFor(customer).forEach(function (group) {
      var button = el("button", "station");
      var ready = stationReady(group, look);
      button.type = "button";
      if (group.id === station) button.className += " on";
      if (ready) button.className += " ready";
      button.setAttribute("aria-pressed", group.id === station ? "true" : "false");
      button.textContent = group.label + (ready ? " ✓" : "");
      button.addEventListener("click", function () {
        station = group.id;
        note = "";
        render();
      });
      stations.appendChild(button);
    });
    tools.appendChild(stations);

    stepLine = el("p", "step-line");
    stepLine.textContent = filledCount(customer, look) + " of " + customer.steps.length + " steps";
    tools.appendChild(stepLine);

    if (station === "hair") {
      var toggle = el("div", "target-toggle");
      ["mannequin", "customer"].forEach(function (id) {
        var button = el("button", "target-btn" + (target === id ? " on" : ""));
        button.type = "button";
        button.textContent = id === "mannequin" ? "Try on mannequin" : "Style " + customer.name;
        button.setAttribute("aria-pressed", target === id ? "true" : "false");
        button.addEventListener("click", function () {
          target = id;
          note = "";
          render();
        });
        toggle.appendChild(button);
      });
      tools.appendChild(toggle);
      tools.appendChild(el("p", "hint", hairTarget()
        ? "Practice the hair here. It stays on the mannequin until you give it."
        : "These taps go straight onto " + customer.name + "."));
    }

    stationsFor(customer).forEach(function (group) {
      if (group.id !== station) return;
      group.steps.forEach(function (step) {
        var box = el("div", "choice-group");
        var grid = el("div", "choice-grid");
        box.appendChild(el("h3", "group-label", SPA_DATA.STEP_LABELS[step] || step));
        SPA_DATA.choices(customer, step).forEach(function (opt) {
          grid.appendChild(choiceButton(step, opt, customer));
        });
        box.appendChild(grid);
        tools.appendChild(box);
      });
    });

    if (note) tools.appendChild(el("p", "note", note));

    layout.appendChild(stage);
    layout.appendChild(tools);
    app.appendChild(layout);

    done = el("div", "done-bar");
    if (station === "hair") {
      done.appendChild(actionButton("Give this hair to " + customer.name, "big-btn gold give-btn", giveHair));
    }
    done.appendChild(actionButton("All done!", "big-btn pink", finishLook));
    done.appendChild(actionButton("Start over", "big-btn ghost", function () {
      confirmReset = true;
      render();
    }));
    done.appendChild(actionButton("Customers", "big-btn ghost", function () {
      screen = "lobby";
      note = "";
      confirmReset = false;
      render();
    }));
    app.appendChild(done);
  }

  function actionButton(label, className, onClick) {
    var button = el("button", className, label);
    button.type = "button";
    button.addEventListener("click", onClick);
    return button;
  }

  function scoreSubtitle(points) {
    if (points === 40) return "Sparkle win!";
    if (points === 20) return "A pretty look.";
    if (points === 5) return "It needs a little more care.";
    return "Let's try a fuller look.";
  }

  function renderScore() {
    var customer = current();
    var result = lastResult;
    var wrap;
    var card;
    var people;
    var actions;
    var won;
    var last;
    if (!customer || !result) {
      screen = "lobby";
      renderLobby();
      return;
    }
    won = SPA_DATA.won(result);
    last = customerIndex(customer.id) === SPA_DATA.customers.length - 1;
    wrap = el("div", "score-screen");
    card = el("div", "score-card score-" + result.points);
    card.appendChild(el("p", "hello-kicker", "Style score"));
    card.appendChild(el("h2", null, result.label));
    card.appendChild(el("p", "sparkle-total", result.points + " spa sparkles"));
    card.appendChild(el("p", "score-sub", scoreSubtitle(result.points)));
    card.appendChild(el("p", "fine", "Best for " + customer.name + ": " + (store.best[customer.id] ? store.best[customer.id].points : result.points) + " spa sparkles."));
    result.tips.forEach(function (tip) {
      card.appendChild(el("p", "tip", tip));
    });
    wrap.appendChild(card);
    people = el("div", "stage-people score-people");
    addFigure(people, customer, false);
    wrap.appendChild(people);

    actions = el("div", "score-actions");
    if (won) {
      actions.appendChild(actionButton(last ? "Back to the salon" : "Next customer", "big-btn pink", function () {
        afterLevel(true, goNext);
      }));
      actions.appendChild(actionButton("Style again", "big-btn ghost", function () {
        afterLevel(true, retryFresh);
      }));
    } else {
      actions.appendChild(actionButton("Try again", "big-btn pink", function () {
        afterLevel(false, retryFresh);
      }));
      actions.appendChild(actionButton(last ? "Back to the salon" : "Next person", "big-btn ghost", function () {
        afterLevel(false, goNext);
      }));
    }
    wrap.appendChild(actions);
    app.appendChild(wrap);
  }

  function renderHowto() {
    var overlay = el("div", "overlay");
    var sheet = el("div", "sheet");
    var list = document.createElement("ol");
    var go;
    var steps = [
      "Pick a customer. Each person is a level.",
      "Try a hairstyle on the mannequin head.",
      "Tap Give this hair to put that look on the customer.",
      "Add makeup, skincare, and nail polish. A heart that says Loves matches their colors.",
      "Tap All done. Fill every step, match the colors they love, and give them the mannequin hair.",
      "Looks amazing is 40 spa sparkles. Looks okay is 20. Looks kinda bad is 5. Looks horrible is 0.",
      "Spa sparkles stay in this salon. Site stars come from Practice, Brain Breaks, and homework."
    ];
    sheet.appendChild(el("h2", null, "How to play"));
    sheet.appendChild(el("p", null, "Hi, " + childName() + "! This is the Huge Spa."));
    steps.forEach(function (text) {
      list.appendChild(el("li", null, text));
    });
    sheet.appendChild(list);
    go = el("button", "big-btn pink", "Let's play!");
    go.type = "button";
    go.addEventListener("click", function () {
      store.seenHowto = true;
      howtoOpen = false;
      saveStore();
      render();
    });
    sheet.appendChild(go);
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function renderConfirm() {
    var customer = current();
    var overlay = el("div", "overlay");
    var sheet = el("div", "sheet");
    var keep;
    var yes;
    sheet.appendChild(el("h2", null, "Start over?"));
    sheet.appendChild(el("p", null, customer
      ? "Start " + customer.name + " over? You'll pause for a Brain Break, then try her look again."
      : "Start this look over?"));
    yes = el("button", "big-btn pink", "Start over");
    yes.type = "button";
    yes.addEventListener("click", function () {
      confirmReset = false;
      render();
      afterLevel(false, retryFresh);
    });
    keep = el("button", "big-btn ghost", "Keep styling");
    keep.type = "button";
    keep.addEventListener("click", function () {
      confirmReset = false;
      render();
    });
    sheet.appendChild(yes);
    sheet.appendChild(keep);
    overlay.appendChild(sheet);
    app.appendChild(overlay);
  }

  function render() {
    app.innerHTML = "";
    paintPill();
    if (screen === "score") renderScore();
    else if (screen === "salon") renderSalon();
    else renderLobby();
    if (howtoOpen) renderHowto();
    else if (confirmReset) renderConfirm();
  }

  render();
})();
