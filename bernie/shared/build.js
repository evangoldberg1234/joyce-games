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

  function iconButton(className, icon, label) {
    var btn = el("button", className);
    btn.type = "button";
    var mark = el("span", "btn-icon");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = icon;
    var text = el("span", "btn-label");
    text.textContent = label;
    btn.appendChild(mark);
    btn.appendChild(text);
    return btn;
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
    var missedIds = {};
    var gestureAt = 0;
    var gestureX = null;
    var gestureY = null;
    var guess = root.BernieGuess.createState();

    var wrap = el("div", "build");
    var hud = el("div", "hud");
    var word = el("p", "prompt-word");
    var speaker = el("button", "speaker");
    speaker.type = "button";
    speaker.textContent = "🔊";
    speaker.setAttribute("aria-label", "Hear it");
    var pips = el("div", "pips");
    pips.setAttribute("aria-hidden", "true");
    hud.appendChild(word);
    hud.appendChild(speaker);
    hud.appendChild(pips);

    var note = el("p", "try");
    note.setAttribute("role", "status");
    var art = el("div", "art");
    var choices = el("div", "choices");
    var startBtn = iconButton("start-go", "▶", "Start");
    var pendingRound = null;

    wrap.appendChild(hud);
    wrap.appendChild(note);
    wrap.appendChild(art);
    wrap.appendChild(choices);
    wrap.appendChild(startBtn);
    opts.mount.innerHTML = "";
    opts.mount.appendChild(wrap);

    var board = null;

    function bit(part) {
      var img = el("img", "bit");
      img.src = part.src;
      img.alt = "";
      img.draggable = false;
      var box = vehicle.board;
      img.style.left = (part.x / box.w * 100) + "%";
      img.style.top = (part.y / box.h * 100) + "%";
      img.style.width = (part.w / box.w * 100) + "%";
      img.style.height = (part.h / box.h * 100) + "%";
      return img;
    }

    function paintBoard() {
      if (!board) {
        board = el("div", "board");
        board.style.aspectRatio = vehicle.board.w + " / " + vehicle.board.h;
        art.appendChild(board);
      }
      board.innerHTML = "";
      var skin = el("div", "outline");
      var ghost = el("img", "silhouette");
      ghost.src = vehicle.outline || "img/outline.webp";
      ghost.alt = "";
      ghost.draggable = false;
      skin.appendChild(ghost);
      board.appendChild(skin);
      var have = {};
      var i;
      for (i = 0; i < placed.length; i++) have[placed[i]] = true;
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
        var pip = el("span", "pip" + (on ? " got" : ""));
        var icon = el("img", "pip-photo");
        icon.src = "img/tile-" + order[i].id + ".webp";
        icon.alt = "";
        icon.draggable = false;
        pip.appendChild(icon);
        pips.appendChild(pip);
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
        img.src = "img/tile-" + choice.id + ".webp";
        img.alt = "";
        img.draggable = false;
        btn.appendChild(img);
        if (choice.id === "front-wheel" || choice.id === "rear-wheel") {
          var tag = el("span", "wheel-tag");
          tag.setAttribute("aria-hidden", "true");
          tag.textContent = choice.id === "front-wheel" ? "F" : "R";
          btn.appendChild(tag);
        }
        btn.addEventListener("click", function (event) {
          /* A tap that disables this tile can fall through onto the neighbor.
             Ignore that second hit when it is the same spot. A real tap on
             the other tile has a different point, so it still counts. */
          if (event && typeof event.clientX === "number") {
            var at = Date.now();
            var sameSpot = gestureX !== null && at - gestureAt < 450 &&
              Math.abs(event.clientX - gestureX) < 28 &&
              Math.abs(event.clientY - gestureY) < 28;
            if (sameSpot) {
              if (event.preventDefault) event.preventDefault();
              if (event.stopPropagation) event.stopPropagation();
              return;
            }
            gestureAt = at;
            gestureX = event.clientX;
            gestureY = event.clientY;
          }
          if (event && event.preventDefault) event.preventDefault();
          if (event && event.stopPropagation) event.stopPropagation();
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

    function paintWheelCue() {
      var old = hud.querySelector(".wheel-cue");
      if (old) old.remove();
      if (!started || !round || (round.id !== "front-wheel" && round.id !== "rear-wheel")) return;
      var cue = el("div", "wheel-cue");
      cue.setAttribute("aria-hidden", "true");
      var img = el("img");
      img.src = vehicle.outline || "img/outline.webp";
      img.alt = "";
      img.draggable = false;
      var dot = el("span", "wheel-cue-dot " + (round.id === "front-wheel" ? "front" : "rear"));
      cue.appendChild(img);
      cue.appendChild(dot);
      if (word.nextSibling) hud.insertBefore(cue, word.nextSibling);
      else hud.appendChild(cue);
    }

    function paintPrompt() {
      if (!round) return;
      word.textContent = title(round.name);
      paintWheelCue();
      remember();
    }

    function showPlay(on) {
      word.hidden = !on;
      speaker.hidden = !on;
      choices.hidden = !on;
      startBtn.hidden = on;
      if (on) paintWheelCue();
      else {
        var cue = hud.querySelector(".wheel-cue");
        if (cue) cue.remove();
      }
    }

    /* Speech exists only here, and only because the speaker button was tapped. */
    function hear() {
      if (!started || !round || !speak) return;
      speak.arm();
      if (speak.lines) speak.lines([round.say]);
      else speak.speak(round.say);
    }

    function buttonFor(id) {
      var buttons = choices.querySelectorAll(".choice");
      var i;
      for (i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.id === id) return buttons[i];
      }
      return null;
    }

    function releaseUntapped(keepId) {
      var buttons = choices.querySelectorAll(".choice");
      var i;
      for (i = 0; i < buttons.length; i++) {
        var other = buttons[i];
        if (other.dataset.id === keepId || missedIds[other.dataset.id]) continue;
        other.disabled = false;
        other.classList.remove("spent", "miss", "wiggle");
        var mark = other.querySelector(".mark-x");
        if (mark) mark.remove();
      }
    }

    function wiggle(id) {
      var btn = buttonFor(id);
      if (!btn) return;
      btn.classList.remove("wiggle");
      if (typeof btn.offsetWidth === "number") void btn.offsetWidth;
      btn.classList.add("wiggle");
    }

    function markWrong(id) {
      var btn = buttonFor(id);
      if (!btn || btn.dataset.id !== id) return;
      missedIds[id] = true;
      btn.disabled = true;
      btn.classList.add("spent", "miss");
      if (!btn.querySelector(".mark-x")) {
        var mark = el("span", "mark-x");
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "✕";
        btn.appendChild(mark);
      }
      wiggle(id);
      releaseUntapped(id);
    }

    function landBox(part) {
      if (!board || !board.getBoundingClientRect || !part || !vehicle.board) return null;
      var rect = board.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      var box = vehicle.board;
      return {
        left: rect.left + (part.x / box.w) * rect.width,
        top: rect.top + (part.y / box.h) * rect.height,
        width: (part.w / box.w) * rect.width,
        height: (part.h / box.h) * rect.height
      };
    }

    function flyTo(fromBtn, part, done) {
      var photoNode = fromBtn && fromBtn.querySelector(".choice-photo");
      var to = landBox(part);
      if (reduced() || !fromBtn || !fromBtn.getBoundingClientRect || !to) {
        done();
        return;
      }
      var from = fromBtn.getBoundingClientRect();
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
      if (pendingRound) {
        round = pendingRound;
        pendingRound = null;
      } else {
        round = questions.makeRound(Math.random, placed.length, prevKey);
      }
      roundToken += 1;
      missedIds = {};
      note.textContent = "";
      paintPrompt();
      paintChoices();
      paintVehicle();
      paintPips();
    }

    function finishBuild() {
      choices.hidden = true;
      speaker.hidden = true;
      word.hidden = false;
      word.textContent = "You built it!";
      note.textContent = "";
      art.classList.add("done-build", "shine");
      if (board) {
        board.classList.add("built", "shine");
        var skin = board.querySelector(".outline");
        if (skin) skin.remove();
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
      var willFinish = placed.length + 1 >= questions.order.length;
      if (!willFinish) {
        pendingRound = questions.makeRound(Math.random, placed.length + 1, part.key);
      }
      flyTo(fromBtn, part, function () {
        if (placed.indexOf(part.id) === -1) placed.push(part.id);
        prevKey = part.key;
        paintVehicle();
        paintPips();
        remember();
        if (willFinish) {
          finishBuild();
          return;
        }
        /* Let the landed piece and the filled pip sit before the next question. */
        root.setTimeout(function () {
          busy = false;
          loadRound();
        }, 1400);
      });
    }

    function choose(id, token) {
      if (!started || busy || token !== roundToken || !round) return;
      var result = root.BernieGuess.answer(guess, id === round.answer);
      if (result.ignore || result.revoke) return;
      if (result.greyChoice) {
        markWrong(id);
        note.textContent = "";
        return;
      }
      if (!result.earned) return;
      commit(round, buttonFor(id));
    }

    speaker.addEventListener("click", hear);

    startBtn.addEventListener("click", function () {
      if (started) return;
      started = true;
      showPlay(true);
      paintVehicle();
    });

    loadRound();
    showPlay(false);
    paintPips();
    paintVehicle();
  }

  root.BernieBuild = { start: start };
})(typeof window !== "undefined" ? window : global);
