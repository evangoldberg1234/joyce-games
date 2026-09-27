/* Star ledger. The server is the authority. This file only displays a
   balance and sends earn/spend calls. Mock mode (?starsmock=1) keeps an
   in-memory balance that starts at 20, for screenshots and local trials.
   Read kid id and functionsUrl from window.KIDS_CHAT. */
(function () {
  var HINT_COST = 5;
  var GAME_COST = 20;
  var mockBalance = null;
  var lastSeen = null;
  var listeners = [];

  function config() {
    var cfg = window.KIDS_CHAT || {};
    return {
      kid: cfg.kid || "",
      kidName: cfg.kidName || "Friend",
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

  function cacheKey() {
    return "kidsStars.display." + (config().kid || "kid");
  }

  function readCache() {
    try {
      var n = Number(sessionStorage.getItem(cacheKey()));
      return isNaN(n) ? null : n;
    } catch (err) {
      return null;
    }
  }

  function writeCache(n) {
    lastSeen = n;
    try { sessionStorage.setItem(cacheKey(), String(n)); } catch (err) { /* display only */ }
  }

  function emit(res) {
    if (res && res.ok && typeof res.balance === "number") writeCache(res.balance);
    listeners.forEach(function (fn) {
      try { fn(res); } catch (err) { /* a listener must not break the ledger */ }
    });
    paint(res);
    return res;
  }

  function paint(res) {
    var el = document.getElementById("starbar");
    if (!el) return;
    if (!res) {
      el.textContent = "★";
      return;
    }
    if (res.ok) {
      el.textContent = "★ " + res.balance;
      return;
    }
    if (res.error === "locked") {
      el.textContent = "Ask a grown-up to unlock stars";
      return;
    }
    el.textContent = "Stars are waking up...";
  }

  function mockResult(body) {
    if (mockBalance == null) mockBalance = 20;
    if (body.action === "balance") {
      return { ok: true, kid: config().kid, balance: mockBalance, mock: true };
    }
    if (body.action === "earn") {
      mockBalance += 1;
      return { ok: true, balance: mockBalance, earned: 1, mock: true };
    }
    if (body.action === "spend") {
      var cost = body.reason === "game" ? GAME_COST : HINT_COST;
      if (mockBalance < cost) {
        return { ok: false, error: "not_enough_stars", balance: mockBalance, cost: cost, mock: true };
      }
      mockBalance -= cost;
      return { ok: true, balance: mockBalance, cost: cost, mock: true };
    }
    return { ok: false, error: "asleep", mock: true };
  }

  function call(body) {
    if (mockOn()) return Promise.resolve(emit(mockResult(body)));
    var cfg = config();
    var auth = token();
    if (!auth || !cfg.functionsUrl) return Promise.resolve(emit({ ok: false, error: "locked" }));
    body.token = auth;
    return fetch(cfg.functionsUrl + "/kid-stars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 404) return { ok: false, error: "asleep" };
        if (res.status === 401 || data.error === "locked") return { ok: false, error: "locked", balance: data.balance };
        if (res.status === 402) return { ok: false, error: "not_enough_stars", balance: data.balance, cost: data.cost || HINT_COST };
        if (res.status === 429) return { ok: false, error: "slow_down", balance: data.balance };
        if (!res.ok && !data.error) return { ok: false, error: "asleep" };
        return data;
      });
    }).catch(function () {
      return { ok: false, error: "asleep" };
    }).then(emit);
  }

  function messageFor(res) {
    if (!res) return "";
    if (res.ok) return "";
    if (res.error === "locked") return "Ask a grown-up to unlock stars. Open the chat bubble and enter the family code.";
    if (res.error === "not_enough_stars") {
      var have = typeof res.balance === "number" ? res.balance : 0;
      return "Not enough stars. You have " + have + ".";
    }
    if (res.error === "slow_down") return "Slow down a moment, then try again.";
    return "Stars are waking up...";
  }

  window.KidsStars = {
    HINT_COST: HINT_COST,
    GAME_COST: GAME_COST,
    mockOn: mockOn,
    lastBalance: function () {
      return lastSeen != null ? lastSeen : readCache();
    },
    onChange: function (fn) { listeners.push(fn); },
    messageFor: messageFor,
    balance: function () { return call({ action: "balance" }); },
    earn: function (opts) {
      opts = opts || {};
      return call({ action: "earn", subject: opts.subject || "", level: opts.level || 1, qid: opts.qid || "" });
    },
    spend: function (opts) {
      opts = opts || {};
      return call({ action: "spend", reason: opts.reason || "hint", item: opts.item || "" });
    },
    paint: paint
  };

  if (document.getElementById("starbar")) {
    var cached = readCache();
    if (cached != null && (mockOn() || token())) {
      document.getElementById("starbar").textContent = "★ " + cached;
    }
    window.KidsStars.balance();
  }
})();
