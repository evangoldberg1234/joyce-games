/* Build-a-vehicle. A correct answer offers the next piece.
   Photo pieces (src, x, y on vehicle.board) are dragged onto the ghost.
   They snap within 60px, on a tap, or on their own after a few seconds.
   A vehicle without images still snaps straight onto draw(). */
(function (root) {
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function start(opts) {
    var vehicle = opts.vehicle;
    var questions = opts.questions;
    var speak = opts.speak;
    var photo = !!(vehicle.board && vehicle.parts[0] && vehicle.parts[0].src);
    var placed = [];
    var question = null;
    var lock = false;
    var snapNow = null;
    var started = false;
    var guess = root.BernieGuess.createState(0);
    var speechGen = 0;

    var wrap = el("div", "build");
    var art = el("div", "art");
    var note = el("p", "try");
    note.setAttribute("role", "status");
    var visual = el("div", "q-visual");
    var speaker = el("button", "speaker");
    speaker.type = "button";
    speaker.setAttribute("aria-label", "Hear the question");
    speaker.textContent = "🔊";
    var choices = el("div", "choices");

    wrap.appendChild(art);
    wrap.appendChild(note);
    wrap.appendChild(visual);
    wrap.appendChild(speaker);
    wrap.appendChild(choices);
    opts.mount.innerHTML = "";
    opts.mount.appendChild(wrap);

    function bit(part, className) {
      var img = el("img", className);
      img.src = part.src;
      img.alt = "";
      img.draggable = false;
      var board = vehicle.board;
      img.style.left = (part.x / board.w * 100) + "%";
      img.style.top = (part.y / board.h * 100) + "%";
      img.style.width = (part.w / board.w * 100) + "%";
      return img;
    }

    function paintBoard() {
      var board = art.querySelector(".board");
      if (!board) {
        board = el("div", "board");
        board.style.aspectRatio = vehicle.board.w + " / " + vehicle.board.h;
        art.insertBefore(board, art.firstChild);
      }
      board.innerHTML = "";
      var ghost = el("img", "ghost");
      ghost.src = vehicle.ghost;
      ghost.alt = "";
      ghost.draggable = false;
      board.appendChild(ghost);
      var i;
      for (i = 0; i < vehicle.parts.length; i++) {
        var part = vehicle.parts[i];
        if (placed.indexOf(part.id) !== -1) board.appendChild(bit(part, "bit"));
      }
    }

    function paintVehicle() {
      if (photo) paintBoard();
      else {
        vehicle.draw(art, {
          parts: placed.slice(),
          bucketUp: false,
          carrying: false,
          just: placed.length ? placed[placed.length - 1] : ""
        });
      }
    }

    function showQuestions(on) {
      visual.hidden = !on;
      speaker.hidden = !on;
      choices.hidden = !on;
    }

    function speechDone(gen, played) {
      if (gen !== speechGen) return;
      if (played) root.BernieGuess.noteSpoken(guess, Date.now());
      else root.BernieGuess.noteSpeechUnavailable(guess);
    }

    function speakLines(list) {
      var gen = ++speechGen;
      root.BernieGuess.noteSpeechStarted(guess);
      var timer = window.setTimeout(function () {
        if (gen !== speechGen) return;
        if (guess.round.speaking) root.BernieGuess.noteSpeechUnavailable(guess);
      }, 8000);
      speak.lines(list, function (played) {
        window.clearTimeout(timer);
        speechDone(gen, played);
      });
    }

    function speakQuestion() {
      speakLines([question.say]);
    }

    /* Short feedback must not let the cancelled question reset the listen clock. */
    function speakFeedback(text) {
      speechGen += 1;
      speak.speak(text);
    }

    function greyChoice(id) {
      var buttons = choices.querySelectorAll(".choice");
      var i;
      for (i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.id === id) {
          buttons[i].disabled = true;
          buttons[i].classList.add("spent");
        }
      }
    }

    function enableChoices() {
      choices.classList.remove("dim");
      var buttons = choices.querySelectorAll(".choice");
      var i;
      for (i = 0; i < buttons.length; i++) {
        if (!buttons[i].classList.contains("spent")) buttons[i].disabled = false;
      }
    }

    var cooldownTimer = 0;

    function startCooldown() {
      if (cooldownTimer) return;
      choices.classList.add("dim");
      var buttons = choices.querySelectorAll(".choice");
      var i;
      for (i = 0; i < buttons.length; i++) buttons[i].disabled = true;
      cooldownTimer = window.setTimeout(function () {
        cooldownTimer = 0;
        if (!started) return;
        root.BernieGuess.endCooldown(guess, Date.now());
        enableChoices();
        speakQuestion();
      }, root.BernieGuess.COOLDOWN_MS);
    }

    function paintQuestion() {
      visual.innerHTML = "";
      visual.className = "q-visual";
      if (question.kind === "count") {
        visual.setAttribute("aria-label", question.rocks + " rocks");
        var i;
        for (i = 0; i < question.rocks; i++) {
          visual.appendChild(el("span", "rock"));
        }
      } else if (question.kind === "word") {
        visual.className = "q-visual word";
        visual.setAttribute("aria-label", question.word);
        var emoji = el("p", "big-emoji");
        emoji.textContent = question.emoji;
        var word = el("p", "word");
        word.textContent = question.word;
        visual.appendChild(emoji);
        visual.appendChild(word);
      } else {
        visual.removeAttribute("aria-label");
      }

      choices.classList.remove("dim");
      choices.innerHTML = "";
      question.choices.forEach(function (choice) {
        var btn = el("button", "choice");
        btn.type = "button";
        btn.dataset.id = choice.id;
        btn.textContent = choice.label;
        btn.addEventListener("click", function () {
          choose(choice.id);
        });
        choices.appendChild(btn);
      });
    }

    function showInset(part) {
      var box = art.querySelector(".inset");
      if (!part || !part.inset) {
        if (box) box.remove();
        return;
      }
      if (!box) {
        box = el("div", "inset");
        art.appendChild(box);
      }
      box.innerHTML = "";
      var img = el("img");
      img.src = part.inset;
      img.alt = "";
      var cap = el("p");
      cap.textContent = part.name;
      box.appendChild(img);
      box.appendChild(cap);
    }

    function showFinale() {
      snapNow = null;
      wrap.classList.remove("placing");
      showInset(null);
      showQuestions(false);
      art.innerHTML = "";
      var card = el("img", "finale");
      card.src = vehicle.finale;
      card.alt = "The loader";
      art.appendChild(card);
      note.textContent = "You built it!";
      speak.speak("You built it!");
      choices.hidden = false;
      choices.innerHTML = "";
      var go = el("button", "choice drive-go");
      go.type = "button";
      go.textContent = "Drive";
      go.addEventListener("click", function () {
        speak.arm();
        if (opts.onDone) opts.onDone();
      });
      choices.appendChild(go);
    }

    function afterPlace() {
      showInset(null);
      wrap.classList.remove("placing");
      paintBoard();
      if (placed.length >= vehicle.parts.length) {
        window.setTimeout(showFinale, reduced() ? 40 : 900);
        return;
      }
      question = questions.makeQuestion();
      root.BernieGuess.nextQuestion(guess, Date.now());
      showQuestions(true);
      paintQuestion();
      note.textContent = "";
      lock = false;
      speakQuestion();
    }

    function present(part) {
      wrap.classList.add("placing");
      showQuestions(false);
      note.textContent = part.name;
      speak.lines(["Yes!", part.name]);
      paintBoard();
      var board = art.querySelector(".board");
      board.appendChild(bit(part, "bit target"));
      showInset(part);

      var img = el("img", "float-piece");
      img.src = part.src;
      img.alt = part.name;
      img.draggable = false;
      art.appendChild(img);

      var boardBox = board.getBoundingClientRect();
      var scale = boardBox.width / vehicle.board.w;
      var width = part.w * scale * 1.2;
      if (width > boardBox.width * 0.78) width = boardBox.width * 0.78;
      img.style.width = width + "px";
      function park(x, y) {
        var w = img.offsetWidth || width;
        var h = img.offsetHeight || (width * part.h / part.w);
        img.style.left = (x - w / 2) + "px";
        img.style.top = (y - h / 2) + "px";
      }
      park(boardBox.left + boardBox.width / 2, boardBox.top + boardBox.height * 0.46);
      if (!reduced()) {
        img.style.transform = "scale(1.4)";
        window.requestAnimationFrame(function () {
          img.style.transition = "transform 0.45s ease";
          img.style.transform = "scale(1)";
        });
      }

      var timer = window.setTimeout(finish, 4500);
      var dragging = false;
      var moved = 0;
      var pointerId = null;
      var last = null;

      function targetBox() {
        var boardEl = art.querySelector(".board");
        if (!boardEl) return null;
        var box = boardEl.getBoundingClientRect();
        if (!box.width || !box.height) return null;
        return {
          left: box.left + (part.x / vehicle.board.w) * box.width,
          top: box.top + (part.y / vehicle.board.h) * box.height,
          width: (part.w / vehicle.board.w) * box.width,
          height: (part.h / vehicle.board.h) * box.height
        };
      }

      function closeEnough() {
        var spot = targetBox();
        if (!spot) return false;
        var here = img.getBoundingClientRect();
        var dx = (here.left + here.width / 2) - (spot.left + spot.width / 2);
        var dy = (here.top + here.height / 2) - (spot.top + spot.height / 2);
        return Math.sqrt(dx * dx + dy * dy) <= 60;
      }

      function finish() {
        if (img.dataset.done) return;
        img.dataset.done = "1";
        snapNow = null;
        window.clearTimeout(timer);
        var spot = targetBox();
        if (spot && !reduced()) {
          img.style.transition = "left 0.35s ease, top 0.35s ease, width 0.35s ease, transform 0.35s ease";
        } else {
          img.style.transition = "none";
        }
        img.style.transform = "scale(1)";
        if (spot) {
          img.style.left = spot.left + "px";
          img.style.top = spot.top + "px";
          img.style.width = spot.width + "px";
        }
        window.setTimeout(function () {
          placed.push(part.id);
          if (img.parentNode) img.remove();
          afterPlace();
        }, reduced() ? 20 : 380);
      }

      snapNow = finish;

      img.addEventListener("pointerdown", function (event) {
        if (img.dataset.done) return;
        dragging = true;
        moved = 0;
        pointerId = event.pointerId;
        last = { x: event.clientX, y: event.clientY };
        img.style.transition = "none";
        try {
          if (img.setPointerCapture) img.setPointerCapture(event.pointerId);
        } catch (err) { /* still follow the finger */ }
      });

      img.addEventListener("pointermove", function (event) {
        if (!dragging || event.pointerId !== pointerId) return;
        moved += Math.abs(event.clientX - last.x) + Math.abs(event.clientY - last.y);
        last = { x: event.clientX, y: event.clientY };
        park(event.clientX, event.clientY - 28);
      });

      function endDrag(event) {
        if (!dragging || event.pointerId !== pointerId) return;
        dragging = false;
        if (img.dataset.done) return;
        if (moved < 14 || closeEnough()) finish();
      }

      img.addEventListener("pointerup", endDrag);
      img.addEventListener("pointercancel", endDrag);
    }

    art.addEventListener("pointerdown", function (event) {
      if (!snapNow) return;
      if (event.target.closest && event.target.closest(".float-piece")) return;
      snapNow();
    });

    function missOn() {
      question = questions.makeQuestion();
      root.BernieGuess.nextQuestion(guess, Date.now());
      showQuestions(true);
      paintQuestion();
      note.textContent = "";
      lock = false;
      speakQuestion();
    }

    function choose(id) {
      if (!started || lock) return;
      var result = root.BernieGuess.answer(guess, id === question.answer, Date.now());
      if (result.ignore) return;
      if (result.cooldown) {
        if (result.greyChoice) greyChoice(id);
        note.textContent = result.say;
        speakFeedback(result.say);
        startCooldown();
        return;
      }
      if (result.greyChoice) {
        greyChoice(id);
        note.textContent = result.say;
        speakFeedback(result.say);
        return;
      }
      if (!result.earned) {
        missOn();
        return;
      }

      lock = true;
      note.textContent = "";
      choices.classList.remove("shake");
      var part = vehicle.parts[placed.length];
      if (photo) {
        present(part);
        return;
      }

      placed.push(part.id);
      paintVehicle();
      if (placed.length >= vehicle.parts.length) {
        speak.lines(["Yes!", "Let's drive!"]);
        window.setTimeout(function () {
          if (opts.onDone) opts.onDone();
        }, 900);
        return;
      }
      question = questions.makeQuestion();
      root.BernieGuess.nextQuestion(guess, Date.now());
      speakLines(["Yes!", question.say]);
      paintQuestion();
      window.setTimeout(function () {
        lock = false;
      }, 400);
    }

    function showStart() {
      paintVehicle();
      showQuestions(false);
      note.textContent = "";
      choices.hidden = false;
      choices.innerHTML = "";
      var start = el("button", "choice start-go");
      start.type = "button";
      if (vehicle.finale || vehicle.ghost) {
        var photo = el("img");
        photo.src = vehicle.finale || vehicle.ghost;
        photo.alt = "";
        start.appendChild(photo);
      } else {
        var emoji = el("span", "start-emoji");
        emoji.textContent = "🚜";
        start.appendChild(emoji);
      }
      var label = el("span");
      label.textContent = "Start";
      start.appendChild(label);
      start.addEventListener("click", function () {
        if (started) return;
        started = true;
        speak.arm();
        question = questions.makeQuestion();
        root.BernieGuess.nextQuestion(guess, Date.now());
        showQuestions(true);
        paintQuestion();
        note.textContent = "";
        speakLines(["Let's build a loader!", question.say]);
      });
      choices.appendChild(start);
    }

    speaker.addEventListener("click", function () {
      if (!question) return;
      speak.arm();
      speakQuestion();
    });

    showStart();
  }

  root.BernieBuild = { start: start };
})(typeof window !== "undefined" ? window : global);
