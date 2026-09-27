/* Homework photo check. One camera button, a checking pause, then a
   list of problems. Hints are read aloud. Stars fly into the counter. */
(function () {
  var RETAKE = "I couldn't read that clearly. Try again with good light, the whole page in the picture, and hold still.";
  var DUPLICATE = "I already checked this photo! Fix a problem, then take a new one.";
  var NOT_HOMEWORK = "Hmm, that doesn't look like a worksheet.";
  var NEWLY = "Only newly-fixed problems earn stars.";
  var DAILY = "You've earned all 20 homework stars today! Your answers are still checked.";

  var app = document.getElementById("app");
  var input = document.createElement("input");
  var sheetId = "";
  var resubmit = false;
  var busy = false;
  var audioCtx = null;

  input.type = "file";
  input.accept = "image/*";
  input.setAttribute("capture", "environment");
  input.className = "hw-file";
  input.addEventListener("change", onFile);

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function unlockAudio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  document.addEventListener("pointerdown", unlockAudio);

  function speak(text) {
    try {
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance || !text) return;
      var voices = window.speechSynthesis.getVoices() || [];
      var voice = null;
      var i;
      for (i = 0; i < voices.length; i += 1) {
        if ((voices[i].lang || "").toLowerCase().indexOf("en") === 0) {
          voice = voices[i];
          break;
        }
      }
      if (!voice && voices.length) voice = voices[0];
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice ? voice.lang : "en-US";
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      /* The words stay on the screen. */
    }
  }

  function hearButton(text, label) {
    if (!window.speechSynthesis) return null;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hw-hear";
    btn.textContent = label || "Hear it";
    btn.addEventListener("click", function () { speak(text); });
    return btn;
  }

  function shootLabel(text, keep) {
    var label = el("label", "hw-shoot", text);
    label.addEventListener("click", function () { resubmit = !!keep; });
    label.appendChild(input);
    return label;
  }

  function messageFor(res) {
    if (window.KidsStars && KidsStars.messageFor) {
      var text = KidsStars.messageFor(res);
      if (text) return text;
    }
    if (res && res.error === "slow_down") return "Wait a moment, then try the photo again.";
    return "Stars are waking up...";
  }

  function correctCount(problems) {
    var n = 0;
    (problems || []).forEach(function (problem) {
      if (problem && problem.correct) n += 1;
    });
    return n;
  }

  function headlines(res) {
    var problems = res.problems || [];
    var earned = typeof res.stars_earned === "number" ? res.stars_earned : 0;
    var cap = typeof res.sheet_cap === "number" ? res.sheet_cap : 10;
    var atSheet = typeof res.sheet_stars_total === "number" && res.sheet_stars_total >= cap;
    var daily = res.error === "daily_cap" || res.daily_remaining === 0;
    var lines = [];
    if (!(daily && earned === 0) && problems.length) {
      lines.push("You got " + correctCount(problems) + " right! +" + earned + " ⭐");
    }
    if (daily) lines.push(DAILY);
    else if (atSheet) lines.push("That's the most stars for one sheet (" + cap + ") — amazing work!");
    if (!lines.length) lines.push("I checked your worksheet.");
    return lines;
  }

  function anyWrong(problems) {
    var wrong = false;
    (problems || []).forEach(function (problem) {
      if (problem && !problem.correct) wrong = true;
    });
    return wrong;
  }

  function clearApp() {
    app.innerHTML = "";
  }

  function showPick() {
    clearApp();
    app.setAttribute("data-screen", "pick");
    app.appendChild(el("h1", "hw-title", "Homework"));
    var lead = el("p", "hw-lead", "Take a picture of one worksheet.");
    app.appendChild(lead);
    var hear = hearButton("Take a picture of one worksheet.", "Hear it");
    if (hear) app.appendChild(hear);
    app.appendChild(shootLabel("Take a photo of your worksheet", false));
    speak("Take a picture of one worksheet.");
  }

  function showChecking() {
    clearApp();
    app.setAttribute("data-screen", "checking");
    var face = el("p", "hw-check-face", "🔎");
    face.setAttribute("aria-hidden", "true");
    app.appendChild(face);
    var word = el("h1", "hw-title", "Checking…");
    app.appendChild(word);
    app.appendChild(el("p", "hw-lead", "Looking at your page."));
    var hear = hearButton("Checking your worksheet.", "Hear it");
    if (hear) app.appendChild(hear);
    speak("Checking your worksheet.");
  }

  function showStatus(screen, text) {
    clearApp();
    app.setAttribute("data-screen", screen);
    app.appendChild(el("h1", "hw-title", "Homework"));
    var note = el("p", "hw-lead", text);
    note.setAttribute("role", "status");
    app.appendChild(note);
    var hear = hearButton(text, "Hear it");
    if (hear) app.appendChild(hear);
    app.appendChild(shootLabel("Take a photo of your worksheet", false));
    speak(text);
  }

  function chime(step) {
    unlockAudio();
    if (!audioCtx) return;
    var notes = [523.25, 659.25, 783.99, 1046.5];
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[step % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  function sparkle(rect) {
    var dots = 6;
    var i;
    for (i = 0; i < dots; i += 1) {
      var dot = el("span", "hw-spark");
      var angle = (Math.PI * 2 * i) / dots;
      dot.style.left = (rect.left + rect.width / 2) + "px";
      dot.style.top = (rect.top + rect.height / 2) + "px";
      dot.style.setProperty("--dx", Math.round(Math.cos(angle) * 28) + "px");
      dot.style.setProperty("--dy", Math.round(Math.sin(angle) * 28) + "px");
      document.body.appendChild(dot);
      (function (node) {
        setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 520);
      })(dot);
    }
  }

  function flyStars(count, balance) {
    var bar = document.getElementById("starbar");
    var start = typeof balance === "number" ? balance - count : null;
    if (start != null && start < 0) start = 0;
    if (start != null && bar) bar.textContent = "★ " + start;
    var origin = document.querySelector(".hw-title") || app;
    var box = origin.getBoundingClientRect();
    var from = {
      left: box.left,
      top: Math.min(box.bottom + 70, window.innerHeight * 0.55),
      width: box.width,
      height: 36
    };
    var n;
    for (n = 0; n < count; n += 1) {
      (function (step) {
        setTimeout(function () { launch(from, step, start); }, step * 520);
      })(n);
    }
    setTimeout(function () {
      if (window.KidsStars && KidsStars.applyStars) KidsStars.applyStars(balance);
      else if (bar && typeof balance === "number") bar.textContent = "★ " + balance;
    }, count * 520 + 760);
  }

  function launch(from, step, start) {
    var bar = document.getElementById("starbar");
    var star = el("span", "hw-fly", "⭐");
    star.style.left = (from.left + from.width / 2 - 16) + "px";
    star.style.top = (from.top + 8) + "px";
    document.body.appendChild(star);
    var to = bar ? bar.getBoundingClientRect() : { left: from.left, top: 8, width: 48, height: 48 };
    var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    var dy = (to.top + to.height / 2) - (from.top + 24);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        star.style.transform = "translate(" + dx + "px, " + dy + "px) scale(0.72)";
      });
    });
    setTimeout(function () {
      sparkle(to);
      chime(step);
      if (bar && start != null) bar.textContent = "★ " + (start + step + 1);
      if (star.parentNode) star.parentNode.removeChild(star);
    }, 720);
  }

  function showResults(res) {
    if (res.sheet_id) sheetId = String(res.sheet_id);
    var lines = headlines(res);
    var problems = res.problems || [];
    var earned = typeof res.stars_earned === "number" ? res.stars_earned : 0;
    clearApp();
    app.setAttribute("data-screen", "results");
    if (res.error === "daily_cap" || res.daily_remaining === 0) app.setAttribute("data-cap", "daily");
    else app.removeAttribute("data-cap");
    app.setAttribute("data-earned", String(earned));

    lines.forEach(function (line, index) {
      var node = el(index === 0 ? "h1" : "p", index === 0 ? "hw-title" : "hw-lead", line);
      if (index === 0) node.setAttribute("role", "status");
      app.appendChild(node);
      var hear = hearButton(line, "Hear it");
      if (hear) app.appendChild(hear);
    });

    if (problems.length) {
      var list = document.createElement("ol");
      list.className = "hw-list";
      problems.forEach(function (problem, index) {
        var number = problem && problem.n != null ? problem.n : index + 1;
        var item = document.createElement("li");
        item.className = problem && problem.correct ? "hw-problem hw-yes" : "hw-problem hw-soft";
        item.appendChild(el("span", "hw-n", String(number)));
        item.appendChild(el("span", "hw-mark", problem && problem.correct ? "✅" : "🤔"));
        if (!(problem && problem.correct)) {
          var hint = problem && problem.hint ? String(problem.hint) : "Try this one again.";
          item.appendChild(el("p", "hw-hint", hint));
          var noHear = hearButton("Problem " + number + ". " + hint, "Hear the hint");
          if (noHear) item.appendChild(noHear);
        }
        list.appendChild(item);
      });
      app.appendChild(list);
    }

    if (anyWrong(problems)) {
      app.appendChild(shootLabel("Fix it and take a new photo", true));
      var note = el("p", "hw-note", NEWLY);
      app.appendChild(note);
      var noteHear = hearButton(NEWLY, "Hear it");
      if (noteHear) app.appendChild(noteHear);
    } else if (problems.length) {
      app.appendChild(shootLabel("Take a photo of your worksheet", false));
    } else {
      app.appendChild(shootLabel("Take a photo of your worksheet", false));
    }

    speak(lines.join(" "));
    if (earned > 0) flyStars(Math.min(earned, 12), res.balance);
    else if (window.KidsStars && KidsStars.applyStars) KidsStars.applyStars(res.balance);
  }

  function showResponse(res) {
    if (res && (res.status === "checked" || res.error === "daily_cap")) {
      showResults(res);
      return;
    }
    if (res && res.status === "retake") {
      showStatus("retake", RETAKE);
      return;
    }
    if (res && res.status === "duplicate") {
      showStatus("duplicate", DUPLICATE);
      return;
    }
    if (res && res.status === "not_homework") {
      showStatus("not_homework", NOT_HOMEWORK);
      return;
    }
    showStatus("message", messageFor(res));
  }

  function onFile() {
    if (busy) return;
    var file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    busy = true;
    var keep = resubmit ? sheetId : "";
    resubmit = false;
    showChecking();
    window.HomeworkPhoto.prepare(file).then(function (photo) {
      return window.HomeworkCheck.check({ image: photo.base64, sheetId: keep });
    }).then(function (res) {
      busy = false;
      showResponse(res);
    }, function () {
      busy = false;
      showStatus("message", "I couldn't use that photo. Try again.");
    });
  }

  showPick();
})();
