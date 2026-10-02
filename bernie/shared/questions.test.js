/* Bernie's question generator: the answer is always a choice,
   and rock counts stay between 1 and 10. */
var assert = require("assert");
var questions = require("./questions.js");

function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function check(item) {
  assert.ok(item.say, "question needs words to speak");
  assert.strictEqual(item.choices.length, 3, item.kind + " needs 3 choices");
  var ids = item.choices.map(function (choice) { return choice.id; });
  var seen = {};
  ids.forEach(function (id) {
    assert.ok(!seen[id], item.kind + " repeated " + id);
    seen[id] = true;
    assert.strictEqual(typeof id, "string");
  });
  assert.ok(seen[item.answer], item.kind + " answer " + item.answer + " not in choices");
  if (item.kind === "count") {
    assert.ok(item.rocks >= 1 && item.rocks <= 10, "rocks " + item.rocks);
    assert.strictEqual(item.rocks, Math.round(item.rocks));
    assert.strictEqual(item.answer, String(item.rocks));
    ids.forEach(function (id) {
      var n = Number(id);
      assert.ok(n >= 1 && n <= 10, "count choice " + id);
      assert.strictEqual(String(n), id);
    });
  }
}

var rng = mulberry32(4);
var i;
for (i = 0; i < 240; i++) check(questions.makeQuestion(rng));

["letter", "sound", "match", "count"].forEach(function (kind) {
  var n;
  for (n = 0; n < 40; n++) {
    var item = questions.makeQuestion(rng, kind);
    assert.strictEqual(item.kind, kind);
    check(item);
  }
});

var counted = questions.makeQuestion(function () { return 0; }, "count");
assert.strictEqual(counted.rocks, 1);
assert.strictEqual(counted.answer, "1");

console.log("Bernie question checks passed.");
