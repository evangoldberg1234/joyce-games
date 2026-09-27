/* Book Club. She finds a book, retells it, and takes a short quiz here.
   Copy this folder with client.js. Read names from window.KIDS_CHAT. */
(function () {
  var app = document.getElementById("app");
  var cfg = window.KIDS_CHAT || {};
  var botName = cfg.botName || "your guide";
  var botEmoji = cfg.botEmoji || "📚";
  var WAIT_HINT_MS = 3 * 60 * 1000;
  var SHORT_NOTE = "This one is a bit short for stars, but reading is always great!";
  var COME_BACK = "This is taking a while. You can come back later from My Bookshelf.";
  var pollGen = 0;
  var busy = false;

  function kid() {
    return (window.KIDS_CHAT && window.KIDS_CHAT.kid) || "kid";
  }

  function storeKey() {
    return "books.reads." + kid();
  }

  function loadReads() {
    try {
      var data = JSON.parse(localStorage.getItem(storeKey()) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch (err) {
      return {};
    }
  }

  function saveReads(data) {
    try { localStorage.setItem(storeKey(), JSON.stringify(data)); } catch (err) { /* private mode */ }
  }

  function remember(book) {
    if (!book || !book.work_id) return;
    var all = loadReads();
    var prev = all[book.work_id] || {};
    all[book.work_id] = {
      work_id: book.work_id,
      read_id: book.read_id || prev.read_id || "",
      title: book.title || prev.title || "",
      author: book.author || prev.author || "",
      status: book.status || prev.status || "",
      attempts: typeof book.attempts === "number" ? book.attempts : (prev.attempts || 0)
    };
    saveReads(all);
    return all[book.work_id];
  }

  function attemptsFor(workId) {
    var row = loadReads()[workId];
    return row && row.attempts ? row.attempts : 0;
  }

  function setAttempts(workId, n) {
    var all = loadReads();
    if (!all[workId]) all[workId] = { work_id: workId, attempts: n };
    else all[workId].attempts = n;
    saveReads(all);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(label, className, onClick) {
    var node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function stopPoll() {
    pollGen += 1;
  }

  function pagesLine(pages) {
    if (typeof pages === "number" && pages > 0) return "about " + pages + " pages";
    return "pages not sure yet";
  }

  function prettyDate(iso) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!match) return "";
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month = months[Number(match[2]) - 1];
    if (!month) return "";
    return month + " " + Number(match[3]);
  }

  function shelfLabel(status) {
    if (status === "passed") return "Earned 20 ⭐";
    if (status === "pending_review") return "Waiting for a grown-up";
    if (status === "failed") return "Not this time";
    if (status === "quiz_ready") return "Your quiz is ready";
    if (status === "awaiting_quiz") return botName + " is making your quiz";
    return "Still checking";
  }

  function coverEl(url) {
    var wrap = el("div", "book-cover");
    var placeholder = el("span", "book-placeholder", "📖");
    placeholder.setAttribute("aria-hidden", "true");
    wrap.appendChild(placeholder);
    if (url) {
      var img = document.createElement("img");
      img.alt = "";
      img.src = url;
      img.addEventListener("error", function () { img.remove(); });
      wrap.appendChild(img);
    }
    return wrap;
  }

  function showStars(balance) {
    var bar = document.getElementById("starbar");
    if (bar && typeof balance === "number") bar.textContent = "★ " + balance;
  }

  function voiceFor() {
    if (!window.speechSynthesis) return null;
    var voices = window.speechSynthesis.getVoices();
    var i;
    for (i = 0; i < voices.length; i++) {
      if ((voices[i].lang || "").toLowerCase().indexOf("en") === 0) return voices[i];
    }
    return null;
  }

  function speak(text) {
    try {
      var voice = voiceFor();
      if (!voice || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice.lang;
      utter.voice = voice;
      window.speechSynthesis.speak(utter);
    } catch (err) { /* The words stay on the screen. */ }
  }

  function showProblem(res) {
    stopPoll();
    busy = false;
    if (res && res.error === "locked") showLocked();
    else showAsleep();
  }

  function showLocked() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "locked");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-note", "Ask a grown-up to unlock. Open the chat bubble and enter the family code."));
    app.appendChild(button("Try again", "book-next", showSearch));
  }

  function showAsleep() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "asleep");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-note", "Book Club is waking up..."));
    app.appendChild(button("Try again", "book-next", showSearch));
  }

  function showSearch() {
    stopPoll();
    busy = false;
    app.innerHTML = "";
    app.setAttribute("data-screen", "search");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-lead", "Read a book. A long one can earn 20 stars."));
    var form = el("form", "book-form");
    var titleLabel = el("label", "book-label", "Book title");
    titleLabel.setAttribute("for", "book-title-input");
    var titleInput = el("input", "book-input");
    titleInput.id = "book-title-input";
    titleInput.type = "text";
    titleInput.autocomplete = "off";
    titleInput.enterKeyHint = "search";
    var authorLabel = el("label", "book-label", "Author, if you know it");
    authorLabel.setAttribute("for", "book-author-input");
    var authorInput = el("input", "book-input");
    authorInput.id = "book-author-input";
    authorInput.type = "text";
    authorInput.autocomplete = "off";
    var find = el("button", "book-next", "Find");
    find.type = "submit";
    var note = el("p", "book-note", "");
    note.setAttribute("data-note", "1");
    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(authorLabel);
    form.appendChild(authorInput);
    form.appendChild(find);
    form.appendChild(note);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      lookup(titleInput.value, authorInput.value, note, find);
    });
    app.appendChild(form);
    app.appendChild(button("My bookshelf", "book-side", showShelf));
  }

  function lookup(title, author, note, find) {
    if (busy) return;
    title = String(title || "").trim();
    author = String(author || "").trim();
    if (!title) {
      note.textContent = "Type the book's name.";
      return;
    }
    busy = true;
    find.disabled = true;
    note.textContent = "Looking...";
    window.KidBooks.lookup(title, author).then(function (res) {
      busy = false;
      if (!res || res.ok === false) {
        showProblem(res);
        return;
      }
      var list = Array.isArray(res.candidates) ? res.candidates.slice(0, 5) : [];
      if (!list.length) {
        showSearch();
        var again = document.querySelector("[data-note]");
        if (again) again.textContent = "No book with that name. Try again.";
        var input = document.getElementById("book-title-input");
        if (input) input.value = title;
        return;
      }
      showResults(list);
    });
  }

  function showResults(list) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "results");
    app.appendChild(el("h1", "book-title", "Is it one of these?"));
    var wrap = el("div", "book-list");
    list.forEach(function (book) {
      var eligible = book.eligible !== false;
      var card = el(eligible ? "button" : "article", "book-card" + (eligible ? "" : " book-card-short"));
      if (eligible) card.type = "button";
      card.setAttribute("data-work-id", book.work_id || "");
      card.setAttribute("data-eligible", eligible ? "true" : "false");
      card.appendChild(coverEl(book.cover_url));
      var text = el("span", "book-card-text");
      text.appendChild(el("span", "book-name", book.title || "A book"));
      text.appendChild(el("span", "book-author", book.author || "Author not sure"));
      text.appendChild(el("span", "book-pages", pagesLine(book.pages)));
      if (book.year) text.appendChild(el("span", "book-date", String(book.year)));
      if (!eligible) text.appendChild(el("span", "book-short-note", SHORT_NOTE));
      card.appendChild(text);
      if (eligible) card.addEventListener("click", function () { showRetell(book); });
      wrap.appendChild(card);
    });
    app.appendChild(wrap);
    app.appendChild(button("None of these", "book-side", showSearch));
  }

  function showRetell(book) {
    stopPoll();
    app.innerHTML = "";
    app.setAttribute("data-screen", "retell");
    app.setAttribute("data-work-id", book.work_id || "");
    app.appendChild(el("h1", "book-title", book.title || "Your book"));
    app.appendChild(el("p", "book-lead", "Tell the story in 2-3 sentences."));
    var box = el("textarea", "book-story");
    box.maxLength = 1000;
    box.setAttribute("aria-label", "Tell the story in 2-3 sentences");
    var count = el("p", "book-count", "Keep going, a little more! 0 / 60");
    count.setAttribute("data-count", "1");
    var send = button("Send my story", "book-next", function () { sendStory(book, box, send); });
    send.disabled = true;
    box.addEventListener("input", function () {
      var n = box.value.trim().length;
      if (n < 60) count.textContent = "Keep going, a little more! " + n + " / 60";
      else count.textContent = n + " / 1000. Ready!";
      send.disabled = n < 60 || n > 1000;
    });
    app.appendChild(box);
    app.appendChild(count);
    app.appendChild(send);
    app.appendChild(button("Pick another book", "book-side", showSearch));
  }

  function sendStory(book, box, send) {
    if (busy) return;
    var text = box.value.trim();
    if (text.length < 60 || text.length > 1000) return;
    busy = true;
    send.disabled = true;
    window.KidBooks.submit(book.work_id, text).then(function (res) {
      busy = false;
      if (res && res.error === "already_read") {
        showAlready(res);
        return;
      }
      if (!res || res.ok === false || !res.read_id) {
        showProblem(res);
        return;
      }
      remember({
        work_id: book.work_id,
        read_id: res.read_id,
        title: book.title,
        author: book.author,
        status: res.status || "awaiting_quiz",
        attempts: attemptsFor(book.work_id)
      });
      startPolling(res.read_id, book, false);
    });
  }

  function showAlready(res) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "already_read");
    app.appendChild(el("h1", "book-title", "Nice reading"));
    app.appendChild(el("p", "book-note", res && res.message ? String(res.message) : "You already did this book! 🌟"));
    app.appendChild(button("Find another book", "book-next", showSearch));
    app.appendChild(button("My bookshelf", "book-side", showShelf));
  }

  function showWaiting(readId, book, started) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "awaiting_quiz");
    app.setAttribute("data-read-id", readId);
    var face = el("div", "wait-face", botEmoji);
    face.setAttribute("aria-hidden", "true");
    app.appendChild(face);
    app.appendChild(el("h1", "book-title", botName + " is reading"));
    app.appendChild(el("p", "book-note", botName + " is reading your story and making your quiz..."));
    var hint = el("p", "book-lead", "");
    hint.setAttribute("data-wait-hint", "1");
    if (Date.now() - started >= WAIT_HINT_MS) hint.textContent = COME_BACK;
    app.appendChild(hint);
    app.appendChild(button("My bookshelf", "book-side", showShelf));
  }

  function startPolling(readId, book, immediate) {
    stopPoll();
    var gen = pollGen;
    var started = Date.now();
    showWaiting(readId, book, started);
    function tick() {
      if (gen !== pollGen) return;
      window.KidBooks.status(readId).then(function (res) {
        if (gen !== pollGen) return;
        if (!res || res.ok === false) {
          showProblem(res);
          return;
        }
        remember({
          work_id: book.work_id,
          read_id: readId,
          title: book.title,
          author: book.author,
          status: res.status,
          attempts: attemptsFor(book.work_id)
        });
        if (res.status === "quiz_ready") {
          showQuiz(readId, book, res.questions || []);
          return;
        }
        if (res.status === "pending_review") {
          showPending(res);
          return;
        }
        if (res.status === "passed") {
          showPassed(res, false);
          return;
        }
        if (res.status === "failed") {
          showFailed(res, readId, book, false);
          return;
        }
        var hint = document.querySelector("[data-wait-hint]");
        if (app.getAttribute("data-screen") !== "awaiting_quiz") showWaiting(readId, book, started);
        else if (hint && Date.now() - started >= WAIT_HINT_MS) hint.textContent = COME_BACK;
        setTimeout(tick, 5000);
      });
    }
    setTimeout(tick, immediate ? 0 : 5000);
  }

  function showPending(res) {
    stopPoll();
    app.innerHTML = "";
    app.setAttribute("data-screen", "pending_review");
    app.appendChild(el("h1", "book-title", "Almost!"));
    var fallback = botName + " wants a grown-up to check this one. Your stars will come after they say OK! 👍";
    app.appendChild(el("p", "book-note", res && res.message ? String(res.message) : fallback));
    app.appendChild(button("My bookshelf", "book-next", showShelf));
    app.appendChild(button("Find another book", "book-side", showSearch));
  }

  function showQuiz(readId, book, questions) {
    stopPoll();
    if (!questions.length) {
      showAsleep();
      return;
    }
    var index = 0;
    var answers = [];
    function draw() {
      var question = questions[index];
      app.innerHTML = "";
      app.setAttribute("data-screen", "quiz");
      app.setAttribute("data-q", String(index));
      app.appendChild(el("p", "book-kicker", "Question " + (index + 1) + " of " + questions.length));
      app.appendChild(el("h1", "book-title book-q", question.q || ""));
      var hear = button("Hear it", "book-side book-speak", function () {
        var bits = [question.q || ""].concat(question.choices || []);
        speak(bits.join(". "));
      });
      hear.hidden = !voiceFor();
      if (window.speechSynthesis && hear.hidden) {
        window.speechSynthesis.onvoiceschanged = function () { hear.hidden = !voiceFor(); };
      }
      app.appendChild(hear);
      var choices = question.choices || [];
      choices.forEach(function (choice, choiceIndex) {
        var pick = button(choice, "book-choice", function () {
          answers[index] = choiceIndex;
          if (index + 1 >= questions.length) sendAnswers(readId, book, answers.slice());
          else {
            index += 1;
            draw();
          }
        });
        pick.setAttribute("data-choice", String(choiceIndex));
        app.appendChild(pick);
      });
      if (index > 0) {
        app.appendChild(button("Go back", "book-side", function () {
          index -= 1;
          draw();
        }));
      }
    }
    draw();
  }

  function sendAnswers(readId, book, answers) {
    if (busy) return;
    busy = true;
    app.innerHTML = "";
    app.setAttribute("data-screen", "scoring");
    app.appendChild(el("p", "book-lead", "Checking your answers..."));
    window.KidBooks.answer(readId, answers).then(function (res) {
      busy = false;
      if (!res || res.ok === false) {
        showProblem(res);
        return;
      }
      showStars(res.balance);
      if (res.passed) {
        setAttempts(book.work_id, 2);
        remember({ work_id: book.work_id, read_id: readId, title: book.title, author: book.author, status: "passed", attempts: 2 });
        showPassed(res, true);
        return;
      }
      var n = attemptsFor(book.work_id) + 1;
      setAttempts(book.work_id, n);
      remember({ work_id: book.work_id, read_id: readId, title: book.title, author: book.author, status: "failed", attempts: n });
      showFailed(res, readId, book, true);
    });
  }

  function showPassed(res, fresh) {
    stopPoll();
    app.innerHTML = "";
    app.setAttribute("data-screen", "passed");
    app.appendChild(el("div", "wait-face", "🌟"));
    app.appendChild(el("h1", "book-title", fresh ? "You did it!" : "You earned your stars"));
    app.appendChild(el("p", "book-note", fresh ? "+20 stars" : "You earned 20 stars for this book."));
    if (typeof res.score === "number") app.appendChild(el("p", "book-lead", "You got " + res.score + " right."));
    if (typeof res.balance === "number") app.appendChild(el("p", "book-lead", "You have " + res.balance + " stars."));
    app.appendChild(button("My bookshelf", "book-next", showShelf));
    app.appendChild(button("Find another book", "book-side", showSearch));
  }

  function showFailed(res, readId, book, fromAnswer) {
    stopPoll();
    var n = attemptsFor(book.work_id);
    app.innerHTML = "";
    app.setAttribute("data-screen", "failed");
    app.setAttribute("data-attempts", String(n));
    app.appendChild(el("h1", "book-title", "Not quite this time"));
    var line = "That was a good try.";
    if (typeof res.score === "number") line = "You got " + res.score + " right. " + line;
    app.appendChild(el("p", "book-note", line));
    if (n < 2) {
      app.appendChild(el("p", "book-lead", "You can try once more."));
      app.appendChild(button("Try again", "book-next", function () {
        startPolling(readId, book, true);
      }));
    } else {
      app.appendChild(el("p", "book-lead", "You used both tries. Reading it was still wonderful."));
    }
    app.appendChild(button("My bookshelf", "book-side", showShelf));
    if (!fromAnswer) app.appendChild(button("Find another book", "book-side", showSearch));
  }

  function resume(book) {
    var stored = loadReads()[book.work_id] || {};
    var readId = book.read_id || stored.read_id;
    if (!readId) {
      showSearch();
      return;
    }
    var info = {
      work_id: book.work_id,
      title: book.title || stored.title,
      author: book.author || stored.author
    };
    if (book.status === "quiz_ready" || book.status === "awaiting_quiz") {
      startPolling(readId, info, true);
      return;
    }
    if (book.status === "pending_review") {
      showPending(book);
      return;
    }
    if (book.status === "passed") {
      showPassed({ score: book.score }, false);
      return;
    }
    if (book.status === "failed") {
      showFailed({ score: book.score }, readId, info, false);
    }
  }

  function showShelf() {
    stopPoll();
    if (busy) return;
    busy = true;
    app.innerHTML = "";
    app.setAttribute("data-screen", "shelf-wait");
    app.appendChild(el("p", "book-lead", "Opening your bookshelf..."));
    window.KidBooks.list().then(function (res) {
      busy = false;
      if (!res || res.ok === false) {
        showProblem(res);
        return;
      }
      paintShelf(Array.isArray(res.books) ? res.books : []);
    });
  }

  function paintShelf(books) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "shelf");
    app.appendChild(el("h1", "book-title", "My bookshelf"));
    if (!books.length) app.appendChild(el("p", "book-lead", "No books yet. Find one you have read."));
    var list = el("div", "book-list");
    books.forEach(function (book) {
      if (book.work_id && book.read_id) remember(book);
      var card = el("button", "book-card");
      card.type = "button";
      card.setAttribute("data-status", book.status || "");
      card.appendChild(coverEl(book.cover_url));
      var text = el("span", "book-card-text");
      text.appendChild(el("span", "book-name", book.title || "A book"));
      if (book.author) text.appendChild(el("span", "book-author", book.author));
      if (typeof book.pages === "number" && book.pages > 0) text.appendChild(el("span", "book-pages", pagesLine(book.pages)));
      text.appendChild(el("span", "book-status", shelfLabel(book.status)));
      var when = prettyDate(book.date);
      if (when) text.appendChild(el("span", "book-date", when));
      if (typeof book.score === "number") text.appendChild(el("span", "book-date", "Score: " + book.score));
      card.appendChild(text);
      card.addEventListener("click", function () { resume(book); });
      list.appendChild(card);
    });
    app.appendChild(list);
    app.appendChild(button("Find a book", "book-next", showSearch));
  }

  showSearch();
})();
