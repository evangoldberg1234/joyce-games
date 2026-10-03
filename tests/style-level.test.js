/* Style register: star awards stay identical, and Young never
   lowers a question below the adaptive level. */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var store = {};
global.localStorage = {
  getItem: function (key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
  setItem: function (key, value) { store[key] = String(value); },
  removeItem: function (key) { delete store[key]; }
};

var style = require("../js/style-level.js");
require("../brain-break/schedule.js");
require("../brain-break/vocab.js");
require("../brain-break/parsha.js");
var engine = require("../brain-break/engine.js");

var modes = ["young", "older", "advanced"];

modes.forEach(function (mode) {
  store["jw-style"] = mode;
  var reward = style.practiceReward(mode);
  assert.strictEqual(reward.stars, 1, mode);
  assert.strictEqual(reward.note, "1 star earned", mode);
});

var notes = modes.map(function (mode) {
  store["jw-style"] = mode;
  return style.practiceReward().note + ":" + style.practiceReward().stars;
});
assert.strictEqual(notes[0], notes[1]);
assert.strictEqual(notes[1], notes[2]);

delete store["jw-style"];
assert.strictEqual(style.get(), "advanced");
assert.strictEqual(style.boost(), 2);
assert.strictEqual(style.practiceReward().stars, 1);

for (var n = 1; n <= 12; n++) {
  assert.strictEqual(style.questionLevel(n, "young", 12), n, "young lowered " + n);
  assert.strictEqual(style.questionLevel(n, "older", 12), Math.min(12, n + 1));
  assert.strictEqual(style.questionLevel(n, "advanced", 12), Math.min(12, n + 2));
  ["", "nope", "baby"].forEach(function (mode) {
    var asked = style.questionLevel(n, mode, 12);
    assert.ok(asked >= n, mode + " lowered " + n + " to " + asked);
  });
  assert.ok(style.questionLevel(n, "young", 3) >= n);
}

[1, 4, 8, 11].forEach(function (stored) {
  [1, 3, 7].forEach(function (gameLevel) {
    var today = engine.effectiveLevel(stored, "math", gameLevel);
    var young = engine.effectiveLevel(stored, "math", gameLevel, style.boost("young"));
    var older = engine.effectiveLevel(stored, "math", gameLevel, style.boost("older"));
    var advanced = engine.effectiveLevel(stored, "math", gameLevel, style.boost("advanced"));
    assert.strictEqual(young, today, "young moved the brain-break level");
    assert.ok(young >= Math.min(stored, engine.MAX.math));
    assert.ok(older >= young);
    assert.ok(advanced >= older);
  });
});

assert.strictEqual(style.questionLevel(6, "young", 4), 6);

var practice = fs.readFileSync(path.join(__dirname, "../practice/practice.js"), "utf8");
assert.ok(practice.indexOf("questionLevel") !== -1);
assert.ok(practice.indexOf("practiceReward") !== -1);
assert.ok(practice.indexOf("level: askedLevel") !== -1);
assert.strictEqual(practice.indexOf("stars:"), -1);

var levelTest = fs.readFileSync(path.join(__dirname, "../level-test/level-test.js"), "utf8");
assert.strictEqual(levelTest.indexOf("questionLevel"), -1);
assert.strictEqual(levelTest.indexOf("styleBoost"), -1);

var settings = fs.readFileSync(path.join(__dirname, "../settings.js"), "utf8");
assert.ok(/newGame:\s*20/.test(settings));
assert.ok(/animalPuzzleHint:\s*5/.test(settings));
assert.ok(/practice:\s*1/.test(settings));
assert.ok(/perSheet:\s*10/.test(settings));
assert.ok(/perDay:\s*20/.test(settings));

var books = fs.readFileSync(path.join(__dirname, "../books/books.js"), "utf8");
assert.ok(books.indexOf("|| 50") !== -1);

var styleSrc = fs.readFileSync(path.join(__dirname, "../js/style-level.js"), "utf8");
assert.ok(styleSrc.indexOf('KEY = "jw-style"') !== -1 || styleSrc.indexOf("KEY = \"jw-style\"") !== -1);
assert.ok(!/starPrices\s*=/.test(styleSrc));
assert.ok(style.isBerniePath("/bernie/"));
assert.ok(style.isBerniePath("/bernie/videos/"));
assert.ok(!style.isBerniePath("/practice/"));
assert.ok(!style.isBerniePath("/"));

store["jw-style"] = "young";
assert.strictEqual(style.t("home.price", "A new game costs {price} stars.", { price: 20 }), "A new game costs 20 stars.");
store["jw-style"] = "advanced";
assert.strictEqual(style.t("home.price", "A new game costs {price} stars.", { price: 20 }), "A new game costs 20 stars.");
assert.ok(style.t("home.hello", "Welcome back, Joyce.").indexOf("Yay") === -1);
assert.ok(style.t("bb.yes", "Yes!").indexOf("!!") === -1);

console.log("Style level checks passed.");
