/* Book Club screens. She finds a book, then talks about it in the chat.
   There is no quiz on this page. Copy this folder with client.js. */
(function () {
  var app = document.getElementById("app");
  var cfg = window.KIDS_CHAT || {};
  var botName = cfg.botName || "your guide";
  var busy = false;

  var STATUS = {
    earned: "Earned 20 ⭐",
    paid: "Earned 20 ⭐",
    already_paid: "Earned 20 ⭐",
    waiting: "Waiting for a grown-up",
    pending: "Waiting for a grown-up",
    review: "Waiting for a grown-up",
    check: "Still checking",
    checking: "Still checking",
    in_progress: "Still checking",
    too_short: "Too short",
    pages_unknown: "Still checking"
  };

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

  function openChat() {
    var fab = document.querySelector(".kc-fab");
    if (fab) fab.click();
  }

  function pagesLine(pages) {
    if (typeof pages === "number" && pages > 0) return "about " + pages + " pages";
    return "pages not sure yet";
  }

  function prettyDate(iso) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!match) return "";
    var month = MONTHS[Number(match[2]) - 1];
    if (!month) return "";
    return month + " " + Number(match[3]);
  }

  function friendlyStatus(status) {
    var key = String(status || "");
    return STATUS[key] || "Still checking";
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

  function showLocked() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "locked");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-note", "Ask a grown-up to unlock. Open the chat bubble and enter the family code."));
    app.appendChild(button("Open the chat", "book-next", openChat));
    app.appendChild(button("Try again", "book-side", showSearch));
  }

  function showAsleep() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "asleep");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-note", "Book Club is waking up..."));
    app.appendChild(button("Try again", "book-next", showSearch));
  }

  function showProblem(res) {
    if (res && res.error === "locked") showLocked();
    else showAsleep();
  }

  function showSearch() {
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
      var results = Array.isArray(res.results) ? res.results.slice(0, 5) : [];
      if (!results.length) {
        showSearch();
        var again = document.querySelector("[data-note]");
        if (again) again.textContent = "No book with that name. Try again.";
        var input = document.getElementById("book-title-input");
        if (input) input.value = title;
        return;
      }
      showResults(results);
    });
  }

  function showResults(results) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "results");
    app.appendChild(el("h1", "book-title", "Is it one of these?"));
    var list = el("div", "book-list");
    results.forEach(function (book) {
      var card = el("button", "book-card");
      card.type = "button";
      card.setAttribute("data-work-id", book.work_id || "");
      card.appendChild(coverEl(book.cover_url));
      var text = el("span", "book-card-text");
      text.appendChild(el("span", "book-name", book.title || "A book"));
      text.appendChild(el("span", "book-author", book.author || "Author not sure"));
      text.appendChild(el("span", "book-pages", pagesLine(book.pages)));
      card.appendChild(text);
      card.addEventListener("click", function () { choose(book); });
      list.appendChild(card);
    });
    app.appendChild(list);
    app.appendChild(button("None of these", "book-side", showSearch));
  }

  function choose(book) {
    if (busy) return;
    busy = true;
    app.innerHTML = "";
    app.setAttribute("data-screen", "wait");
    app.appendChild(el("p", "book-lead", "One moment..."));
    window.KidBooks.start(book.work_id).then(function (res) {
      busy = false;
      if (!res || res.ok === false) {
        showProblem(res);
        return;
      }
      showStatus(res, book);
    });
  }

  function fallbackMessage(res) {
    var status = res.status;
    if (status === "check") return "Great reading! Now tell " + botName + " about your book in the chat 💬";
    if (status === "too_short") {
      var min = res.min_pages || 50;
      return "This book is shorter than " + min + " pages, so it doesn't earn stars, but reading is always awesome!";
    }
    if (status === "already_paid") return "You already got your stars for this book! 🌟";
    if (status === "pages_unknown") return "We don't know how many pages yet.";
    if (status === "in_progress") return "We're still checking this book.";
    return "Try another book.";
  }

  function showStatus(res, book) {
    app.innerHTML = "";
    app.setAttribute("data-screen", res.status || "status");
    app.appendChild(el("h1", "book-title", book && book.title ? book.title : "Your book"));
    var message = res.message ? String(res.message) : fallbackMessage(res);
    app.appendChild(el("p", "book-note", message));
    if (res.status === "check") {
      app.appendChild(button("Tell " + botName + " in the chat", "book-next", openChat));
    }
    app.appendChild(button("Find another book", "book-side", showSearch));
    app.appendChild(button("My bookshelf", "book-side", showShelf));
  }

  function showShelf() {
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
    if (!books.length) {
      app.appendChild(el("p", "book-lead", "No books yet. Find one you have read."));
    }
    var list = el("div", "book-list");
    books.forEach(function (book) {
      var card = el("article", "book-card book-card-static");
      card.setAttribute("data-status", book.status || "");
      card.appendChild(coverEl(book.cover_url));
      var text = el("span", "book-card-text");
      text.appendChild(el("span", "book-name", book.title || "A book"));
      text.appendChild(el("span", "book-author", book.author || ""));
      if (typeof book.pages === "number" && book.pages > 0) {
        text.appendChild(el("span", "book-pages", pagesLine(book.pages)));
      }
      text.appendChild(el("span", "book-status", friendlyStatus(book.status)));
      var when = prettyDate(book.date);
      if (when) text.appendChild(el("span", "book-date", when));
      if (typeof book.score === "number") text.appendChild(el("span", "book-date", "Score: " + book.score));
      card.appendChild(text);
      list.appendChild(card);
    });
    app.appendChild(list);
    app.appendChild(button("Find a book", "book-next", showSearch));
  }

  showSearch();
})();
