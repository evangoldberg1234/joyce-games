/* A miss greys that choice and earns no part. Two fast or wrong taps pause the question. */
var assert = require("assert");
var guess = require("./guess.js");

var state = guess.createState(0);
guess.noteSpeechUnavailable(state);

var early = guess.answer(state, true, 400);
assert.strictEqual(early.cooldown, true);
assert.strictEqual(early.earned, false);
assert.strictEqual(early.greyChoice, false);
assert.strictEqual(early.wrong, false);
assert.strictEqual(early.say, "Listen first");
assert.strictEqual(early.revoke, false);

guess.endCooldown(state, 3000);
guess.noteSpeechUnavailable(state);
var firstWrong = guess.answer(state, false, 4500);
assert.strictEqual(firstWrong.greyChoice, true);
assert.strictEqual(firstWrong.wrong, true);
assert.strictEqual(firstWrong.earned, false);
assert.strictEqual(firstWrong.cooldown, false);
assert.strictEqual(firstWrong.say, "Try again");
assert.strictEqual(firstWrong.revoke, false);

var wasted = guess.answer(state, true, 5000);
assert.strictEqual(wasted.earned, false);
assert.strictEqual(wasted.cooldown, false);
assert.strictEqual(wasted.revoke, false);
assert.strictEqual(state.wrongStreak, 0);

guess.nextQuestion(state, 6000);
guess.noteSpeechUnavailable(state);
var earned = guess.answer(state, true, 7500);
assert.strictEqual(earned.earned, true);
assert.strictEqual(earned.say, "Yes!");
assert.strictEqual(earned.revoke, false);

guess.nextQuestion(state, 8000);
guess.noteSpeechUnavailable(state);
assert.strictEqual(guess.answer(state, false, 9500).cooldown, false);
var second = guess.answer(state, false, 10000);
assert.strictEqual(second.cooldown, true);
assert.strictEqual(second.greyChoice, true);
assert.strictEqual(second.wrong, true);
assert.strictEqual(second.earned, false);
assert.strictEqual(second.say, "Listen first");
assert.strictEqual(second.revoke, false);
var during = guess.answer(state, true, 11000);
assert.strictEqual(during.ignore, true);
assert.strictEqual(during.earned, false);

var spoken = guess.createState(0);
guess.noteSpeechStarted(spoken);
assert.strictEqual(guess.answer(spoken, true, 500).cooldown, true);
assert.strictEqual(guess.answer(spoken, false, 800).ignore, true);
guess.endCooldown(spoken, 4000);
guess.noteSpeechStarted(spoken);
guess.noteSpoken(spoken, 4200);
/* The pause already happened, so the re-read must not arm another one. */
var accepted = guess.answer(spoken, true, 4300);
assert.strictEqual(accepted.cooldown, false);
assert.strictEqual(accepted.earned, true);
assert.strictEqual(accepted.say, "Yes!");

var repeated = guess.createState(0);
guess.noteSpeechUnavailable(repeated);
guess.answer(repeated, false, 2000);
assert.strictEqual(guess.answer(repeated, false, 3000).say, "Listen first");
assert.strictEqual(guess.answer(repeated, false, 3200).ignore, true);
guess.endCooldown(repeated, 7000);
guess.noteSpeechStarted(repeated);
var calmed = guess.answer(repeated, false, 7100);
assert.strictEqual(calmed.cooldown, false);
assert.strictEqual(calmed.say, "Try again");
assert.strictEqual(calmed.greyChoice, true);
assert.strictEqual(guess.answer(repeated, true, 8000).earned, false);

console.log("Bernie guess checks passed.");
