/* Book Club calls. The server is the authority. Mock mode (?starsmock=1)
   returns a few pretend books, including one short book, and does not
   use the network. Read kid and functionsUrl from window.KIDS_CHAT. */
(function () {
  function config() {
    var cfg = window.KIDS_CHAT || {};
    return {
      kid: cfg.kid || "",
      botName: cfg.botName || "your guide",
      functionsUrl: String(cfg.functionsUrl || "").replace(/\/+$/, "")
    };
  }

  function mockOn() {
    try {
      return /(?:^|[?&])starsmock=1(?:&|$)/.test(window.location.search);
    } catch (err) {
      return false;
    }
  }

  function token() {
    var kid = config().kid;
    if (!kid) return "";
    try {
      return localStorage.getItem("kidsChat." + kid + ".token") || "";
    } catch (err) {
      return "";
    }
  }

  function cover(color, letter) {
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='320'>" +
      "<rect width='240' height='320' rx='18' fill='" + color + "'/>" +
      "<text x='120' y='186' text-anchor='middle' font-size='120' font-family='Georgia, serif' fill='white'>" +
      letter + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function botName() {
    return config().botName;
  }

  function mockBooks() {
    return [
      {
        work_id: "cw",
        title: "Charlotte's Web",
        author: "E. B. White",
        cover_url: cover("#2b86f0", "C"),
        pages: 184,
        pages_source: "mock"
      },
      {
        work_id: "frog",
        title: "Frog and Toad Are Friends",
        author: "Arnold Lobel",
        cover_url: "",
        pages: 64,
        pages_source: "mock"
      },
      {
        work_id: "zoo",
        title: "Dear Zoo",
        author: "Rod Campbell",
        cover_url: cover("#e07a3d", "Z"),
        pages: 18,
        pages_source: "mock"
      },
      {
        work_id: "box",
        title: "The Boxcar Children",
        author: "Gertrude Chandler Warner",
        cover_url: cover("#1f8a4c", "B"),
        pages: null,
        pages_source: ""
      },
      {
        work_id: "matilda",
        title: "Matilda",
        author: "Roald Dahl",
        cover_url: cover("#7a4eab", "M"),
        pages: 240,
        pages_source: "mock"
      }
    ];
  }

  function mockShelf() {
    return [
      {
        title: "Charlotte's Web",
        author: "E. B. White",
        pages: 184,
        status: "earned",
        date: "2026-09-20",
        score: 5,
        cover_url: cover("#2b86f0", "C")
      },
      {
        title: "Frog and Toad Are Friends",
        author: "Arnold Lobel",
        pages: 64,
        status: "waiting",
        date: "2026-09-26",
        score: null,
        cover_url: ""
      },
      {
        title: "Matilda",
        author: "Roald Dahl",
        pages: 240,
        status: "check",
        date: "2026-09-27",
        score: null,
        cover_url: cover("#7a4eab", "M")
      },
      {
        title: "Dear Zoo",
        author: "Rod Campbell",
        pages: 18,
        status: "too_short",
        date: "2026-09-18",
        score: null,
        cover_url: cover("#e07a3d", "Z")
      }
    ];
  }

  function mockResult(body) {
    var name = botName();
    if (body.action === "lookup") {
      return { ok: true, results: mockBooks(), mock: true };
    }
    if (body.action === "start") {
      var id = body.work_id;
      if (id === "zoo") {
        return {
          ok: true,
          status: "too_short",
          pages: 18,
          min_pages: 50,
          book_id: "zoo",
          message: "This book is shorter than 50 pages, so it doesn't earn stars, but reading is always awesome!",
          mock: true
        };
      }
      if (id === "matilda") {
        return {
          ok: true,
          status: "already_paid",
          pages: 240,
          min_pages: 50,
          book_id: "matilda",
          message: "You already got your stars for this book! 🌟",
          mock: true
        };
      }
      if (id === "box") {
        return {
          ok: true,
          status: "pages_unknown",
          pages: null,
          min_pages: 50,
          book_id: "box",
          message: "We can't see the page count yet. Ask a grown-up if this is a long book.",
          mock: true
        };
      }
      if (id === "frog") {
        return {
          ok: true,
          status: "in_progress",
          pages: 64,
          min_pages: 50,
          book_id: "frog",
          message: "We're still checking this book. You can tell " + name + " about it in a little while.",
          mock: true
        };
      }
      return {
        ok: true,
        status: "check",
        pages: 184,
        min_pages: 50,
        book_id: "cw",
        message: "Great reading! Now tell " + name + " about your book in the chat 💬",
        mock: true
      };
    }
    if (body.action === "list") {
      return { ok: true, books: mockShelf(), mock: true };
    }
    return { ok: false, error: "asleep", mock: true };
  }

  function post(body) {
    if (mockOn()) return Promise.resolve(mockResult(body || {}));
    var cfg = config();
    var auth = token();
    if (!auth || !cfg.functionsUrl) return Promise.resolve({ ok: false, error: "locked" });
    var payload = {};
    Object.keys(body || {}).forEach(function (key) { payload[key] = body[key]; });
    payload.token = auth;
    payload.kid = cfg.kid;
    return fetch(cfg.functionsUrl + "/kid-books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401) return { ok: false, error: "locked" };
        if (res.status === 404) return { ok: false, error: "asleep" };
        if (!res.ok && !(data && data.error)) return { ok: false, error: "asleep" };
        return data || { ok: false, error: "asleep" };
      });
    }).catch(function () {
      return { ok: false, error: "asleep" };
    });
  }

  window.KidBooks = {
    mockOn: mockOn,
    lookup: function (title, author) {
      return post({ action: "lookup", title: String(title || ""), author: String(author || "") });
    },
    start: function (workId) {
      return post({ action: "start", work_id: String(workId || "") });
    },
    list: function () {
      return post({ action: "list" });
    }
  };
})();
