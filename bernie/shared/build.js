/* Build-a-vehicle. One correct answer snaps on the next part.
   The vehicle is a config: ordered parts plus a draw(host, state) function.
   A wrong tap says try again and changes nothing. */
(function (root) {
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function start(opts) {
    var vehicle = opts.vehicle;
    var questions = opts.questions;
    var speak = opts.speak;
    var earned = [];
    var just = "";
    var question = questions.makeQuestion();
    var lock = false;

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

    function paintVehicle() {
      vehicle.draw(art, {
        parts: earned.slice(),
        bucketUp: false,
        carrying: false,
        just: just
      });
    }

    function paintQuestion() {
      visual.innerHTML = "";
      if (question.kind === "count") {
        visual.setAttribute("aria-label", question.rocks + " rocks");
        var i;
        for (i = 0; i < question.rocks; i++) {
          visual.appendChild(el("span", "rock"));
        }
      } else if (question.show) {
        visual.removeAttribute("aria-label");
        var big = el("p", "big-letter");
        big.textContent = question.show;
        visual.appendChild(big);
      } else {
        visual.removeAttribute("aria-label");
      }

      choices.innerHTML = "";
      question.choices.forEach(function (choice) {
        var btn = el("button", "choice");
        btn.type = "button";
        btn.textContent = choice.label;
        btn.addEventListener("click", function () {
          choose(choice.id);
        });
        choices.appendChild(btn);
      });
    }

    function choose(id) {
      if (!speak.isArmed()) {
        speak.arm();
        speak.speak(question.say);
        return;
      }
      if (lock) return;
      if (id !== question.answer) {
        speak.speak("Try again.");
        note.textContent = "Try again";
        choices.classList.remove("shake");
        void choices.offsetWidth;
        choices.classList.add("shake");
        return;
      }

      lock = true;
      note.textContent = "";
      choices.classList.remove("shake");
      var part = vehicle.parts[earned.length];
      earned.push(part.id);
      just = part.id;
      paintVehicle();

      if (earned.length >= vehicle.parts.length) {
        speak.lines(["Yes!", "Let's drive!"]);
        window.setTimeout(function () {
          if (opts.onDone) opts.onDone();
        }, 650);
        return;
      }

      question = questions.makeQuestion();
      speak.lines(["Yes!", question.say]);
      paintQuestion();
      window.setTimeout(function () {
        lock = false;
      }, 400);
    }

    speaker.addEventListener("click", function () {
      speak.arm();
      speak.speak(question.say);
    });

    paintVehicle();
    paintQuestion();
  }

  root.BernieBuild = { start: start };
})(typeof window !== "undefined" ? window : global);
