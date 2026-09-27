/* Book Club calls. The server is the authority. Mock mode (?starsmock=1)
   pretends lookup, submit, status, answer, and list, with no network.
   Read kid and functionsUrl from window.KIDS_CHAT. */
(function () {
  var MIN_PAGES = 50;

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

  function choices(correct, wrongs) {
    return [correct].concat(wrongs);
  }

  function charlotteQuiz() {
    return [
      { q: "Who is the pig in this story?", choices: choices("Wilbur", ["Charlotte", "Fern", "Templeton"]) },
      { q: "Who writes words in a web?", choices: choices("Charlotte", ["Wilbur", "Fern", "Avery"]) },
      { q: "Who is the girl who loves Wilbur?", choices: choices("Fern", ["Charlotte", "Mrs. Arable", "The goose"]) },
      { q: "What animal is Charlotte?", choices: choices("A spider", ["A pig", "A rat", "A sheep"]) },
      { q: "Who wrote this book?", choices: choices("E. B. White", ["Roald Dahl", "Arnold Lobel", "Beatrix Potter"]) }
    ];
  }

  function boxcarQuiz(round) {
    var last = round > 1 ? "What is the children's last name?" : "The children in this book are called the Boxcar what?";
    var lastChoices = round > 1
      ? choices("Alden", ["Brown", "Smith", "White"])
      : choices("Children", ["Bears", "Pigs", "Ducks"]);
    return [
      { q: "Where do the children live for a while?", choices: choices("In a boxcar", ["In a castle", "On a boat", "In a tent"]) },
      { q: "Who is the youngest child?", choices: choices("Benny", ["Henry", "Jessie", "Violet"]) },
      { q: "How many children are in the family?", choices: choices("Four", ["Two", "Six", "Ten"]) },
      { q: "Who is the oldest boy?", choices: choices("Henry", ["Benny", "Violet", "Watch"]) },
      { q: last, choices: lastChoices }
    ];
  }

  function candidates() {
    return [
      { work_id: "cw", title: "Charlotte's Web", author: "E. B. White", pages: 184, cover_url: cover("#2b86f0", "C"), year: 1952, eligible: true },
      { work_id: "frog", title: "Frog and Toad Are Friends", author: "Arnold Lobel", pages: 64, cover_url: "", year: 1970, eligible: true },
      { work_id: "zoo", title: "Dear Zoo", author: "Rod Campbell", pages: 18, cover_url: cover("#e07a3d", "Z"), year: 1982, eligible: false },
      { work_id: "box", title: "The Boxcar Children", author: "Gertrude Chandler Warner", pages: 192, cover_url: cover("#1f8a4c", "B"), year: 1924, eligible: true },
      { work_id: "matilda", title: "Matilda", author: "Roald Dahl", pages: 240, cover_url: cover("#7a4eab", "M"), year: 1988, eligible: true }
    ];
  }

  var reads = {
    "shelf-quiz": { kind: "fail", polls: 1, fails: 0, round: 1, work_id: "box" }
  };
  var seq = 1;

  function mockResult(body) {
    var name = config().botName;
    if (body.action === "lookup") return { ok: true, candidates: candidates(), mock: true };
    if (body.action === "list") {
      return {
        ok: true,
        books: [
          { work_id: "cw", read_id: "done-cw", title: "Charlotte's Web", author: "E. B. White", pages: 184, cover_url: cover("#2b86f0", "C"), status: "passed", score: 5, date: "2026-09-20" },
          { work_id: "frog", read_id: "rev-frog", title: "Frog and Toad Are Friends", author: "Arnold Lobel", pages: 64, cover_url: "", status: "pending_review", score: null, date: "2026-09-26" },
          { work_id: "box", read_id: "shelf-quiz", title: "The Boxcar Children", author: "Gertrude Chandler Warner", pages: 192, cover_url: cover("#1f8a4c", "B"), status: "quiz_ready", score: null, date: "2026-09-27" },
          { work_id: "await", read_id: "await-1", title: "Stuart Little", author: "E. B. White", pages: 132, cover_url: cover("#d4a017", "S"), status: "awaiting_quiz", score: null, date: "2026-09-27" }
        ],
        mock: true
      };
    }
    if (body.action === "submit") {
      if (body.work_id === "matilda") {
        return { ok: false, error: "already_read", message: "You already did this book! 🌟", mock: true };
      }
      var kind = "pass";
      if (body.work_id === "box") kind = "fail";
      if (body.work_id === "frog") kind = "review";
      var readId = "r" + (seq++);
      reads[readId] = { kind: kind, polls: 0, fails: 0, round: 1, work_id: body.work_id };
      return { ok: true, read_id: readId, status: "awaiting_quiz", mock: true };
    }
    if (body.action === "status") {
      if (body.read_id === "await-1") return { ok: true, read_id: body.read_id, status: "awaiting_quiz", mock: true };
      if (body.read_id === "rev-frog") {
        return {
          ok: true,
          read_id: body.read_id,
          status: "pending_review",
          message: name + " wants a grown-up to check this one. Your stars will come after they say OK! 👍",
          mock: true
        };
      }
      var rec = reads[body.read_id];
      if (!rec) return { ok: false, error: "asleep", mock: true };
      rec.polls += 1;
      if (rec.kind === "review") {
        return {
          ok: true,
          read_id: body.read_id,
          status: "pending_review",
          message: name + " wants a grown-up to check this one. Your stars will come after they say OK! 👍",
          mock: true
        };
      }
      var questions = rec.work_id === "box" || rec.kind === "fail" ? boxcarQuiz(rec.round || 1) : charlotteQuiz();
      return { ok: true, read_id: body.read_id, status: "quiz_ready", questions: questions, mock: true };
    }
    if (body.action === "answer") {
      var quiz = reads[body.read_id] || { kind: "pass", fails: 0, round: 1 };
      quiz.fails = (quiz.fails || 0) + 1;
      var answers = body.answers || [];
      var allFirst = answers.length === 5 && answers.every(function (n) { return n === 0; });
      if (quiz.kind === "fail" && quiz.fails === 1) {
        quiz.round = 2;
        quiz.polls = 0;
        return { ok: true, score: 2, passed: false, balance: 20, mock: true };
      }
      if (allFirst) return { ok: true, score: 5, passed: true, balance: 40, mock: true };
      return { ok: true, score: 2, passed: false, balance: 20, mock: true };
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
        data = data || {};
        if (res.status === 401) return { ok: false, error: "locked" };
        if (res.status === 404) return { ok: false, error: "asleep" };
        if (res.status === 409) return { ok: false, error: data.error || "already_read", message: data.message };
        if (!res.ok && !data.error) return { ok: false, error: "asleep" };
        return data;
      });
    }).catch(function () {
      return { ok: false, error: "asleep" };
    });
  }

  window.KidBooks = {
    MIN_PAGES: MIN_PAGES,
    mockOn: mockOn,
    lookup: function (title, author) {
      var body = { action: "lookup", title: String(title || "") };
      if (author) body.author = String(author);
      return post(body);
    },
    submit: function (workId, retelling) {
      return post({ action: "submit", work_id: String(workId || ""), retelling: String(retelling || "") });
    },
    status: function (readId) {
      return post({ action: "status", read_id: String(readId || "") });
    },
    answer: function (readId, answers) {
      return post({ action: "answer", read_id: String(readId || ""), answers: answers || [] });
    },
    list: function () {
      return post({ action: "list" });
    }
  };
})();
