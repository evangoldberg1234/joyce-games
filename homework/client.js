/* Homework photo check. Posts through KidsStars.postJson so the device
   token, renewed token, and error mapping match the star ledger.
   ?starsmock=1 simulates a reply. ?hwmock=checked|retake|duplicate|not_homework|cap
   picks one. With no hwmock, mock replies cycle through those screens. */
(function () {
  var ORDER = ["checked", "retake", "duplicate", "not_homework", "cap"];
  var MOCK_WAIT = 900;

  function mockOn() {
    if (window.KidsStars && KidsStars.mockOn) return KidsStars.mockOn();
    try {
      return /(?:^|[?&])starsmock=1(?:&|$)/.test(window.location.search);
    } catch (err) {
      return false;
    }
  }

  function hwMock() {
    try {
      var match = /(?:^|[?&])hwmock=([a-z_]+)/.exec(window.location.search || "");
      return match ? match[1] : "";
    } catch (err) {
      return "";
    }
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function nextKind() {
    var forced = hwMock();
    if (ORDER.indexOf(forced) !== -1) return forced;
    var step = 0;
    try { step = Number(sessionStorage.getItem("kidsHomework.mockStep") || "0"); } catch (err) { step = 0; }
    if (!(step >= 0)) step = 0;
    var kind = ORDER[step % ORDER.length];
    try { sessionStorage.setItem("kidsHomework.mockStep", String(step + 1)); } catch (err2) { /* keep going */ }
    return kind;
  }

  function problems(wrongFrom) {
    var list = [];
    var n;
    for (n = 1; n <= 10; n += 1) {
      if (n >= wrongFrom) {
        list.push({
          n: n,
          correct: false,
          hint: n === 8 ? "Look at the sign between the numbers."
            : n === 9 ? "Count the groups one more time."
            : "Check which number is bigger."
        });
      } else {
        list.push({ n: n, correct: true });
      }
    }
    return list;
  }

  function mockBody(body) {
    var kind = nextKind();
    if (kind === "retake") return { ok: true, status: "retake", reason: "blurry", mock: true };
    if (kind === "duplicate") return { ok: true, status: "duplicate", mock: true };
    if (kind === "not_homework") return { ok: true, status: "not_homework", mock: true };
    if (kind === "cap") {
      return {
        ok: false,
        error: "daily_cap",
        status: "checked",
        sheet_id: "sheet-cap",
        problems: [
          { n: 1, correct: true },
          { n: 2, correct: true },
          { n: 3, correct: false, hint: "Read the question one more time." }
        ],
        stars_earned: 0,
        sheet_stars_total: 10,
        sheet_cap: 10,
        daily_remaining: 0,
        balance: 40,
        mock: true
      };
    }
    if (body && body.sheet_id) {
      return {
        ok: true,
        status: "checked",
        sheet_id: body.sheet_id,
        problems: problems(10),
        stars_earned: 2,
        sheet_stars_total: 9,
        sheet_cap: 10,
        daily_remaining: 11,
        balance: 29,
        mock: true
      };
    }
    return {
      ok: true,
      status: "checked",
      sheet_id: "sheet-mock-1",
      problems: problems(8),
      stars_earned: 7,
      sheet_stars_total: 7,
      sheet_cap: 10,
      daily_remaining: 13,
      balance: 27,
      mock: true
    };
  }

  function send(body) {
    if (!window.KidsStars || !KidsStars.postJson) {
      return Promise.resolve({ ok: false, error: "asleep" });
    }
    return KidsStars.postJson("/kid-homework", body).then(function (res) {
      if (!res || res.error !== "slow_down") return res;
      var seconds = Number(res.retry_after);
      if (!(seconds >= 0)) seconds = 2;
      return wait(seconds * 1000).then(function () {
        return KidsStars.postJson("/kid-homework", body);
      });
    });
  }

  window.HomeworkCheck = {
    mockOn: mockOn,
    check: function (opts) {
      opts = opts || {};
      var body = { image: String(opts.image || "") };
      if (opts.sheetId) body.sheet_id = String(opts.sheetId);
      if (mockOn()) return wait(MOCK_WAIT).then(function () { return mockBody(body); });
      return send(body);
    }
  };
})();
