/* Six loader parts, in build order. The right photo is not stuck in one slot,
   and the same three photos are not offered twice in a row. */
var assert = require("assert");
var questions = require("./questions.js");

var ORDER = ["rear-wheel", "front-wheel", "engine", "cab", "arms", "bucket"];

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

function check(round) {
  assert.strictEqual(round.choices.length, 3);
  assert.strictEqual(round.say, "Find the " + round.name + "!");
  assert.ok(round.say.indexOf("letter") === -1, round.say);
  assert.notStrictEqual(round.say, "How many rocks?");
  var ids = round.choices.map(function (choice) { return choice.id; });
  var seen = {};
  ids.forEach(function (id) {
    assert.ok(!seen[id], "repeated " + id);
    seen[id] = true;
    assert.ok(ORDER.indexOf(id) !== -1, id);
  });
  assert.ok(seen[round.answer], "answer missing");
  assert.strictEqual(round.key, ids.slice().sort().join("+"));
}

assert.deepStrictEqual(questions.order.map(function (part) { return part.id; }), ORDER);

var game = questions.play(mulberry32(2));
assert.strictEqual(game.length, 6);
game.forEach(function (round, index) {
  check(round);
  assert.strictEqual(round.answer, ORDER[index], "parts stay in build order");
  assert.strictEqual(round.index, index);
  if (index) assert.notStrictEqual(round.key, game[index - 1].key, "same set twice in a row");
});

var rng = mulberry32(4);
var slots = [0, 0, 0];
var prev = "";
var i;
for (i = 0; i < 180; i++) {
  var round = questions.makeRound(rng, i % 6, prev);
  check(round);
  assert.strictEqual(round.answer, ORDER[i % 6]);
  assert.notStrictEqual(round.key, prev, "same set twice in a row");
  prev = round.key;
  var at = round.choices.findIndex(function (choice) { return choice.id === round.answer; });
  slots[at] += 1;
}
slots.forEach(function (count, index) {
  assert.ok(count > 20, "answer position " + index + " only came up " + count);
});

var stuck = questions.makeRound(function () { return 0; }, 0, "");
var other = questions.makeRound(function () { return 0; }, 0, stuck.key);
assert.notStrictEqual(other.key, stuck.key, "a fixed roll still changes the set");

console.log("Bernie question checks passed.");
