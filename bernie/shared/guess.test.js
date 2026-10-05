/* A wrong tap still leaves the part available. The right tap awards it,
   and a second tap on that same round does not award it again. */
var assert = require("assert");
var guess = require("./guess.js");

var state = guess.createState();
var missed = guess.answer(state, false);
assert.strictEqual(missed.greyChoice, true);
assert.strictEqual(missed.wrong, true);
assert.strictEqual(missed.earned, false);
assert.strictEqual(missed.say, "Try again");
assert.strictEqual(missed.ignore, false);
assert.strictEqual(missed.revoke, false);
assert.strictEqual(missed.cooldown, false);

var still = guess.answer(state, true);
assert.strictEqual(still.earned, true, "wrong then right still awards the part");
assert.strictEqual(still.say, "Yes!");
assert.strictEqual(still.revoke, false);
assert.strictEqual(still.ignore, false);

var extra = guess.answer(state, true);
assert.strictEqual(extra.ignore, true, "a second tap does not award again");
assert.strictEqual(extra.earned, false);
assert.strictEqual(extra.say, "");
assert.notStrictEqual(extra.say, "Listen first");

var again = guess.answer(state, false);
assert.strictEqual(again.ignore, true);
assert.strictEqual(again.earned, false);
assert.notStrictEqual(again.say, "Listen first");

guess.nextQuestion(state);
var fresh = guess.answer(state, true);
assert.strictEqual(fresh.earned, true);
assert.strictEqual(fresh.say, "Yes!");
assert.strictEqual(guess.answer(state, true).earned, false);

console.log("Bernie guess checks passed.");
