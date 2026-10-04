/* A wrong tap greys that choice and earns no part. Taps are never blocked. */
var assert = require("assert");
var guess = require("./guess.js");

var state = guess.createState();
var firstWrong = guess.answer(state, false);
assert.strictEqual(firstWrong.greyChoice, true);
assert.strictEqual(firstWrong.wrong, true);
assert.strictEqual(firstWrong.earned, false);
assert.strictEqual(firstWrong.cooldown, false);
assert.strictEqual(firstWrong.ignore, false);
assert.strictEqual(firstWrong.say, "Try again");
assert.strictEqual(firstWrong.revoke, false);

var second = guess.answer(state, false);
assert.strictEqual(second.say, "Try again");
assert.strictEqual(second.greyChoice, true);
assert.strictEqual(second.cooldown, false);
assert.strictEqual(second.ignore, false);
assert.strictEqual(second.revoke, false);

var wasted = guess.answer(state, true);
assert.strictEqual(wasted.earned, false);
assert.strictEqual(wasted.cooldown, false);
assert.strictEqual(wasted.ignore, false);
assert.strictEqual(wasted.revoke, false);
assert.strictEqual(wasted.say, "");

guess.nextQuestion(state);
var earned = guess.answer(state, true);
assert.strictEqual(earned.earned, true);
assert.strictEqual(earned.say, "Yes!");
assert.strictEqual(earned.cooldown, false);
assert.strictEqual(earned.revoke, false);

var fast = guess.createState();
assert.strictEqual(guess.answer(fast, true).say, "Yes!");
assert.strictEqual(guess.answer(fast, false).ignore, false);
assert.strictEqual(guess.answer(fast, false).cooldown, false);
assert.notStrictEqual(guess.answer(fast, false).say, "Listen first");

console.log("Bernie guess checks passed.");
