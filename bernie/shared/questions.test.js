/* Bernie's question generator: picture prompts name the thing to find,
   rock counts stay in 1-10, and the right choice is not stuck in one slot. */
var assert = require("assert");
var questions = require("./questions.js");

var BANNED = ["knife", "giraffe", "gnome", "phone", "cereal", "ship", "chair"];
var TRICKY = /^(kn|wr|gn|ph|sh|ch)/;

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
  assert.ok(item.choices.length >= 3 && item.choices.length <= 4, item.kind + " choice count");
  var ids = item.choices.map(function (choice) { return choice.id; });
  var seen = {};
  ids.forEach(function (id) {
    assert.ok(!seen[id], item.kind + " repeated " + id);
    seen[id] = true;
  });
  assert.ok(seen[item.answer], item.kind + " answer " + item.answer + " not in choices");
  if (item.kind === "picture") {
    assert.strictEqual(item.answer, item.word);
    assert.strictEqual(item.say, "Find the " + item.word + "!");
    assert.ok(item.say.indexOf("letter") === -1, item.say);
    assert.ok(BANNED.indexOf(item.word.toLowerCase()) === -1, item.word);
    assert.ok(!TRICKY.test(item.word.toLowerCase()), item.word);
    assert.ok(item.emoji);
    var hit = item.choices.filter(function (choice) { return choice.id === item.answer; })[0];
    assert.strictEqual(hit.label, item.emoji);
    item.choices.forEach(function (choice) {
      assert.notStrictEqual(choice.label, choice.id);
      assert.ok(!/^[A-Z]$/.test(choice.id), choice.id);
    });
  }
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

assert.ok(questions.words.length >= 20 && questions.words.length <= 30, "word bank size");
questions.words.forEach(function (item) {
  assert.ok(BANNED.indexOf(item.word) === -1, item.word);
  assert.ok(!TRICKY.test(item.word), item.word);
  assert.strictEqual(item.word.charAt(0), item.word.charAt(0).toLowerCase());
});
BANNED.forEach(function (word) {
  questions.words.forEach(function (item) {
    assert.notStrictEqual(item.word, word);
  });
});

var rng = mulberry32(4);
var i;
var slots = [0, 0, 0];
var prevKey = "";
for (i = 0; i < 240; i++) {
  var item = questions.makeQuestion(rng);
  check(item);
  var key = item.kind + ":" + (item.kind === "picture" ? item.word : item.rocks);
  assert.notStrictEqual(key, prevKey, "question repeated back to back");
  prevKey = key;
  var at = item.choices.findIndex(function (choice) { return choice.id === item.answer; });
  assert.ok(at >= 0 && at < item.choices.length);
  slots[at] += 1;
}
slots.forEach(function (count, index) {
  assert.ok(count > 0, "correct answer never landed in position " + index);
});

["picture", "count"].forEach(function (kind) {
  var n;
  for (n = 0; n < 40; n++) {
    var next = questions.makeQuestion(rng, kind);
    assert.strictEqual(next.kind, kind);
    check(next);
    var nextKey = next.kind + ":" + (next.kind === "picture" ? next.word : next.rocks);
    assert.notStrictEqual(nextKey, prevKey, "question repeated back to back");
    prevKey = nextKey;
  }
});

var counted = questions.makeQuestion(function () { return 0; }, "count");
assert.strictEqual(counted.rocks, 1);
assert.strictEqual(counted.answer, "1");

console.log("Bernie question checks passed.");
