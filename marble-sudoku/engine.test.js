/* Generated Marble Sudoku boards must be valid and have one solution.
   Run: node marble-sudoku/engine.test.js */
var assert = require("assert");
var engine = require("./engine.js");

function blanks(givens) {
  var n = 0;
  var i;
  for (i = 0; i < givens.length; i++) if (!givens[i]) n++;
  return n;
}

function givenCount(givens) {
  return givens.length - blanks(givens);
}

var sizes = [4, 6, 9];
var seeds = { 4: 10, 6: 6, 9: 3 };

sizes.forEach(function (size) {
  var seen = {};
  var s;
  for (s = 1; s <= seeds[size]; s++) {
    var started = Date.now();
    var puzzle = engine.generate(size, s, { budget: 8000 });
    var elapsed = Date.now() - started;
    assert.ok(engine.isValid(puzzle.solution, size), size + " seed " + s + " solution is invalid");
    assert.strictEqual(puzzle.givens.length, size * size);
    var i;
    for (i = 0; i < puzzle.givens.length; i++) {
      if (puzzle.givens[i]) {
        assert.strictEqual(puzzle.givens[i], puzzle.solution[i], size + " given drifted");
      }
    }
    var rated = engine.countSolutions(puzzle.givens, size, 2);
    assert.strictEqual(rated.count, 1, size + " seed " + s + " count " + rated.count);
    assert.deepStrictEqual(rated.solution, puzzle.solution, size + " seed " + s + " solution mismatch");
    var state = engine.assess(puzzle.solution, size);
    assert.strictEqual(state.solved, true);
    var minBlanks = size === 4 ? 6 : size === 6 ? 12 : 20;
    assert.ok(blanks(puzzle.givens) >= minBlanks, size + " seed " + s + " only " + blanks(puzzle.givens) + " blanks");
    assert.ok(elapsed < 4000, size + " seed " + s + " took " + elapsed + "ms");
    seen[puzzle.givens.join(",")] = true;

    var hole = puzzle.givens.indexOf(0);
    assert.ok(hole >= 0);
    var dup = puzzle.solution.slice();
    dup[1] = dup[0];
    var clash = engine.assess(dup, size);
    assert.strictEqual(clash.solved, false, size + " duplicate should not win");
    assert.ok(clash.bad[0] && clash.bad[1], size + " duplicate should be marked");

    var played = puzzle.givens.slice();
    played[hole] = puzzle.solution[hole];
    if (blanks(played) === 0) {
      assert.strictEqual(engine.assess(played, size).solved, true);
    }
    console.log(
      size + "×" + size + " seed " + s +
      " givens " + givenCount(puzzle.givens) +
      " blanks " + blanks(puzzle.givens) +
      " " + elapsed + "ms"
    );
  }
  assert.ok(Object.keys(seen).length >= 2, size + " puzzles did not vary");
});

var boxClash = [];
var i;
for (i = 0; i < 36; i++) boxClash.push(0);
boxClash[0] = 1;
boxClash[6 + 2] = 1;
assert.ok(engine.conflicts(boxClash, 6)[0], "6×6 box should catch a repeat");
assert.ok(engine.conflicts(boxClash, 6)[8], "6×6 box should catch a repeat");

var boxOk = [];
for (i = 0; i < 36; i++) boxOk.push(0);
boxOk[0] = 1;
boxOk[12 + 1] = 1;
assert.strictEqual(Object.keys(engine.conflicts(boxOk, 6)).length, 0);

var empty4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
assert.strictEqual(engine.countSolutions(empty4, 4, 2).count, 2);

var clashRow = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
assert.strictEqual(engine.countSolutions(clashRow, 4, 2).count, 0);
assert.ok(engine.conflicts(clashRow, 4)[0]);
assert.ok(engine.conflicts(clashRow, 4)[1]);

var filled = engine.generate(4, 3, { budget: 8000 });
var almost = filled.solution.slice();
var last = almost.lastIndexOf(almost[0] === 1 ? 2 : 1);
/* Drop two cells that share a value so the board is not yet solved,
   then confirm the stored completion still assesses as solved. */
almost[0] = 0;
almost[last] = 0;
assert.strictEqual(engine.assess(almost, 4).solved, false);
assert.strictEqual(engine.assess(filled.solution, 4).solved, true);

console.log("marble sudoku engine ok");
