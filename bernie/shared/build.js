/* Build-a-vehicle by finding the next real part.
   Tap a photo of the part. It flies to its spot. Dragging is not required. */
(function (root) {
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function title(name) {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  var SHAPES = ["bucket", "arm", "cab", "body", "wheel-front", "wheel-rear"];

  function addShapes(host) {
    var i;
    for (i = 0; i < SHAPES.length; i++) host.appendChild(el("span", "ol ol-" + SHAPES[i]));
  }

  function start(opts) {
    var vehicle = opts.vehicle;
    var questions = opts.questions;
    var speak = opts.speak;
    var photo = !!(vehicle.board && vehicle.parts[0] && vehicle.parts[0].src);
    var placed = [];
    var round = null;
    var prevKey = "";
    var roundToken = 1;
    var busy = false;
    var started = false;
    var guess = root.BernieGuess.createState();
    var audio = null;

    var wrap = el("div", "build");
    var hud = el("div", "hud");
    var word = el("p", "prompt-word");
    var map = el("div", "prompt-map");
    var speaker = el("button", "speaker");
    speaker.type = "button";
    speaker.textContent = "Hear it";
    speaker.setAttribute("aria-label", "Hear it");
    var pips = el("div", "pips");
    pips.setAttribute("aria-hidden", "true");
    hud.appendChild(word);
    hud.appendChild(map);
    hud.appendChild(speaker);
    hud.appendChild(pips);

    var note = el("p", "try");
    note.setAttribute("role", "status");
    var art = el("div", "art");
    var choices = el("div", "choices");
    var startBtn = el("button", "start-go");
    startBtn.type = "button";
    startBtn.textContent = "Start";

    wrap.appendChild(hud);
    wrap.appendChild(note);
    wrap.appendChild(art);
    wrap.appendChild(choices);
    wrap.appendChild(startBtn);
    opts.mount.innerHTML = "";
    opts.mount.appendChild(wrap);

    var board = null;

    function findPart(id) {
      var i;
      for (i = 0; i < vehicle.parts.length; i++) {
        if (vehicle.parts[i].id === id) return vehicle.parts[i];
      }
      return null;
    }

    function piecesFor(id) {
      var part = findPart(id);
      if (part && part.with && part.with.length) return part.with;
      return [id];
    }

    function placeBox(node, part) {
      if (!part || !vehicle.board || part.x === undefined) return;
      var box = vehicle.board;
      node.style.left = (part.x / box.w * 100) + "%";
      node.style.top = (part.y / box.h * 100) + "%";
      node.style.width = (part.w / box.w * 100) + "%";
      node.style.height = (part.h / box.h * 100) + "%";
    }

    function bit(part) {
      var img = el("img", "bit");
      img.src = part.src;
      img.alt = "";
      img.draggable = false;
      var box = vehicle.board;
      img.style.left = (part.x / box.w * 100) + "%";
      img.style.top = (part.y / box.h * 100) + "%";
      img.style.width = (part.w / box.w * 100) + "%";
      return img;
    }

    function paintOutline(host, part) {
      host.innerHTML = "";
      var skin = el("div", "outline");
      addShapes(skin);
      if (part) {
        var slot = el("span", "ol-slot");
        placeBox(slot, part);
        skin.appendChild(slot);
      }
      host.appendChild(skin);
    }

    function paintBoard() {
      if (!board) {
        board = el("div", "board");
        board.style.aspectRatio = vehicle.board.w + " / " + vehicle.board.h;
        art.appendChild(board);
      }
      board.innerHTML = "";
      var skin = el("div", "outline");
      addShapes(skin);
      board.appendChild(skin);
      if (started && round) {
        var slot = el("div", "slot");
        placeBox(slot, findPart(round.id));
        board.appendChild(slot);
      }
      var have = {};
      var i;
      for (i = 0; i < placed.length; i++) {
        var ids = piecesFor(placed[i]);
        var j;
        for (j = 0; j < ids.length; j++) have[ids[j]] = true;
      }
      for (i = 0; i < vehicle.parts.length; i++) {
        if (have[vehicle.parts[i].id]) board.appendChild(bit(vehicle.parts[i]));
      }
    }

    function paintVehicle() {
      if (photo) {
        paintBoard();
        return;
      }
      if (vehicle.draw && placed.length) {
        vehicle.draw(art, {
          parts: placed.slice(),
          just: placed[placed.length - 1]
        });
      }
      var old = art.querySelectorAll(".bit");
      var i;
      for (i = old.length - 1; i >= 0; i--) old[i].remove();
      for (i = 0; i < placed.length; i++) {
        var mark = el("span", "bit");
        mark.dataset.id = placed[i];
        art.appendChild(mark);
      }
    }

    function paintPips() {
      pips.innerHTML = "";
      var order = questions.order;
      var i;
      for (i = 0; i < order.length; i++) {
        var on = placed.indexOf(order[i].id) !== -1;
        pips.appendChild(el("span", "pip pip-" + order[i].id + (on ? " got" : "")));
      }
    }

    function paintChoices() {
      choices.innerHTML = "";
      if (!round) return;
      var token = roundToken;
      round.choices.forEach(function (choice) {
        var btn = el("button", "choice");
        btn.type = "button";
        btn.dataset.id = choice.id;
        btn.setAttribute("aria-label", choice.name);
        var img = el("img", "choice-photo");
        img.src = "img/inset-" + choice.id + ".webp";
        img.alt = "";
        img.draggable = false;
        btn.appendChild(img);
        btn.addEventListener("click", function () {
          choose(choice.id, token);
        });
        choices.appendChild(btn);
      });
    }

    function remember() {
      wrap.dataset.answer = round ? round.answer : "";
      wrap.dataset.say = round ? round.say : "";
      wrap.dataset.placed = String(placed.length);
    }

    function paintPrompt() {
      if (!round) return;
      word.textContent = title(round.name);
      paintOutline(map, findPart(round.id) || round);
      remember();
    }

    function showPlay(on) {
      word.hidden = !on;
      map.hidden = !on;
      speaker.hidden = !on;
      choices.hidden = !on;
      startBtn.hidden = on;
    }

    function say(text) {
      if (!text || !speak) return;
      speak.arm();
      speak.speak(text);
    }

    function blip() {
      var Ctx = root.AudioContext || root.webkitAudioContext;
      if (!Ctx) return;
      try {
        if (!audio) audio = new Ctx();
        if (audio.state === "suspended" && audio.resume) audio.resume();
        var osc = audio.createOscillator();
        var gain = audio.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(audio.destination);
        var t = audio.currentTime;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.start(t);
        osc.stop(t + 0.18);
      } catch (err) { /* a missing audio device should not stop the build */ }
    }

    function buttonFor(id) {
      var buttons = choices.querySelectorAll(".choice");
      var i;
      for (i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.id === id) return buttons[i];
      }
      return null;
    }

    function grey(id) {
      var btn = buttonFor(id);
      if (!btn) return;
      btn.disabled = true;
      btn.classList.add("spent");
    }

    function wiggle(id) {
      var btn = buttonFor(id);
      if (!btn) return;
      btn.classList.remove("wiggle");
      if (typeof btn.offsetWidth === "number") void btn.offsetWidth;
      btn.classList.add("wiggle");
    }

    function flyTo(fromBtn, done) {
      var slot = board && board.querySelector(".slot");
      var photoNode = fromBtn && fromBtn.querySelector(".choice-photo");
      if (reduced() || !fromBtn || !fromBtn.getBoundingClientRect || !slot || !slot.getBoundingClientRect) {
        done();
        return;
      }
      var from = fromBtn.getBoundingClientRect();
      var to = slot.getBoundingClientRect();
      if (!from.width || !to.width) {
        done();
        return;
      }
      var flyer = el("img", "flyer");
      flyer.src = photoNode ? photoNode.src : "";
      flyer.alt = "";
      flyer.style.left = from.left + "px";
      flyer.style.top = from.top + "px";
      flyer.style.width = from.width + "px";
      flyer.style.height = from.height + "px";
      document.body.appendChild(flyer);
      var frame = root.requestAnimationFrame || function (fn) { return root.setTimeout(fn, 16); };
      frame(function () {
        flyer.style.left = to.left + "px";
        flyer.style.top = to.top + "px";
        flyer.style.width = Math.max(to.width, 24) + "px";
        flyer.style.height = Math.max(to.height, 24) + "px";
      });
      root.setTimeout(function () {
        flyer.remove();
        done();
      }, 620);
    }

    function loadRound() {
      root.BernieGuess.nextQuestion(guess);
      round = questions.makeRound(Math.random, placed.length, prevKey);
      roundToken += 1;
      note.textContent = "";
      paintPrompt();
      paintChoices();
      paintVehicle();
      paintPips();
    }

    function finishBuild() {
      choices.hidden = true;
      speaker.hidden = true;
      map.hidden = true;
      word.hidden = false;
      word.textContent = "You built it!";
      note.textContent = "";
      if (board) {
        var slot = board.querySelector(".slot");
        if (slot) slot.remove();
      }
      paintPips();
      remember();
      root.setTimeout(function () {
        busy = false;
        if (opts.onDone) opts.onDone();
      }, 2000);
    }

    function commit(part, fromBtn) {
      busy = true;
      var buttons = choices.querySelectorAll(".choice");
      var i;
      for (i = 0; i < buttons.length; i++) buttons[i].disabled = true;
      say("Yes! The " + part.name + "!");
      blip();
      flyTo(fromBtn, function () {
        if (placed.indexOf(part.id) === -1) placed.push(part.id);
        prevKey = part.key;
        if (placed.length >= questions.order.length) {
          paintVehicle();
          paintPips();
          remember();
          finishBuild();
          return;
        }
        busy = false;
        loadRound();
      });
    }

    function choose(id, token) {
      if (!started || busy || token !== roundToken || !round) return;
      var result = root.BernieGuess.answer(guess, id === round.answer);
      if (result.ignore || result.revoke) return;
      if (result.greyChoice) {
        grey(id);
        wiggle(id);
        note.textContent = result.say;
        say(result.say);
        return;
      }
      if (!result.earned) return;
      commit(round, buttonFor(id));
    }

    speaker.addEventListener("click", function () {
      if (!started || !round) return;
      say(round.say);
    });

    startBtn.addEventListener("click", function () {
      if (started) return;
      started = true;
      showPlay(true);
      paintVehicle();
      say(round.say);
    });

    loadRound();
    showPlay(false);
    paintPips();
    paintVehicle();
  }

  root.BernieBuild = { start: start };
})(typeof window !== "undefined" ? window : global);
